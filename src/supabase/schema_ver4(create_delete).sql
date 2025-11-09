-- =========================================
-- 🚨 データベース初期化 (全てを削除)
-- =========================================

-- RLSポリシーの削除
DROP POLICY IF EXISTS "profiles: select_self" ON profiles;
DROP POLICY IF EXISTS "profiles: update_self" ON profiles;
DROP POLICY IF EXISTS "teams: select_member_teams" ON teams;
DROP POLICY IF EXISTS "teams: delete_flexible_non_personal" ON teams;
DROP POLICY IF EXISTS "memberships: select_self" ON memberships;
DROP POLICY IF EXISTS "memberships: insert_self" ON memberships;
DROP POLICY IF EXISTS "tasks: select_in_member_teams" ON tasks;
DROP POLICY IF EXISTS "tasks: insert_in_member_teams" ON tasks;
DROP POLICY IF EXISTS "tasks: update_in_member_teams" ON tasks;
DROP POLICY IF EXISTS "work_logs: select_in_member_teams" ON work_logs;
DROP POLICY IF EXISTS "work_logs: insert_in_member_teams" ON work_logs;
DROP POLICY IF EXISTS "reports: select_in_member_teams" ON reports;
DROP POLICY IF EXISTS "reports: insert_self" ON reports;
DROP POLICY IF EXISTS "reports: update_self" ON reports;
-- 🚨 notifications のポリシーを削除 (再定義のため)
DROP POLICY IF EXISTS "notifications: select_self" ON notifications; 
DROP POLICY IF EXISTS "storage: avatars_manage_self" ON storage.objects; 
DROP POLICY IF EXISTS "storage: project_images_manage" ON storage.objects;
-- 🆕 project_memberships RLSの削除を追加
DROP POLICY IF EXISTS "project_memberships: select_in_member_projects" ON project_memberships;
DROP POLICY IF EXISTS "project_memberships: insert_self_or_admin" ON project_memberships;
DROP POLICY IF EXISTS "project_memberships: update_self_or_admin" ON project_memberships;


-- Authトリガーの削除
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガー関数の削除
DROP TRIGGER IF EXISTS trg_prevent_personal_team_deletion ON public.teams;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.prevent_personal_team_deletion();

-- インデックスの削除（テーブル削除時に自動削除されるため省略可能だが、明示的に記述）
DROP INDEX IF EXISTS idx_tasks_team; 
DROP INDEX IF EXISTS idx_tasks_assignee;
DROP INDEX IF EXISTS idx_reports_team;
DROP INDEX IF EXISTS idx_reports_user;
DROP INDEX IF EXISTS idx_worklogs_task;
DROP INDEX IF EXISTS idx_worklogs_user;
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_team;
DROP INDEX IF EXISTS unique_personal_team_per_owner;
DROP INDEX IF EXISTS idx_projects_team;
DROP INDEX IF EXISTS idx_notifications_project;
-- 🆕 project_memberships 用のインデックス削除を追加
DROP INDEX IF EXISTS idx_project_memberships_project; 


-- テーブルの削除 (外部キー制約の関係で順番に削除)
DROP TABLE IF EXISTS notifications CASCADE; -- 🚨 再定義のため CASCADE
DROP TABLE IF EXISTS work_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_memberships CASCADE; -- 🆕 project_memberships の削除を追加
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;


-- =========================================
-- データベース再構築（プロジェクト＆通知修正版）
-- =========================================

-- === Profiles ==============================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- === Teams ================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_personal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX unique_personal_team_per_owner
ON teams (owner_id)
WHERE is_personal = TRUE;

-- === Memberships ===========================
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'guest')),
  status TEXT NOT NULL CHECK (status IN ('active', 'invited', 'removed')),
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, team_id)
);

-- === Projects ================= (更新)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT, -- 🆕 追加: プロジェクト画像のURLを保存
  status TEXT NOT NULL CHECK (status IN ('active', 'on_hold', 'completed', 'archived')) DEFAULT 'active',
  start_date DATE,
  end_date DATE,

  -- 🆕 プロジェクトに追加された属性
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium', -- 優先度
  invite_code TEXT UNIQUE, -- 招待コード
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE, -- お気に入り

  -- 共通監査カラム
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 作成者
  created_method_id TEXT, -- 作成機能ID
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- 更新者
  updated_method_id TEXT -- 更新機能ID
);

-- === Project Memberships (プロジェクトへの所属) ================= (新規追加)
CREATE TABLE project_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 役割 (プロジェクトレベルの権限)
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'guest')), 
  
  -- 参加ステータス (join/invited/rejected/removed)
  status TEXT NOT NULL CHECK (status IN ('joined', 'invited', 'rejected', 'removed')) DEFAULT 'invited',
  
  invited_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ, -- 参加承認された日時
  
  -- 共通監査カラム
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE (project_id, user_id) -- 1プロジェクトにつき1ユーザーのみ
);

-- === Tasks =================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE, 
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'done', 'canceled')) DEFAULT 'todo',
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
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, 
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  generated_from_task_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- === Notifications (project_id を追加) =========================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- 🚨 追記: ProjectID
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
-- Triggers (変更なし)
-- =========================================
-- Supabase Authとの同期トリガー関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  personal_team_id UUID;
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

  -- 2. 個人チームを作成し、IDを変数に格納
  -- 🌟 is_personal フラグを TRUE に設定
  INSERT INTO public.teams (name, description, owner_id, is_personal)
  VALUES (
    user_name || 'の個人チーム',
    user_name || 'さんの個人的なタスク管理スペースです。',
    NEW.id,
    TRUE
  )
  RETURNING id INTO personal_team_id;

  -- 3. ユーザーをその個人チームのメンバー（admin）として登録
  INSERT INTO public.memberships (user_id, team_id, role, status)
  VALUES (
    NEW.id,
    personal_team_id,
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
CREATE OR REPLACE FUNCTION public.prevent_personal_team_deletion()
RETURNS trigger AS $$
BEGIN
  IF OLD.is_personal = TRUE THEN
    RAISE EXCEPTION '個人チーム (is_personal = TRUE) は削除できません。';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- トリガーの適用
CREATE TRIGGER trg_prevent_personal_team_deletion
BEFORE DELETE ON teams
FOR EACH ROW
EXECUTE FUNCTION public.prevent_personal_team_deletion();

-- =========================================
-- Indexes (notifications / project_memberships に project_id を追加)
-- =========================================

CREATE INDEX idx_projects_team ON projects(team_id); 
CREATE INDEX idx_project_memberships_project ON project_memberships(project_id); -- 🚨 project_memberships 用インデックスを追記

CREATE INDEX idx_tasks_project ON tasks(project_id); -- 旧 idx_tasks_team を idx_tasks_project に修正済みと仮定
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

CREATE INDEX idx_reports_team ON reports(team_id);
CREATE INDEX idx_reports_project ON reports(project_id);
CREATE INDEX idx_reports_user ON reports(user_id);

CREATE INDEX idx_worklogs_task ON work_logs(task_id);
CREATE INDEX idx_worklogs_user ON work_logs(user_id);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_team ON notifications(team_id);
CREATE INDEX idx_notifications_project ON notifications(project_id); -- 🚨 追記: ProjectIDインデックス

-- =========================================
-- Policys (Storage Policy)
-- =========================================
CREATE POLICY "storage: avatars_manage_self"
  ON storage.objects
  FOR ALL
  USING (auth.uid()::text = (storage.foldername(name))[2])
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[2]);

CREATE POLICY "storage: project_images_manage"
  ON storage.objects
  FOR ALL -- SELECT, INSERT, UPDATE, DELETE を許可
  TO authenticated -- 認証済みユーザーに限定
  USING (
    bucket_id = 'project_images' 
    AND EXISTS (
      -- ユーザーがアクセスしようとしている画像（パス名）に紐づくプロジェクトIDを取得し、
      -- そのプロジェクトがユーザーの所属チームに紐づいているかを確認
      SELECT 1 FROM projects
      JOIN memberships ON memberships.team_id = projects.team_id
      -- Storageのパス構造を '/project_images/{project_id}/image.png' と仮定
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  )
  WITH CHECK (
    -- INSERT/UPDATE時にも同じ条件をチェック
    bucket_id = 'project_images'
    AND EXISTS (
      SELECT 1 FROM projects
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE projects.id::text = (storage.foldername(name))[2]
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- RLS有効化
-- =========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY; 
ALTER TABLE project_memberships ENABLE ROW LEVEL SECURITY; -- 🚨 project_memberships の RLS 有効化を追記
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLSの定義について 
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
-- teams / RLS 
-- 所属しているチームのみ参照可能。オーナー/管理者である、またはオーナー/管理者が不在の場合は削除を許可
-- =========================================
CREATE POLICY "teams: select_member_teams"
  ON teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.team_id = teams.id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "teams: delete_flexible_non_personal"
  ON teams FOR DELETE
  USING (
    -- 1. 個人チームではないこと
    is_personal = FALSE 
    AND (
        -- 2A. チームのオーナーである
        auth.uid() = owner_id 
        OR 
        -- 2B. チームの管理者である (membershipsテーブルを参照)
        EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.team_id = teams.id
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
-- projects / RLS 
-- 所属チームのプロジェクトのみ参照・操作可能
-- =========================================
CREATE POLICY "projects: select_in_member_teams"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.team_id = projects.team_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "projects: manage_in_member_teams"
  ON projects FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.team_id = projects.team_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
      AND memberships.role IN ('admin', 'member')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.team_id = projects.team_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
      AND memberships.role IN ('admin', 'member')
    )
  );

-- =========================================
-- project_memberships / RLS (新規追記)
-- プロジェクトのメンバーシップを参照・操作可能
-- =========================================
CREATE POLICY "project_memberships: select_in_member_projects"
  ON project_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE projects.id = project_memberships.project_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "project_memberships: insert_self_or_admin"
  ON project_memberships FOR INSERT
  WITH CHECK (
    -- 1. ユーザー自身が 'invited' ステータスで挿入しようとしている 
    (auth.uid() = user_id AND status = 'invited')
    OR
    -- 2. 挿入者がチームの管理者である
    EXISTS (
        SELECT 1 FROM memberships 
        WHERE memberships.team_id = (SELECT team_id FROM projects WHERE id = project_memberships.project_id)
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'admin'
    )
  );

CREATE POLICY "project_memberships: update_self_or_admin"
  ON project_memberships FOR UPDATE
  USING (
    -- 1. ユーザー自身が更新する
    (auth.uid() = user_id)
    OR
    -- 2. 管理者が更新する
    EXISTS (
        SELECT 1 FROM memberships 
        WHERE memberships.team_id = (SELECT team_id FROM projects WHERE id = project_memberships.project_id)
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'admin'
    )
  );

-- =========================================
-- tasks / RLS 
-- 自分の所属チームのプロジェクトに紐づくタスクのみ参照・操作可能
-- =========================================
CREATE POLICY "tasks: select_in_member_projects"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE projects.id = tasks.project_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "tasks: insert_in_member_projects"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE projects.id = tasks.project_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "tasks: update_in_member_projects"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE projects.id = tasks.project_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- work_logs / RLS 
-- 自分の所属チームのプロジェクトのタスクに紐づく作業ログのみ
-- =========================================
CREATE POLICY "work_logs: select_in_member_projects"
  ON work_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE tasks.id = work_logs.task_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

CREATE POLICY "work_logs: insert_in_member_projects"
  ON work_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks
      JOIN projects ON projects.id = tasks.project_id
      JOIN memberships ON memberships.team_id = projects.team_id
      WHERE tasks.id = task_id
      AND memberships.user_id = auth.uid()
      AND memberships.status = 'active'
    )
  );

-- =========================================
-- reports / RLS 
-- 自分または所属チームに紐づく日報のみ
-- =========================================
CREATE POLICY "reports: select_in_member_teams"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM memberships
      WHERE memberships.team_id = reports.team_id
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
-- notifications / RLS (🚨 追記: user_id フィルタに team/project 所属チェックを追加)
-- 宛先が自分のもので、かつ所属チーム/プロジェクトに関する通知のみ参照可能
-- =========================================
CREATE POLICY "notifications: select_self"
  ON notifications FOR SELECT
  USING (
    -- 1. 基本条件: 自分の user_id 宛である
    auth.uid() = user_id 
    AND (
        -- 2A. team_id が設定されている場合: そのチームに所属していること
        (notifications.team_id IS NULL OR EXISTS (
            SELECT 1 FROM memberships
            WHERE memberships.team_id = notifications.team_id
            AND memberships.user_id = auth.uid()
            AND memberships.status = 'active'
        ))
        AND
        -- 2B. project_id が設定されている場合: そのプロジェクトのチームに所属していること
        (notifications.project_id IS NULL OR EXISTS (
            SELECT 1 FROM projects
            JOIN memberships ON memberships.team_id = projects.team_id
            WHERE projects.id = notifications.project_id
            AND memberships.user_id = auth.uid()
            AND memberships.status = 'active'
        ))
    )
  );


-- =========================================
-- 完全ロックモード/FORCE RLS (変更なし)
-- =========================================
-- ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
-- ALTER TABLE projects FORCE ROW LEVEL SECURITY;
