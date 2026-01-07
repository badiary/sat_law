import { RelatedArticleNumType } from "@api/types/law";
import { getTextNode } from "./text-node";

/**
 * 関係条⽂番号のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {RelatedArticleNumType[]} props.relatedArticleNumList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 関係条⽂番号のコンポーネント
 */
export const LawRelatedArticleNum: React.FC<{
  relatedArticleNumList: RelatedArticleNumType[];
  treeElement: string[];
}> = (props) => {
  const { relatedArticleNumList, treeElement } = props;
  return (
    <>
      {relatedArticleNumList.length > 0 &&
        getTextNode(relatedArticleNumList[0].RelatedArticleNum, [
          ...treeElement,
          "RelatedArticleNum",
        ])}
    </>
  );
};
