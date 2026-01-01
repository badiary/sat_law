import { DOC_TYPES } from "@api/const/common";

/**
 * 法令の時系列の状態を表す
 * @typedef {'future' | 'current' | 'past'} timeCategory
 */
type TimeCategory = "future" | "current" | "past";

/**
 * 法令の分類を表すコード
 * @typedef {'10' | '20' | '30' | '40' | '50' | '60'} LawCategoryCode
 * 10: 憲法
 * 20: 法律
 * 30: 政令
 * 40: 勅令
 * 50: 府省令
 * 60: 規則
 */

/**
 * LawTagコンポーネントのProps
 * @param {string} label - タグ名
 */
type LawTagProps = {
  type?: string;
};

/**
 * 法令の分類を表すタグコンポーネント
 * @returns {JSX.Element} - 法令の分類を表すタグ
 */
const LawTag = (props: LawTagProps) => {
  const { type } = props;
  if (!type || type == "") {
    return <></>;
  }
  const color = "bg-Sea-900 text-light-Text-OnFill";
  const label = DOC_TYPES.find((docType) => docType.id === type)?.label ?? "";

  return <Tag label={label} color={color} />;
};

/**
 * 法令の施行状態を表すタグコンポーネントprops
 * @param {string} label - タグ名
 * @param {TimeCategory} timeCategory - 施行日時点の状態(未来、現在、過去)
 */
type TimeCategoryTagProps = {
  label: string;
  timeCategory: TimeCategory;
};

/**
 * 施行日時点の状態(未来、現在、過去)を表すタグコンポーネント
 * @param {TimeCategoryTagProps} props
 * @returns {JSX.Element} - 施行日時点の状態を表すタグ
 */
const TimeCategoryTag = (props: TimeCategoryTagProps) => {
  const { label, timeCategory } = props;
  const colorMap = {
    future: "bg-Sea-200 text-light-Text-Body",
    current: "bg-Forest-200 text-light-Text-Body",
    past: "bg-Sumi-200 text-light-Text-Body",
  };
  return <Tag label={label} color={colorMap[timeCategory]} />;
};

/**
 * タグコンポーネントのProps
 * @param {string} label - タグ名
 * @param {string} color - タグの色
 */
type TagProps = {
  label: string;
  color?: string;
};

/**
 * 共通タグコンポーネント
 * @param {TagProps} props
 * @returns {JSX.Element} - tag
 */
const Tag = (props: TagProps) => {
  const { label, color = "bg-Sumi-800 text-light-Text-OnFill" } = props;
  return (
    <span className={`whitespace-nowrap rounded text-xs px-3 py-1.5 ${color} `}>
      {label}
    </span>
  );
};

export { LawTag, TimeCategoryTag, Tag };
