import { z } from "zod";

/**
 * 法令履歴一覧取得APIリクエストのパラメータを検証するためのスキーマ
 * @type {z.ZodObject<{ lawId: z.ZodString }, "strip", { lawId: string }>}
 */
export const RequestRevisionParamsSchema = z.object({
  lawId: z.string().refine((value) => value.length > 0, {
    message: "法令IDの入力は必須です(完全一致)",
    path: ["lawId"],
  }),
});

export type RequestRevisionParams = z.infer<typeof RequestRevisionParamsSchema>;
