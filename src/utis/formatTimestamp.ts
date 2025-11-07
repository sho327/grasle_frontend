/**
 * タイムスタンプを相対時間（X分前）または絶対日付（YYYY/MM/DD）でフォーマットする
 * @param timestamp ISO形式のタイムスタンプ文字列
 * @param threshold 相対表示を維持する日数 (例: 7日で1週間前まで)
 */
export const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInDays = Math.floor(diffInMinutes / 1440);

    // 1. 今すぐ (60秒未満)
    if (diffInMinutes < 1) return '今';

    // 2. 1時間以内 (60分未満)
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;

    // 3. 24時間以内 (1440分未満)
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;

	// 4. 7日以内(7日未満)
	if (diffInDays < 7) {
		return `${diffInDays}日前`;
	}

	// 5. 30日以内(30日未満)
	if (diffInDays < 30) {
		const diffInWeeks = Math.floor(diffInDays / 7);
		return `${diffInWeeks}週間前`;
	}
    // 6. 長期データ (絶対日付表示に切り替え)
    // 💡 例: 2024/05/20
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};