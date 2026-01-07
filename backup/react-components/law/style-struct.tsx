import {
  RemarksType,
  StyleStructTitleType,
  StyleStructType,
  StyleType,
} from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawAny } from "./any";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 様式項目のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {StyleStructType[]} props.styleStructList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 様式項目のコンポーネント
 */
export const LawStyleStruct: React.FC<{
  styleStructList: StyleStructType[];
  treeElement: string[];
}> = (props) => {
  const { styleStructList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `StyleStruct_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {styleStructList.map((dt, index) => {
        const StyleStructTitle = getType<StyleStructTitleType>(
          dt.StyleStruct,
          "StyleStructTitle"
        );
        const Remarks = getType<RemarksType>(dt.StyleStruct, "Remarks");
        const Style = getType<StyleType>(dt.StyleStruct, "Style")[0];
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {StyleStructTitle.length > 0 && (
              <div className="_div_StyleStructTitle">
                {getTextNode(
                  StyleStructTitle[0].StyleStructTitle,
                  addTreeElement(index)
                )}
              </div>
            )}
            {dt.StyleStruct.map((dt2, index2) => {
              if ("Style" in dt2) {
                return (
                  <LawAny
                    key={`${addTreeElement(index, index2).join("_")}`}
                    lawTypeList={Style.Style}
                    parentElement="Style"
                    treeElement={addTreeElement(index, index2)}
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
