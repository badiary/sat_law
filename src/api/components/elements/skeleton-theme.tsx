import { SkeletonTheme as SkeletonThemeComponent } from "react-loading-skeleton";
/**
 * SkeletonThemeコンポーネントは、Skeleton UIを提供するためのテーマを設定します。
 * loadingコンポーネントで共通のSkeltonTheme
 * @param {Object} props - Reactコンポーネントのプロパティ
 * @param {React.ReactNode} props.children - SkeletonThemeコンポーネントの子要素
 * @returns {JSX.Element} - SkeletonThemeコンポーネント
 */
const SkeletonTheme = ({ children }: { children: React.ReactNode }) => {
  return (
    <SkeletonThemeComponent baseColor="#e8e8eb" highlightColor="#f1f1f4">
      {children}
    </SkeletonThemeComponent>
  );
};

export default SkeletonTheme;
