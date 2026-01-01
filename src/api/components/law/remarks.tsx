import {
  ItemType,
  RemarksLabelType,
  RemarksType,
  SentenceType,
} from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawItem } from "./item";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 備考のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {RemarksType[]} props.remarksList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 備考のコンポーネント
 */
export const LawRemarks: React.FC<{
  remarksList: RemarksType[];
  treeElement: string[];
}> = (props) => {
  const { remarksList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Remarks_${index}`,
  ];

  return (
    <>
      {remarksList.map((dt, index) => {
        const RemarksLabel = getType<RemarksLabelType>(
          dt.Remarks,
          "RemarksLabel"
        )[0];
        const Sentence = getType<SentenceType>(dt.Remarks, "Sentence");
        const Item = getType<ItemType>(dt.Remarks, "Item");

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_RemarksLabel">
              {getTextNode(RemarksLabel.RemarksLabel, addTreeElement(index))}
            </div>
            <LawSentence
              sentenceList={Sentence}
              treeElement={addTreeElement(index)}
              isPrecedingSentence={false}
            />
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
