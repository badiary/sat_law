import {
  ColumnType,
  SentenceType,
  Sublist1SentenceType,
  Sublist2SentenceType,
  Sublist3SentenceType,
} from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawColumn } from "./column";
import { getType } from "@api/lib/law/law";

/**
 * 列記細分１⽂のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Sublist1SentenceType} props.sublist1Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分１⽂のコンポーネント
 */
export const LawSublist1Sentence: React.FC<{
  sublist1Sentence: Sublist1SentenceType;
  treeElement: string[];
}> = (props) => {
  const { sublist1Sentence, treeElement } = props;

  return (
    <LawSublistSentence
      sublistSentence={sublist1Sentence.Sublist1Sentence}
      treeElement={[...treeElement, "Sublist1Sentence"]}
    />
  );
};

/**
 * 列記細分２⽂のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Sublist2SentenceType} props.sublist2Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分２⽂のコンポーネント
 */
export const LawSublist2Sentence: React.FC<{
  sublist2Sentence: Sublist2SentenceType;
  treeElement: string[];
}> = (props) => {
  const { sublist2Sentence, treeElement } = props;

  return (
    <LawSublistSentence
      sublistSentence={sublist2Sentence.Sublist2Sentence}
      treeElement={[...treeElement, "Sublist2Sentence"]}
    />
  );
};

/**
 * 列記細分３⽂のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Sublist3SentenceType} props.sublist3Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分３⽂のコンポーネント
 */
export const LawSublist3Sentence: React.FC<{
  sublist3Sentence: Sublist3SentenceType;
  treeElement: string[];
}> = (props) => {
  const { sublist3Sentence, treeElement } = props;

  return (
    <LawSublistSentence
      sublistSentence={sublist3Sentence.Sublist3Sentence}
      treeElement={[...treeElement, "Sublist3Sentence"]}
    />
  );
};

/**
 * 列記細分のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {(SentenceType | ColumnType)[]} props.sublistSentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分のコンポーネント
 */
const LawSublistSentence: React.FC<{
  sublistSentence: (SentenceType | ColumnType)[];
  treeElement: string[];
}> = (props) => {
  const { sublistSentence, treeElement } = props;
  const Sentence = getType<SentenceType>(sublistSentence, "Sentence");
  const Column = getType<ColumnType>(sublistSentence, "Column");
  return (
    <>
      <LawSentence
        sentenceList={Sentence}
        treeElement={treeElement}
        isPrecedingSentence={false}
      />
      <LawColumn columnList={Column} treeElement={treeElement} />
    </>
  );
};
