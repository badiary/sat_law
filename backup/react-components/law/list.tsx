import { ListSentenceType, ListType, Sublist1Type } from "@api/types/law";
import { LawSublist1 } from "./sublist";
import { LawListSentence } from "./list-sentence";
import { Fragment } from "react";
import { getParentElement, getType } from "@api/lib/law/law";

/**
 * 列記のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ListType[]} props.listList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記のコンポーネント
 */
export const LawList: React.FC<{
  listList: ListType[];
  treeElement: string[];
}> = (props) => {
  const { listList, treeElement } = props;
  const addTreeElement = (index: number) => [...treeElement, `List_${index}`];
  return (
    <>
      {listList.map((dt, index) => {
        const ListSentence = getType<ListSentenceType>(
          dt.List,
          "ListSentence"
        )[0];
        const Sublist1 = getType<Sublist1Type>(dt.List, "Sublist1");
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div
              className={`_div_ListSentence ${
                getParentElement(treeElement) == "Paragraph" &&
                treeElement.length > 1 &&
                treeElement[treeElement.length - 2] == "TableColumn"
                  ? "pl-8"
                  : "pl-4"
              }`}
            >
              <LawListSentence
                key={`ListSentence_${index}`}
                listSentence={ListSentence}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawSublist1
              key={`Sublist1_${index}`}
              sublist1List={Sublist1}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};
