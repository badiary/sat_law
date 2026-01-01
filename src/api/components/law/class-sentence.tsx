import { ClassSentenceType } from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawColumn } from "./column";
import { LawTable } from "./table";

/**
 * 類文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ClassSentenceType} props.classSentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 類文のコンポーネント
 */
export const LawClassSentence: React.FC<{
  classSentence: ClassSentenceType;
  treeElement: string[];
}> = (props) => {
  const { classSentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `ClassSentence_${index}`,
  ];

  return (
    <>
      {classSentence.ClassSentence.map((dt, index) => {
        if ("Sentence" in dt) {
          return (
            <LawSentence
              key={`${addTreeElement(index).join("_")}`}
              sentenceList={[dt]}
              treeElement={addTreeElement(index)}
              isPrecedingSentence={
                index > 0 &&
                classSentence.ClassSentence.slice(0, index).some(
                  (dt) => "Sentence" in dt
                )
              }
            />
          );
        } else if ("Column" in dt) {
          return (
            <LawColumn
              key={`${addTreeElement(index).join("_")}`}
              columnList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else {
          return (
            <LawTable
              key={`${addTreeElement(index).join("_")}`}
              table={dt}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </>
  );
};
