import { LawNumType } from "@api/types/law";
import { TextNode } from "./text-node";

/**
 * LawNum コンポーネントのプロパティを定義する型
 * @typedef {Object} LawNumProps
 * @property {LawNumType} value - 表示情報
 */
type LawNumProps = {
  value: LawNumType;
};

/**
 * 法令番号のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @returns {JSX.Element} - 法令番号のコンポーネント
 */
const LawNum = (props: LawNumProps) => {
  const { value } = props;

  if (value.LawNum === undefined) {
    return <></>;
  }

  return (
    <span>
      (<TextNode val={value.LawNum} />)
    </span>
  );
};

export default LawNum;
