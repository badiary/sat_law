import { z } from "zod";

/**
 * 添付ファイル取得API(/attached)のクエリパラメータのスキーマのバリデーション
 */
export const RequestAttachedParamsSchema = z.object({
  lawRevisionId: z.string().refine((value) => value.length > 0, {
    message: "法令履歴ID(完全一致)の入力は必須です",
  }),
  src: z.string().optional(),
});

export type RequestAttachedParams = z.infer<typeof RequestAttachedParamsSchema>;
