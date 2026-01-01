import {
  EXPONENTS,
  KANJI_NAMES,
  KANJI_NUMBERS,
  OFFSET_LIMIT,
} from "@api/const/common";
import { CheckboxItemType } from "@api/types/common";
import crypto from "crypto";
/**
 * URLSearchParamsオブジェクトを文字列に変換する
 *
 * @param {URLSearchParams} urlSearchParams - 変換するURLSearchParamsオブジェクト
 * @returns {string} - URLSearchParamsオブジェクトを文字列に変換したもの（例："key1=value1&key2=value2"）
 */
export const getAllSearchParamsAsString = (
  urlSearchParams: URLSearchParams
) => {
  const paramsArray = Array.from(urlSearchParams.entries()).map(
    ([key, value]) => `${key}=${value}`
  );
  return paramsArray.join("&");
};

/**
 * QueryParamsオブジェクトを受け取り、URLクエリストリングを構築します。
 * @param {T} params - クエリパラメータのオブジェクト
 * @returns {string} - URLクエリストリング
 */
export const buildQueryString = <
  T extends Record<string, string | number | boolean | undefined | null>
>(
  params: T
): string => {
  const filteredParams: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      filteredParams[key] = value.toString();
    }
  });

  return new URLSearchParams(filteredParams).toString();
};

/**
 * 渡されたオブジェクトの全てのプロパティがundefinedであるかどうかを判定する
 *
 * @template T - 判定対象のオブジェクトの型
 * @param {T} searchParams - 判定対象のオブジェクト
 * @returns {boolean} - 全てのプロパティがundefinedである場合はtrue、そうでない場合はfalse
 */
export const isAllPropsUndefined = <T extends { [key: string]: unknown }>(
  searchParams: T
) => {
  return Object.values(searchParams).every((val) => val === undefined);
};

/**
 * 文字列をMD5ハッシュ値に変換する
 *
 * @param {string} input - 変換する文字列
 * @returns {string} - MD5ハッシュ値
 */
export const generateHash = (input: string) => {
  const hash = crypto.createHash("md5");
  hash.update(input);
  return hash.digest("hex");
};

/**
 * ページ番号とオフセットリミットからオフセットを計算する
 *
 * @param {number} page - ページ番号
 * @returns {number} - 計算されたオフセット
 */
export const getOffsetByPage = (page: number) => {
  if (page <= 0) return 0;
  return OFFSET_LIMIT * (page - 1);
};

/**
 * 数字を漢数字に変換する
 * @param {any} num - 変換する数字
 * @returns {string} 漢数字に変換された文字列
 * @throws {TypeError} 数字以外の文字が含まれている場合
 * @throws {RangeError} 数値がNumber.MIN_SAFE_INTEGER ～ Number.MAX_SAFE_INTEGER の範囲外の場合
 */
export const numbersToKanji = (num: any) => {
  if (num === "元") {
    return "元";
  }

  if (num === undefined || num === null || num === "") {
    return "";
  }
  // 全角数字を半角数字に変換
  num = num.toString().replace(/[０-９]/g, function (s: string) {
    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
  });

  // 半角数字と全角数字の両方を受け付ける正規表現
  if (!/^-?[0-9０-９]+$/g.test(num)) {
    throw new TypeError(
      "数字以外の文字が含まれています。漢数字に変換できませんでした。-> " + num
    );
  }

  num = Number(num);

  if (!Number.isSafeInteger(num)) {
    throw new RangeError(
      "数値が " +
        Number.MIN_SAFE_INTEGER +
        " ～ " +
        Number.MAX_SAFE_INTEGER +
        " の範囲外です。漢数字に変換できませんでした。-> " +
        num
    );
  }
  if (num === 0) {
    return "零";
  }
  let ret = "";
  if (num < 0) {
    ret += "マイナス";
    num *= -1;
  }

  const exponentsLen = EXPONENTS.length;
  for (let i = exponentsLen; i >= 0; --i) {
    const bias = Math.pow(10, EXPONENTS[i]);
    if (num >= bias) {
      const top = Math.floor(num / bias);
      if (top >= 10) {
        ret += numbersToKanji(top);
      } else {
        if (top == 1 && EXPONENTS[i] <= 3) {
          // ※先頭の数字が1、かつ指数が3 (千の位) 以下の場合のみ『一』をつけない
        } else {
          ret += KANJI_NUMBERS[top];
        }
      }
      ret += KANJI_NAMES[i];
      num -= top * bias;
    }
  }
  ret += KANJI_NUMBERS[num];
  return ret;
};

/**
 * チェックボックスのリストから、各チェックボックスの初期状態を表すオブジェクトを返す。
 *
 * @template T チェックボックスのIDの型
 * @param {CheckboxItemType<T>[]} checkboxList チェックボックスのリスト
 * @returns {Record<string, boolean>} 各チェックボックスの初期状態を表すオブジェクト
 */
export const initCheckedItems = <T>(checkboxList: CheckboxItemType<T>[]) =>
  updateCheckboxItems({ checkboxList });

/**
 * チェックボックスのリストから、各チェックボックスの状態を表すオブジェクトを返す。
 *
 * @template T チェックボックスのIDの型
 * @param {CheckboxItemType<T>[]} checkboxList チェックボックスのリスト
 * @param {boolean | null} [isSelected] すべてのチェックボックスを選択するかどうかを表すパラメータ (省略可能)
 * @returns {Record<string, boolean>} 各チェックボックスの状態を表すオブジェクト
 */
export const updateCheckboxItems = <T>({
  checkboxList,
  isSelected,
}: {
  checkboxList: CheckboxItemType<T>[];
  isSelected?: boolean | undefined;
}) => {
  return checkboxList.reduce(
    (prev, item) => ({
      ...prev,
      [String(item.id)]: isSelected !== undefined ? isSelected : item.checked,
    }),
    {} as Record<string, boolean>
  );
};
