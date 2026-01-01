import { TableStructTitleType, TableStructType } from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawTable } from "./table";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 表項⽬のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TableStructType[]} props.tableStructList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 表項⽬のコンポーネント
 */
export const LawTableStruct: React.FC<{
  tableStructList: TableStructType[];
  treeElement: string[];
}> = (props) => {
  const { tableStructList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `TableStruct_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {tableStructList.map((dt, index) => {
        const TableStructTitle = getType<TableStructTitleType>(
          dt.TableStruct,
          "TableStructTitle"
        );
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {TableStructTitle.length > 0 && (
              <div className="_div_TableStructTitle">
                {getTextNode(
                  TableStructTitle[0].TableStructTitle,
                  addTreeElement(index)
                )}
              </div>
            )}
            {dt.TableStruct.map((dt2, index2) => {
              if ("Table" in dt2) {
                return (
                  <LawTable
                    key={`${addTreeElement(index, index2).join("_")}`}
                    table={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Remarks" in dt2) {
                return (
                  <LawRemarks
                    key={`${addTreeElement(index, index2).join("_")}`}
                    remarksList={[dt2]}
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
