"use client";
import { FigType } from "@api/types/law";
import Icon from "../elements/icons";
// import ImageComponent from "next/image";
import { useContext, useEffect, useState } from "react";
import LawRevisionIdContext from "@api/context/law-revision-id";
import ImageIcon from "../icons/image-icon";
// import Link from "next/link";

/**
 * 添付ファイル取得API
 * @param {string} lawRevisionId - 法令履歴ID
 * @param {string} src - 法令本文中の添付ファイルのsrc属性
 * @returns {Promise<Blob>} - 添付ファイルのBlobデータ
 */
const fetchAttachment = async (lawRevisionId: string, src: string) => {
  const res = await fetch(`/attachment/${lawRevisionId}/api?src=${src}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Network response was not ok");
  }

  return await res.blob();
};

/**
 * 図のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {FigType} props.fig - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 図のコンポーネント
 */
export const LawFig: React.FC<{
  fig: FigType;
  treeElement: string[];
}> = (props) => {
  const { fig, treeElement } = props;
  const lawRevisionId = useContext(LawRevisionIdContext);

  if (/\.pdf$/g.exec(fig[":@"].src.toLowerCase())) {
    /** PDF */
    return <LawFigPDF lawRevisionId={lawRevisionId} src={fig[":@"].src} />;
  } else if (fig[":@"].src == "") {
    /** ブランク */
    if (treeElement.some((dt) => /^Style_.*/.test(dt))) {
      return <div className="_div_Fig_noPdf pl-8">（略）</div>;
    } else {
      return <span className="_span_Fig_noImg inline-block pl-4">（略）</span>;
    }
  } else {
    return <LawFigImage lawRevisionId={lawRevisionId} src={fig[":@"].src} />;
  }
};

/**
 * PDFのコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {string} props.lawRevisionId - 法令履歴ID
 * @param {string} props.src - 法令本文中の添付ファイルのsrc属性
 * @returns {JSX.Element} - PDFのコンポーネント
 */
export const LawFigPDF = (props: { lawRevisionId: string; src: string }) => {
  const download = async () => {
    try {
      const blob = await fetchAttachment(props.lawRevisionId, props.src);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;

      const fileName = props.src.split("/").slice(-1);
      a.download = `${fileName}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={download}
      aria-label="PDFファイルをダウンロード"
      title="PDFファイルをダウンロード"
    >
      <Icon name="pdf" />
    </button>
  );
};

/**
 * 画像のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {string} props.lawRevisionId - 法令履歴ID
 * @param {string} props.src - 法令本文中の添付ファイルのsrc属性
 * @returns {JSX.Element} - 画像のコンポーネント
 */
export const LawFigImage = (props: { lawRevisionId: string; src: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>(
    { width: 0, height: 0 }
  );

  useEffect(() => {
    let blobUrl: string | null = null;
    fetchAttachment(props.lawRevisionId, props.src)
      .then((blob) => {
        blobUrl = URL.createObjectURL(blob);
        setImageUrl(blobUrl);
        setIsLoading(false);
        const image = new Image();
        image.addEventListener("load", () => {
          setImageSize({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });
        });
        image.src = blobUrl;
      })
      .catch(() => {
        setIsLoading(false);
      });

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl); // Blob URL を解放
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingImage />;
  }

  if (imageUrl) {
    const url = `/attachment/${props.lawRevisionId}?src=${props.src}`;
    return (
      <></>

      // <Link href={url}>
      //   <ImageComponent
      //     src={imageUrl}
      //     alt={`${props.src}`}
      //     width={imageSize.width}
      //     height={imageSize.height}
      //   />
      // </Link>
    );
  }

  return <ErrorImage />;
};

/**
 * ローディング（画像）のコンポーネント
 * @returns {JSX.Element} - ローディング（画像）のコンポーネント
 */
const LoadingImage = () => {
  return (
    <DummyImageWrapper>
      <ImageIcon className="fill-Sumi-600" width={36} height={36} />
      <span className="text-xs text-light-Text-PlaceHolder font-bold">
        画像を読み込み中...
      </span>
    </DummyImageWrapper>
  );
};

/**
 * エラー（画像）のコンポーネント
 * @returns {JSX.Element} - エラー（画像）のコンポーネント
 */
const ErrorImage = () => {
  return (
    <DummyImageWrapper className="bg-Sumi-100">
      <span className="text-xs text-light-Text-Disabled font-bold">
        画像読み込みに失敗しました
      </span>
    </DummyImageWrapper>
  );
};

/**
 * DummyImageWrapper コンポーネントのプロパティを定義する型
 * @typedef {Object} DummyImageWrapperProps
 * @property {React.ReactNode} children - DummyImageWrapper コンポーネントの子要素
 * @property {string} className - クラス名
 */
type DummyImageWrapperProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * ダミー画像のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {React.ReactNode} props.children - DummyImageWrapper コンポーネントの子要素
 * @param {string} props.className - クラス名
 * @returns {JSX.Element} - ダミー画像のコンポーネント
 */
const DummyImageWrapper = (props: DummyImageWrapperProps) => {
  const {
    children,
    className = "bg-light-Background-Secondary animate-pulse",
  } = props;
  return (
    <div
      className={`flex items-center justify-center w-80 h-48 rounded-md ${className}`}
    >
      <div className="flex flex-col justify-center items-center">
        {children}
      </div>
    </div>
  );
};
