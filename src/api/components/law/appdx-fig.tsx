import {
  AppdxFigTitleType,
  AppdxFigType,
  RelatedArticleNumType,
} from "@api/types/law";
import { LawTableStruct } from "./table-struct";
import { LawFigStruct } from "./fig-struct";
import { LawRelatedArticleNum } from "./related-article-num";
import { getTextNode } from "./text-node";
import { getType } from "@api/lib/law/law";

/**
 * 別図のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AppdxFigType} props.appdxFig - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 別図のコンポーネント
 */
export const LawAppdxFig: React.FC<{
  appdxFig: AppdxFigType;
  treeElement: string[];
}> = (props) => {
  const { appdxFig, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `AppdxFig${index ? `_${index}` : ""}`,
  ];
  const AppdxFigTitle = getType<AppdxFigTitleType>(
    appdxFig.AppdxFig,
    "AppdxFigTitle"
  );
  const RelatedArticleNum = getType<RelatedArticleNumType>(
    appdxFig.AppdxFig,
    "RelatedArticleNum"
  );
  return (
    <section className="active AppdxFig">
      {(AppdxFigTitle.length > 0 || RelatedArticleNum.length > 0) && (
        <div className="_div_AppdxFigTitle">
          {AppdxFigTitle.length > 0 &&
            getTextNode(AppdxFigTitle[0].AppdxFigTitle, addTreeElement())}
          <LawRelatedArticleNum
            relatedArticleNumList={RelatedArticleNum}
            treeElement={addTreeElement()}
          />
        </div>
      )}
      {appdxFig.AppdxFig.map((dt, index) => {
        if ("FigStruct" in dt) {
          return (
            <LawFigStruct
              key={`${addTreeElement(index).join("_")}`}
              figStructList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TableStruct" in dt) {
          return (
            <LawTableStruct
              key={`${addTreeElement(index).join("_")}`}
              tableStructList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </section>
  );
};
