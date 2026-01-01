import { Result } from "@api/types/result";
import { z } from "zod";

/**
 * 検索結果のソート順の値のスキーマ
 */
export const SortSchema = z
  .string()
  .refine((value) => ["1", "2", "3", "4", "5"].includes(value), {
    message: "ソートの値は1から5の整数の範囲内でなければなりません",
    path: ["sort"],
  });

/**
 * ページ番号のスキーマ
 */
export const PageSchema = z
  .string()
  .refine((value) => /^[1-9]\d*$/.test(value), {
    message: "ページ番号は1から始まる数字の文字列である必要があります",
  });

/**
 * バリデーションチェックの共通化処理
 */
export const validateRequest = <T>({
  schema,
  params,
}: {
  schema: z.ZodSchema<T>;
  params: T;
}): Result<T> => {
  const parsed = schema.safeParse(params);
  if (!parsed.success) {
    const errorMessages: string[] = parsed.error.issues.map((issue) => issue.message);
    return {
      isSuccess: false,
      error: new Error(errorMessages.join("\n")),
    };
  }
  return {
    isSuccess: true,
    value: parsed.data,
  };
};
