import { LawItem } from "@api/components/law/item";
import {
  AmendProvisionType,
  ClassType,
  FigStructType,
  ItemType,
  ListType,
  ParagraphCaptionType,
  ParagraphNumType,
  ParagraphSentenceType,
  ParagraphType,
  StyleStructType,
  TableStructType,
} from "@api/types/law";
import { LawTableStruct } from "./table-struct";
import { LawParagraphSentence } from "./paragraph-sentence";
import { LawAmendProvision } from "./amend-provision";
import { LawClass } from "./class";
import { LawFigStruct } from "./fig-struct";
import { LawStyleStruct } from "./style-struct";
import { LawList } from "./list";
import { Fragment } from "react";
import { getType, getParentElement } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 数値に対応した項番号のラベルを返却する。
 * @param {number} val - 対象値
 * @returns {string} - 項番号のラベル
 */
const getOldNumLabel = (val: number) => {
  const numLabelList = [
    "⓪",
    "①",
    "②",
    "③",
    "④",
    "⑤",
    "⑥",
    "⑦",
    "⑧",
    "⑨",
    "⑩",
    "⑪",
    "⑪",
    "⑫",
    "⑬",
    "⑭",
    "⑮",
    "⑯",
    "⑰",
    "⑱",
    "⑲",
    "⑳",
    "㉑",
    "㉒",
    "㉓",
    "㉔",
    "㉕",
    "㉖",
    "㉗",
    "㉘",
    "㉙",
    "㉚",
    "㉛",
    "㉜",
    "㉝",
    "㉞",
    "㉟",
    "㊱",
    "㊲",
    "㊳",
    "㊴",
    "㊵",
    "㊶",
    "㊷",
    "㊸",
    "㊹",
    "㊺",
    "㊻",
    "㊼",
    "㊽",
    "㊾",
    "㊿",
  ];
  return val < numLabelList.length ? numLabelList[val] : val.toString();
};

/**
 * 項のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {ParagraphType[]} paragraphList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @param {number} props.parentParagraphIndex - 親の項指数
 * @returns {JSX.Element} - 項のコンポーネント
 */
export const LawParagraph: React.FC<{
  paragraphList: ParagraphType[];
  treeElement: string[];
  parentParagraphIndex: number;
}> = (props) => {
  const { paragraphList, treeElement, parentParagraphIndex } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Paragraph_${index + parentParagraphIndex}${
      index2 !== undefined ? `_Child_${index2}` : ""
    }`,
  ];
  return (
    <>
      {paragraphList.map((dt, index) => {
        const ParagraphCaption = getType<ParagraphCaptionType>(
          dt.Paragraph,
          "ParagraphCaption"
        );
        const ParagraphNum = getType<ParagraphNumType>(
          dt.Paragraph,
          "ParagraphNum"
        )[0];
        const ParagraphSentence = getType<ParagraphSentenceType>(
          dt.Paragraph,
          "ParagraphSentence"
        )[0];

        const AmendProvision = getType<AmendProvisionType>(
          dt.Paragraph,
          "AmendProvision"
        );
        const Class = getType<ClassType>(dt.Paragraph, "Class");
        const TableStruct = getType<TableStructType>(
          dt.Paragraph,
          "TableStruct"
        );
        const FigStruct = getType<FigStructType>(dt.Paragraph, "FigStruct");
        const StyleStruct = getType<StyleStructType>(
          dt.Paragraph,
          "StyleStruct"
        );
        const Item = getType<ItemType>(dt.Paragraph, "Item");
        const List = getType<ListType>(dt.Paragraph, "List");

        const ParagraphNumNode = (
          <>
            {dt[":@"].OldNum !== undefined && dt[":@"].OldNum ? (
              <>
                <span className="font-bold">
                  {getOldNumLabel(dt[":@"].Num)}
                </span>
                {`　`}
              </>
            ) : (
              ParagraphNum.ParagraphNum.length > 0 && (
                <>
                  <span className="font-bold">
                    {getTextNode(
                      ParagraphNum.ParagraphNum,
                      addTreeElement(index)
                    )}
                  </span>
                  {`　`}
                </>
              )
            )}
          </>
        );

        const ParagraphNode = (
          <>
            {ParagraphCaption.length > 0 && (
              <div className="_div_ParagraphCaption font-bold pl-4">
                {getTextNode(
                  ParagraphCaption[0].ParagraphCaption,
                  addTreeElement(index)
                )}
              </div>
            )}
            <div
              className={`_div_ParagraphSentence ${
                ParagraphNum.ParagraphNum.length > 0
                  ? "pl-4 indent-1"
                  : "indent1"
              }`}
            >
              {ParagraphNumNode}
              <LawParagraphSentence
                paragraphSentence={ParagraphSentence}
                treeElement={addTreeElement(index)}
              />
            </div>
          </>
        );

        const Children = () =>
          dt.Paragraph.map((dt2, index2) => {
            // console.log(
            //   `Children(${index2}): ${addTreeElement(index, index2).join("_")}`
            // );
            if ("AmendProvision" in dt2) {
              return (
                <LawAmendProvision
                  key={`${addTreeElement(index, index2).join("_")}`}
                  amendProvisionList={[dt2]}
                  treeElement={addTreeElement(index, index2)}
                />
              );
            } else if ("Class" in dt2) {
              return (
                <LawClass
                  key={`${addTreeElement(index, index2).join("_")}`}
                  classList={[dt2]}
                  treeElement={addTreeElement(index, index2)}
                />
              );
            } else if ("TableStruct" in dt2) {
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
            } else if ("Item" in dt2) {
              return (
                <LawItem
                  key={`${addTreeElement(index, index2).join("_")}`}
                  itemList={[dt2]}
                  isPrecedingParagraph={index + parentParagraphIndex > 0}
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
            } else {
              return <></>;
            }
          });

        const ParagraphComponent = () => {
          if (getParentElement(treeElement) == "TableColumn") {
            return (
              <>
                {ParagraphNumNode}
                <LawParagraphSentence
                  paragraphSentence={ParagraphSentence}
                  treeElement={addTreeElement(index)}
                />
                {(AmendProvision.length > 0 ||
                  Class.length > 0 ||
                  TableStruct.length > 0 ||
                  FigStruct.length > 0 ||
                  StyleStruct.length > 0 ||
                  Item.length > 0 ||
                  List.length > 0 ||
                  index > 0) && <br />}
                {Children()}
              </>
            );
          } else if (
            getParentElement(treeElement) == "Article" &&
            index + parentParagraphIndex == 0
          ) {
            return (
              <>
                <LawParagraphSentence
                  paragraphSentence={ParagraphSentence}
                  treeElement={addTreeElement(index)}
                />
                {Children()}
              </>
            );
          } else if (
            ["MainProvision", "SupplProvision"].includes(
              getParentElement(treeElement)
            )
          ) {
            return (
              <section className="active Paragraph">
                {ParagraphNode}
                {Children()}
              </section>
            );
          } else {
            return (
              <>
                {ParagraphNode}
                {Children()}
              </>
            );
          }
        };
        // console.log(`${addTreeElement(index).join("_")}`);
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {ParagraphComponent()}
          </Fragment>
        );
      })}
    </>
  );
};
