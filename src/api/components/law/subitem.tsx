import {
  FigStructType,
  ListType,
  StyleStructType,
  Subitem10SentenceType,
  Subitem10TitleType,
  Subitem10Type,
  Subitem1SentenceType,
  Subitem1TitleType,
  Subitem1Type,
  Subitem2SentenceType,
  Subitem2TitleType,
  Subitem2Type,
  Subitem3SentenceType,
  Subitem3TitleType,
  Subitem3Type,
  Subitem4SentenceType,
  Subitem4TitleType,
  Subitem4Type,
  Subitem5SentenceType,
  Subitem5TitleType,
  Subitem5Type,
  Subitem6SentenceType,
  Subitem6TitleType,
  Subitem6Type,
  Subitem7SentenceType,
  Subitem7TitleType,
  Subitem7Type,
  Subitem8SentenceType,
  Subitem8TitleType,
  Subitem8Type,
  Subitem9SentenceType,
  Subitem9TitleType,
  Subitem9Type,
  TableStructType,
} from "@api/types/law";
import { LawTableStruct } from "./table-struct";
import { LawFigStruct } from "./fig-struct";
import { LawStyleStruct } from "./style-struct";
import { LawList } from "./list";
import {
  LawSubitem10Sentence,
  LawSubitem1Sentence,
  LawSubitem2Sentence,
  LawSubitem3Sentence,
  LawSubitem4Sentence,
  LawSubitem5Sentence,
  LawSubitem6Sentence,
  LawSubitem7Sentence,
  LawSubitem8Sentence,
  LawSubitem9Sentence,
} from "./subitem-sentence";
import { Fragment } from "react";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 号細分の子要素コンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {FigStructType
 * | ListType
 * | StyleStructType
 * | Subitem10SentenceType
 * | Subitem10TitleType
 * | Subitem10Type
 * | Subitem1SentenceType
 * | Subitem1TitleType
 * | Subitem1Type
 * | Subitem2SentenceType
 * | Subitem2TitleType
 * | Subitem2Type
 * | Subitem3SentenceType
 * | Subitem3TitleType
 * | Subitem3Type
 * | Subitem4SentenceType
 * | Subitem4TitleType
 * | Subitem4Type
 * | Subitem5SentenceType
 * | Subitem5TitleType
 * | Subitem5Type
 * | Subitem6SentenceType
 * | Subitem6TitleType
 * | Subitem6Type
 * | Subitem7SentenceType
 * | Subitem7TitleType
 * | Subitem7Type
 * | Subitem8SentenceType
 * | Subitem8TitleType
 * | Subitem8Type
 * | Subitem9SentenceType
 * | Subitem9TitleType
 * | Subitem9Type
 * | TableStructType } props.dt - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分の子要素コンポーネント
 */
const SubitemChildren: React.FC<{
  dt:
    | FigStructType
    | ListType
    | StyleStructType
    | Subitem10SentenceType
    | Subitem10TitleType
    | Subitem10Type
    | Subitem1SentenceType
    | Subitem1TitleType
    | Subitem1Type
    | Subitem2SentenceType
    | Subitem2TitleType
    | Subitem2Type
    | Subitem3SentenceType
    | Subitem3TitleType
    | Subitem3Type
    | Subitem4SentenceType
    | Subitem4TitleType
    | Subitem4Type
    | Subitem5SentenceType
    | Subitem5TitleType
    | Subitem5Type
    | Subitem6SentenceType
    | Subitem6TitleType
    | Subitem6Type
    | Subitem7SentenceType
    | Subitem7TitleType
    | Subitem7Type
    | Subitem8SentenceType
    | Subitem8TitleType
    | Subitem8Type
    | Subitem9SentenceType
    | Subitem9TitleType
    | Subitem9Type
    | TableStructType;
  treeElement: string[];
}> = (props) => {
  const { dt, treeElement } = props;
  if ("TableStruct" in dt) {
    return <LawTableStruct tableStructList={[dt]} treeElement={treeElement} />;
  } else if ("FigStruct" in dt) {
    return <LawFigStruct figStructList={[dt]} treeElement={treeElement} />;
  } else if ("StyleStruct" in dt) {
    return <LawStyleStruct styleStructList={[dt]} treeElement={treeElement} />;
  } else if ("List" in dt) {
    return <LawList listList={[dt]} treeElement={treeElement} />;
  } else {
    return <></>;
  }
};

/**
 * 号細分のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem1Type[]} props.subitem1List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分のコンポーネント
 */
export const LawSubitem1: React.FC<{
  subitem1List: Subitem1Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem1List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem1_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem1List.map((dt, index) => {
        const Subitem1Title = getType<Subitem1TitleType>(
          dt.Subitem1,
          "Subitem1Title"
        );
        const Subitem1Sentence = getType<Subitem1SentenceType>(
          dt.Subitem1,
          "Subitem1Sentence"
        )[0];
        const Subitem2 = getType<Subitem2Type>(dt.Subitem1, "Subitem2");

        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            <div
              className={`_div_Subitem1Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-12" : "pl-8"
              } indent-1`}
            >
              {Subitem1Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem1Title[0].Subitem1Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem1Sentence
                subitem1Sentence={Subitem1Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem1.filter((dt2) =>
                ["TableStruct", "FigStruct", "StyleStruct", "List"].some(
                  (dt3) => dt3 in dt2
                )
              ).map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem2
              subitem2List={Subitem2}
              treeElement={addTreeElement(index)}
            />
          </Fragment>
        );
      })}
    </>
  );
};

/**
 * 号細分２のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem2Type[]} props.subitem2List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分２のコンポーネント
 */
export const LawSubitem2: React.FC<{
  subitem2List: Subitem2Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem2List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem2_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem2List.map((dt, index) => {
        const Subitem2Title = getType<Subitem2TitleType>(
          dt.Subitem2,
          "Subitem2Title"
        );
        const Subitem2Sentence = getType<Subitem2SentenceType>(
          dt.Subitem2,
          "Subitem2Sentence"
        )[0];
        const Subitem3 = getType<Subitem3Type>(dt.Subitem2, "Subitem3");

        return (
          <>
            <div
              className={`_div_Subitem2Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-16" : "pl-12"
              } indent-1`}
            >
              {Subitem2Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem2Title[0].Subitem2Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem2Sentence
                subitem2Sentence={Subitem2Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem2.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem3
              subitem3List={Subitem3}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分３のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem3Type[]} props.subitem3List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分３のコンポーネント
 */
export const LawSubitem3: React.FC<{
  subitem3List: Subitem3Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem3List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem3_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem3List.map((dt, index) => {
        const Subitem3Title = getType<Subitem3TitleType>(
          dt.Subitem3,
          "Subitem3Title"
        );
        const Subitem3Sentence = getType<Subitem3SentenceType>(
          dt.Subitem3,
          "Subitem3Sentence"
        )[0];
        const Subitem4 = getType<Subitem4Type>(dt.Subitem3, "Subitem4");

        return (
          <>
            <div
              className={`_div_Subitem3Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-20" : "pl-16"
              } indent-1`}
            >
              {Subitem3Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem3Title[0].Subitem3Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem3Sentence
                subitem3Sentence={Subitem3Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem3.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem4
              subitem4List={Subitem4}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分４のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem4Type[]} props.subitem4List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分４のコンポーネント
 */
export const LawSubitem4: React.FC<{
  subitem4List: Subitem4Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem4List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem4_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem4List.map((dt, index) => {
        const Subitem4Title = getType<Subitem4TitleType>(
          dt.Subitem4,
          "Subitem4Title"
        );
        const Subitem4Sentence = getType<Subitem4SentenceType>(
          dt.Subitem4,
          "Subitem4Sentence"
        )[0];
        const Subitem5 = getType<Subitem5Type>(dt.Subitem4, "Subitem5");

        return (
          <>
            <div
              className={`_div_Subitem4Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-24" : "pl-20"
              } indent-1`}
            >
              {Subitem4Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem4Title[0].Subitem4Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem4Sentence
                subitem4Sentence={Subitem4Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem4.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem5
              subitem5List={Subitem5}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分５のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem5Type[]} props.subitem5List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分５のコンポーネント
 */
export const LawSubitem5: React.FC<{
  subitem5List: Subitem5Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem5List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem5_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem5List.map((dt, index) => {
        const Subitem5Title = getType<Subitem5TitleType>(
          dt.Subitem5,
          "Subitem5Title"
        );
        const Subitem5Sentence = getType<Subitem5SentenceType>(
          dt.Subitem5,
          "Subitem5Sentence"
        )[0];
        const Subitem6 = getType<Subitem6Type>(dt.Subitem5, "Subitem6");

        return (
          <>
            <div
              className={`_div_Subitem5Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-28" : "pl-24"
              } indent-1`}
            >
              {Subitem5Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem5Title[0].Subitem5Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem5Sentence
                subitem5Sentence={Subitem5Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem5.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem6
              subitem6List={Subitem6}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分６のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem6Type[]} props.subitem6List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分６のコンポーネント
 */
export const LawSubitem6: React.FC<{
  subitem6List: Subitem6Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem6List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem6_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem6List.map((dt, index) => {
        const Subitem6Title = getType<Subitem6TitleType>(
          dt.Subitem6,
          "Subitem6Title"
        );
        const Subitem6Sentence = getType<Subitem6SentenceType>(
          dt.Subitem6,
          "Subitem6Sentence"
        )[0];
        const Subitem7 = getType<Subitem7Type>(dt.Subitem6, "Subitem7");

        return (
          <>
            <div
              className={`_div_Subitem6Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-32" : "pl-28"
              } indent-1`}
            >
              {Subitem6Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem6Title[0].Subitem6Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem6Sentence
                subitem6Sentence={Subitem6Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem6.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem7
              subitem7List={Subitem7}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分７のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem7Type[]} props.subitem7List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分７のコンポーネント
 */
export const LawSubitem7: React.FC<{
  subitem7List: Subitem7Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem7List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem7_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem7List.map((dt, index) => {
        const Subitem7Title = getType<Subitem7TitleType>(
          dt.Subitem7,
          "Subitem7Title"
        );
        const Subitem7Sentence = getType<Subitem7SentenceType>(
          dt.Subitem7,
          "Subitem7Sentence"
        )[0];
        const Subitem8 = getType<Subitem8Type>(dt.Subitem7, "Subitem8");

        return (
          <>
            <div
              className={`_div_Subitem7Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-36" : "pl-32"
              } indent-1`}
            >
              {Subitem7Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem7Title[0].Subitem7Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem7Sentence
                subitem7Sentence={Subitem7Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem7.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem8
              subitem8List={Subitem8}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分８のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem8Type[]} props.subitem8List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分８のコンポーネント
 */
export const LawSubitem8: React.FC<{
  subitem8List: Subitem8Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem8List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem8_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem8List.map((dt, index) => {
        const Subitem8Title = getType<Subitem8TitleType>(
          dt.Subitem8,
          "Subitem8Title"
        );
        const Subitem8Sentence = getType<Subitem8SentenceType>(
          dt.Subitem8,
          "Subitem8Sentence"
        )[0];
        const Subitem9 = getType<Subitem9Type>(dt.Subitem8, "Subitem9");

        return (
          <>
            <div
              className={`_div_Subitem8Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-40" : "pl-36"
              } indent-1`}
            >
              {Subitem8Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem8Title[0].Subitem8Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem8Sentence
                subitem8Sentence={Subitem8Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem8.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem9
              subitem9List={Subitem9}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分９のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem9Type[]} props.subitem9List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分９のコンポーネント
 */
export const LawSubitem9: React.FC<{
  subitem9List: Subitem9Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem9List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem9_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem9List.map((dt, index) => {
        const Subitem9Title = getType<Subitem9TitleType>(
          dt.Subitem9,
          "Subitem9Title"
        );
        const Subitem9Sentence = getType<Subitem9SentenceType>(
          dt.Subitem9,
          "Subitem9Sentence"
        )[0];
        const Subitem10 = getType<Subitem10Type>(dt.Subitem9, "Subitem10");

        return (
          <>
            <div
              className={`_div_Subitem9Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-44" : "pl-40"
              } indent-1`}
            >
              {Subitem9Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem9Title[0].Subitem9Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem9Sentence
                subitem9Sentence={Subitem9Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem9.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
            <LawSubitem10
              subitem10List={Subitem10}
              treeElement={addTreeElement(index)}
            />
          </>
        );
      })}
    </>
  );
};

/**
 * 号細分１０のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem10Type[]} props.subitem10List - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分１０のコンポーネント
 */
export const LawSubitem10: React.FC<{
  subitem10List: Subitem10Type[];
  treeElement: string[];
}> = (props) => {
  const { subitem10List, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `Subitem10_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];

  return (
    <>
      {subitem10List.map((dt, index) => {
        const Subitem10Title = getType<Subitem10TitleType>(
          dt.Subitem10,
          "Subitem10Title"
        );
        const Subitem10Sentence = getType<Subitem10SentenceType>(
          dt.Subitem10,
          "Subitem10Sentence"
        )[0];

        return (
          <>
            <div
              className={`_div_Subitem10Sentence ${
                isParentParagraphPreceding(treeElement) ? "pl-48" : "pl-44"
              } indent-1`}
            >
              {Subitem10Title.length > 0 && (
                <span className="font-bold">
                  {getTextNode(
                    Subitem10Title[0].Subitem10Title,
                    addTreeElement(index)
                  )}
                  {`　`}
                </span>
              )}
              <LawSubitem10Sentence
                subitem10Sentence={Subitem10Sentence}
                treeElement={addTreeElement(index)}
              />
              {dt.Subitem10.map((dt2, index2) => {
                return (
                  <SubitemChildren
                    key={`${addTreeElement(index, index2).join("_")}`}
                    dt={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              })}
            </div>
          </>
        );
      })}
    </>
  );
};

/**
 * 祖先ノードの内に２件目以降のParagraphが存在するか
 * @param treeElement ツリーエレメント
 * @returns true: 存在する
 */
const isParentParagraphPreceding = (treeElement: string[]) => {
  return treeElement.some((dt) => {
    const spDt = dt.split("_");
    if (spDt[0] == "Paragraph") {
      return spDt[1] != "0";
    }
    return false;
  });
};
