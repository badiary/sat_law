"use client";
import { LawBodyType, LawNumType, LawTitleType } from "@api/types/law";
import { LawBodyComponent } from "./law-body";
import LawRevisionIdContext from "@api/context/law-revision-id";
import { TextNode } from "./text-node";

/**
 * 法令のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {LawNumType} props.lawNum - 法令番号
 * @param {LawBodyType} props.lawBody - 法令本体
 * @param {LawTitleType} props.lawTitle - 題名
 * @param {string} props.lawRevisionId - 法令履歴ID
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 法令のコンポーネント
 */
export const LawComponent: React.FC<{
  lawNum: LawNumType;
  lawBody: LawBodyType;
  lawTitle: LawTitleType;
  lawRevisionId: string;
  treeElement: string[];
}> = (props) => {
  const { lawNum, lawBody, lawTitle, lawRevisionId, treeElement } = props;
  const addTreeElement = [...treeElement, "Law"];

  return (
    <LawRevisionIdContext.Provider value={lawRevisionId}>
      <div className="pb-4">
        <div className="font-bold">
          <TextNode val={lawNum.LawNum} treeElement={addTreeElement} />
        </div>
        <div className="text-xl font-bold">
          <TextNode val={lawTitle.LawTitle} treeElement={addTreeElement} />
        </div>
      </div>
      <LawBodyComponent lawBody={lawBody} treeElement={addTreeElement} />
    </LawRevisionIdContext.Provider>
  );
};
