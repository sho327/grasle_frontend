'use client'
// Modules
import { CheckCircle } from 'lucide-react'
// Store
import { useCommonStore } from '@/store/common'

/**
 * ページローディング表示コンポーネント
 * @args
 * @createdBy KatoShogo
 * @createdAt 2025/11/02
 */
export default function LoadingOverlay() {
    // ============================================================================
    // グローバル状態（GlobalState）
    // ============================================================================
    // StoreStates: コンポーネントの状態管理(Store)
    const { isLoading } = useCommonStore()

    // ============================================================================
    // テンプレート（Template）
    // ============================================================================
    return (
        <>
            {isLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="animate-sway mb-3">
                            <CheckCircle className="text-primary mx-auto h-7 w-7" />
                        </div>
                        <p className="text-lg font-medium text-gray-600">読み込み中です...</p>
                    </div>
                </div>
            )}
        </>
    )
}
