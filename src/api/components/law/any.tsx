import { LawTypeList } from "@api/types/law";
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
import { LawFig } from "./fig";
import { getTextNode } from "./text-node";

/**
 * 法令関連のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {LawTypeList[]} props.lawTypeList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 法令関連のコンポーネント
 */
export const LawAny: React.FC<{
  lawTypeList: LawTypeList[];
  treeElement: string[];
  parentElement: string;
}> = (props) => {
  const { lawTypeList, treeElement, parentElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `${parentElement}_${index}`,
  ];
  let isParagraph = false;
  let paragraphIndex = 0;

  return (
    <>
      {lawTypeList.map((dt, index) => {
        if ("LawTitle" in dt) {
          return getTextNode(dt.LawTitle, addTreeElement(index));
        } else if ("Preamble" in dt) {
          return (
            <LawPreamble
              key={`${addTreeElement(index).join("_")}`}
              preamble={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TOC" in dt) {
          return (
            <LawTOC
              key={`${addTreeElement(index).join("_")}`}
              toc={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Part" in dt) {
          return (
            <LawPart
              key={`${addTreeElement(index).join("_")}`}
              partList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("PartTitle" in dt) {
          return getTextNode(dt.PartTitle, addTreeElement(index));
        } else if ("Chapter" in dt) {
          return (
            <LawChapter
              key={`${addTreeElement(index).join("_")}`}
              chapterList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("ChapterTitle" in dt) {
          return getTextNode(dt.ChapterTitle, addTreeElement(index));
        } else if ("Section" in dt) {
          return (
            <LawSection
              key={`${addTreeElement(index).join("_")}`}
              sectionList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("SectionTitle" in dt) {
          return getTextNode(dt.SectionTitle, addTreeElement(index));
        } else if ("Subsection" in dt) {
          return (
            <LawSubsection
              key={`${addTreeElement(index).join("_")}`}
              subsectionList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("SubsectionTitle" in dt) {
          return getTextNode(dt.SubsectionTitle, addTreeElement(index));
        } else if ("Division" in dt) {
          return (
            <LawDivision
              key={`${addTreeElement(index).join("_")}`}
              divisionList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("DivisionTitle" in dt) {
          return getTextNode(dt.DivisionTitle, addTreeElement(index));
        } else if ("Article" in dt) {
          return (
            <LawArticle
              key={`${addTreeElement(index).join("_")}`}
              articleList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("SupplNote" in dt) {
          return getTextNode(dt.SupplNote, addTreeElement(index));
        } else if ("Paragraph" in dt) {
          isParagraph = true;
          paragraphIndex++;
          return (
            <LawParagraph
              key={`${addTreeElement(index).join("_")}`}
              paragraphList={[dt]}
              treeElement={addTreeElement(index)}
              parentParagraphIndex={paragraphIndex - 1}
            />
          );
        } else if ("Item" in dt) {
          return (
            <LawItem
              key={`${addTreeElement(index).join("_")}`}
              itemList={[dt]}
              treeElement={addTreeElement(index)}
              isPrecedingParagraph={isParagraph}
            />
          );
        } else if ("Subitem1" in dt) {
          return (
            <LawSubitem1
              key={`${addTreeElement(index).join("_")}`}
              subitem1List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem2" in dt) {
          return (
            <LawSubitem2
              key={`${addTreeElement(index).join("_")}`}
              subitem2List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem3" in dt) {
          return (
            <LawSubitem3
              key={`${addTreeElement(index).join("_")}`}
              subitem3List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem4" in dt) {
          return (
            <LawSubitem4
              key={`${addTreeElement(index).join("_")}`}
              subitem4List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem5" in dt) {
          return (
            <LawSubitem5
              key={`${addTreeElement(index).join("_")}`}
              subitem5List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem6" in dt) {
          return (
            <LawSubitem6
              key={`${addTreeElement(index).join("_")}`}
              subitem6List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem7" in dt) {
          return (
            <LawSubitem7
              key={`${addTreeElement(index).join("_")}`}
              subitem7List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem8" in dt) {
          return (
            <LawSubitem8
              key={`${addTreeElement(index).join("_")}`}
              subitem8List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem9" in dt) {
          return (
            <LawSubitem9
              key={`${addTreeElement(index).join("_")}`}
              subitem9List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Subitem10" in dt) {
          return (
            <LawSubitem10
              key={`${addTreeElement(index).join("_")}`}
              subitem10List={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("List" in dt) {
          return (
            <LawList
              key={`${addTreeElement(index).join("_")}`}
              listList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Sentence" in dt) {
          return (
            <LawSentence
              key={`${addTreeElement(index).join("_")}`}
              sentenceList={[dt]}
              treeElement={addTreeElement(index)}
              isPrecedingSentence={
                index > 0 &&
                lawTypeList.slice(0, index).some((dt) => "Sentence" in dt)
              }
            />
          );
        } else if ("AmendProvision" in dt) {
          return (
            <LawAmendProvision
              key={`${addTreeElement(index).join("_")}`}
              amendProvisionList={[dt]}
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
        } else if ("SupplProvisionAppdxStyle" in dt) {
          return (
            <LawSupplProvisionAppdxStyle
              key={`${addTreeElement(index).join("_")}`}
              supplProvisionAppdxStyleList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("SupplProvisionAppdxTable" in dt) {
          return (
            <LawSupplProvisionAppdxTable
              key={`${addTreeElement(index).join("_")}`}
              supplProvisionAppdxTableList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("SupplProvisionAppdx" in dt) {
          return (
            <LawSupplProvisionAppdx
              key={`${addTreeElement(index).join("_")}`}
              supplProvisionAppdxList={[dt]}
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
        } else if ("TableRow" in dt) {
          return (
            <LawTableRow
              key={`${addTreeElement(index).join("_")}`}
              tableRowList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("TableColumn" in dt) {
          return (
            <LawTableColumn
              key={`${addTreeElement(index).join("_")}`}
              tableColumnList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("FigStruct" in dt) {
          return (
            <LawFigStruct
              key={`${addTreeElement(index).join("_")}`}
              figStructList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("NoteStruct" in dt) {
          return (
            <LawNoteStruct
              key={`${addTreeElement(index).join("_")}`}
              noteStruct={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("StyleStruct" in dt) {
          return (
            <LawStyleStruct
              key={`${addTreeElement(index).join("_")}`}
              styleStructList={[dt]}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("FormatStruct" in dt) {
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
        } else if ("LawBody" in dt) {
          return (
            <LawBodyComponent
              key={`${addTreeElement(index).join("_")}`}
              lawBody={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("Fig" in dt) {
          return (
            <LawFig
              key={`${addTreeElement(index).join("_")}`}
              fig={dt}
              treeElement={addTreeElement(index)}
            />
          );
        } else if ("_" in dt) {
          return getTextNode([dt], addTreeElement(index));
        } else {
          return <></>;
        }
      })}
    </>
  );
};
