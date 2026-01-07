import {
  AppdxType,
  ArithFormulaNumType,
  ArithFormulaType,
  RelatedArticleNumType,
  RemarksType,
} from "@api/types/law";
import { LawRemarks } from "./remarks";
import { LawArithFormulaNum } from "./arith-formula-num";
import { LawRelatedArticleNum } from "./related-article-num";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 付録のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {AppdxType[]} props.appdxList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 付録のコンポーネント
 */
export const LawAppdx: React.FC<{
  appdxList: AppdxType[];
  treeElement: string[];
}> = (props) => {
  const { appdxList, treeElement } = props;
  const addTreeElement = (index: number) => [...treeElement, `Appdx_${index}`];
  return (
    <>
      {appdxList.map((dt, index) => {
        const ArithFormulaNum = getType<ArithFormulaNumType>(
          dt.Appdx,
          "ArithFormulaNum"
        );
        const RelatedArticleNum = getType<RelatedArticleNumType>(
          dt.Appdx,
          "RelatedArticleNum"
        );
        const ArithFormula = getType<ArithFormulaType>(
          dt.Appdx,
          "ArithFormula"
        );
        const Remarks = getType<RemarksType>(dt.Appdx, "Remarks");
        return (
          <section
            key={`${addTreeElement(index).join("_")}`}
            className="active Appdx"
          >
            {(ArithFormulaNum.length > 0 || RelatedArticleNum.length > 0) && (
              <div className="_div_ArithFormulaNum">
                <LawArithFormulaNum
                  arithFormulaNum={ArithFormulaNum[0]}
                  treeElement={addTreeElement(index)}
                />
                <LawRelatedArticleNum
                  relatedArticleNumList={RelatedArticleNum}
                  treeElement={addTreeElement(index)}
                />
              </div>
            )}
            {getTextNode(ArithFormula, addTreeElement(index))}
            <LawRemarks
              remarksList={Remarks}
              treeElement={addTreeElement(index)}
            />
          </section>
        );
      })}
    </>
  );
};
