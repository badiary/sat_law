import { TableHeaderRowType, TableRowType, TableType } from "@api/types/law";
import { LawTableRow } from "./table-row";
import { LawTableHeaderRow } from "./table-header-row";
import { getType } from "@api/lib/law/law";

/**
 * 表のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TableType} props.table - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 表のコンポーネント
 */
export const LawTable: React.FC<{
  table: TableType;
  treeElement: string[];
}> = (props) => {
  const { table, treeElement } = props;
  const addTreeElement = [...treeElement, "Table"];

  const TableHeaderRow = getType<TableHeaderRowType>(
    table.Table,
    "TableHeaderRow"
  );
  const TableRow = getType<TableRowType>(table.Table, "TableRow");

  return (
    <table className="Table">
      <tbody>
        <LawTableHeaderRow
          tableHeaderRowList={TableHeaderRow}
          treeElement={addTreeElement}
        />
        <LawTableRow tableRowList={TableRow} treeElement={addTreeElement} />
      </tbody>
    </table>
  );
};
