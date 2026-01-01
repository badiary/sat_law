import { CategoryCd, LawType } from "@api/lib/typescript-fetch";
import { CheckboxItemType, RadioItemType } from "@api/types/common";

/**
 * 時点指定
 */
export const POINT_IN_TIME_LIST: Array<RadioItemType> = [
  {
    id: "point_in_time_current",
    label: "現行法令",
    disabled: false,
  },
  {
    id: "point_in_time_point",
    label: "時点指定",
    disabled: false,
  },
];

/**
 * 文書種別のデフォルト値
 */
const docTypeDefaultValues = {
  name: "docType",
  checked: true,
  disabled: false,
};

/**
 * 文書種別(一旦法令種別のみ)
 */
export const DOC_TYPES: Array<CheckboxItemType<LawType>> = [
  {
    id: "Constitution",
    label: "憲法",
    ...docTypeDefaultValues,
  },
  {
    id: "Act",
    label: "法律",
    ...docTypeDefaultValues,
  },
  {
    id: "CabinetOrder",
    label: "政令",
    ...docTypeDefaultValues,
  },
  {
    id: "ImperialOrder",
    label: "勅令",
    ...docTypeDefaultValues,
  },
  {
    id: "MinisterialOrdinance",
    label: "府省令",
    ...docTypeDefaultValues,
  },
  {
    id: "Rule",
    label: "規則",
    ...docTypeDefaultValues,
  },
  {
    id: "Misc",
    label: "その他",
    ...docTypeDefaultValues,
  },
];

/**
 * 法令分類のデフォルト値
 */
const categoryCdDefaultValues = {
  name: "categoryCd",
  checked: true,
  disabled: false,
};

/**
 * 法令分類
 */
export const LAW_CATEGORIES: CheckboxItemType<CategoryCd>[] = [
  {
    id: "001",
    label: "憲法",
    ...categoryCdDefaultValues,
  },
  {
    id: "002",
    label: "刑事",
    ...categoryCdDefaultValues,
  },
  {
    id: "003",
    label: "財務通則",
    ...categoryCdDefaultValues,
  },
  {
    id: "004",
    label: "水産業",
    ...categoryCdDefaultValues,
  },
  {
    id: "005",
    label: "観光",
    ...categoryCdDefaultValues,
  },
  {
    id: "006",
    label: "国会",
    ...categoryCdDefaultValues,
  },
  {
    id: "007",
    label: "警察",
    ...categoryCdDefaultValues,
  },
  {
    id: "008",
    label: "国有財産",
    ...categoryCdDefaultValues,
  },
  {
    id: "009",
    label: "鉱業",
    ...categoryCdDefaultValues,
  },
  {
    id: "010",
    label: "郵務",
    ...categoryCdDefaultValues,
  },
  {
    id: "011",
    label: "行政組織",
    ...categoryCdDefaultValues,
  },
  {
    id: "012",
    label: "消防",
    ...categoryCdDefaultValues,
  },
  {
    id: "013",
    label: "国税",
    ...categoryCdDefaultValues,
  },
  {
    id: "014",
    label: "工業",
    ...categoryCdDefaultValues,
  },
  {
    id: "015",
    label: "電気通信",
    ...categoryCdDefaultValues,
  },
  {
    id: "016",
    label: "国家公務員",
    ...categoryCdDefaultValues,
  },
  {
    id: "017",
    label: "国土開発",
    ...categoryCdDefaultValues,
  },
  {
    id: "018",
    label: "事業",
    ...categoryCdDefaultValues,
  },
  {
    id: "019",
    label: "商業",
    ...categoryCdDefaultValues,
  },
  {
    id: "020",
    label: "労働",
    ...categoryCdDefaultValues,
  },
  {
    id: "021",
    label: "行政手続",
    ...categoryCdDefaultValues,
  },
  {
    id: "022",
    label: "土地",
    ...categoryCdDefaultValues,
  },
  {
    id: "023",
    label: "国債",
    ...categoryCdDefaultValues,
  },
  {
    id: "024",
    label: "金融・保険",
    ...categoryCdDefaultValues,
  },
  {
    id: "025",
    label: "環境保全",
    ...categoryCdDefaultValues,
  },
  {
    id: "026",
    label: "統計",
    ...categoryCdDefaultValues,
  },
  {
    id: "027",
    label: "都市計画",
    ...categoryCdDefaultValues,
  },
  {
    id: "028",
    label: "教育",
    ...categoryCdDefaultValues,
  },
  {
    id: "029",
    label: "外国為替・貿易",
    ...categoryCdDefaultValues,
  },
  {
    id: "030",
    label: "厚生",
    ...categoryCdDefaultValues,
  },
  {
    id: "031",
    label: "地方自治",
    ...categoryCdDefaultValues,
  },
  {
    id: "032",
    label: "道路",
    ...categoryCdDefaultValues,
  },
  {
    id: "033",
    label: "文化",
    ...categoryCdDefaultValues,
  },
  {
    id: "034",
    label: "陸運",
    ...categoryCdDefaultValues,
  },
  {
    id: "035",
    label: "社会福祉",
    ...categoryCdDefaultValues,
  },
  {
    id: "036",
    label: "地方財政",
    ...categoryCdDefaultValues,
  },
  {
    id: "037",
    label: "河川",
    ...categoryCdDefaultValues,
  },
  {
    id: "038",
    label: "産業通則",
    ...categoryCdDefaultValues,
  },
  {
    id: "039",
    label: "海運",
    ...categoryCdDefaultValues,
  },
  {
    id: "040",
    label: "社会保険",
    ...categoryCdDefaultValues,
  },
  {
    id: "041",
    label: "司法",
    ...categoryCdDefaultValues,
  },
  {
    id: "042",
    label: "災害対策",
    ...categoryCdDefaultValues,
  },
  {
    id: "043",
    label: "農業",
    ...categoryCdDefaultValues,
  },
  {
    id: "044",
    label: "航空",
    ...categoryCdDefaultValues,
  },
  {
    id: "045",
    label: "防衛",
    ...categoryCdDefaultValues,
  },
  {
    id: "046",
    label: "民事",
    ...categoryCdDefaultValues,
  },
  {
    id: "047",
    label: "建築・住宅",
    ...categoryCdDefaultValues,
  },
  {
    id: "048",
    label: "林業",
    ...categoryCdDefaultValues,
  },
  {
    id: "049",
    label: "貨物運送",
    ...categoryCdDefaultValues,
  },
  {
    id: "050",
    label: "外事",
    ...categoryCdDefaultValues,
  },
];

/**
 * 1...10のkeyというpropertyを持ったオブジェクト配列を作成
 * 検索結果のスケルトン表示用
 */
export const SKELTON_ITEMS = Array.from({ length: 10 }, (_, i) => ({ key: i }));

/**
 * 1ページあたりの表示件数
 */
export const OFFSET_LIMIT = 20;

/**
 * 漢数字の定数
 */
export const KANJI_NUMBERS = [
  "",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
];

/**
 * 漢数字の位の定数
 */
export const KANJI_NAMES = [
  "十",
  "百",
  "千",
  "万",
  "億",
  "兆",
  "京",
  "垓",
  "𥝱",
  "穣",
  "溝",
  "澗",
  "正",
  "載",
  "極",
  "恒河沙",
  "阿僧祇",
  "那由他",
  "不可思議",
  "無量大数",
];

export const EXPONENTS = [
  1, 2, 3, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68,
];
