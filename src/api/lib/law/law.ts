import { LawBodyType, LawNumType, LawTitleType, LawType } from "@api/types/law";
import { numbersToKanji } from "../utils/helper";
import { XMLParser } from "fast-xml-parser";
import { Era, RevisionInfo } from "../typescript-fetch";
import logger from "../utils/logger";

/**
 * XML文字列データをObject型に変換する。
 * @param {Era} xml - XML文字列データ
 * @returns {{lawTitle: LawTitleType, lawNum: LawNumType, PromulgateDate: string, lawBody: LawBodyType}}
 * - 法令名, 法令番号, 公布日, 法令本文を含むオブジェクト
 */
export const convertLawData = (xml: string) => {
  const xp = new XMLParser({
    ignoreDeclaration: true, // trueの場合、XML宣言タグの除去をする
    ignoreAttributes: false, // falseの場合、属性をオブジェクト変換対象にする
    alwaysCreateTextNode: false, // falseの場合、テキストノードが存在する場合のみプロパティを作成する
    preserveOrder: true, // trueの場合、オブジェクト内のタグの順序を維持する
    textNodeName: "_", // テキストノードのパラメータ名の指定
    attributeNamePrefix: "", // 属性のパラメータ名の不要文字列削除
  });

  // XMLデータをオブジェクト型に変換する
  const convertLaw: Array<LawType> = xp.parse(xml);

  try {
    // 配列で返却される為、配列の1件目を取得する
    const law = convertLaw[0];

    // 法令番号
    const lawNum =
      getTypeByFind<LawNumType>(law.Law, "LawNum") ??
      ({ lawNum: [] } as unknown as LawNumType);

    // 法令本文
    const lawBody =
      getTypeByFind<LawBodyType>(law.Law, "LawBody") ??
      ({ LawBody: [] } as unknown as LawBodyType);

    // 法令名
    const lawTitle =
      getTypeByFind<LawTitleType>(lawBody?.LawBody, "LawTitle") ??
      ({ LawTitle: [] } as unknown as LawTitleType);

    // 公布日
    const PromulgateDate =
      getEraLabel(law[":@"].Era) +
      numbersToKanji(law[":@"].Year) +
      "年" +
      (law[":@"].PromulgateMonth &&
        numbersToKanji(law[":@"].PromulgateMonth) + "月") +
      (law[":@"].PromulgateDay &&
        numbersToKanji(law[":@"].PromulgateDay) + "日");

    return {
      lawTitle,
      lawNum,
      PromulgateDate,
      lawBody,
    };
  } catch (error) {
    logger.error({
      message: "[getLawComponentData] law analysis error",
      error: error,
      query: xml,
    });

    throw Error("法令データの解析に失敗しました。");
  }
};

/**
 * 和暦の元号に対応するラベルを取得する
 * @param {Era} val - 元号
 * @returns {string} - 元号に対応するラベル
 */
export const getEraLabel = (val: Era) => {
  switch (val) {
    case "Meiji":
      return "明治";
    case "Taisho":
      return "大正";
    case "Showa":
      return "昭和";
    case "Heisei":
      return "平成";
    case "Reiwa":
      return "令和";
  }
};

/**
 * 沿革一覧から新規制定法令を判定する。
 * 施行日順の沿革履歴一覧を逆順から見ていき、amendmentLawIdがないものを新規制定法令と判定する。
 * @param revisions - 法令の改正履歴沿革の配列
 * @returns 改正法令のリビジョンID。ない場合はundefinedを返します。
 */
export const getNewlyEnactedLawId = (revisions: RevisionInfo[]) => {
  return [...revisions].reverse().find((revision) => {
    return revision.amendmentLawId === undefined;
  })?.lawRevisionId;
};

/**
 * 配列から指定されたプロパティを持つ最初の要素を取得する。
 * @template T
 * @param {Array<any>} dtList - 検索対象の配列
 * @param {string} type - 検索するプロパティ名
 * @returns {T | undefined} - 指定されたプロパティを持つ最初の要素。見つからなかった場合は undefined。
 */
export const getTypeByFind = <T>(
  dtList: Array<any> | undefined,
  type: string
): T | undefined => {
  if (!dtList) {
    return undefined;
  }

  return dtList.find((dt) => {
    return type in dt;
  });
};

/**
 * 配列から指定されたプロパティを持つ要素だけを抽出する。
 * @template T
 * @param {Array<any>} dtList - 検索対象の配列
 * @param {string} type - 検索するプロパティ名
 * @returns {Array<T>} - 指定されたプロパティを持つ要素だけを含む新しい配列
 */
export const getType = <T>(dtList: Array<any>, type: string): Array<T> => {
  return dtList.filter((dt) => {
    return type in dt;
  });
};

/**
 * 親要素名を取得する。
 * @param {string[]} treeElement - 要素配列
 * @returns {string} - 親要素名
 */
export const getParentElement = (treeElement: string[]) => {
  return treeElement.length > 0
    ? treeElement[treeElement.length - 1].split("_")[0]
    : "";
};
