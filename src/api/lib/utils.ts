import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 複数のクラス名を結合し、Tailwind CSSのクラス名をマージします。
 * @param inputs - 結合するクラス名の配列
 * @returns 結合されたクラス名
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};
