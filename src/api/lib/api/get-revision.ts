import { GetRevisionsRequest, LawRevisionsResponse } from "../typescript-fetch";
import { getApiClient } from "../utils/api";
import logger from "../utils/logger";
import { validateRequest } from "../utils/zod-schemas/common-schema";
import {
  RequestRevisionParams,
  RequestRevisionParamsSchema,
} from "../utils/zod-schemas/request-revision-params-schema";
import { Result } from "@api/types/result";

/**
 * 法令沿革履歴画面のデータ取得処理
 * 法令履歴一覧取得API(/revisions)を利用
 * 法令IDを基に法令履歴一覧データを取得する
 * @param {RequestRevisionParams} params - 検索条件
 * @returns {Promise<Result<LawRevisionsResponse>>} - 法令履歴一覧データ
 *
 * 利用対象API: /revisions (GET) - 法令履歴一覧取得API
 * - APIエンドポイント [API_URL]/revisions
 * - リクエストメソッド: GET
 * - リクエストパラメータ: searchParams（検索条件）
 *
 * 本データ取得処理は、@interface {GetRevisionsRequest} のパラメータのうち、
 * @param {RequestRevisionParams} に記載している以下のパラメータを利用し、法令履歴一覧のデータを取得しています。
 * lawId(法令ID)
 *
 * - レスポンス: 法令履歴一覧データ（LawRevisionsResponse）
 * - エラーハンドリング: APIからのエラーレスポンスや通信エラーに対しては、Errorオブジェクトを生成して返す
 * - 依存関係: 環境変数（process.env.API_URL）からAPIのBase URLを取得
 * - クライアントコード生成: OpenAPI Generatorを利用して生成(TypeScript-fetch)
 */
export const getRevision = async ({
  lawId,
}: RequestRevisionParams): Promise<Result<LawRevisionsResponse>> => {
  // リクエストパラメータのバリデーションチェック
  const validateResult = validateRequest<RequestRevisionParams>({
    schema: RequestRevisionParamsSchema,
    params: { lawId },
  });
  if (!validateResult.isSuccess) return validateResult;

  // リクエストパラメータの整形、クエリ作成
  // 本データ取得処理(/revisions)は、@interface {GetRevisionsRequest} のパラメータのうち、
  // @param {RequestRevisionParams} に記載している以下のパラメータを利用し、法令履歴一覧データを取得しています。
  const query: GetRevisionsRequest = {
    lawId: lawId,
  };

  // APIの設定(OpenAPI Generatorで生成したクライアントコードを利用)
  // Configuration オブジェクトを生成して、APIの基本パスとヘッダーを設定
  const api = getApiClient({
    headers: { Accept: "application/json", "Accept-Encoding": "gzip" },
  });
  try {
    // 法令履歴一覧取得API(/revisions)を呼び出し
    // api.getRevisions(query)メソッドにクエリを渡して、法令履歴一覧の情報を取得
    logger.info("[API] revisions request");
    const result = await api.getRevisions(query);
    // APIデータ取得成功時
    // isSuccessをtrueにして、取得したデータをvalueに格納
    return { isSuccess: true, value: result };
  } catch (error) {
    logger.error({
      message: "[revision] API error",
      error: error,
      query: query,
    });

    // APIデータ取得失敗時
    // isSuccessをfalseにして、エラーをvalueに格納
    return { isSuccess: false, error: new Error(`API error: ${error}`) };
  }
};
