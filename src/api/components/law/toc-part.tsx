import {
  ArticleRangeType,
  PartTitleType,
  TOCChapterType,
  TOCPartType,
} from "@api/types/law";
import { LawArticleRange } from "./article-range";
import { LawTOCChapter } from "./toc-chapter";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 目次編のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCPartType[]} props.tocPartList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目次編のコンポーネント
 */
export const LawTOCPart: React.FC<{
  tocPartList: TOCPartType[];
  treeElement: string[];
}> = (props) => {
  const { tocPartList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TOCPart_${index}`,
  ];

  return (
    <>
      {tocPartList.map((dt, index) => {
        const PartTitle = getType<PartTitleType>(dt.TOCPart, "PartTitle")[0];
        const ArticleRange = getType<ArticleRangeType>(
          dt.TOCPart,
          "ArticleRange"
        );
        const TOCChapter = getType<TOCChapterType>(dt.TOCPart, "TOCChapter");
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_TOCPart">
              {getTextNode(PartTitle.PartTitle, addTreeElement(index))}
              {ArticleRange.length > 0 && (
                <LawArticleRange
                  articleRange={ArticleRange[0]}
                  treeElement={addTreeElement(index)}
                />
              )}
            </div>
            <LawTOCChapter
              tocChapterList={TOCChapter}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};
