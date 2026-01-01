import {
  AppdxFormatTitleType,
  AppdxFormatType,
  RelatedArticleNumType,
} from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawFormatStruct } from "./format-struct";
import { LawRelatedArticleNum } from "./related-article-num";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 別記書式のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AppdxFormatType} props.appdxFormat - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 別記書式のコンポーネント
 */
export const LawAppdxFormat: React.FC<{
  appdxFormat: AppdxFormatType;
  treeElement: string[];
}> = (props) => {
  const { appdxFormat, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `AppdxFormat${index ? `_${index}` : ""}`,
  ];
  const AppdxFormatTitle = getType<AppdxFormatTitleType>(
    appdxFormat.AppdxFormat,
    "AppdxFormatTitle"
  );
  const RelatedArticleNum = getType<RelatedArticleNumType>(
    appdxFormat.AppdxFormat,
    "RelatedArticleNum"
  );
  return (
    <section className="active AppdxFormat">
      {(AppdxFormatTitle.length > 0 || RelatedArticleNum.length > 0) && (
        <div className="_div_AppdxFormatTitle">
          {AppdxFormatTitle.length > 0 &&
            getTextNode(AppdxFormatTitle[0].AppdxFormatTitle, addTreeElement())}
          <LawRelatedArticleNum
            relatedArticleNumList={RelatedArticleNum}
            treeElement={addTreeElement()}
          />
        </div>
      )}
      {appdxFormat.AppdxFormat.map((dt, index) => {
        if ("FormatStruct" in dt) {
          return (
            <LawFormatStruct
              key={`${addTreeElement(index).join("_")}`}
              formatStructList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Remarks" in dt) {
          return (
            <LawRemarks
              key={`${addTreeElement(index).join("_")}`}
              remarksList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </section>
  );
};
