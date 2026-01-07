import {
  RelatedArticleNumType,
  SupplProvisionAppdxTableTitleType,
  SupplProvisionAppdxTableType,
  TableStructType,
} from "@api/types/law";
import { LawRelatedArticleNum } from "./related-article-num";
import { LawTableStruct } from "./table-struct";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 附則別表のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SupplProvisionAppdxTableType[]} props.supplProvisionAppdxTableList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 附則別表のコンポーネント
 */
export const LawSupplProvisionAppdxTable: React.FC<{
  supplProvisionAppdxTableList: SupplProvisionAppdxTableType[];
  treeElement: string[];
}> = (props) => {
  const { supplProvisionAppdxTableList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `SupplProvisionAppdxTable_${index}`,
  ];

  return (
    <>
      {supplProvisionAppdxTableList.map((dt, index) => {
        const SupplProvisionAppdxTableTitle =
          getType<SupplProvisionAppdxTableTitleType>(
            dt.SupplProvisionAppdxTable,
            "SupplProvisionAppdxTableTitle"
          )[0];
        const RelatedArticleNum = getType<RelatedArticleNumType>(
          dt.SupplProvisionAppdxTable,
          "RelatedArticleNum"
        );
        const TableStruct = getType<TableStructType>(
          dt.SupplProvisionAppdxTable,
          "TableStruct"
        );

        return (
          <section
            key={`${addTreeElement(index).join("_")}`}
            className="active SupplProvisionAppdxTable"
          >
            <div className="_div_SupplProvisionAppdxStyleTitle font-bold">
              {getTextNode(
                SupplProvisionAppdxTableTitle.SupplProvisionAppdxTableTitle,
                addTreeElement(index)
              )}
              <LawRelatedArticleNum
                relatedArticleNumList={RelatedArticleNum}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawTableStruct
              tableStructList={TableStruct}
              treeElement={addTreeElement(index)}
            />
          </section>
        );
      })}
    </>
  );
};
