import { ColumnType } from "@api/types/law";
import { LawSentence } from "./sentence";
import { Fragment } from "react";

/**
 * 欄のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ColumnType[]} props.columnList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 欄のコンポーネント
 */
export const LawColumn: React.FC<{
  columnList: ColumnType[];
  treeElement: string[];
}> = (props) => {
  console.log(props);
  const { columnList, treeElement } = props;
  const addTreeElement = (index: number) => [...treeElement, `Column_${index}`];
  let isLineBreak = false;
  return (
    <>
      {columnList.map((dt, index) => {
        if (
          !isLineBreak &&
          (dt[":@"].LineBreak === undefined || !dt[":@"].LineBreak)
        ) {
          isLineBreak = true;
        }
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {index > 0 && isLineBreak && `　`}
            {/* 樋口追記 */}
            {dt[":@"].Num && Number(dt[":@"].Num) > 1 && `　`}
            <LawSentence
              sentenceList={dt.Column}
              treeElement={addTreeElement(index)}
              isPrecedingSentence={false}
            />
            {dt[":@"].LineBreak && <br />}
          </Fragment>
        );
      })}
    </>
  );
};
