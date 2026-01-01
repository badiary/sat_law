import { RevisionInfo } from "@api/lib/typescript-fetch";
import { toJapaneseEra } from "@api/lib/utils/date";
import { buildQueryString } from "@api/lib/utils/helper";
// import Link from "next/link";
import Skeleton from "react-loading-skeleton";

type RevisionItemProps = {
  lawId: string;
  revision: RevisionInfo;
  isSelected: boolean;
  isNewlyEnactedLaw: boolean;
};

/**
 * 沿革の項目コンポーネント
 * @param {RevisionItemProps} props 沿革の項目コンポーネントのprops
 * @param {string} props.lawId 法令ID
 * @param {RevisionInfo} props.revision 改正法令情報
 * @param {boolean} props.isSelected 選択されているかどうか
 * @returns {JSX.Element} 沿革の項目コンポーネント
 */
const RevisionItem = ({
  lawId,
  revision,
  isSelected,
  isNewlyEnactedLaw,
}: RevisionItemProps) => {
  // 法令ページへのリンク
  const query = buildQueryString({
    lawId: revision.lawRevisionId ?? lawId,
  });
  const lawLink = `/law?${query}`;

  // 公布日
  const amendmentPromulgateDate = revision?.amendmentPromulgateDate
    ? toJapaneseEra(revision?.amendmentPromulgateDate, true)
    : "";

  // 新規制定or基準日現在のデータ
  const lawTitle = (() => {
    if (isNewlyEnactedLaw) {
      if (revision?.amendmentLawTitle && revision?.amendmentLawTitle !== "") {
        return revision.amendmentLawTitle;
      }
      return "新規制定";
    }
    return revision?.amendmentLawTitle ?? "";
  })();

  return (
    <div className={`flex pr-3 ${isSelected && " bg-Sea-50"}`}>
      <div className={"flex justify-center w-8"}>
        <span className={`border-l-4 border-Sumi-300 relative left-3`} />
        <span
          className={`text-2xl w-5 h-5 rounded-full relative z-10 ${isSelected ? "bg-Forest-300 top-12" : "bg-Sumi-300 top-9"
            }`}
        />
      </div>
      <div className="relative w-full">
        {isSelected && (
          <div className="absolute left-2 top-2 border border-gray-300 rounded-2xl p-2 text-Sea-900 font-bold bg-White-1000">
            表示中
          </div>
        )}


      </div>
    </div>
  );
};

export default RevisionItem;

/**
 * 法令名の表示
 * @param lawTitle 法令名
 * @param isNewlyEnactedLaw 新規制定かどうか
 * @param amendmentLawNum 改正法令番号
 * @returns {JSX.Element} 法令名の表示
 */
const LawTitle = ({
  lawTitle,
  isNewlyEnactedLaw,
  amendmentLawNum,
}: {
  lawTitle: string;
  isNewlyEnactedLaw: boolean;
  amendmentLawNum?: string;
}) => {
  // 新規制定の場合は改正法令番号はないため、タイトル("新規制定"or"基準日現在のデータ")を表示する
  if (isNewlyEnactedLaw) return <div className="font-bold">{lawTitle}</div>;

  // 一時的に 改正公布日,改正法令番号,改正法令名がない場合、新規制定とする
  if (
    lawTitle === "" &&
    (amendmentLawNum === "" || amendmentLawNum === undefined)
  )
    return <div className="font-bold">新規制定</div>;

  const isExistAmendmentLawNum =
    amendmentLawNum !== "" && amendmentLawNum !== undefined;

  return (
    <>
      <div>
        <span className="font-bold">{lawTitle}</span>
        {isExistAmendmentLawNum && <span>による改正</span>}
      </div>
      {/** 改正法令番号 */}
      {isExistAmendmentLawNum && <div>({amendmentLawNum})</div>}
    </>
  );
};

/**
 * 施行日の表示コンポーネント
 * @param {RevisionInfo} revision 改正法令情報
 * @returns {JSX.Element} 施行日の表示コンポーネント
 */
export const EnforcementDate = ({
  revision,
  amendmentPromulgateDate,
  enforcementDate,
  className = "",
}: {
  revision?: RevisionInfo;
  amendmentPromulgateDate: string | undefined;
  enforcementDate: string | undefined;
  className?: string;
}) => {

  return (
    <>
      {/* <div
        className={`font-bold ${className}`}
        data-testid="amendment-enforcement-date"
      >
        公布日:{amendmentPromulgateDate}
      </div>
      <div
        className={`font-bold ${className}`}
        data-testid="amendment-enforcement-date"
      >
        施行日:{enforcementDate}
      </div> */}
    </>
  );
};

/**
 * RevisionItemSkeletonコンポーネントは、改正法令のスケルトンを表示するためのコンポーネントです。
 *
 * @returns {JSX.Element} RevisionItemSkeletonコンポーネント
 */
export const RevisionItemSkeleton = () => {
  return (
    <div className="flex pr-8">
      {/** タイムライン */}
      <div className="flex justify-center w-8">
        <span className={`border-l-4 border-Sumi-300 relative left-3`} />
        <span className="relative top-9 h-5 w-5 rounded-full bg-Sumi-300" />
      </div>
      <div className="relative w-full py-4">
        <div className="flex flex-col items-start text-left text-light-Text-Body border border-gray-300 rounded-2xl px-3 py-4 bg-light-Background-Primary">
          {/** 改正法令情報  */}
          <div className="w-full">
            {/** 改正法令名 */}
            <div className="w-56 md:w-full">
              <Skeleton />
            </div>
            {/** 改正法令番号 */}
            <Skeleton width={200} />
          </div>
          {/** 施行日・公布日 */}
          <div className="inline-flex flex-col md:flex-row md:gap-4 pt-2">
            <div className="flex gap-1">
              <Skeleton width={60} />
              <Skeleton width={150} />
            </div>
            <div className="flex gap-1">
              <Skeleton width={60} />
              <Skeleton width={150} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
