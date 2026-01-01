import { ColumnType, ListSentenceType, SentenceType } from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawColumn } from "./column";
import { getType } from "@api/lib/law/law";

/**
 * 列記文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ListSentenceType} props.listSentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記文のコンポーネント
 */
export const LawListSentence: React.FC<{
  listSentence: ListSentenceType;
  treeElement: string[];
}> = (props) => {
  const { listSentence, treeElement } = props;
  const addTreeElement = [...treeElement, "ListSentence"];
  const Sentence = getType<SentenceType>(listSentence.ListSentence, "Sentence");
  const Column = getType<ColumnType>(listSentence.ListSentence, "Column");
  return (
    <>
      <LawSentence
        sentenceList={Sentence}
        treeElement={addTreeElement}
        isPrecedingSentence={false}
      />
      <LawColumn columnList={Column} treeElement={addTreeElement} />
    </>
  );
};
