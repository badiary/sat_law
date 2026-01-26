import { XMLParser } from "fast-xml-parser";
import {
  AttachedFile,
  AttachedFilesInfo,
  Era,
  LawInfo,
  LawType,
  LawdataResponse,
  Mission,
  RepealStatus,
  RevisionInfo,
  Status,
} from "../typescript-fetch";
import { buildQueryString, numbersToKanji } from "../utils/helper";
import logger from "../utils/logger";
import { validateRequest } from "../utils/zod-schemas/common-schema";
import {
  RequestLawDataParams,
  RequestLawDataParamsSchema,
} from "../utils/zod-schemas/request-law-data-params-schema";
import { Result } from "@api/types/result";
import {
  LawDataResponseType,
  ParsedAttachedFile,
  ParsedAttachedFilesInfo,
  ParsedLawFullText,
  ParsedLawInfo,
  ParsedRevisionInfo,
  XMLParsedAttachedFile,
  XMLParsedAttachedFilesInfo,
  XMLParsedLawInfo,
  XMLParsedRevisionInfo,
  XmlProperty,
} from "@api/types/api_law";
import {
  LawBodyType,
  LawType as LawData,
  LawNumType,
  LawTitleType,
} from "@api/types/law";
import { getEraLabel, getTypeByFind } from "../law/law";

/**
 * 法令情報のXMLParserObjectから法令名, 法令番号, 公布日, 法令本文を含むオブジェクトを取得
 * @param {LawData} law - 法令情報のXMLParserObject
 * @returns {{lawTitle: LawTitleType, lawNum: LawNumType, PromulgateDate: string, lawBody: LawBodyType}}
 * - 法令名, 法令番号, 公布日, 法令本文を含むオブジェクト
 */
export const getLawComponentData = (law: LawData) => {
  try {
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
      query: law,
    });

    throw Error("法令データの解析に失敗しました。");
  }
};

/**
 * XMLParserObjectからの対象Parameter値取得処理
 * @param {U[]} obj - MLParserObject
 * @param {keyof U} key - 対象Parameter名
 * @param {boolean = false} isDate - 対象ParameterがDate型かどうか
 * @returns {T | undefined} - 対象Parameter値
 */
const findByKey = <T, U>(
  obj: U[],
  key: keyof U,
  isDate: boolean = false
): T | undefined => {
  // 対象Parameterを検索
  const foundItem = obj.find((item) => {
    const val = item[key] as XmlProperty<unknown | undefined>[];
    return val && val.length > 0;
  });

  // 対象Parameterがない場合、undefinedを返却
  if (foundItem?.[key] === undefined) {
    return undefined;
  }

  // 返却値の型がDate型の場合、文字列からDate型に変換後返却
  if (isDate) {
    const date = new Date(
      (foundItem?.[key] as XmlProperty<unknown>[])[0]._ as string
    );

    return !isNaN(date.getDate()) ? (date as T) : undefined;
  }

  // 添付ファイル情報のXML変換専用処理
  if (key == "attached_files") {
    return (foundItem?.[key] as ParsedAttachedFile[]).map((dt) =>
      parsedXmlToAttachedFile(dt)
    ) as T;
  }

  return (foundItem?.[key] as XmlProperty<unknown>[])[0]._ as T;
};

/**
 * 全添付ファイル情報のXMLParserObjectからの操作用Object変換処理
 * @param {ParsedAttachedFile} parsedXmlData - 全添付ファイル情報のXMLParserObject
 * @returns {AttachedFilesInfo} - 全添付ファイル情報の操作用Object
 */
function parsedXmlToAttachedFilesInfo(
  parsedXmlData: ParsedAttachedFilesInfo
): AttachedFilesInfo {
  const data = parsedXmlData.attached_files_info;

  // 各要素を取得してインターフェースにマッピング
  const mapping = {
    imageData: findByKey<string, XMLParsedAttachedFilesInfo>(
      data,
      "image_data"
    ),
    attachedFiles: findByKey<AttachedFile[], XMLParsedAttachedFilesInfo>(
      data,
      "attached_files"
    ),
  };

  return mapping;
}

/**
 * 添付ファイル情報のXMLParserObjectからの操作用Object変換処理
 * @param {ParsedAttachedFile} parsedXmlData - 添付ファイル情報のXMLParserObject
 * @returns {ParsedAttachedFile} - 添付ファイル情報の操作用Object
 */
function parsedXmlToAttachedFile(
  parsedXmlData: ParsedAttachedFile
): AttachedFile {
  const data = parsedXmlData.attached_file;  // attached_files -> attached_file (単数形)
  // 各要素を取得してインターフェースにマッピング
  const mapping = {
    lawRevisionId: findByKey<string, XMLParsedAttachedFile>(
      data,
      "law_revision_id"
    ),
    src: findByKey<string, XMLParsedAttachedFile>(data, "src"),
    updated: findByKey<Date, XMLParsedAttachedFile>(data, "updated", true),
  };

  return mapping;
}

/**
 * 履歴に依存しない法令（法令IDで特定される法令）のメタ情報のXMLParserObjectからの操作用Object変換処理
 * @param {ParsedLawInfo} parsedXmlData - 履歴に依存しない法令（法令IDで特定される法令）のメタ情報のXMLParserObject
 * @returns {LawInfo} - 履歴に依存しない法令（法令IDで特定される法令）のメタ情報の操作用Object
 */
function parsedXmlToLawInfo(parsedXmlData: ParsedLawInfo): LawInfo {
  const data = parsedXmlData.law_info;
  // 各要素を取得してインターフェースにマッピング
  const mapping = {
    lawType: findByKey<LawType, XMLParsedLawInfo>(data, "law_type"),
    lawId: findByKey<string, XMLParsedLawInfo>(data, "law_id"),
    lawNum: findByKey<string, XMLParsedLawInfo>(data, "law_num"),
    lawNumEra: findByKey<Era, XMLParsedLawInfo>(data, "law_num_era"),
    lawNumYear: findByKey<number, XMLParsedLawInfo>(data, "law_num_year"),
    lawNumType: findByKey<LawType, XMLParsedLawInfo>(data, "law_num_type"),
    lawNumNum: findByKey<string, XMLParsedLawInfo>(data, "law_num_num"),
    promulgationDate: findByKey<Date, XMLParsedLawInfo>(
      data,
      "promulgation_date",
      true
    ),
  };

  return mapping;
}

/**
 * 法令の履歴に関する情報のXMLParserObjectからの操作用Object変換処理
 * @param {ParsedRevisionInfo} parsedXmlData - 法令の履歴に関する情報のXMLParserObject
 * @returns {RevisionInfo} - 法令の履歴に関する情報の操作用Object
 */
function parsedXmlToRevisionInfo(
  parsedXmlData: ParsedRevisionInfo
): RevisionInfo {
  const data = parsedXmlData.revision_info;
  // 各要素を取得してインターフェースにマッピング
  const mapping = {
    lawRevisionId: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "law_revision_id"
    ),
    lawType: findByKey<LawType, XMLParsedRevisionInfo>(data, "law_type"),
    lawTitle: findByKey<string, XMLParsedRevisionInfo>(data, "law_title"),
    lawTitleKana: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "law_title_kana"
    ),
    lawTitleKanaseion: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "law_title_kanaseion"
    ),
    abbrev: findByKey<string, XMLParsedRevisionInfo>(data, "abbrev"),
    abbrevKana: findByKey<string, XMLParsedRevisionInfo>(data, "abbrev_kana"),
    category: findByKey<string, XMLParsedRevisionInfo>(data, "category"),
    revisionIndex: findByKey<number, XMLParsedRevisionInfo>(
      data,
      "revision_index"
    ),
    subrevisionIndex: findByKey<number, XMLParsedRevisionInfo>(
      data,
      "subrevision_index"
    ),
    updated: findByKey<Date, XMLParsedRevisionInfo>(data, "updated", true),
    previusRevisionId: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "previus_revision_id",
      true
    ),
    amendmentPromulgateDate: findByKey<Date, XMLParsedRevisionInfo>(
      data,
      "amendment_promulgate_date",
      true
    ),
    amendmentEnforcementDate: findByKey<Date, XMLParsedRevisionInfo>(
      data,
      "amendment_enforcement_date",
      true
    ),
    amendmentEnforcementEndDate: findByKey<Date, XMLParsedRevisionInfo>(
      data,
      "amendment_enforcement_end_date",
      true
    ),
    amendmentEnforcementComment: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "amendment_enforcement_comment"
    ),
    amendmentScheduledEnforcementDate: findByKey<Date, XMLParsedRevisionInfo>(
      data,
      "amendment_scheduled_enforcement_date"
    ),
    amendmentLawId: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "amendment_law_id"
    ),
    amendmentLawTitle: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "amendment_law_title"
    ),
    amendmentLawTitleKana: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "amendment_law_title_kana"
    ),
    amendmentLawTitleKanaseion: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "amendment_law_title_kanaseion"
    ),
    amendmentLawNum: findByKey<string, XMLParsedRevisionInfo>(
      data,
      "amendment_law_num"
    ),
    repealStatus: findByKey<RepealStatus, XMLParsedRevisionInfo>(
      data,
      "repeal_status"
    ),
    repealDate: findByKey<Date | null, XMLParsedRevisionInfo>(
      data,
      "repeal_date",
      true
    ),
    remainInForce: findByKey<boolean | null, XMLParsedRevisionInfo>(
      data,
      "remain_in_force"
    ),
    mission: findByKey<Mission, XMLParsedRevisionInfo>(data, "mission"),
    status: findByKey<Status, XMLParsedRevisionInfo>(data, "status"),
    isLast: findByKey<boolean, XMLParsedRevisionInfo>(data, "is_last"),
  };
  return mapping;
}

/**
 * 法令本文データの返却パラメータ型
 */
export type ModifiedLawdataResponse = Omit<LawdataResponse, "lawFullText"> & {
  lawFullText: LawData;
};

/**
 * 法令画面のデータ取得処理(xml形式でデータを取得する例)
 * 法令本文取得API(/lawdata)を利用
 * 法令ID,時点指定を基に法令本文データを取得する
 * @param {RequestLawDataParams} searchParams - 検索条件
 * @returns {Promise<Result<ModifiedLawdataResponse>>} - 法令本文データ
 *
 * 利用対象API: /lawdata (GET) - 法令本文取得API
 * - APIエンドポイント [API_URL]/lawdata
 * - リクエストメソッド: GET
 * - リクエストパラメータ: searchParams（検索条件）
 *
 *  本データ取得処理は、@interface {GetLawdataRequest} のパラメータのうち、
 *  @param {RequestLawDataParams} に記載している以下のパラメータを利用し、法令本文のデータを取得しています。
 *  lawId(法令ID,もしくは法令履歴ID),
 *  asof(時点指定)
 *
 * - レスポンス: 法令本文データ（LawdataResponse）
 * - エラーハンドリング: APIからのエラーレスポンスや通信エラーに対しては、Errorオブジェクトを生成して返す
 * - 依存関係: 環境変数（process.env.API_URL）からAPIのBase URLを取得
 * - クライアントコード生成: OpenAPI Generatorを利用して生成(TypeScript-fetch)
 */
export const getLawData = async ({
  lawId,
  asof,
}: RequestLawDataParams): Promise<Result<ModifiedLawdataResponse>> => {
  // リクエストパラメータのバリデーションチェック
  const validateResult = validateRequest<RequestLawDataParams>({
    schema: RequestLawDataParamsSchema,
    params: { lawId, asof },
  });
  if (!validateResult.isSuccess) return validateResult;

  // リクエストパラメータの整形、クエリ作成
  // 本データ取得処理(/lawdata)は、@interface {GetLawdataRequest} のパラメータのうち、
  // @param {RequestLawDataParams} に記載している以下のパラメータを利用し、法令本文データを取得しています。
  // また、response_formatにて本データ取得処理のレスポンス形式をJSONではなくxmlに指定しています。
  const query = {
    law_id: lawId,
    asof: asof ? asof : undefined,
    response_format: "xml",
  };
  const queryString = buildQueryString(query);

  // APIの設定(OpenAPI Generatorで生成したクライアントコードを利用)
  // Configuration オブジェクトを生成して、APIの基本パスとヘッダーを設定
  // APIオブジェクトを生成
  logger.info("[API] lawdata request");
  const url = `https://laws.e-gov.go.jp/api/2/law_data/${lawId}?response_format=xml`;
  try {
    // 法令文書取得API(/law_data)を呼び出し
    // const result = await fetch(url, {
    //   method: "GET",
    //   // headers: { Accept: "application/xml", "Accept-Encoding": "gzip" },
    //   mode: "no-cors", // no-cors, *cors, same-origin
    // });
    const result = await fetch(url);

    /**
     * response_formatをxmlに指定しているため、xml形式でレスポンスが返却されます。
     * そのため、以下ではレスポンスをxml形式からオブジェクト形式に変換しています。
     */
    const xml = await result.text();
    const xp = new XMLParser({
      ignoreDeclaration: true, // trueの場合、XML宣言タグの除去をする
      ignoreAttributes: false, // falseの場合、属性をオブジェクト変換対象にする
      alwaysCreateTextNode: false, // falseの場合、テキストノードが存在する場合のみプロパティを作成する
      preserveOrder: true, // trueの場合、オブジェクト内のタグの順序を維持する
      textNodeName: "_", // テキストノードのパラメータ名の指定
      attributeNamePrefix: "", // 属性のパラメータ名の不要文字列削除
    });

    // XMLデータをオブジェクト型に変換する
    const convertLaw = xp.parse(xml);
    console.log('convertLaw:', convertLaw);
    console.log('law_data_response:', convertLaw[0]?.law_data_response);

    // 型指定
    const lawDataResponse = (convertLaw as LawDataResponseType[])[0];

    // lawFullTextを取得
    // バージョン2のレスポンス構造: law_data_response → law_full_text
    // @ts-ignore
    const lawFullText = convertLaw[0].law_data_response[3].law_full_text[0] as LawData;

    // parseしたXMLをattachedFilesInfoの型に変換
    // attached_files_infoは配列の最初の要素
    let attachedFilesInfo;
    try {
      attachedFilesInfo = parsedXmlToAttachedFilesInfo(
        convertLaw[0].law_data_response[0] as ParsedAttachedFilesInfo
      );
    } catch (error) {
      console.warn('attachedFilesInfo parse failed:', error);
      attachedFilesInfo = undefined;
    }

    // parseしたXMLをlawInfoの型に変換
    let lawInfo;
    try {
      lawInfo = parsedXmlToLawInfo(
        convertLaw[0].law_data_response[1] as ParsedLawInfo
      );
    } catch (error) {
      console.warn('lawInfo parse failed:', error);
      lawInfo = undefined;
    }

    // parseしたXMLをrevisionInfoの型に変換
    let revisionInfo;
    try {
      revisionInfo = parsedXmlToRevisionInfo(
        convertLaw[0].law_data_response[2] as ParsedRevisionInfo
      );
    } catch (error) {
      console.warn('revisionInfo parse failed:', error);
      revisionInfo = undefined;
    }


    // APIデータ取得成功時
    // isSuccessをtrueにして、取得したデータをvalueに格納
    return {
      isSuccess: true,
      value: {
        lawFullText,
        attachedFilesInfo,
        lawInfo,
        revisionInfo,
      },
    };
  } catch (error) {
    logger.error({
      message: "[getLawData] API error",
      error: error,
      query: query,
    });
    // API呼び出しに失敗した場合の処理
    // isSuccessをfalseにして、エラー情報をerrorに格納
    return {
      isSuccess: false,
      error: new Error(`API error: ${error}`),
    };
  }
};
