import {
  ItemSentenceType,
  ItemTitleType,
  ItemType,
  Subitem1Type,
} from "@api/types/law";
import { LawList } from "./list";
import { LawSubitem1 } from "./subitem";
import { LawItemSentence } from "./item-sentence";
import { LawTableStruct } from "./table-struct";
import { LawFigStruct } from "./fig-struct";
import { LawStyleStruct } from "./style-struct";
import { Fragment } from "react";
import { getParentElement, getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 号のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ItemType[]} props.itemList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @param {boolean} props.isPrecedingParagraph - 2件目以降のParagraphかどうかのフラグ
 * @returns {JSX.Element} - 号のコンポーネント
 */
export const LawItem: React.FC<{
  itemList: ItemType[];
  treeElement: string[];
  isPrecedingParagraph: boolean;
}> = (props) => {
  const { itemList, treeElement, isPrecedingParagraph } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Item_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  const padding = () => {
    if (
      (treeElement.some((dt) => /^TableColumn.*/.test(dt)) &&
        getParentElement(treeElement) == "Paragraph") ||
      (treeElement.some((dt) => /^Paragraph_.*/.test(dt)) &&
        isPrecedingParagraph)
    ) {
      return "pl-8";
    } else {
      return "pl-4";
    }
  };
  return (
    <>
      {itemList.map((dt, index) => {
        const ItemTitle = getType<ItemTitleType>(dt.Item, "ItemTitle");
        const Subitem1 = getType<Subitem1Type>(dt.Item, "Subitem1");
        const ItemSentence = getType<ItemSentenceType>(
          dt.Item,
          "ItemSentence"
        )[0];

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className={`_div_ItemSentence ${padding()} indent-1`}>
              {ItemTitle.length > 0 && (
                <span className="font-bold">
                  {getTextNode(ItemTitle[0].ItemTitle, addTreeElement(index))}
                  {`　`}
                </span>
              )}
              <LawItemSentence
                itemSentence={ItemSentence}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawSubitem1
              subitem1List={Subitem1}
              treeElement={addTreeElement(index)}
            />
            {dt.Item.map((dt2, index2) => {
              if ("TableStruct" in dt2) {
                return (
                  <LawTableStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tableStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("FigStruct" in dt2) {
                return (
                  <LawFigStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    figStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("StyleStruct" in dt2) {
                return (
                  <LawStyleStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    styleStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("List" in dt2) {
                return (
                  <LawList
                    key={`${addTreeElement(index, index2).join("_")}`}
                    listList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              }
            })}
          </Fragment>
        );
      })}
    </>
  );
};
