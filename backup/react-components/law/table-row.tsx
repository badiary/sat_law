import { TableRowType } from "@api/types/law";
import { LawTableColumn } from "./table-column";

/**
 * 表項のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TableRowType[]} props.tableRowList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 表項のコンポーネント
 */
export const LawTableRow: React.FC<{
  tableRowList: TableRowType[];
  treeElement: string[];
}> = (props) => {
  const { tableRowList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TableRow_${index}`,
  ];

  return (
    <>
      {tableRowList.map((dt, index) => {
        return (
          <tr key={`${addTreeElement(index).join("_")}`} className="TableRow">
            <LawTableColumn
              tableColumnList={dt.TableRow}
              treeElement={[...treeElement, "TableRow"]}
            />
          </tr>
        );
      })}
    </>
  );
};
