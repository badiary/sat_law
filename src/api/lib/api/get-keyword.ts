import { OFFSET_LIMIT } from "@api/const/common";
import {
  KeywordResponse,
  GetKeywordRequest,
  OrderNo,
} from "../typescript-fetch";
import { getApiClient } from "../utils/api";
import { isAllPropsUndefined, getOffsetByPage } from "../utils/helper";
import { validateRequest } from "../utils/zod-schemas/common-schema";
import {
  RequestKeywordSearchParams,
  RequestKeywordSearchParamsSchema,
} from "../utils/zod-schemas/request-keyword-search-params-schema";
import { Result } from "@api/types/result";
import logger from "../utils/logger";

/**
 * キーワード検索画面の検索結果データ取得処理
 * キーワード検索API(/keyword)を利用
 * 検索条件に基づいて法令一覧を取得する
 * @param {RequestKeywordSearchParams} searchParams - 検索条件
 * @returns {Promise<Result<KeywordResponse | null>>} - 法令一覧
 *
 * 利用対象API: /keyword (GET) - キーワード検索API
 * - APIエンドポイント [API_URL]/keyword
 * - リクエストメソッド: GET
 * - リクエストパラメータ: searchParams（検索条件）
 *
 *    本データ取得処理は、@interface {GetKeywordRequest} のパラメータのうち、
 *    @param {RequestKeywordSearchParams} に記載している以下のパラメータを利用し、法令一覧のデータを取得しています。
 *    keyword(キーワード),
 *    asof(時点指定),
 *    orderNo(検索結果の並び順),
 *    offset(取得件数),
 *    limit(レスポンスのlawsの取得件数の上限 ※本処理では固定値を使用)
 *
 * - レスポンス: 法令一覧（KeywordResponse）
 * - エラーハンドリング: APIからのエラーレスポンスや通信エラーに対しては、Errorオブジェクトを生成して返す
 * - 依存関係: 環境変数（process.env.API_URL）からAPIのBase URLを取得
 * - クライアントコード生成: OpenAPI Generatorを利用して生成(TypeScript-fetch)
 *
 */
export const getLawDataFromKeyword = async (
  searchParams: RequestKeywordSearchParams
): Promise<Result<KeywordResponse | null>> => {
  const isQueryEmpty = isAllPropsUndefined(searchParams);
  if (isQueryEmpty) return { isSuccess: true, value: null };

  // リクエストパラメータのバリデーションチェック
  const validateResult = validateRequest<RequestKeywordSearchParams>({
    schema: RequestKeywordSearchParamsSchema,
    params: searchParams,
  });
  if (!validateResult.isSuccess) return validateResult;

  // リクエストパラメータの整形、クエリ作成
  // 本データ取得処理は、@interface {GetKeywordRequest} のパラメータのうち、
  // @param {RequestKeywordSearchParams} に記載しているものを利用。
  const query: GetKeywordRequest = {
    keyword: searchParams.keyword,
    asof: searchParams.asof ? new Date(searchParams.asof) : undefined,
    offset:
      searchParams.page !== undefined
        ? getOffsetByPage(Number(searchParams.page))
        : 0,
    orderNo:
      searchParams.orderNo !== undefined
        ? (Number(searchParams.orderNo) as OrderNo)
        : (1 as OrderNo),
    limit: OFFSET_LIMIT,
  };

  // APIの設定 (OpenAPI Generatorで生成したクライアントコードを利用)
  // Configuration オブジェクトを生成して、APIの基本パスとヘッダーを設定
  // APIオブジェクトを生成
  logger.info("[API] keyword request");
  const api = getApiClient({
    headers: { Accept: "application/json", "Accept-Encoding": "gzip" },
  });

  try {
    // キーワード検索API(/keyword)を呼び出し
    // api.getKeyword(query)メソッドにクエリパラメータを渡して、キーワード検索結果を取得
    const result = await api.getKeyword(query);
    // API呼び出しに成功した場合の処理
    // isSuccessをtrueにして、取得したデータをvalueに格納
    return {
      isSuccess: true,
      value: result,
    };
  } catch (error) {
    logger.error({
      message: "[getLawDataFromKeyword] API error",
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
