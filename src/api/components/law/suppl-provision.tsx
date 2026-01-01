import {
  ParagraphType,
  SupplProvisionLabelType,
  SupplProvisionType,
} from "@api/types/law";
import { LawArticle } from "./article";
import { LawParagraph } from "./paragraph";
import { LawChapter } from "./chapter";
import { LawSupplProvisionAppdxTable } from "./suppl-provision-appdx-table";
import { LawSupplProvisionAppdxStyle } from "./suppl-provision-appdx-style";
import { LawSupplProvisionAppdx } from "./suppl-provision-appdx";
import { getType, getTypeByFind } from "@api/lib/law/law";
import { TextNode } from "./text-node";

/**
 * 附則のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {SupplProvisionType} props.supplProvision - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 附則のコンポーネント
 */
export const LawSupplProvision: React.FC<{
  supplProvision: SupplProvisionType;
  treeElement: string[];
}> = (props) => {
  const { supplProvision, treeElement } = props;
  const addTreeElement = (index?: number, childNum?: number) => [
    ...treeElement,
    `SupplProvision${index ? `_${index}` : ""}${childNum ? `_Child${childNum > 1 ? `_${childNum}` : ""}` : ""
    }`,
  ];
  const SupplProvisionLabel: SupplProvisionLabelType =
    getTypeByFind<SupplProvisionLabelType>(
      supplProvision.SupplProvision,
      "SupplProvisionLabel"
    ) ?? ([] as unknown as SupplProvisionLabelType);

  const Paragraph = getType<ParagraphType>(
    supplProvision.SupplProvision,
    "Paragraph"
  );

  return (
    <section className="active SupplProvision pb-4" style={{ display: "none" }}>
      <div className="_div_SupplProvisionLabel SupplProvisionLabel pl-12 font-bold pb-4">
        <TextNode
          val={SupplProvisionLabel.SupplProvisionLabel}
          treeElement={addTreeElement()}
        />
        {supplProvision[":@"]?.AmendLawNum &&
          `　（${supplProvision[":@"].AmendLawNum}）`}
        {supplProvision[":@"]?.Extract && `　抄`}
      </div>
      <LawParagraph
        paragraphList={Paragraph}
        treeElement={addTreeElement()}
        parentParagraphIndex={0}
      />
      {supplProvision.SupplProvision.map((dt, index) => {
        if ("Chapter" in dt) {
          return (
            <LawChapter
              key={`${addTreeElement(index, 1).join("_")}`}
              chapterList={[dt]}
              treeElement={addTreeElement(index, 1)}
            />
          );
        } else if ("Article" in dt) {
          return (
            <LawArticle
              key={`${addTreeElement(index, 1).join("_")}`}
              articleList={[dt]}
              treeElement={addTreeElement(index, 1)}
            />
          );
        }
      })}
      {supplProvision.SupplProvision.map((dt, index) => {
        if ("SupplProvisionAppdxTable" in dt) {
          return (
            <LawSupplProvisionAppdxTable
              key={`${addTreeElement(index, 2).join("_")}`}
              supplProvisionAppdxTableList={[dt]}
              treeElement={addTreeElement(index, 2)}
            />
          );
        } else if ("SupplProvisionAppdxStyle" in dt) {
          return (
            <LawSupplProvisionAppdxStyle
              key={`${addTreeElement(index, 2).join("_")}`}
              supplProvisionAppdxStyleList={[dt]}
              treeElement={addTreeElement(index, 2)}
            />
          );
        } else if ("SupplProvisionAppdx" in dt) {
          return (
            <LawSupplProvisionAppdx
              key={`${addTreeElement(index, 2).join("_")}`}
              supplProvisionAppdxList={[dt]}
              treeElement={addTreeElement(index, 2)}
            />
          );
        }
      })}
    </section>
  );
};
