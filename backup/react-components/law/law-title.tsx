import { LawTitleType } from "@api/types/law";
import { TextNode } from "./text-node";

/**
 * LawTitle コンポーネントのプロパティを定義する型
 * @typedef {Object} LawTitleProps
 * @property {LawTitleType} value - 表示情報
 */
type LawTitleProps = {
  value: LawTitleType;
};

/**
 * 法令名のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @returns {JSX.Element} - 法令名のコンポーネント
 */
const LawTitle = (props: LawTitleProps) => {
  const { value } = props;

  return (
    <span className="font-bold">
      <TextNode val={value.LawTitle} />
    </span>
  );
};

export default LawTitle;
