import {
  ArticleRangeType,
  DivisionTitleType,
  TOCDivisionType,
} from "@api/types/law";
import { LawArticleRange } from "./article-range";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 目次目のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCDivisionType[]} props.tocDivisionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目次目のコンポーネント
 */
export const LawTOCDivision: React.FC<{
  tocDivisionList: TOCDivisionType[];
  treeElement: string[];
}> = (props): React.ReactElement => {
  const { tocDivisionList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TOCDivision_${index}`,
  ];

  return (
    <>
      {tocDivisionList.map((dt, index) => {
        const DivisionTitle = getType<DivisionTitleType>(
          dt.TOCDivision,
          "DivisionTitle"
        )[0];
        const ArticleRange = getType<ArticleRangeType>(
          dt.TOCDivision,
          "ArticleRange"
        );
        return (
          <div
            key={`${addTreeElement(index).join("_")}`}
            className="_div_TOCDivision pl-16"
          >
            {getTextNode(DivisionTitle.DivisionTitle, addTreeElement(index))}
            {ArticleRange.length > 0 && (
              <LawArticleRange
                articleRange={ArticleRange[0]}
                treeElement={addTreeElement(index)}
              />
            )}
          </div>
        );
      })}
    </>
  );
};
