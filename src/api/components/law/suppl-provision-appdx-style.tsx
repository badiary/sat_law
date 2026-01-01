import {
  RelatedArticleNumType,
  StyleStructType,
  SupplProvisionAppdxStyleTitleType,
  SupplProvisionAppdxStyleType,
} from "@api/types/law";
import { LawRelatedArticleNum } from "./related-article-num";
import { LawStyleStruct } from "./style-struct";
import { getType } from "@api/lib/law/law";
import { getTextNode } from "./text-node";

/**
 * 附則様式のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SupplProvisionAppdxStyleType[]} props.supplProvisionAppdxStyleList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 附則様式のコンポーネント
 */
export const LawSupplProvisionAppdxStyle: React.FC<{
  supplProvisionAppdxStyleList: SupplProvisionAppdxStyleType[];
  treeElement: string[];
}> = (props) => {
  const { supplProvisionAppdxStyleList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `SupplProvisionAppdxStyle_${index}`,
  ];

  return (
    <>
      {supplProvisionAppdxStyleList.map((dt, index) => {
        const SupplProvisionAppdxStyleTitle =
          getType<SupplProvisionAppdxStyleTitleType>(
            dt.SupplProvisionAppdxStyle,
            "SupplProvisionAppdxStyleTitle"
          )[0];
        const RelatedArticleNum = getType<RelatedArticleNumType>(
          dt.SupplProvisionAppdxStyle,
          "RelatedArticleNum"
        );
        const StyleStruct = getType<StyleStructType>(
          dt.SupplProvisionAppdxStyle,
          "StyleStruct"
        );

        return (
          <section
            key={`${addTreeElement(index).join("_")}`}
            className="active SupplProvisionAppdxStyle"
          >
            <div className="_div_SupplProvisionAppdxStyleTitle font-bold">
              {getTextNode(
                SupplProvisionAppdxStyleTitle.SupplProvisionAppdxStyleTitle,
                addTreeElement(index)
              )}
              <LawRelatedArticleNum
                relatedArticleNumList={RelatedArticleNum}
                treeElement={addTreeElement(index)}
              />
            </div>
            <LawStyleStruct
              styleStructList={StyleStruct}
              treeElement={addTreeElement(index)}
            />
          </section>
        );
      })}
    </>
  );
};
