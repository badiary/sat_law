import { ArithFormulaNumType } from "@api/types/law";
import { getTextNode } from "./text-node";

/**
 * 算式番号のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ArithFormulaNumType} props.arithFormulaNum - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 算式番号のコンポーネント
 */
export const LawArithFormulaNum: React.FC<{
  arithFormulaNum: ArithFormulaNumType;
  treeElement: string[];
}> = (props) => {
  const { arithFormulaNum, treeElement } = props;

  return (
    <span className="_span_ArithFormulaNum">
      {getTextNode(arithFormulaNum.ArithFormulaNum, [
        ...treeElement,
        "ArithFormulaNum",
      ])}
    </span>
  );
};
