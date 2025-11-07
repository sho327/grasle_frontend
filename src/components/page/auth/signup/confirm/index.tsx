'use client'
// Modules
import type React from 'react'
import Link from 'next/link'
import { MailCheck, ArrowRight } from 'lucide-react'
// UI/Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * メール認証完了画面
 * サインアップ後、メール認証が必要な場合に遷移するページ
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/03
 */
export default function SignupConfirmPage() {
    // ============================================================================
    // テンプレート（コンポーネント描画処理）
    // ============================================================================
    return (
        <>
            {/* 認証完了/カード */}
            <Card className="border-border w-full max-w-md rounded-xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <MailCheck className="text-primary h-12 w-12" />
                    </div>
                    <CardTitle className="text-2xl">メール送信完了</CardTitle>
                    <CardDescription className="text-base text-gray-700 dark:text-gray-300">
                        ご登録いただいたメールアドレスに確認メールを送信しました。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                    <p className="text-muted-foreground text-center text-sm">
                        メールに記載されている**認証リンクをクリック**して、アカウントを有効化してください。
                        <br />
                        認証が完了すると、自動的にログイン状態になります。
                    </p>

                    {/* 💡 ヘルプや再送信の導線 */}
                    <div className="space-y-3 border-t pt-4">
                        <Button asChild className="w-full rounded-lg font-semibold" size="lg">
                            <Link href="/auth/login">
                                ログイン画面に戻る
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <p className="text-muted-foreground text-center text-xs">
                            メールが届かない場合は、迷惑メールフォルダをご確認ください。
                        </p>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
