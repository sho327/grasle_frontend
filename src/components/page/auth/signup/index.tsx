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
// Store
import { useCommonStore } from '@/store/common'
// Supabase
import { supabase } from '@/lib/supabase/client'

/**
 * 新規登録ページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function SignupPage() {
    // ============================================================================
    // 変数（Constant）
    // ============================================================================
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // ============================================================================
    // ローカル状態（LocalState）
    // ============================================================================
    const [name, setName] = useState('')
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
    const signupSchema = z.object({
        name: z.string().min(1, { message: '名前を入力してください。' }),
        email: z.string().email({ message: '有効なメールアドレスを入力してください。' }),
        password: z.string().min(6, { message: 'パスワードは6文字以上で入力してください。' }),
    })

    // ============================================================================
    // アクション処理（Action）
    // ============================================================================
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const result = signupSchema.safeParse({ name, email, password })

        if (!result.success) {
            setError(result.error.errors[0].message)
            return
        }

        setIsLoading(true)

        // === Supabase Auth 新規登録 (signUp) ===
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name, // DBトリガーが参照する名前をセット
                },
            },
        })

        if (authError) {
            console.error('Sign-up error:', authError)
            if (authError.message.includes('already registered')) {
                setError('このメールアドレスは既に登録されています。')
            } else {
                setError('ユーザー登録中にエラーが発生しました。')
            }
            setIsLoading(false)
            return
        }

        // 登録成功後の処理
        if (data.session) {
            // メール認証が無効な設定の場合、セッションが確立される
            // セッション確立とDBトリガーの完了を軽く待機
            for (let i = 0; i < 5; i++) {
                const { data: userCheck } = await supabase.auth.getUser()
                if (userCheck.user) break
                await new Promise((r) => setTimeout(r, 200))
            }

            // トランジション発火（ページ遷移）
            startTransition(() => {
                router.push('/home')
            })

            setIsLoading(false)
        } else if (data.user && !data.session) {
            // メール認証が必要な場合（デフォルト設定）
            // 完了画面にリダイレクト
            startTransition(() => {
                // メール認証完了画面へのパスを指定
                router.push('/auth/verify-email')
            })
            // ローディングはトランジションとは独立して解除
            setIsLoading(false)
        }
    }

    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <>
            {/* 新規登録/カード */}
            <Card className="border-border rounded-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl">アカウント作成</CardTitle>
                    <CardDescription>
                        今日からチームでコラボレーションを始めましょう
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">名前</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="あなたの名前"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="rounded-lg"
                            />
                        </div>
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
                                placeholder="6文字以上"
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
                            {isPending ? '登録中…' : '新規登録'}
                        </Button>
                    </form>

                    <div className="text-muted-foreground mt-6 text-center text-sm">
                        既にアカウントをお持ちの方は{' '}
                        <Link
                            href="/auth/login"
                            className="text-primary font-medium hover:underline"
                        >
                            ログイン
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
