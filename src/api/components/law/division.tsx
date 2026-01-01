import { ArticleType, DivisionTitleType, DivisionType } from "@api/types/law";
import { LawArticle } from "./article";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 目のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {DivisionType[]} props.divisionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目のコンポーネント
 */
export const LawDivision: React.FC<{
  divisionList: DivisionType[];
  treeElement: string[];
}> = (props) => {
  const { divisionList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Division_${index}`,
  ];
  return (
    <>
      {divisionList.map((dt, index) => {
        const DivisionTitle = getType<DivisionTitleType>(
          dt.Division,
          "DivisionTitle"
        )[0];
        const Article = getType<ArticleType>(dt.Division, "Article");

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <section className="active Division">
              <div className="_div_DivisionTitle DivisionTitle pl-24 font-bold">
                {getTextNode(
                  DivisionTitle.DivisionTitle,
                  addTreeElement(index)
                )}
              </div>
            </section>
            <LawArticle
              articleList={Article}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};
