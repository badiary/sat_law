import {
  TOCAppdxTableLabelType,
  TOCLabelType,
  TOCPreambleLabelType,
  TOCSupplProvisionType,
  TOCType,
} from "@api/types/law";
import { LawTOCSupplProvision } from "./toc-suppl-provision";
import { LawTOCAppdxTableLabel } from "./toc-appdx-table-label";
import { LawTOCPart } from "./toc-part";
import { LawTOCChapter } from "./toc-chapter";
import { LawTOCSection } from "./toc-section";
import { LawTOCArticle } from "./toc-article";
import { getTypeByFind, getType } from "@api/lib/law/law";
import { TextNode } from "./text-node";

/**
 * 目次のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCType} props.toc - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 目次のコンポーネント
 */
export const LawTOC: React.FC<{ toc: TOCType; treeElement: string[] }> = (
  props
) => {
  const { toc, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `TOC${index ? `_${index}` : ""}`,
  ];
  const TOCLabel = getTypeByFind<TOCLabelType>(toc.TOC, "TOCLabel");
  const TOCPreambleLabel = getTypeByFind<TOCPreambleLabelType>(
    toc.TOC,
    "TOCPreambleLabel"
  );
  const TOCSupplProvision = getTypeByFind<TOCSupplProvisionType>(
    toc.TOC,
    "TOCSupplProvision"
  );
  const TOCAppdxTableLabel = getType<TOCAppdxTableLabelType>(
    toc.TOC,
    "TOCAppdxTableLabel"
  );
  return (
    <>
      <div className="_div_TOCLabel">
        {TOCLabel !== undefined && (
          <TextNode val={TOCLabel.TOCLabel} treeElement={addTreeElement()} />
        )}
      </div>
      {TOCPreambleLabel !== undefined && (
        <div className="_div_TOCPreambleLabel">
          <TextNode
            val={TOCPreambleLabel.TOCPreambleLabel}
            treeElement={addTreeElement()}
          />
        </div>
      )}
      {toc.TOC.map((dt, index) => {
        if ("TOCPart" in dt) {
          return (
            <LawTOCPart
              key={`${addTreeElement(index).join("_")}`}
              tocPartList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TOCChapter" in dt) {
          return (
            <LawTOCChapter
              key={`${addTreeElement(index).join("_")}`}
              tocChapterList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TOCSection" in dt) {
          return (
            <LawTOCSection
              key={`${addTreeElement(index).join("_")}`}
              tocSectionList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TOCArticle" in dt) {
          return (
            <LawTOCArticle
              key={`${addTreeElement(index).join("_")}`}
              tocArticleList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
      {TOCSupplProvision !== undefined && (
        <LawTOCSupplProvision
          tocSupplProvision={TOCSupplProvision}
          treeElement={addTreeElement()}
        />
      )}
      <LawTOCAppdxTableLabel
        tocAppdxTableLabelList={TOCAppdxTableLabel}
        treeElement={addTreeElement()}
      />
    </>
  );
};
