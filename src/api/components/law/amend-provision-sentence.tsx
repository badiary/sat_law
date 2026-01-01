import { AmendProvisionSentenceType, SentenceType } from "@api/types/law";
import { LawSentence } from "./sentence";
import { getType } from "@api/lib/law/law";

/**
 * 改正規定文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AmendProvisionSentenceType} props.amendProvisionSentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 改正規定文のコンポーネント
 */
export const LawAmendProvisionSentence: React.FC<{
  amendProvisionSentence: AmendProvisionSentenceType;
  treeElement: string[];
}> = (props) => {
  const { amendProvisionSentence, treeElement } = props;
  const Sentence = getType<SentenceType>(
    amendProvisionSentence.AmendProvisionSentence,
    "Sentence"
  );

  return (
    <LawSentence
      sentenceList={Sentence}
      treeElement={[...treeElement, "AmendProvisionSentence"]}
      isPrecedingSentence={false}
    />
  );
};
