import {
  FormatStructTitleType,
  FormatStructType,
  FormatType,
  RemarksType,
} from "@api/types/law";
import { LawAny } from "./any";
import { LawRemarks } from "./remarks";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 書式項目のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {FormatStructType[]} props.formatStructList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 書式項目のコンポーネント
 */
export const LawFormatStruct: React.FC<{
  formatStructList: FormatStructType[];
  treeElement: string[];
}> = (props) => {
  const { formatStructList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `FormatStruct_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {formatStructList.map((dt, index) => {
        const FormatStructTitle = getType<FormatStructTitleType>(
          dt.FormatStruct,
          "FormatStructTitle"
        );
        const Format = getType<FormatType>(dt.FormatStruct, "Format")[0];
        const Remarks = getType<RemarksType>(dt.FormatStruct, "Remarks");
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {FormatStructTitle.length > 0 && (
              <div>
                {getTextNode(
                  FormatStructTitle[0].FormatStructTitle,
                  addTreeElement(index)
                )}
              </div>
            )}
            {dt.FormatStruct.map((dt2, index2) => {
              if ("Format" in dt2) {
                return (
                  <LawAny
                    key={`${addTreeElement(index, index2).join("_")}`}
                    lawTypeList={Format.Format}
                    treeElement={addTreeElement(index, index2)}
                    parentElement="FormatStruct"
                  />
                );
              } else if ("Remarks" in dt2) {
                return (
                  <LawRemarks
                    key={`${addTreeElement(index, index2).join("_")}`}
                    remarksList={Remarks}
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
