import {
  EnactStatementType,
  LawBodyType,
  MainProvisionType,
  PreambleType,
  TOCType,
} from "@api/types/law";
import { LawEnactStatement } from "./enact-statement";
import { LawTOC } from "./toc";
import { LawPreamble } from "./preamble";
import { LawMainProvision } from "./main-provision";
import { LawSupplProvision } from "./suppl-provision";
import { LawAppdxTable } from "./appdx-table";
import { LawAppdxNote } from "./appdx-note";
import { LawAppdxStyle } from "./appdx-style";
import { LawAppdx } from "./appdx";
import { LawAppdxFig } from "./appdx-fig";
import { LawAppdxFormat } from "./appdx-format";
import { getType, getTypeByFind } from "@api/lib/law/law";

/**
 * 法令本体のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {LawBodyType} props.lawBody - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 法令本体のコンポーネント
 */
export const LawBodyComponent: React.FC<{
  lawBody: LawBodyType;
  treeElement: string[];
}> = (props) => {
  const { lawBody, treeElement } = props;
  const addTreeElement = (index?: number) => [
    ...treeElement,
    index ? `LawBody_${index}` : "LawBody",
  ];
  const EnactStatement = getType<EnactStatementType>(
    lawBody.LawBody,
    "EnactStatement"
  );
  const TOC = getType<TOCType>(lawBody.LawBody, "TOC");
  const Preamble = getTypeByFind<PreambleType>(lawBody.LawBody, "Preamble");
  const MainProvision =
    getTypeByFind<MainProvisionType>(lawBody.LawBody, "MainProvision") ??
    ({ MainProvision: [] } as unknown as MainProvisionType);

  return (
    <>
      {/** 制定文 */}
      {EnactStatement.length > 0 && (
        <section id="EnactStatement" className="active EnactStatement">
          <LawEnactStatement
            enactStatementList={EnactStatement}
            treeElement={addTreeElement()}
          />
        </section>
      )}
      {/** 法令目次 */}
      {TOC.length > 0 && (
        <section className="active TOC pb-4">
          <LawTOC toc={TOC[0]} treeElement={addTreeElement()} />
        </section>
      )}
      {Preamble !== undefined && (
        <section className="active Preamble">
          <LawPreamble preamble={Preamble} treeElement={addTreeElement()} />
        </section>
      )}
      <section id="MainProvision" className="active MainProvision">
        <LawMainProvision
          mainProvision={MainProvision}
          treeElement={addTreeElement()}
        />
      </section>
      {lawBody.LawBody.map((dt, index) => {
        if ("SupplProvision" in dt && dt.SupplProvision.length > 0) {
          return (
            <LawSupplProvision
              key={`${addTreeElement(index).join("_")}`}
              supplProvision={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("AppdxTable" in dt) {
          return (
            <LawAppdxTable
              key={`${addTreeElement(index).join("_")}`}
              appdxTableList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("AppdxNote" in dt) {
          return (
            <LawAppdxNote
              key={`${addTreeElement(index).join("_")}`}
              appdxNoteList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("AppdxStyle" in dt) {
          return (
            <LawAppdxStyle
              key={`${addTreeElement(index).join("_")}`}
              appdxStyle={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Appdx" in dt) {
          return (
            <LawAppdx
              key={`${addTreeElement(index).join("_")}`}
              appdxList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("AppdxFig" in dt) {
          return (
            <LawAppdxFig
              key={`${addTreeElement(index).join("_")}`}
              appdxFig={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("AppdxFormat" in dt) {
          return (
            <LawAppdxFormat
              key={`${addTreeElement(index).join("_")}`}
              appdxFormat={dt}
              treeElement={addTreeElement(index)}
            />
          );
        }
      })}
    </>
  );
};
