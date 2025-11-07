import { useEffect, useState } from 'react'

/**
 * useOnlineStatus — オンライン検知
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export const useOnlineStatus = () => {
    const [online, setOnline] = useState<boolean>(navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return online
}

// ============================================================================
// 使用例
// ============================================================================
// const online = useOnlineStatus();
// if (!online) return <p>オフラインモードです</p>;
