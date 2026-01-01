import { PartTitleType, PartType } from "@api/types/law";
import { LawChapter } from "./chapter";
import { LawArticle } from "./article";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 編のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {PartType[]} props.partList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 編のコンポーネント
 */
export const LawPart: React.FC<{
  partList: PartType[];
  treeElement: string[];
}> = (props) => {
  const { partList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Part_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {partList.map((dt, index) => {
        const PartTitle = getType<PartTitleType>(dt.Part, "PartTitle")[0];

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <section className="active Part followingPart Part pb-4">
              <div className="_div_PartTitle PartTitle font-bold pl-8">
                {getTextNode(PartTitle.PartTitle, addTreeElement(index))}
              </div>
            </section>
            {dt.Part.map((dt2, index2) => {
              if ("Chapter" in dt2) {
                return (
                  <LawChapter
                    key={`${addTreeElement(index, index2).join("_")}`}
                    chapterList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Article" in dt2) {
                return (
                  <LawArticle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    articleList={[dt2]}
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
