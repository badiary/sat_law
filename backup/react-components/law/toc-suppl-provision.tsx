import {
  ArticleRangeType,
  SupplProvisionLabelType,
  TOCSupplProvisionType,
} from "@api/types/law";
import { LawArticleRange } from "./article-range";
import { LawTOCArticle } from "./toc-article";
import { LawTOCChapter } from "./toc-chapter";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * ⽬次附則のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCSupplProvisionType} props.tocSupplProvision - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - ⽬次附則のコンポーネント
 */
export const LawTOCSupplProvision: React.FC<{
  tocSupplProvision: TOCSupplProvisionType;
  treeElement: string[];
}> = (props) => {
  const { tocSupplProvision, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `TOCSupplProvision${index ? `_${index}` : ""}`,
  ];
  const SupplProvisionLabel = getType<SupplProvisionLabelType>(
    tocSupplProvision.TOCSupplProvision,
    "SupplProvisionLabel"
  )[0];
  const ArticleRange = getType<ArticleRangeType>(
    tocSupplProvision.TOCSupplProvision,
    "ArticleRange"
  );

  return (
    <>
      <div className="_div_TOCSupplProvision pl-4">
        {getTextNode(SupplProvisionLabel.SupplProvisionLabel, addTreeElement())}
        {ArticleRange.length > 0 && (
          <LawArticleRange
            articleRange={ArticleRange[0]}
            treeElement={addTreeElement()}
          />
        )}
      </div>
      {tocSupplProvision.TOCSupplProvision.map((dt, index) => {
        if ("TOCArticle" in dt) {
          return (
            <LawTOCArticle
              key={`${addTreeElement(index).join("_")}_Child`}
              tocArticleList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TOCChapter" in dt) {
          return (
            <LawTOCChapter
              key={`${addTreeElement(index).join("_")}_Child`}
              tocChapterList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </>
  );
};
