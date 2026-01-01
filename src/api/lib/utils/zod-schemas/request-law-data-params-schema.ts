import { z } from "zod";
import { AsOfSchema } from "./date-schemas";

/**
 * 法令本文取得APIのリクエストのパラメータを検証するためのスキーマ
 * @type {z.ZodObject<{ lawId: z.ZodString }, "strip", { lawId: string, asof: string }>}
 */
export const RequestLawDataParamsSchema = z.object({
  lawId: z.string().refine((value) => value.length > 0, {
    message: "法令IDの入力は必須です(完全一致)",
    path: ["lawId"],
  }),
  asof: AsOfSchema.optional(),
});

export type RequestLawDataParams = z.infer<typeof RequestLawDataParamsSchema>;
