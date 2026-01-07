import {
  AppdxTableTitleType,
  AppdxTableType,
  RelatedArticleNumType,
  RemarksType,
} from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawRelatedArticleNum } from "./related-article-num";
import { LawTableStruct } from "./table-struct";
import { LawItem } from "./item";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 別表のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AppdxTableType[]} props.appdxTableList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 別表のコンポーネント
 */
export const LawAppdxTable: React.FC<{
  appdxTableList: AppdxTableType[];
  treeElement: string[];
}> = (props) => {
  const { appdxTableList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `AppdxTable_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];
  return (
    <>
      {appdxTableList.map((dt, index) => {
        const AppdxTableTitle = getType<AppdxTableTitleType>(
          dt.AppdxTable,
          "AppdxTableTitle"
        );
        const RelatedArticleNum = getType<RelatedArticleNumType>(
          dt.AppdxTable,
          "RelatedArticleNum"
        );
        const Remarks = getType<RemarksType>(dt.AppdxTable, "Remarks");

        return (
          <section
            key={`${addTreeElement(index).join("_")}`}
            className="active AppdxTable"
          >
            {(AppdxTableTitle.length > 0 || RelatedArticleNum.length > 0) && (
              <div className="_div_AppdxTableTitle font-bold">
                {AppdxTableTitle.length > 0 &&
                  getTextNode(
                    AppdxTableTitle[0].AppdxTableTitle,
                    addTreeElement(index)
                  )}
                <LawRelatedArticleNum
                  relatedArticleNumList={RelatedArticleNum}
                  treeElement={addTreeElement(index)}
                />
              </div>
            )}

            {dt.AppdxTable.map((dt2, index2) => {
              if ("Item" in dt2) {
                return (
                  <LawItem
                    key={`${addTreeElement(index, index2).join("_")}`}
                    itemList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                    isPrecedingParagraph={false}
                  />
                );
              } else if ("TableStruct" in dt2) {
                return (
                  <LawTableStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tableStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              }
            })}
            <LawRemarks
              remarksList={Remarks}
              treeElement={addTreeElement(index)}
            />
          </section>
        );
      })}
    </>
  );
};
