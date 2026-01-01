import {
  AppdxStyleTitleType,
  AppdxStyleType,
  RelatedArticleNumType,
} from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawStyleStruct } from "./style-struct";
import { LawRelatedArticleNum } from "./related-article-num";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 別記様式のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AppdxStyleType} props.appdxStyle - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 別記様式のコンポーネント
 */
export const LawAppdxStyle: React.FC<{
  appdxStyle: AppdxStyleType;
  treeElement: string[];
}> = (props) => {
  const { appdxStyle, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `AppdxStyle${index ? `_${index}` : ""}`,
  ];
  const AppdxStyleTitle = getType<AppdxStyleTitleType>(
    appdxStyle.AppdxStyle,
    "AppdxStyleTitle"
  );
  const RelatedArticleNum = getType<RelatedArticleNumType>(
    appdxStyle.AppdxStyle,
    "RelatedArticleNum"
  );
  return (
    <section className="active AppdxStyle">
      {(AppdxStyleTitle.length > 0 || RelatedArticleNum.length > 0) && (
        <div className="_div_AppdxStyleTitle font-bold">
          {AppdxStyleTitle.length > 0 &&
            getTextNode(AppdxStyleTitle[0].AppdxStyleTitle, addTreeElement())}
          <LawRelatedArticleNum
            relatedArticleNumList={RelatedArticleNum}
            treeElement={addTreeElement()}
          />
        </div>
      )}
      {appdxStyle.AppdxStyle.map((dt, index) => {
        if ("StyleStruct" in dt) {
          return (
            <LawStyleStruct
              key={`${addTreeElement(index).join("_")}`}
              styleStructList={[dt]}
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
