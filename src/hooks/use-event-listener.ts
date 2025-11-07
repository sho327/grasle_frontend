import { useEffect } from 'react'

/**
 * useEventListener — イベント安全管理
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export const useEventListener = <K extends keyof WindowEventMap>(
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    element: Window | Document = window
) => {
    useEffect(() => {
        element.addEventListener(event, handler as EventListener)
        return () => element.removeEventListener(event, handler as EventListener)
    }, [event, handler, element])
}

// ============================================================================
// 使用例
// ============================================================================
// useEventListener("keydown", (e) => {
//     if (e.key === "s" && e.metaKey) {
//         e.preventDefault();
//         saveReport();
//     }
// });
