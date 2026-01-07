import { ParagraphSentenceType, SentenceType } from "@api/types/law";
import { LawSentence } from "./sentence";
import { getType } from "@api/lib/law/law";

/**
 * 項文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ParagraphSentenceType} props.paragraphSentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 項文のコンポーネント
 */
export const LawParagraphSentence: React.FC<{
  paragraphSentence: ParagraphSentenceType;
  treeElement: string[];
}> = (props) => {
  const { paragraphSentence, treeElement } = props;
  const Sentence = getType<SentenceType>(
    paragraphSentence.ParagraphSentence,
    "Sentence"
  );

  return (
    <LawSentence
      sentenceList={Sentence}
      treeElement={[...treeElement, "ParagraphSentence"]}
      isPrecedingSentence={false}
    />
  );
};
