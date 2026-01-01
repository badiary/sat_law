import { OFFSET_LIMIT } from "@api/const/common";
import {
  CategoryCd,
  GetLawlistRequest,
  LawType,
  LawsResponse,
  OrderNo,
} from "../typescript-fetch";
import { getApiClient } from "../utils/api";
import { isAllPropsUndefined, getOffsetByPage } from "../utils/helper";
import { validateRequest } from "../utils/zod-schemas/common-schema";
import {
  ResultLawListSearchParams,
  ResultLawListSearchParamsSchema,
} from "../utils/zod-schemas/request-law-list-search-params-schema";
import { Result } from "@api/types/result";
import logger from "../utils/logger";
/**
 * 詳細検索画面の検索結果データ取得処理
 * 検索条件に基づいて法令一覧を取得する
 * @param {ResultLawListSearchParams} searchParams - 検索条件
 * @returns {Promise<Result<LawsResponse | null>>} - 法令一覧
 *
 * 利用対象API: /laws (GET) - 文書一覧取得API
 * - APIエンドポイント [API_URL]/laws
 * - リクエストメソッド: GET
 * - リクエストパラメータ: searchParams（検索条件）
 *
 * 　 本データ取得処理は、@interface {GetLawlistRequest} のパラメータのうち、
 *    @param {ResultLawListSearchParams} に記載している以下のパラメータを利用し、法令一覧のデータを取得しています。
 *    lawTitle(法令名),
 *    lawNum(法令番号),
 *    asof(時点指定),
 *    promulgationDateFrom(公布年月日の範囲指定 指定日以後),
 *    promulgationDateTo(公布年月日の範囲指定 指定日以前),
 *    updatedFrom(更新日の範囲指定 指定日以後)
 *    updatedTo(更新日の範囲指定 指定日以前),
 *    lawType(法令種別),
 *    categoryCd(事項別分類コード),
 *    offset(取得件数),
 *    orderNo(検索結果の並び順),
 *    limit(レスポンスのlawsの取得件数の上限 ※本処理では固定値を使用)
 *
 * - レスポンス: 法令一覧（LawsResponse）
 * - エラーハンドリング: APIからのエラーレスポンスや通信エラーに対しては、Errorオブジェクトを生成して返す
 * - 依存関係: 環境変数（process.env.API_URL）からAPIのBase URLを取得
 * - クライアントコード生成: OpenAPI Generatorを利用して生成(TypeScript-fetch)
 *
 */
export const getLawList = async (
  searchParams: ResultLawListSearchParams
): Promise<Result<LawsResponse | null>> => {
  const isQueryEmpty = isAllPropsUndefined(searchParams);
  if (isQueryEmpty) return { isSuccess: true, value: null };

  // リクエストパラメータのバリデーションチェック
  const validateResult = validateRequest<ResultLawListSearchParams>({
    schema: ResultLawListSearchParamsSchema,
    params: searchParams,
  });
  if (!validateResult.isSuccess) return validateResult;

  // リクエストパラメータの整形、クエリ作成
  // @interface {GetLawlistRequest} のパラメータのうち、
  // @param {ResultLawListSearchParams} に記載しているものを利用。
  const query: GetLawlistRequest = {
    ...searchParams,
    asof: searchParams.asof ? new Date(searchParams.asof) : undefined,
    promulgationDateFrom: searchParams.promulgationDateFrom
      ? new Date(searchParams.promulgationDateFrom)
      : undefined,
    promulgationDateTo: searchParams.promulgationDateTo
      ? new Date(searchParams.promulgationDateTo)
      : undefined,
    updatedFrom: searchParams.updatedFrom
      ? new Date(searchParams.updatedFrom)
      : undefined,
    updatedTo: searchParams.updatedTo
      ? new Date(searchParams.updatedTo)
      : undefined,
    lawType: searchParams.lawType?.split(",") as LawType[] | undefined,
    categoryCd: searchParams.categoryCd?.split(",") as CategoryCd[] | undefined,
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
  const api = getApiClient({
    headers: { Accept: "application/json", "Accept-Encoding": "gzip" },
  });

  try {
    // 文書一覧取得API(/laws)を呼び出し
    // api.getLawlistメソッドにクエリパラメータを渡して、文書一覧を取得
    logger.info("[API] laws request");
    const result = await api.getLawlist(query);

    // API呼び出しに成功した場合の処理
    // isSuccessをtrueにして、取得したデータをvalueに格納
    return {
      isSuccess: true,
      value: result,
    };
  } catch (error) {
    logger.error({
      message: "[getLawList] API error",
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
