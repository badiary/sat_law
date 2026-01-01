import {
  ArticleRangeType,
  SectionTitleType,
  TOCSectionType,
} from "@api/types/law";
import { LawArticleRange } from "./article-range";
import { LawTOCDivision } from "./toc-division";
import { LawTOCSubsection } from "./toc-subsection";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 目次節のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCSectionType[]} props.tocSectionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目次節のコンポーネント
 */
export const LawTOCSection: React.FC<{
  tocSectionList: TOCSectionType[];
  treeElement: string[];
}> = (props): React.ReactElement => {
  const { tocSectionList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `TOCSection_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {tocSectionList.map((dt, index) => {
        const SectionTitle = getType<SectionTitleType>(
          dt.TOCSection,
          "SectionTitle"
        )[0];
        const ArticleRange = getType<ArticleRangeType>(
          dt.TOCSection,
          "ArticleRange"
        );
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_TOCSection pl-8">
              {getTextNode(SectionTitle.SectionTitle, addTreeElement(index))}
              {ArticleRange.length > 0 && (
                <LawArticleRange
                  articleRange={ArticleRange[0]}
                  treeElement={addTreeElement(index)}
                />
              )}
            </div>
            {dt.TOCSection.map((dt2, index2) => {
              if ("TOCSubsection" in dt2) {
                return (
                  <LawTOCSubsection
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tocSubsection={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("TOCDivision" in dt2) {
                return (
                  <LawTOCDivision
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tocDivisionList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              }
            })}
          </Fragment>
        );
      })}
    </>
  );
};
