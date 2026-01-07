import { ArticleRangeType } from "@api/types/law";
import { getTextNode } from "./text-node";

/**
 * 条範囲のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ArticleRangeType} props.articleRange - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 条範囲のコンポーネント
 */
export const LawArticleRange: React.FC<{
  articleRange: ArticleRangeType;
  treeElement: string[];
}> = (props) => {
  const { articleRange, treeElement } = props;

  return getTextNode(articleRange.ArticleRange, [
    ...treeElement,
    "ArticleRange",
  ]);
};
