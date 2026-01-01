import { Configuration, LawsApiApi } from "../typescript-fetch";

type ApiClientProps = {
  headers: Record<string, string>;
};

/**
 * LawsApiApiのインスタンスを返す関数です。
 * @param {ApiClientProps} [options] - オプションの設定
 * @param {Record<string, string>} [options.headers] - リクエストヘッダー
 * @returns {LawsApiApi} - LawsApiApiのインスタンス
 */
export const getApiClient = (options?: ApiClientProps) => {
  // APIの設定 (OpenAPI Generatorで生成したクライアントコードを利用)
  // Configuration オブジェクトを生成して、APIの基本パスとヘッダーを設定
  const conf = new Configuration({
    basePath: "https://elaws.e-gov.go.jp/api/1",
    headers: {
      ...options?.headers,
    },
  });
  // APIオブジェクトを生成して返す
  return new LawsApiApi(conf);
};
