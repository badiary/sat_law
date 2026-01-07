import {
  Sublist1SentenceType,
  Sublist1Type,
  Sublist2SentenceType,
  Sublist2Type,
  Sublist3SentenceType,
  Sublist3Type,
} from "@api/types/law";
import {
  LawSublist1Sentence,
  LawSublist2Sentence,
  LawSublist3Sentence,
} from "./sublist-sentence";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";

/**
 * 列記細分１
 * @param {Object} props - プロパティオブジェクト
 * @param {Sublist1Type[]} props.sublist1List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分１のコンポーネント
 */
export const LawSublist1: React.FC<{
  sublist1List: Sublist1Type[];
  treeElement: string[];
}> = (props) => {
  const { sublist1List, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Sublist1_${index}`,
  ];

  return (
    <>
      {sublist1List.map((dt, index) => {
        const Sublist1Sentence = getType<Sublist1SentenceType>(
          dt.Sublist1,
          "Sublist1Sentence"
        )[0];
        const Sublist2 = getType<Sublist2Type>(dt.Sublist1, "Sublist2");
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_Sublist1Sentence pl-8">
              <LawSublist1Sentence
                sublist1Sentence={Sublist1Sentence}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawSublist2
              sublist2List={Sublist2}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};

/**
 * 列記細分２
 * @param {Object} props - プロパティオブジェクト
 * @param {Sublist2Type[]} props.sublist2List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分２のコンポーネント
 */
const LawSublist2: React.FC<{
  sublist2List: Sublist2Type[];
  treeElement: string[];
}> = (props) => {
  const { sublist2List, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Sublist2_${index}`,
  ];

  return (
    <>
      {sublist2List.map((dt, index) => {
        const Sublist2Sentence = getType<Sublist2SentenceType>(
          dt.Sublist2,
          "Sublist2Sentence"
        )[0];
        const Sublist3 = getType<Sublist3Type>(dt.Sublist2, "Sublist3");
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div className="_div_Sublist2Sentence pl-12">
              <LawSublist2Sentence
                sublist2Sentence={Sublist2Sentence}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawSublist3
              sublist3List={Sublist3}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};

/**
 * 列記細分３
 * @param {Object} props - プロパティオブジェクト
 * @param {Sublist3Type[]} props.sublist3List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 列記細分３のコンポーネント
 */
const LawSublist3: React.FC<{
  sublist3List: Sublist3Type[];
  treeElement: string[];
}> = (props) => {
  const { sublist3List, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Sublist3_${index}`,
  ];

  return (
    <>
      {sublist3List.map((dt, index) => {
        const Sublist3Sentence = getType<Sublist3SentenceType>(
          dt.Sublist3,
          "Sublist3Sentence"
        )[0];
        return (
          <div key={`${addTreeElement(index).join("_")}`} className="pl-16">
            <LawSublist3Sentence
              sublist3Sentence={Sublist3Sentence}
              treeElement={[...treeElement, "Sublist3"]}
            />
          </div>
        );
      })}
    </>
  );
};
