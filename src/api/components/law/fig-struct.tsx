import {
  FigStructTitleType,
  FigStructType,
  FigType,
  RemarksType,
} from "@api/types/law";
import { LawFig } from "./fig";
import { LawRemarks } from "./remarks";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 図項目のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {FigStructType[]} props.figStructList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 図項目のコンポーネント
 */
export const LawFigStruct: React.FC<{
  figStructList: FigStructType[];
  treeElement: string[];
}> = (props) => {
  const { figStructList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `FigStruct_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {figStructList.map((dt, index) => {
        const FigStructTitle = getType<FigStructTitleType>(
          dt.FigStruct,
          "FigStructTitle"
        );
        const Remarks = getType<RemarksType>(dt.FigStruct, "Remarks");
        const Fig = getType<FigType>(dt.FigStruct, "Fig")[0];

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {FigStructTitle.length > 0 &&
              getTextNode(
                FigStructTitle[0].FigStructTitle,
                addTreeElement(index)
              )}
            {dt.FigStruct.map((dt2, index2) => {
              if ("Fig" in dt2) {
                return (
                  <LawFig
                    key={`${addTreeElement(index, index2).join("_")}`}
                    fig={Fig}
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
