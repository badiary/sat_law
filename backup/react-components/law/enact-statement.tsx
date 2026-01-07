import { EnactStatementType } from "@api/types/law";
import { TextNode } from "./text-node";

/**
 * 制定文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {EnactStatementType[]} props.enactStatementList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 制定文のコンポーネント
 */
export const LawEnactStatement: React.FC<{
  enactStatementList: EnactStatementType[];
  treeElement: string[];
}> = (props) => {
  const { enactStatementList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `EnactStatement_${index}`,
  ];

  return (
    <>
      {enactStatementList.map((dt, index) => {
        return (
          <div
            key={`${addTreeElement(index).join("_")}`}
            className="_div_EnactStatement"
          >
            <TextNode
              val={dt.EnactStatement}
              treeElement={addTreeElement(index)}
            />
          </div>
        );
      })}
    </>
  );
};
