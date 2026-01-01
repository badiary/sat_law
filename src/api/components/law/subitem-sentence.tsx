import {
  ColumnType,
  SentenceType,
  Subitem1SentenceType,
  Subitem2SentenceType,
  Subitem3SentenceType,
  Subitem4SentenceType,
  Subitem5SentenceType,
  Subitem6SentenceType,
  Subitem7SentenceType,
  Subitem8SentenceType,
  Subitem9SentenceType,
  Subitem10SentenceType,
  TableType,
} from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawColumn } from "./column";
import { LawTable } from "./table";

/**
 * 号細分文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SentenceType | ColumnType | TableType} props.dt - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @param {boolean} props.isPrecedingSentence - 2件目以降のSentenceかどうかのフラグ
 * @returns {JSX.Element} - 号細分文のコンポーネント
 */
export const LawSubitemSentence: React.FC<{
  dt: SentenceType | ColumnType | TableType;
  treeElement: string[];
  isPrecedingSentence: boolean;
}> = (props) => {
  const { dt, treeElement, isPrecedingSentence } = props;
  if ("Sentence" in dt) {
    return (
      <LawSentence
        sentenceList={[dt]}
        treeElement={treeElement}
        isPrecedingSentence={isPrecedingSentence}
      />
    );
  } else if ("Column" in dt) {
    return <LawColumn columnList={[dt]} treeElement={treeElement} />;
  } else {
    return <LawTable table={dt} treeElement={treeElement} />;
  }
};

/**
 * 号細分文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem1SentenceType} props.subitem1Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分文のコンポーネント
 */
export const LawSubitem1Sentence: React.FC<{
  subitem1Sentence: Subitem1SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem1Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem1Sentence_${index}`,
  ];

  return (
    <>
      {subitem1Sentence.Subitem1Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem1Sentence.Subitem1Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};

/**
 * 号細分２文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem2SentenceType} props.subitem2Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分２文のコンポーネント
 */
export const LawSubitem2Sentence: React.FC<{
  subitem2Sentence: Subitem2SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem2Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem2Sentence_${index}`,
  ];

  return (
    <>
      {subitem2Sentence.Subitem2Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem2Sentence.Subitem2Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分３文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem3SentenceType} props.subitem3Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分３文のコンポーネント
 */
export const LawSubitem3Sentence: React.FC<{
  subitem3Sentence: Subitem3SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem3Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem3Sentence_${index}`,
  ];

  return (
    <>
      {subitem3Sentence.Subitem3Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem3Sentence.Subitem3Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分４文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem4SentenceType} props.subitem4Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分４文のコンポーネント
 */
export const LawSubitem4Sentence: React.FC<{
  subitem4Sentence: Subitem4SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem4Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem4Sentence_${index}`,
  ];

  return (
    <>
      {subitem4Sentence.Subitem4Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem4Sentence.Subitem4Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分５文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem5SentenceType} props.subitem5Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分５文のコンポーネント
 */
export const LawSubitem5Sentence: React.FC<{
  subitem5Sentence: Subitem5SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem5Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem5Sentence_${index}`,
  ];

  return (
    <>
      {subitem5Sentence.Subitem5Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem5Sentence.Subitem5Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分６文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem6SentenceType} props.subitem6Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分６文のコンポーネント
 */
export const LawSubitem6Sentence: React.FC<{
  subitem6Sentence: Subitem6SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem6Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem6Sentence_${index}`,
  ];

  return (
    <>
      {subitem6Sentence.Subitem6Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem6Sentence.Subitem6Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分７文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem7SentenceType} props.subitem7Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分７文のコンポーネント
 */
export const LawSubitem7Sentence: React.FC<{
  subitem7Sentence: Subitem7SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem7Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem7Sentence_${index}`,
  ];

  return (
    <>
      {subitem7Sentence.Subitem7Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem7Sentence.Subitem7Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分８文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem8SentenceType} props.subitem8Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分８文のコンポーネント
 */
export const LawSubitem8Sentence: React.FC<{
  subitem8Sentence: Subitem8SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem8Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem8Sentence_${index}`,
  ];

  return (
    <>
      {subitem8Sentence.Subitem8Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem8Sentence.Subitem8Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
/**
 * 号細分９文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem9SentenceType} props.subitem9Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分９文のコンポーネント
 */
export const LawSubitem9Sentence: React.FC<{
  subitem9Sentence: Subitem9SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem9Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem9Sentence_${index}`,
  ];

  return (
    <>
      {subitem9Sentence.Subitem9Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem9Sentence.Subitem9Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};

/**
 * 号細分１０文のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {Subitem10SentenceType} props.subitem10Sentence - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 号細分１０文のコンポーネント
 */
export const LawSubitem10Sentence: React.FC<{
  subitem10Sentence: Subitem10SentenceType;
  treeElement: string[];
}> = (props) => {
  const { subitem10Sentence, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `Subitem10Sentence_${index}`,
  ];

  return (
    <>
      {subitem10Sentence.Subitem10Sentence.map((dt, index) => {
        return (
          <LawSubitemSentence
            key={`${addTreeElement(index).join("_")}`}
            dt={dt}
            treeElement={addTreeElement(index)}
            isPrecedingSentence={
              index > 0 &&
              subitem10Sentence.Subitem10Sentence.slice(0, index).some(
                (dt) => "Sentence" in dt
              )
            }
          />
        );
      })}
    </>
  );
};
