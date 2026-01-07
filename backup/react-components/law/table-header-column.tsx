import { TableHeaderColumnType } from "@api/types/law";
import { getTextNode } from "./text-node";

/**
 * 表欄名のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TableHeaderColumnType[]} props.tableHeaderColumnList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 表欄名のコンポーネント
 */
export const LawTableHeaderColumn: React.FC<{
  tableHeaderColumnList: TableHeaderColumnType[];
  treeElement: string[];
}> = (props) => {
  const { tableHeaderColumnList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TableHeaderColumn_${index}`,
  ];
  return (
    <>
      {tableHeaderColumnList.map((dt, index) => {
        return (
          <td
            key={`${addTreeElement(index).join("_")}`}
            style={{
              borderTop: "black solid 1px",
              borderBottom: "black solid 1px",
              borderLeft: "black solid 1px",
              borderRight: "black solid 1px",
            }}
            className="TableHeaderColumn"
          >
            {getTextNode(dt.TableHeaderColumn, [
              ...treeElement,
              "TableHeaderColumn",
            ])}
          </td>
        );
      })}
    </>
  );
};
