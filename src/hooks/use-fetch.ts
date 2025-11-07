import { useState, useEffect } from 'react'

/**
 * useFetch — 非同期データ取得（ローディング付き）
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export function useFetch<T>(fetcher: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let isMounted = true
        setLoading(true)

        fetcher()
            .then((res) => isMounted && setData(res))
            .catch((err) => isMounted && setError(err))
            .finally(() => isMounted && setLoading(false))

        return () => {
            isMounted = false
        }
    }, [fetcher])

    return { data, loading, error }
}

// ============================================================================
// 使用例
// ============================================================================
// const { data: tasks, loading } = useFetch(async () => {
//     const { data } = await supabase.from("tasks").select("*");
//     return data ?? [];
// });
