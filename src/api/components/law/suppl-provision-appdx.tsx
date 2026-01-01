import {
  ArithFormulaNumType,
  ArithFormulaType,
  RelatedArticleNumType,
  SupplProvisionAppdxType,
} from "@api/types/law";
import { LawArithFormulaNum } from "./arith-formula-num";
import { LawRelatedArticleNum } from "./related-article-num";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 附則付録のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SupplProvisionAppdxType[]} props.supplProvisionAppdxList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 附則付録のコンポーネント
 */
export const LawSupplProvisionAppdx: React.FC<{
  supplProvisionAppdxList: SupplProvisionAppdxType[];
  treeElement: string[];
}> = (props) => {
  const { supplProvisionAppdxList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `SupplProvisionAppdx_${index}`,
  ];

  return (
    <>
      {supplProvisionAppdxList.map((dt, index) => {
        const ArithFormulaNum = getType<ArithFormulaNumType>(
          dt.SupplProvisionAppdx,
          "ArithFormulaNum"
        );
        const RelatedArticleNum = getType<RelatedArticleNumType>(
          dt.SupplProvisionAppdx,
          "RelatedArticleNum"
        );
        const ArithFormula = getType<ArithFormulaType>(
          dt.SupplProvisionAppdx,
          "ArithFormula"
        );

        return (
          <section
            key={`${addTreeElement(index).join("_")}`}
            className="active SupplProvisionAppdx"
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
          </section>
        );
      })}
    </>
  );
};
