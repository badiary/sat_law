import {
  AmendProvisionSentenceType,
  AmendProvisionType,
  NewProvisionType,
} from "@api/types/law";
import { LawNewProvision } from "./new-provision";
import { LawAmendProvisionSentence } from "./amend-provision-sentence";
import { Fragment } from "react";
import { getParentElement, getType } from "@api/lib/law/law";

/**
 * 改正規定のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AmendProvisionType[]} props.amendProvisionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 改正規定のコンポーネント
 */
export const LawAmendProvision: React.FC<{
  amendProvisionList: AmendProvisionType[];
  treeElement: string[];
}> = (props) => {
  const { amendProvisionList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `AmendProvision_${index}`,
  ];
  return (
    <>
      {amendProvisionList.map((dt, index) => {
        const AmendProvisionSentence = getType<AmendProvisionSentenceType>(
          dt.AmendProvision,
          "AmendProvisionSentence"
        );
        const NewProvision = getType<NewProvisionType>(
          dt.AmendProvision,
          "NewProvision"
        );

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {AmendProvisionSentence.length > 0 && (
              <div
                className={`_div_AmendProvisionSentence ${
                  ["Paragraph", "Article"].includes(
                    getParentElement(treeElement)
                  )
                    ? "pl-4"
                    : ""
                } indent-1`}
              >
                <LawAmendProvisionSentence
                  amendProvisionSentence={AmendProvisionSentence[0]}
                  treeElement={addTreeElement(index)}
                />
              </div>
            )}

            {NewProvision.length > 0 && (
              <div className="pl-4">
                <LawNewProvision
                  newProvisionList={NewProvision}
                  treeElement={addTreeElement(index)}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </>
  );
};
