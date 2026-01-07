import { ParagraphType, PreambleType } from "@api/types/law";
import { LawParagraph } from "./paragraph";
import { getType } from "@api/lib/law/law";

/**
 * 前文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {PreambleType} props.preamble - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 前文のコンポーネント
 */
export const LawPreamble: React.FC<{
  preamble: PreambleType;
  treeElement: string[];
}> = (props) => {
  const { preamble, treeElement } = props;
  const Paragraph = getType<ParagraphType>(preamble.Preamble, "Paragraph");

  return (
    <LawParagraph
      paragraphList={Paragraph}
      treeElement={[...treeElement, "Preamble"]}
      parentParagraphIndex={0}
    />
  );
};
