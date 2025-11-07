'use client'
// Modules
import type React from 'react'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
// UI/Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Constants
import { appInfo } from '@/constants/appInfo'
// Store
import { useCommonStore } from '@/store/common'
// Supabase
import { supabase } from '@/lib/supabase/client'
// Actions
import { getAndSetDefaultGroupId } from '@/actions/authActions'

/**
 * ログインページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function LoginPage() {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    const { setIsLoading } = useCommonStore()

    // ============================================================================
    // スキーマ定義（Zod Validation）
    // ============================================================================
    const loginSchema = z.object({
        email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
        password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください。' }),
    })

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        const result = loginSchema.safeParse({ email, password })
        if (!result.success) {
            setError(result.error.errors[0].message)
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        // === Supabase Auth ログイン ===
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError('メールアドレスまたはパスワードが正しくありません。')
            setIsLoading(false)
            return
        }

        // ログイン後
        if (data.session) {
            // Supabaseのセッション確立を軽く待機
            for (let i = 0; i < 5; i++) {
                const { data: userCheck } = await supabase.auth.getUser()
                if (userCheck.user) break
                await new Promise((r) => setTimeout(r, 200))
            }

            // ユーザの全メンバーシップから個人グループIDを取得し、Cookieへセット
            try {
                // サーバーアクションを実行して、Cookie設定とグループID取得をサーバー側で完結させる
                await getAndSetDefaultGroupId(data.user!.id)

                // トランジション発火（ページ遷移）
                startTransition(() => {
                    router.push('/home')
                })
            } catch (e) {
                // エラー処理
                setError('ログイン後の初期設定に失敗しました。')
            } finally {
                // トランジションとは独立してローディング解除
                setIsLoading(false)
            }
        }
    }

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <>
            {/* ログイン/カード */}
            <Card className="border-border rounded-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">おかえりなさい</CardTitle>
                    <CardDescription>{appInfo.APP_NAME}アカウントにログイン</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">メールアドレス</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="rounded-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">パスワード</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="rounded-lg"
                            />
                        </div>

                        {error && <p className="text-destructive text-center text-sm">{error}</p>}

                        <Button
                            type="submit"
                            className="w-full rounded-lg font-semibold"
                            size="lg"
                            disabled={isPending}
                        >
                            {isPending ? 'ログイン中…' : 'ログイン'}
                        </Button>
                    </form>

                    <div className="text-muted-foreground mt-6 text-center text-sm">
                        アカウントをお持ちでない方は{' '}
                        <Link
                            href="/auth/signup"
                            className="text-primary font-medium hover:underline"
                        >
                            新規登録
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
