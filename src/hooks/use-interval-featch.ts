import { useEffect } from 'react'

/**
 * useIntervalFetch — ポーリング（例：通知）
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export const useIntervalFetch = (callback: () => void, delay: number) => {
    useEffect(() => {
        const id = setInterval(callback, delay)
        return () => clearInterval(id)
    }, [callback, delay])
}

// ============================================================================
// 使用例
// ============================================================================
// useIntervalFetch(() => {
//     refetchNotifications();
// }, 30_000);
