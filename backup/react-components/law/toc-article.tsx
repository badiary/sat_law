import { getType } from "@api/lib/law/law";
import {
  ArticleCaptionType,
  ArticleTitleType,
  TOCArticleType,
} from "@api/types/law";
import { getTextNode } from "./text-node";

/**
 * ⽬次条のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCArticleType[]} props.tocArticleList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - ⽬次条のコンポーネント
 */
export const LawTOCArticle: React.FC<{
  tocArticleList: TOCArticleType[];
  treeElement: string[];
}> = (props) => {
  const { tocArticleList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TOCArticle_${index}`,
  ];

  return (
    <>
      {tocArticleList.map((dt, index) => {
        const ArticleTitle = getType<ArticleTitleType>(
          dt.TOCArticle,
          "ArticleTitle"
        )[0];
        const ArticleCaption = getType<ArticleCaptionType>(
          dt.TOCArticle,
          "ArticleCaption"
        )[0];
        return (
          <div
            key={`${addTreeElement(index).join("_")}`}
            className="_div_TOCArticle pl-4"
          >
            {getTextNode(ArticleTitle.ArticleTitle, addTreeElement(index))}
            {getTextNode(ArticleCaption.ArticleCaption, addTreeElement(index))}
          </div>
        );
      })}
    </>
  );
};
