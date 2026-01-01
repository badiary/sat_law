/**
 * 法令画面
 * @param searchParams 検索条件
 * @returns {JSX.Element} 法令画面
 */
export default function APIError({ message }: { message: string }) {
    return <div>
        <span>法令APIとの通信でエラーが発生しました。<a href={"'" + location.href + "'"}>ページを再読み込み</a>してください。</span><br />
        <span>エラーメッセージ：{message}</span>
    </div>;
}