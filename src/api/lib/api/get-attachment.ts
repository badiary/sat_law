import { Result } from "@api/types/result";
import { getApiClient } from "../utils/api";
import { GetAttachedRequest } from "../typescript-fetch";
import { validateRequest } from "../utils/zod-schemas/common-schema";
import { RequestAttachedParamsSchema } from "../utils/zod-schemas/request-attached-params-schema";
import logger from "../utils/logger";

/**
 * GetAttachedRequestオブジェクトを受け取り、添付ファイルのデータを取得する非同期関数です。
 * @param {GetAttachedRequest} query - 添付ファイルの取得に必要なクエリパラメータ
 * @returns {Promise<Attached>} - 添付ファイルのデータを含むPromiseオブジェクト
 */
export const fetchAttachment = async (query: GetAttachedRequest) => {
  // APIクライアントの生成
  const api = getApiClient();
  // 添付ファイル取得API(/attached)を呼び出し
  // api.getAttachedメソッドにクエリパラメータを渡し、添付画像のデータを取得
  return await api.getAttached(query);
};

/**
 * 添付画像ファイル用のページの画像データ取得処理
 * 添付画像ファイル取得API(/attached)を利用
 * 添付画像ファイルのデータ(blob)を取得する
 * @param {GetAttachedRequest} params
 * @param {string} params.lawRevisionId - 法令ID
 * @param {string} params.src - 添付ファイルのパス
 * @returns {Promise<Result<Blob>>} - 添付ファイルの画像データ
 *
 * 利用対象API: /attached (GET) - 添付画像ファイル取得API
 * - APIエンドポイント [API_URL]/attached
 * - リクエストメソッド: GET
 * - リクエストパラメータ: params（検索条件）
 *
 * 本データ取得処理は、@interface {GetAttachedRequest} のパラメータのうち、
 * @param {GetAttachedRequest} に記載している以下のパラメータを利用し、添付ファイルの画像データを取得しています。
 * lawRevisionId(法令履歴ID)
 * src(添付ファイルのパス)
 *
 * - レスポンス: 添付ファイルの画像データ（Blob）
 * - エラーハンドリング: APIからのエラーレスポンスや通信エラーに対しては、Errorオブジェクトを生成して返す
 * - 依存関係: 環境変数（process.env.API_URL）からAPIのBase URLを取得
 * - クライアントコード生成: OpenAPI Generatorを利用して生成(TypeScript-fetch)
 */
export const getAttachment = async ({
  lawRevisionId,
  src,
}: GetAttachedRequest): Promise<Result<Blob>> => {
  // リクエストパラメータのバリデーションチェック
  const validateResult = validateRequest<GetAttachedRequest>({
    schema: RequestAttachedParamsSchema,
    params: { lawRevisionId, src },
  });
  // バリデーションエラーの場合は Error オブジェクトを返す
  if (!validateResult.isSuccess) return validateResult;

  // リクエストパラメータの整形、クエリ作成
  // 本データ取得処理(/attached)は、@interface {GetAttachedRequest} のパラメータのうち、
  // @param {GetAttachedRequest} に記載している以下のパラメータを利用し、添付ファイルの画像データを取得しています。
  const query: GetAttachedRequest = {
    lawRevisionId: lawRevisionId,
    src: src ?? "",
  };

  try {
    // fetchAttachment関数 内部で添付ファイル取得API(/attached)を呼び出し、リクエスト
    logger.info("[API] attached request");
    const result = await fetchAttachment(query);
    // APIデータ取得成功時
    // isSuccessをtrueにして、取得したデータをvalueに格納
    return {
      isSuccess: true,
      value: result,
    };
  } catch (error) {
    logger.error({
      message: "[getAttachment] API error",
      error: error,
      query: query,
    });

    // APIデータ取得失敗時
    // isSuccessをfalseにして、エラーをvalueに格納
    return {
      isSuccess: false,
      error: new Error(`API error: ${error}`),
    };
  }
};
