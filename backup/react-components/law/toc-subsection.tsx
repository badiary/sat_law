import {
  ArticleRangeType,
  SubsectionTitleType,
  TOCDivisionType,
  TOCSubsectionType,
} from "@api/types/law";
import { LawArticleRange } from "./article-range";
import { LawTOCDivision } from "./toc-division";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * ⽬次款のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TOCSubsectionType} props.tocSubsection - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - ⽬次款のコンポーネント
 */
export const LawTOCSubsection: React.FC<{
  tocSubsection: TOCSubsectionType;
  treeElement: string[];
}> = (props) => {
  const { tocSubsection, treeElement } = props;
  const addTreeElement = [...treeElement, "TOCSubsection"];
  const SubsectionTitle = getType<SubsectionTitleType>(
    tocSubsection.TOCSubsection,
    "SubsectionTitle"
  )[0];
  const ArticleRange = getType<ArticleRangeType>(
    tocSubsection.TOCSubsection,
    "ArticleRange"
  );
  const TOCDivision = getType<TOCDivisionType>(
    tocSubsection.TOCSubsection,
    "TOCDivision"
  );
  return (
    <>
      <div className="_div_TOCSubsection pl-12">
        {getTextNode(SubsectionTitle.SubsectionTitle, addTreeElement)}
        {ArticleRange.length > 0 && (
          <LawArticleRange
            articleRange={ArticleRange[0]}
            treeElement={addTreeElement}
          />
        )}
      </div>
      <LawTOCDivision
        tocDivisionList={TOCDivision}
        treeElement={addTreeElement}
      />
    </>
  );
};
