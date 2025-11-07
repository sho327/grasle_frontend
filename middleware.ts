import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 認証済みユーザーのみアクセス可能 (ガードが必要なパス)
const PROTECTED_ROUTES = ['/home', '/task']

// 認証済みの場合にアクセスを制限するルート (ログイン/サインアップなど)
// /not-found を追加することで、認証済みでも /home にリダイレクトされるのを防ぐ
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/signup/confirm', '/not-found']

/**
 * Next.jsのミドルウェア関数
 */
export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    })

    // 1. Supabaseクライアントの作成
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options) {
                    req.cookies.set(name, value)
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    // res.cookies.set(name, value, options) の呼び出しを維持
                    // TypeScriptが推論できる形で渡す
                    res.cookies.set(name, value, options)
                },
                remove(name: string) {
                    // options を削除または使用しない
                    req.cookies.delete(name)
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    })
                    // res.cookies.delete(name) で名前のみを渡す
                    res.cookies.delete(name)
                },
            },
        }
    )

    // 2. セッション情報の取得
    const {
        data: { session },
    } = await supabase.auth.getSession()

    const { pathname } = req.nextUrl

    // 3. ルートガードの適用

    // A. 認証済みユーザーのみアクセス可能 (PROTECTED_ROUTES) のガード
    // -------------------------------------------------------------------
    // パスが PROTECTED_ROUTES のいずれかで始まるかどうかで判定
    if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
        if (!session) {
            // セッションがない場合、ログインページにリダイレクト
            const url = req.nextUrl.clone()
            url.pathname = '/auth/login'
            return NextResponse.redirect(url)
        }
    }

    // B. 未認証ユーザーのみアクセス可能 (AUTH_ROUTES) のガード
    // ---------------------------------------------------
    if (AUTH_ROUTES.includes(pathname)) {
        if (session) {
            // セッションがある場合、ホーム(`/home`)にリダイレクト
            const url = req.nextUrl.clone()
            url.pathname = '/home' // リダイレクト先を /home に戻す
            return NextResponse.redirect(url)
        }
    }

    // C. その他はそのまま許可
    return res
}

/**
 * ミドルウェアを適用するパスの指定
 */
export const config = {
    // 静的アセット、APIルート以外全てにミドルウェアを適用
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png)$).*)'],
}

// 認証済みユーザー: /not-found にアクセス -> セッションが存在するため /home にリダイレクトされる
// （/not-found ページをそのまま見せたい場合は、AUTH_ROUTES から除外。
// その場合は、/auth/login から /not-found へのリダイレクトが起こらなくなる。）
// 未認証ユーザー: 存在しないページにアクセス -> not-found ページへ遷移し、そのまま表示される。
