import { Era } from "@api/lib/typescript-fetch";
import { z } from "zod";

/**
 * 年号のスキーマ
 */
export const EraSchema = z.union([
  z.literal(Era.Reiwa),
  z.literal(Era.Heisei),
  z.literal(Era.Showa),
  z.literal(Era.Taisho),
  z.literal(Era.Meiji),
]);

const MONTH_ERROR_MESSAGE = "月は1から12の数値である必要があります";

const isValidMonth = (value: string | number) => {
  const month = parseFloat(value.toString());
  return Number.isInteger(month) && month >= 1 && month <= 12;
};
/**
 * 月のスキーマ
 */
export const MonthSchema = z.union([
  z.string().refine(isValidMonth, {
    message: MONTH_ERROR_MESSAGE,
  }),
  z.number().refine(isValidMonth, {
    message: MONTH_ERROR_MESSAGE,
  }),
]);

const DAY_ERROR_MESSAGE = "日は1から31の数値である必要があります";

/**
 * 日付のスキーマ
 */
const isValidDay = (value: string | number) => {
  const day = parseFloat(value.toString());
  return Number.isInteger(day) && day >= 1 && day <= 31;
};
export const DaySchema = z.union([
  z.string().refine(isValidDay, {
    message: DAY_ERROR_MESSAGE,
  }),
  z.number().refine(isValidDay, {
    message: DAY_ERROR_MESSAGE,
  }),
]);

/**
 * 日付用のスキーマ
 * エラーメッセージとパスを引数に取り、日付のスキーマを作成する。
 *
 * @param {string} message エラーメッセージ
 * @param {string[]} path パス
 * @returns {z.ZodTypeAny} 日付のスキーマ
 */
export const createDateSchema = (message: string, path: string[]) => {
  return z.any().refine(
    (value) => {
      // undefinedを許容
      if (value === undefined) {
        return true;
      }
      // 値が文字列でない場合または日付として解析できない場合は false を返す
      return typeof value === "string" && !isNaN(Date.parse(value));
    },
    {
      message,
      path,
    }
  );
};

/**
 * 時点指定のスキーマ
 */
export const AsOfSchema = createDateSchema("時点指定の値に誤りがあります", [
  "asof",
]);
export const PromulgationDateFromSchema = createDateSchema(
  "公布日の値に誤りがあります",
  ["promulgationDateFrom"]
);
export const PromulgationDateToSchema = createDateSchema(
  "公布日の値に誤りがあります",
  ["promulgationDateTo"]
);
export const UpdatedFromSchema = createDateSchema(
  "改正日の値に誤りがあります",
  ["updatedFrom"]
);
export const UpdatedToSchema = createDateSchema("改正日の値に誤りがあります", [
  "updatedTo",
]);
