import { SectionTitleType, SectionType } from "@api/types/law";
import { LawArticle } from "./article";
import { LawSubsection } from "./subsection";
import { LawDivision } from "./division";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 目次節のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SectionType[]} props.sectionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目次節のコンポーネント
 */
export const LawSection: React.FC<{
  sectionList: SectionType[];
  treeElement: string[];
}> = (props) => {
  const { sectionList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Section_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {sectionList.map((dt, index) => {
        const SectionTitle = getType<SectionTitleType>(
          dt.Section,
          "SectionTitle"
        )[0];

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <section className="active Section pb-4">
              <div className="SectionTitle _div_SectionTitle pl-16 font-bold">
                {getTextNode(SectionTitle.SectionTitle, addTreeElement(index))}
              </div>
            </section>
            {dt.Section.map((dt2, index2) => {
              if ("Article" in dt2) {
                return (
                  <LawArticle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    articleList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subsection" in dt2) {
                return (
                  <LawSubsection
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subsectionList={[dt2]}
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
