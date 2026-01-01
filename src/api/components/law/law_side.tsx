import { RevisionInfo } from "@api/lib/typescript-fetch";
import { toJapaneseEra } from "@api/lib/utils/date";
import Icon from "../elements/icons";
import { LawTag } from "../elements/tag";
import LawTitle from "./law-title";
import LawNum from "./law-num";
import { LawNumType, LawTitleType } from "@api/types/law";

/**
 * 法令画面: サイドパネル
 * @param {Object} props - プロパティオブジェクト
 * @param {string} props.publicDate - 公布日
 * @param {RevisionInfo} props.revisionInfo - 履歴情報
 * @param {() => void} props.toggleClose - サイドパネルの閉じる処理
 * @returns {JSX.Element} - サイドパネルのコンポーネント
 */
export const LawSideComponent: React.FC<{
  publicDate: string;
  revisionInfo?: RevisionInfo;
  toggleClose?: () => void;
  lawTitle?: LawTitleType;
  lawNum?: LawNumType;
  lawType?: string;
}> = (props) => {
  const { lawTitle, lawNum, lawType, publicDate, revisionInfo, toggleClose } =
    props;

  // 改正法令名+改正法令番号
  const amendmentLawTitleAndNum = (() => {
    if (revisionInfo?.amendmentLawTitle && !revisionInfo?.amendmentLawNum) {
      return `${revisionInfo?.amendmentLawTitle}`;
    } else if (
      revisionInfo?.amendmentLawTitle &&
      revisionInfo?.amendmentLawNum
    ) {
      return `${revisionInfo?.amendmentLawTitle}(${revisionInfo?.amendmentLawNum})`;
    } else {
      return "";
    }
  })();

  // 改正公布日
  const amendmentPromulgateDate =
    revisionInfo?.amendmentPromulgateDate === undefined
      ? ""
      : toJapaneseEra(revisionInfo?.amendmentPromulgateDate, true);

  return (
    <>
      {/** サイドパネル切り替えタブ */}
      <div
        className={`bg-inherit border-b h-12 flex items-center justify-center ${
          toggleClose != undefined && " px-3"
        }`}
      >
        <div
          className={`flex font-bold h-12 items-center text-center justify-center${
            toggleClose != undefined && " mr-auto"
          }`}
        >
          詳細情報
        </div>
        {toggleClose != undefined && (
          <button
            type="button"
            onClick={toggleClose}
            aria-label="詳細情報を閉じる"
          >
            <Icon name="close" />
          </button>
        )}
      </div>
      {lawType && lawTitle && lawNum && (
        <div className="flex items-baseline bg-inherit px-3 py-4">
          <div className="pr-2 py-1">
            <LawTag type={lawType} />
          </div>
          <div className="">
            <LawTitle value={lawTitle} />
            <LawNum value={lawNum} />
          </div>
        </div>
      )}
      {/** 改正法令情報 */}
      <div className="bg-inherit border-b border-t md:border-t-0 font-bold h-12 flex items-center px-3">
        改正法令情報
      </div>
      <div className="bg-inherit px-3">
        <div className="py-3">
          <div className="font-bold">公布日</div>
          {publicDate}
        </div>
        <div className="py-3">
          <div className="font-bold">改正法令名</div>
          {amendmentLawTitleAndNum}
        </div>
        <div className="py-3">
          <div className="font-bold">改正法公布日</div>
          {amendmentPromulgateDate}
        </div>
      </div>
    </>
  );
};
