import { TOCAppdxTableLabelType } from "@api/types/law";
import { getTextNode } from "./text-node";

/**
 * ⽬次別表ラベルのコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCAppdxTableLabelType[]} props.tocAppdxTableLabelList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - ⽬次別表ラベルのコンポーネント
 */
export const LawTOCAppdxTableLabel: React.FC<{
  tocAppdxTableLabelList: TOCAppdxTableLabelType[];
  treeElement: string[];
}> = (props) => {
  const { tocAppdxTableLabelList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TOCAppdxTableLabel_${index}`,
  ];

  return (
    <>
      {tocAppdxTableLabelList.map((dt, index) => {
        return (
          <div
            key={`${addTreeElement(index).join("_")}`}
            className="_div_TOCAppdxTableLabel pl-4"
          >
            {getTextNode(dt.TOCAppdxTableLabel, addTreeElement(index))}
          </div>
        );
      })}
    </>
  );
};
