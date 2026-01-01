"use client";

import { useState } from "react";
import Icon from "../elements/icons";
import { LawSideComponent } from "./law_side";
import { RevisionInfo } from "@api/lib/typescript-fetch";
import { LawNumType, LawTitleType } from "@api/types/law";

/**
 * 法令詳細情報表示ボタン
 * @param {Object} props - プロパティオブジェクト
 * @param {LawTitleType} props.lawTitle - 法令名
 * @param {LawNumType} props.lawNum - 法令番号
 * @param {string} props.lawType - 法令種別
 * @param {string} props.publicDate - 公布日
 * @param {RevisionInfo} props.revisionInfo - 沿革情報
 * @returns {JSX.Element} 法令詳細情報表示ボタン
 */
const ViewInfoButton = ({
  lawTitle,
  lawNum,
  lawType,
  publicDate,
  revisionInfo,
}: {
  lawTitle: LawTitleType;
  lawNum: LawNumType;
  lawType: string;
  publicDate: string;
  revisionInfo?: RevisionInfo;
}) => {
  const [show, setShow] = useState<boolean>(false);

  const toggleShow = () => {
    setShow(!show);
  };

  return (
    <>
      <button
        className="md:hidden flex-shrink-0 min-w-[24px] pr-3"
        type="button"
        onClick={toggleShow}
        aria-label="詳細情報"
      >
        <Icon name="info" />
      </button>
      {show && (
        <dialog className="modalWrapper top-14 z-20">
          <div className="w-full h-screen bg-White-1000">
            <LawSideComponent
              lawTitle={lawTitle}
              lawNum={lawNum}
              lawType={lawType}
              publicDate={publicDate}
              revisionInfo={revisionInfo}
              toggleClose={toggleShow}
            />
          </div>
        </dialog>
      )}
    </>
  );
};
export default ViewInfoButton;
