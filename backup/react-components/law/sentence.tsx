import { getParentElement } from "@api/lib/law/law";
import { SentenceType } from "@api/types/law";
import { Fragment } from "react";
import { getTextNode } from "./text-node";

/**
 * 段のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SentenceType[]} props.sentenceList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @param {boolean} props.isPrecedingSentence - 2件目以降のSentenceかどうかのフラグ
 * @returns {JSX.Element} - 段のコンポーネント
 */
export const LawSentence: React.FC<{
  sentenceList: SentenceType[];
  treeElement: string[];
  isPrecedingSentence: boolean;
}> = (props) => {
  const { sentenceList, treeElement, isPrecedingSentence } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Sentence_${index}`,
  ];
  return (
    <>
      {sentenceList.map((dt, index) => {
        if (getParentElement(treeElement) == "Remarks") {
          return (
            <div key={`${addTreeElement(index).join("_")}`}>
              {getTextNode(dt.Sentence, addTreeElement(index))}{" "}
            </div>
          );
        } else {
          return (
            <Fragment key={`${addTreeElement(index).join("_")}`}>
              {["TableColumn", "ArithFormula"].includes(
                getParentElement(treeElement)
              ) &&
                (index > 0 || isPrecedingSentence)}
              {getTextNode(dt.Sentence, addTreeElement(index))}
            </Fragment>
          );
        }
      })}
    </>
  );
};
