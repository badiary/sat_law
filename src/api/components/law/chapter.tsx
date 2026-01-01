import { ChapterTitleType, ChapterType } from "@api/types/law";
import { LawArticle } from "./article";
import { LawSection } from "./section";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 章のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ChapterType[]} props.chapterList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 章のコンポーネント
 */
export const LawChapter: React.FC<{
  chapterList: ChapterType[];
  treeElement: string[];
}> = (props) => {
  const { chapterList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Chapter_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];
  return (
    <>
      {chapterList.map((chapter, index) => {
        const ChapterTitle = getType<ChapterTitleType>(
          chapter.Chapter,
          "ChapterTitle"
        )[0];

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <section className="active Chapter pb-4">
              <div className="ChapterTitle _div_ChapterTitle font-bold pl-12">
                {getTextNode(ChapterTitle.ChapterTitle, addTreeElement(index))}
              </div>
            </section>
            {chapter.Chapter.map((dt2, index2) => {
              if ("Article" in dt2) {
                return (
                  <LawArticle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    articleList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Section" in dt2) {
                return (
                  <LawSection
                    key={`${addTreeElement(index, index2).join("_")}`}
                    sectionList={[dt2]}
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
