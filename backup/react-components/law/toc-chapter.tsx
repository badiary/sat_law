import {
  ArticleRangeType,
  ChapterTitleType,
  TOCChapterType,
  TOCSectionType,
} from "@api/types/law";
import { LawArticleRange } from "./article-range";
import { LawTOCSection } from "./toc-section";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 目次章のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCChapterType[]} props.tocChapterList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目次章のコンポーネント
 */
export const LawTOCChapter: React.FC<{
  tocChapterList: TOCChapterType[];
  treeElement: string[];
}> = (props) => {
  const { tocChapterList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TOCChapter_${index}`,
  ];

  return (
    <>
      {tocChapterList.map((dt, index) => {
        const ChapterTitle = getType<ChapterTitleType>(
          dt.TOCChapter,
          "ChapterTitle"
        )[0];
        const ArticleRange = getType<ArticleRangeType>(
          dt.TOCChapter,
          "ArticleRange"
        );
        const TOCSection = getType<TOCSectionType>(dt.TOCChapter, "TOCSection");
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_TOCChapter pl-4">
              {getTextNode(ChapterTitle.ChapterTitle, addTreeElement(index))}
              {ArticleRange.length > 0 && (
                <LawArticleRange
                  articleRange={ArticleRange[0]}
                  treeElement={addTreeElement(index)}
                />
              )}
            </div>
            <LawTOCSection
              tocSectionList={TOCSection}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};
