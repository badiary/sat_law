import {
  ClassSentenceType,
  ClassTitleType,
  ClassType,
  ItemType,
} from "@api/types/law";
import { LawItem } from "./item";
import { LawClassSentence } from "./class-sentence";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 類のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ClassType[]} props.classList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 類のコンポーネント
 */
export const LawClass: React.FC<{
  classList: ClassType[];
  treeElement: string[];
}> = (props) => {
  const { classList, treeElement } = props;
  const addTreeElement = (index: number) => [...treeElement, `Class_${index}`];

  return (
    <>
      {classList.map((dt, index) => {
        const ClassTitle = getType<ClassTitleType>(dt.Class, "ClassTitle");
        const ClassSentence = getType<ClassSentenceType>(
          dt.Class,
          "ClassSentence"
        )[0];
        const Item = getType<ItemType>(dt.Class, "Item");

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_ClassSentence">
              {ClassTitle.length > 0 &&
                getTextNode(ClassTitle[0].ClassTitle, addTreeElement(index))}
              {`　`}
              <LawClassSentence
                classSentence={ClassSentence}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawItem
              itemList={Item}
              treeElement={addTreeElement(index)}
              isPrecedingParagraph={false}
            />
          </Fragment>
        );
      })}
    </>
  );
};
