import { TableHeaderRowType } from "@api/types/law";
import { LawTableHeaderColumn } from "./table-header-column";

/**
 * 表欄名項のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TableHeaderRowType[]} props.tableHeaderRowList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 表欄名項のコンポーネント
 */
export const LawTableHeaderRow: React.FC<{
  tableHeaderRowList: TableHeaderRowType[];
  treeElement: string[];
}> = (props) => {
  const { tableHeaderRowList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TableHeaderRow_${index}`,
  ];

  return (
    <>
      {tableHeaderRowList.map((dt, index) => {
        return (
          <tr
            key={`${addTreeElement(index).join("_")}`}
            className="TableHeaderRow"
          >
            <LawTableHeaderColumn
              tableHeaderColumnList={dt.TableHeaderColumn}
              treeElement={[...treeElement, "TableHeaderRow"]}
            />
          </tr>
        );
      })}
    </>
  );
};
