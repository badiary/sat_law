import { SubsectionTitleType, SubsectionType } from "@api/types/law";
import { LawArticle } from "./article";
import { LawDivision } from "./division";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 款のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SubsectionType[]} props.subsectionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 款のコンポーネント
 */
export const LawSubsection: React.FC<{
  subsectionList: SubsectionType[];
  treeElement: string[];
}> = (props) => {
  const { subsectionList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subsection_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subsectionList.map((dt, index) => {
        const SubsectionTitle = getType<SubsectionTitleType>(
          dt.Subsection,
          "SubsectionTitle"
        )[0];

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <section>
              <div className="SubsectionTitle _div_SubsectionTitle pl-5 font-bold">
                {getTextNode(
                  SubsectionTitle.SubsectionTitle,
                  addTreeElement(index)
                )}
              </div>
            </section>
            {dt.Subsection.map((dt2, index2) => {
              if ("Article" in dt2) {
                return (
                  <LawArticle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    articleList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Division" in dt2) {
                return (
                  <LawDivision
                    key={`${addTreeElement(index, index2).join("_")}`}
                    divisionList={[dt2]}
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
