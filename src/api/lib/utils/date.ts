// import { TargetDateForm } from "@api/hooks/target-date-search-form-hooks";
import { Era } from "../typescript-fetch";
import { numbersToKanji } from "./helper";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const VALID_ERAS = Object.values(Era) as Era[];
/**
 * 日付を和暦の文字列に変換する関数(ex:Date(2020-01-01) -> 令和2年1月1日)
 * @param {Date} date
 * @return {string} 和暦の文字列 (ex: 令和2年1月1日)
 */
export const toJapaneseEra = (
  dateInput: Date,
  isKanji: boolean = false
): string => {
  const year = dateInput.getFullYear();
  const month = dateInput.getMonth() + 1; // DateオブジェクトのgetMonthは0から始まる
  const day = dateInput.getDate();

  if (year < 1868) {
    throw new Error("Unsupported date");
  }

  const getEra = (year: number, month: number, day: number) => {
    if (year < 1912 || (year === 1912 && month <= 7)) {
      return ["明治", year - 1867 === 1 ? "元" : year - 1867];
    } else if (year < 1926 || (year === 1926 && month === 12 && day <= 24)) {
      return ["大正", year - 1911 === 1 ? "元" : year - 1911];
    } else if (year < 1989 || (year === 1989 && month === 1 && day <= 7)) {
      return ["昭和", year - 1925 === 1 ? "元" : year - 1925];
    } else if (year < 2019 || (year === 2019 && month <= 4)) {
      return ["平成", year - 1988 === 1 ? "元" : year - 1988];
    } else {
      return ["令和", year - 2018 === 1 ? "元" : year - 2018];
    }
  };

  const [era, eraYear] = getEra(year, month, day);
  if (isKanji) {
    return `${era}${numbersToKanji(eraYear)}年${numbersToKanji(
      month
    )}月${numbersToKanji(day)}日`;
  }
  return `${era}${eraYear}年${month}月${day}日`;
};

/**
 * ターゲット日付が完全な形式かどうかを判定する関数
 * @param {TargetDateForm} targetDate - ターゲット日付のフォームデータ
 * @returns {boolean} ターゲット日付が完全な形式の場合はtrue、そうでない場合はfalse
 */
// export const isCompleteDateForm = (targetDate: TargetDateForm) => {
//   const { era, year, month, day } = targetDate;
//   return !!(era && year && month && day);
// };

/**
 * 年月日がすべて指定されているか、未指定であるかを判定する関数
 * @param {TargetDateForm} targetDate - 年月日を含むオブジェクト
 * @returns {boolean} 年月日がすべて指定されているか、未指定である場合はtrue、それ以外はfalse
 */
// export const isFullySpecifiedOrEmptyDate = (targetDate: TargetDateForm) => {
//   const { year, month, day } = targetDate;
//   return (!year && !month && !day) || !!(year && month && day);
// };

/**
 * targetDateFormをDateに変換する関数
 * 時点指定フォームの値などに利用する
 * @param {TargetDateForm} targetDate
 */
// export const convertToDate = (targetDate: TargetDateForm) => {
//   const { era, year, month, day } = targetDate;

//   if (!isCompleteDateForm(targetDate)) {
//     return null;
//   }

//   const eraToYearOffset: { [key in Era]: number } = {
//     Meiji: 1868 - 1,
//     Taisho: 1912 - 1,
//     Showa: 1926 - 1,
//     Heisei: 1989 - 1,
//     Reiwa: 2019 - 1,
//   };

//   const yearOffset = eraToYearOffset[era];

//   if (yearOffset === undefined) {
//     return null;
//   }

//   const jsYear = yearOffset + parseInt(year!, 10);
//   const jsMonth = parseInt(month!, 10) - 1;
//   const jsDay = parseInt(day!, 10);

//   return new Date(jsYear, jsMonth, jsDay);
// };

/**
 * 日付の入力値をバリデーションする関数
 * @param {keyof TargetDateForm} key
 * @param {string | null} value
 * @return {boolean} 入力値が正しいかどうか
 */
// export const isValidJapaneseDateField = (
//   targetDateForm: TargetDateForm,
//   key: keyof TargetDateForm,
//   value: string | null
// ): boolean => {
//   switch (key) {
//     case "era":
//       return VALID_ERAS.includes(value as Era);
//     case "year":
//       return (
//         value === null ||
//         value === "" ||
//         (value.length <= 3 && !isNaN(Number(value)) && !value.startsWith("0"))
//       );
//     case "month":
//       return (
//         value === null ||
//         value === "" ||
//         (value.length <= 2 && Number(value) >= 1 && Number(value) <= 12)
//       );
//     case "day":
//       const { year, month } = targetDateForm;
//       if (year !== null && month !== null && year !== "" && month !== "") {
//         // 月の最後の日を取得
//         const lastDay = new Date(Number(year), Number(month), 0).getDate();
//         return (
//           value === null ||
//           value === "" ||
//           (value.length <= 2 && Number(value) >= 1 && Number(value) <= lastDay)
//         );
//       } else {
//         return (
//           value === null ||
//           value === "" ||
//           (value.length <= 2 && Number(value) >= 1 && Number(value) <= 31)
//         );
//       }
//     default:
//       return false;
//   }
// };

/**
 * 西暦の年月日から元号と元号内の年数を取得する関数
 * @param {number} year - 西暦の年
 * @param {number} month - 月
 * @param {number} day - 日
 * @returns {{era: Era, eraYear: string}} 元号と元号内の年数を含むオブジェクト
 */
export const getEraAndEraYear = (
  year: number,
  month: number,
  day: number
): {
  era: Era;
  eraYear: string;
} => {
  if (
    year < 1912 ||
    (year === 1912 && (month < 7 || (month === 7 && day <= 29)))
  ) {
    return {
      era: "Meiji",
      eraYear: String(year - 1867),
    };
  } else if (year < 1926 || (year === 1926 && month === 12 && day <= 24)) {
    return {
      era: "Taisho",
      eraYear: String(year - 1911),
    };
  } else if (year < 1989 || (year === 1989 && month === 1 && day <= 7)) {
    return {
      era: "Showa",
      eraYear: String(year - 1925),
    };
  } else if (year < 2019 || (year === 2019 && month <= 4)) {
    return {
      era: "Heisei",
      eraYear: String(year - 1988),
    };
  } else {
    return {
      era: "Reiwa",
      eraYear: String(year - 2018),
    };
  }
};

/**
 * ISO形式の日付文字列を東京タイムゾーンの日付文字列に変換する関数
 * return時のフォーマットはyyyy-MM-dd
 * @param {string} isoString - ISO形式の日付文字列
 * @returns {string} 東京タイムゾーンの日付文字列 (ex: 2020-01-01)
 */
export const formatISOToTokyoDate = (isoString: string) => {
  const tokyoTimeZone = "Asia/Tokyo";
  const dateInTokyoTimezone = toZonedTime(isoString, tokyoTimeZone);
  return format(dateInTokyoTimezone, "yyyy-MM-dd");
};

/**
 * 指定された日付を日本標準時のタイムゾーンに変換し、その日付の時刻を00:00:00または23:59:59に設定します。
 * @param {Date} date - 変換する日付
 * @param {"start" | "end"} dayBoundary - 日付の時刻を00:00:00に設定する場合は"start"、23:59:59に設定する場合は"end"を指定します。
 * @returns {Date} - 時刻が設定された日付
 */
export const setTimezoneStartOrEndDayInTokyo = (
  date: Date,
  dayBoundary: "start" | "end"
) => {
  const tokyoTimeZone = "Asia/Tokyo";
  const dateInTokyoTimezone = toZonedTime(date, tokyoTimeZone);

  const year = dateInTokyoTimezone.getFullYear();
  const month = dateInTokyoTimezone.getMonth();
  const day = dateInTokyoTimezone.getDate();

  if (dayBoundary === "start") {
    // 00:00:00に設定
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  }
  // 23:59:59に設定
  return new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
};
