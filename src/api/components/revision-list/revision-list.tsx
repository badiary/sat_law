type RevisionsWrapperProps = {
  children: React.ReactNode;
};
/**
 * RevisionsWrapperコンポーネントは、改正法令リストをラップするためのコンポーネントです。
 *
 * @param {RevisionsWrapperProps} props - propsオブジェクト
 * @param {ReactNode} props.children - 子要素(RevisionItemコンポーネントのリスト)
 * @returns {JSX.Element} RevisionsWrapperコンポーネント
 */
const RevisionsWrapper = ({ children }: RevisionsWrapperProps) => {
  return (
    <div className="flex flex-col overflow-y-auto md-max-height-law">
      {children}
    </div>
  );
};

export default RevisionsWrapper;
