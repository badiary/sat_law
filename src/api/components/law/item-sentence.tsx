import { ItemSentenceType } from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawColumn } from "./column";
import { LawTable } from "./table";

/**
 * 号文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ItemSentenceType} props.itemSentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号文のコンポーネント
 */
export const LawItemSentence: React.FC<{
  itemSentence: ItemSentenceType;
  treeElement: string[];
}> = (props) => {
  const { itemSentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `ItemSentence_${index}`,
  ];

  return (
    <>
      {itemSentence.ItemSentence.map((dt, index) => {
        if ("Sentence" in dt) {
          return (
            <LawSentence
              key={`${addTreeElement(index).join("_")}`}
              sentenceList={[dt]}
              treeElement={addTreeElement(index)}
              isPrecedingSentence={
                index > 0 &&
                itemSentence.ItemSentence.slice(0, index).some(
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
