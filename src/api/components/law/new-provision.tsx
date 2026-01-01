import { NewProvisionType } from "@api/types/law";
import { LawList } from "./list";
import {
  LawSubitem1,
  LawSubitem10,
  LawSubitem2,
  LawSubitem3,
  LawSubitem4,
  LawSubitem5,
  LawSubitem6,
  LawSubitem7,
  LawSubitem8,
  LawSubitem9,
} from "./subitem";
import { LawTableStruct } from "./table-struct";
import { LawFigStruct } from "./fig-struct";
import { LawStyleStruct } from "./style-struct";
import { LawRemarks } from "./remarks";
import { LawFormatStruct } from "./format-struct";
import { LawNoteStruct } from "./note-struct";
import { LawTableColumn } from "./table-column";
import { LawTableRow } from "./table-row";
import { LawSupplProvisionAppdx } from "./suppl-provision-appdx";
import { LawSupplProvisionAppdxTable } from "./suppl-provision-appdx-table";
import { LawSupplProvisionAppdxStyle } from "./suppl-provision-appdx-style";
import { LawAppdxFormat } from "./appdx-format";
import { LawAppdxFig } from "./appdx-fig";
import { LawAppdx } from "./appdx";
import { LawAppdxStyle } from "./appdx-style";
import { LawAppdxNote } from "./appdx-note";
import { LawAppdxTable } from "./appdx-table";
import { LawSentence } from "./sentence";
import { LawItem } from "./item";
import { LawParagraph } from "./paragraph";
import { LawArticle } from "./article";
import { LawDivision } from "./division";
import { LawSubsection } from "./subsection";
import { LawSection } from "./section";
import { LawChapter } from "./chapter";
import { LawPart } from "./part";
import { LawTOC } from "./toc";
import { LawPreamble } from "./preamble";
import { LawAmendProvision } from "./amend-provision";
import { LawBodyComponent } from "./law-body";
import { Fragment } from "react";
import { getTextNode } from "./text-node";

/**
 * 新規定のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {NewProvisionType[]} props.newProvisionList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 新規定のコンポーネント
 */
export const LawNewProvision: React.FC<{
  newProvisionList: NewProvisionType[];
  treeElement: string[];
}> = (props) => {
  const { newProvisionList, treeElement } = props;
  const addTreeElement = (index: number, index2?: number) => [
    ...treeElement,
    `NewProvision_${index}${index2 !== undefined ? `_Child_${index2}` : ""}`,
  ];
  let isParagraph = false;
  let paragraphIndex = 0;

  return (
    <>
      {newProvisionList.map((dt, index) => {
        return (
          <Fragment key={`${addTreeElement(index).join("_")}`}>
            {dt.NewProvision.map((dt2, index2) => {
              if ("LawTitle" in dt2) {
                return getTextNode(dt2.LawTitle, addTreeElement(index, index2));
              } else if ("Preamble" in dt2) {
                return (
                  <LawPreamble
                    key={`${addTreeElement(index, index2).join("_")}`}
                    preamble={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("TOC" in dt2) {
                return (
                  <LawTOC
                    key={`${addTreeElement(index, index2).join("_")}`}
                    toc={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Part" in dt2) {
                return (
                  <LawPart
                    key={`${addTreeElement(index, index2).join("_")}`}
                    partList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("PartTitle" in dt2) {
                return getTextNode(
                  dt2.PartTitle,
                  addTreeElement(index, index2)
                );
              } else if ("Chapter" in dt2) {
                return (
                  <LawChapter
                    key={`${addTreeElement(index, index2).join("_")}`}
                    chapterList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("ChapterTitle" in dt2) {
                return getTextNode(
                  dt2.ChapterTitle,
                  addTreeElement(index, index2)
                );
              } else if ("Section" in dt2) {
                return (
                  <LawSection
                    key={`${addTreeElement(index, index2).join("_")}`}
                    sectionList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("SectionTitle" in dt2) {
                return getTextNode(
                  dt2.SectionTitle,
                  addTreeElement(index, index2)
                );
              } else if ("Subsection" in dt2) {
                return (
                  <LawSubsection
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subsectionList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("SubsectionTitle" in dt2) {
                return getTextNode(
                  dt2.SubsectionTitle,
                  addTreeElement(index, index2)
                );
              } else if ("Division" in dt2) {
                return (
                  <LawDivision
                    key={`${addTreeElement(index, index2).join("_")}`}
                    divisionList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("DivisionTitle" in dt2) {
                return getTextNode(
                  dt2.DivisionTitle,
                  addTreeElement(index, index2)
                );
              } else if ("Article" in dt2) {
                return (
                  <LawArticle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    articleList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("SupplNote" in dt2) {
                return getTextNode(
                  dt2.SupplNote,
                  addTreeElement(index, index2)
                );
              } else if ("Paragraph" in dt2) {
                isParagraph = true;
                paragraphIndex++;
                return (
                  <LawParagraph
                    key={`${addTreeElement(index, index2).join("_")}`}
                    paragraphList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                    parentParagraphIndex={paragraphIndex - 1}
                  />
                );
              } else if ("Item" in dt2) {
                return (
                  <LawItem
                    key={`${addTreeElement(index, index2).join("_")}`}
                    itemList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                    isPrecedingParagraph={isParagraph}
                  />
                );
              } else if ("Subitem1" in dt2) {
                return (
                  <LawSubitem1
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem1List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem2" in dt2) {
                return (
                  <LawSubitem2
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem2List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem3" in dt2) {
                return (
                  <LawSubitem3
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem3List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem4" in dt2) {
                return (
                  <LawSubitem4
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem4List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem5" in dt2) {
                return (
                  <LawSubitem5
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem5List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem6" in dt2) {
                return (
                  <LawSubitem6
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem6List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem7" in dt2) {
                return (
                  <LawSubitem7
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem7List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem8" in dt2) {
                return (
                  <LawSubitem8
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem8List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem9" in dt2) {
                return (
                  <LawSubitem9
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem9List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Subitem10" in dt2) {
                return (
                  <LawSubitem10
                    key={`${addTreeElement(index, index2).join("_")}`}
                    subitem10List={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("List" in dt2) {
                return (
                  <LawList
                    key={`${addTreeElement(index, index2).join("_")}`}
                    listList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Sentence" in dt2) {
                return (
                  <LawSentence
                    key={`${addTreeElement(index, index2).join("_")}`}
                    sentenceList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                    isPrecedingSentence={
                      index > 0 &&
                      dt.NewProvision.slice(0, index2).some(
                        (dt) => "Sentence" in dt
                      )
                    }
                  />
                );
              } else if ("AmendProvision" in dt2) {
                return (
                  <LawAmendProvision
                    key={`${addTreeElement(index, index2).join("_")}`}
                    amendProvisionList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("AppdxTable" in dt2) {
                return (
                  <LawAppdxTable
                    key={`${addTreeElement(index, index2).join("_")}`}
                    appdxTableList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("AppdxNote" in dt2) {
                return (
                  <LawAppdxNote
                    key={`${addTreeElement(index, index2).join("_")}`}
                    appdxNoteList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("AppdxStyle" in dt2) {
                return (
                  <LawAppdxStyle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    appdxStyle={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Appdx" in dt2) {
                return (
                  <LawAppdx
                    key={`${addTreeElement(index, index2).join("_")}`}
                    appdxList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("AppdxFig" in dt2) {
                return (
                  <LawAppdxFig
                    key={`${addTreeElement(index, index2).join("_")}`}
                    appdxFig={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("AppdxFormat" in dt2) {
                return (
                  <LawAppdxFormat
                    key={`${addTreeElement(index, index2).join("_")}`}
                    appdxFormat={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("SupplProvisionAppdxStyle" in dt2) {
                return (
                  <LawSupplProvisionAppdxStyle
                    key={`${addTreeElement(index, index2).join("_")}`}
                    supplProvisionAppdxStyleList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("SupplProvisionAppdxTable" in dt2) {
                return (
                  <LawSupplProvisionAppdxTable
                    key={`${addTreeElement(index, index2).join("_")}`}
                    supplProvisionAppdxTableList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("SupplProvisionAppdx" in dt2) {
                return (
                  <LawSupplProvisionAppdx
                    key={`${addTreeElement(index, index2).join("_")}`}
                    supplProvisionAppdxList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("TableStruct" in dt2) {
                return (
                  <LawTableStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tableStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("TableRow" in dt2) {
                return (
                  <LawTableRow
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tableRowList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("TableColumn" in dt2) {
                return (
                  <LawTableColumn
                    key={`${addTreeElement(index, index2).join("_")}`}
                    tableColumnList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("FigStruct" in dt2) {
                return (
                  <LawFigStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    figStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("NoteStruct" in dt2) {
                return (
                  <LawNoteStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    noteStruct={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("StyleStruct" in dt2) {
                return (
                  <LawStyleStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    styleStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("FormatStruct" in dt2) {
                return (
                  <LawFormatStruct
                    key={`${addTreeElement(index, index2).join("_")}`}
                    formatStructList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("Remarks" in dt2) {
                return (
                  <LawRemarks
                    key={`${addTreeElement(index, index2).join("_")}`}
                    remarksList={[dt2]}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              } else if ("LawBody" in dt2) {
                return (
                  <LawBodyComponent
                    key={`${addTreeElement(index, index2).join("_")}`}
                    lawBody={dt2}
                    treeElement={addTreeElement(index, index2)}
                  />
                );
              }
            })}
          </Fragment>
        );
      })}
    </>
  );
};
