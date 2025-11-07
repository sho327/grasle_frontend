import { useEffect } from 'react'

/**
 * useMount — マウント時1回だけ処理する
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export const useMount = (fn: () => void) => {
    useEffect(() => {
        fn()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

// ============================================================================
// 使用例
// ============================================================================
// useMount(() => {
//     console.log("Tasrepoを起動しました 🚀");
// });
