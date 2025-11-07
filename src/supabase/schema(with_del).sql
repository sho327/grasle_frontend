-- =========================================
-- 🚨 データベース初期化 (全てを削除)
-- ⚠️ 既存のデータは全て失われます
-- =========================================

-- RLSポリシーの削除
DROP POLICY IF EXISTS "profiles: select_self" ON profiles;
DROP POLICY IF EXISTS "profiles: update_self" ON profiles;
DROP POLICY IF EXISTS "groups: select_member_groups" ON groups;
DROP POLICY IF EXISTS "groups: delete_non_personal" ON groups;
DROP POLICY IF EXISTS "memberships: select_self" ON memberships;
DROP POLICY IF EXISTS "memberships: insert_self" ON memberships;
DROP POLICY IF EXISTS "tasks: select_in_member_groups" ON tasks;
DROP POLICY IF EXISTS "tasks: insert_in_member_groups" ON tasks;
DROP POLICY IF EXISTS "tasks: update_in_member_groups" ON tasks;
DROP POLICY IF EXISTS "work_logs: select_in_member_groups" ON work_logs;
DROP POLICY IF EXISTS "work_logs: insert_in_member_groups" ON work_logs;
DROP POLICY IF EXISTS "reports: select_in_member_groups" ON reports;
DROP POLICY IF EXISTS "reports: insert_self" ON reports;
DROP POLICY IF EXISTS "reports: update_self" ON reports;
DROP POLICY IF EXISTS "notifications: select_self" ON notifications;
-- Storageポリシーの削除は、GUIでの管理を推奨するため除外します
DROP POLICY IF EXISTS "storage: avatars_manage_self" ON storage.objects; 

-- Authトリガーの削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガー関数の削除
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.prevent_personal_group_deletion();

-- インデックスの削除（テーブル削除時に自動削除されるため省略可能だが、明示的に記述）
DROP INDEX IF EXISTS idx_tasks_group;
DROP INDEX IF EXISTS idx_tasks_assignee;
DROP INDEX IF EXISTS idx_reports_group;
DROP INDEX IF EXISTS idx_reports_user;
DROP INDEX IF EXISTS idx_worklogs_task;
DROP INDEX IF EXISTS idx_worklogs_user;
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_group;
DROP INDEX IF EXISTS unique_personal_group_per_owner;

-- テーブルの削除 (外部キー制約の関係で順番に削除)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS work_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;


-- =========================================
-- データベース再構築（最終確定版）
-- =========================================

-- =========================================
-- Tasrepo Schema (MVP)
-- =========================================

-- === Profiles ==============================
-- Supabase Authと同期されるユーザーテーブル
-- 新規登録時にauth.users → public.profilesへ自動反映
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- === Groups ================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_personal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX unique_personal_group_per_owner
ON groups (owner_id)
WHERE is_personal = TRUE;

-- === Memberships ===========================
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'removed')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, group_id)
);

-- === Tasks =================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date DATE,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- === Work Logs =============================
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN end_time IS NOT NULL
         THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60
         ELSE NULL END
  ) STORED,
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- === Reports ===============================
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  generated_from_task_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- === Notifications =========================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'report', 'system', 'comment')),
  title TEXT NOT NULL,
  description TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- Triggers
-- =========================================
-- Supabase Authとの同期トリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  personal_group_id UUID;
  user_name TEXT;
  email_local_part TEXT;
BEGIN
  -- メールアドレスから@以前の部分を抽出し、それがなければ「ユーザー」を設定
  email_local_part := SPLIT_PART(NEW.email, '@', 1);
  user_name := COALESCE(NULLIF(email_local_part, ''), 'ユーザー'); 

  -- 1. public.profiles テーブルにユーザー情報を挿入
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    user_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  -- 2. 個人グループを作成し、IDを変数に格納
  -- 🌟 is_personal フラグを TRUE に設定
  INSERT INTO public.groups (name, description, owner_id, is_personal)
  VALUES (
    user_name || 'の個人グループ',
    user_name || 'さんの個人的なタスク管理スペースです。',
    NEW.id,
    TRUE
  )
  RETURNING id INTO personal_group_id;

  -- 3. ユーザーをその個人グループのメンバー（admin）として登録
  INSERT INTO public.memberships (user_id, group_id, role, status)
  VALUES (
    NEW.id,
    personal_group_id,
    'admin', 
    'active'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 削除禁止用のトリガー関数
CREATE OR REPLACE FUNCTION public.prevent_personal_group_deletion()
RETURNS trigger AS $$
BEGIN
  IF OLD.is_personal = TRUE THEN
    RAISE EXCEPTION '個人グループ (is_personal = TRUE) は削除できません。';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- トリガーの適用
CREATE TRIGGER trg_prevent_personal_group_deletion
BEFORE DELETE ON groups
FOR EACH ROW
EXECUTE FUNCTION public.prevent_personal_group_deletion();

-- =========================================
-- Indexes
-- =========================================

CREATE INDEX idx_tasks_group ON tasks(group_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

CREATE INDEX idx_reports_group ON reports(group_id);
CREATE INDEX idx_reports_user ON reports(user_id);

CREATE INDEX idx_worklogs_task ON work_logs(task_id);
CREATE INDEX idx_worklogs_user ON work_logs(user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_group ON notifications(group_id);

-- =========================================
-- storage (avatars) / RLS
-- 自分のUIDフォルダ配下のオブジェクトのみ参照・操作可能
-- Storageポリシーの作成はGUIで行われた既存のものを利用するため、このセクションは削除します
-- =========================================
CREATE POLICY "storage: avatars_manage_self"
  ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[2])  -- /avatars/users/{uid}/image.png 想定
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[2]);

-- =========================================
-- RLS有効化
-- =========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLSの定義について
-- # 命名規則のポイント
-- 項目 | 内容
-- :--- | :---
-- **テーブル名** | Supabase Studioのポリシー一覧でグループ化されやすい
-- **動詞（select / insert / update / delete）** | 操作種別を即判別
-- **条件（self / in_member_groups）** | 誰のものに対してか一目でわかる
-- **命名を英小文字＋スネークケースに統一** | SQL的にも一貫して見やすい

-- # Studioで見たとき
-- profiles: select_self
-- profiles: update_self
-- tasks: select_in_member_groups
-- tasks: update_in_member_groups
-- => 「このテーブルで何が許されているか」がすぐ視認できる
-- =========================================

-- =========================================
-- profiles / RLS
-- 自分のユーザー情報のみ参照・更新可能
-- =========================================
CREATE POLICY "profiles: select_self"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: update_self"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =========================================
-- groups / RLS
-- 所属しているグループのみ参照可能。オーナー/管理者である、またはオーナー/管理者が不在の場合は削除を許可
-- =========================================
CREATE POLICY "groups: select_member_groups"
  ON groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.group_id = groups.id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "groups: delete_flexible_non_personal"
  ON groups FOR DELETE
  USING (
    -- 1. 個人グループではないこと
    is_personal = FALSE 
    AND (
        -- 2A. グループのオーナーである
        auth.uid() = owner_id 
        OR 
        -- 2B. グループの管理者である (membershipsテーブルを参照)
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.group_id = groups.id
            AND memberships.user_id = auth.uid()
            AND memberships.role = 'admin'
            AND memberships.status = 'active'
        )
        OR 
        -- 2C. オーナーが不在である（誰も管理していない）
        owner_id IS NULL
    )
  );

-- =========================================
-- memberships / RLS
-- 自分の所属データのみ参照・登録可能
-- =========================================
CREATE POLICY "memberships: select_self"
  ON memberships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "memberships: insert_self"
  ON memberships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =========================================
-- tasks / RLS
-- 自分の所属グループのタスクのみ参照・操作可能
-- =========================================
CREATE POLICY "tasks: select_in_member_groups"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.group_id = tasks.group_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "tasks: insert_in_member_groups"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.group_id = group_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "tasks: update_in_member_groups"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.group_id = tasks.group_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- work_logs / RLS
-- 自分の所属グループのタスクに紐づく作業ログのみ
-- =========================================
CREATE POLICY "work_logs: select_in_member_groups"
  ON work_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN memberships ON memberships.group_id = tasks.group_id
      WHERE tasks.id = work_logs.task_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "work_logs: insert_in_member_groups"
  ON work_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN memberships ON memberships.group_id = tasks.group_id
      WHERE tasks.id = task_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- reports / RLS
-- 自分または所属グループに紐づく日報のみ
-- =========================================
CREATE POLICY "reports: select_in_member_groups"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.group_id = reports.group_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "reports: insert_self"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reports: update_self"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

-- =========================================
-- notifications / RLS
-- 宛先が自分のもののみ参照可能
-- =========================================
CREATE POLICY "notifications: select_self"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);


-- =========================================
-- 完全ロックモード/FORCE RLS
-- 「ポリシーを設定していないテーブル」や「不正なアクセス」は一切通らなくなる
-- =========================================
-- ALTER TABLE tasks FORCE ROW LEVEL SECURITY;