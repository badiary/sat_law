import { z } from "zod";
import {
  AsOfSchema,
  PromulgationDateFromSchema,
  PromulgationDateToSchema,
  UpdatedFromSchema,
  UpdatedToSchema,
} from "./date-schemas";
import { PageSchema, SortSchema } from "./common-schema";
import { LawType, CategoryCd } from "@api/lib/typescript-fetch";

/**
 * 法令種別のスキーマ
 */
const validLawTypes = Object.values(LawType);
const LawTypeArraySchema = z.string().refine(
  (value) => {
    const lawTypes = value.split(",");

    return lawTypes.every((lawType) =>
      validLawTypes.includes(lawType as LawType)
    );
  },
  {
    message: "法令種別の値に誤りがあります",
    path: ["lawType"],
  }
);

/**
 * 検索分類のスキーマ
 */
const validCategoryCds = Object.values(CategoryCd);
const CategoryCdSchema = z.string().refine(
  (value) => {
    const validCategoryCdSet = new Set(validCategoryCds);
    const categoryCds = value.split(",");
    return categoryCds.every((categoryCd) =>
      validCategoryCdSet.has(categoryCd as CategoryCd)
    );
  },
  {
    message: "カテゴリーの値に誤りがあります",
    path: ["categoryCd"],
  }
);

/**
 * 法令一覧取得API(/laws)のクエリパラメータのスキーマバリデーション
 */
export const ResultLawListSearchParamsSchema = z.object({
  lawTitle: z.string().optional(), // 法令名
  lawNum: z.string().optional(), // 法令番号
  lawType: LawTypeArraySchema.optional(), // 法令種別
  asof: AsOfSchema, // 時点指定
  promulgationDateFrom: PromulgationDateFromSchema.optional(), // 公布日From
  promulgationDateTo: PromulgationDateToSchema.optional(), // 公布日To
  categoryCd: CategoryCdSchema.optional(), // 事項別分類コード
  updatedFrom: UpdatedFromSchema.optional(), // 更新日From
  updatedTo: UpdatedToSchema.optional(), // 更新日To
  page: PageSchema.optional(), // ページ番号
  orderNo: SortSchema.optional(), // ソート順
});

export type ResultLawListSearchParams = z.infer<
  typeof ResultLawListSearchParamsSchema
>;
