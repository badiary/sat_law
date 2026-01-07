import {
  ArticleType,
  ChapterType,
  ColumnType,
  DivisionType,
  FigStructType,
  ItemType,
  ParagraphType,
  PartType,
  RemarksType,
  SectionType,
  SentenceType,
  Subitem10Type,
  Subitem1Type,
  Subitem2Type,
  Subitem3Type,
  Subitem4Type,
  Subitem5Type,
  Subitem6Type,
  Subitem7Type,
  Subitem8Type,
  Subitem9Type,
  SubsectionType,
  TableColumnAttributeType,
  TableColumnType,
} from "@api/types/law";
import { LawSentence } from "./sentence";
import { LawFigStruct } from "./fig-struct";
import { LawChapter } from "./chapter";
import { LawArticle } from "./article";
import { LawParagraph } from "./paragraph";
import { LawItem } from "./item";
import { LawRemarks } from "./remarks";
import { LawColumn } from "./column";
import { LawPart } from "./part";
import { LawSection } from "./section";
import { LawDivision } from "./division";
import { LawSubsection } from "./subsection";
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
import { getType } from "@api/lib/law/law";

/**
 * 表欄のコンポーネント
 * @param {Object} props - プロパティオブジェクト
 * @param {TableColumnType[]} props.tableColumnList - 表示情報
 * @param {string[]} props.treeElement - 法令ツリー要素
 * @returns {JSX.Element} - 表欄のコンポーネント
 */
export const LawTableColumn: React.FC<{
  tableColumnList: TableColumnType[];
  treeElement: string[];
}> = (props) => {
  const { tableColumnList, treeElement } = props;
  const addTreeElement = (index: number) => [
    ...treeElement,
    `TableColumn_${index}`,
  ];
  const getBorderClass = ({
    border,
  }: {
    border: TableColumnAttributeType;
  }): React.CSSProperties => {
    return {
      borderTop: `black ${border?.BorderTop ?? "solid"} 1px`,
      borderBottom: `black ${border?.BorderBottom ?? "solid"} 1px`,
      borderLeft: `black ${border?.BorderLeft ?? "solid"} 1px`,
      borderRight: `black ${border?.BorderRight ?? "solid"} 1px`,
      textAlign: border?.Align,
      verticalAlign: border?.Valign,
    };
  };

  return (
    <>
      {tableColumnList.map((dt, index) => {
        const Part = getType<PartType>(dt.TableColumn, "Part");
        const Chapter = getType<ChapterType>(dt.TableColumn, "Chapter");
        const Section = getType<SectionType>(dt.TableColumn, "Section");
        const Subsection = getType<SubsectionType>(
          dt.TableColumn,
          "Subsection"
        );
        const Division = getType<DivisionType>(dt.TableColumn, "Division");
        const Article = getType<ArticleType>(dt.TableColumn, "Article");
        const Paragraph = getType<ParagraphType>(dt.TableColumn, "Paragraph");
        const Item = getType<ItemType>(dt.TableColumn, "Item");
        const Subitem1 = getType<Subitem1Type>(dt.TableColumn, "Subitem1");
        const Subitem2 = getType<Subitem2Type>(dt.TableColumn, "Subitem2");
        const Subitem3 = getType<Subitem3Type>(dt.TableColumn, "Subitem3");
        const Subitem4 = getType<Subitem4Type>(dt.TableColumn, "Subitem4");
        const Subitem5 = getType<Subitem5Type>(dt.TableColumn, "Subitem5");
        const Subitem6 = getType<Subitem6Type>(dt.TableColumn, "Subitem6");
        const Subitem7 = getType<Subitem7Type>(dt.TableColumn, "Subitem7");
        const Subitem8 = getType<Subitem8Type>(dt.TableColumn, "Subitem8");
        const Subitem9 = getType<Subitem9Type>(dt.TableColumn, "Subitem9");
        const Subitem10 = getType<Subitem10Type>(dt.TableColumn, "Subitem10");
        const FigStruct = getType<FigStructType>(dt.TableColumn, "FigStruct");
        const Remarks = getType<RemarksType>(dt.TableColumn, "Remarks");
        const Sentence = getType<SentenceType>(dt.TableColumn, "Sentence");
        const Column = getType<ColumnType>(dt.TableColumn, "Column");
        return (
          <td
            key={`${addTreeElement(index).join("_")}`}
            className="p-2"
            style={getBorderClass({
              border: dt[":@"],
            })}
            colSpan={dt[":@"]?.colspan}
            rowSpan={dt[":@"]?.rowspan}
          >
            <div>
              <LawPart partList={Part} treeElement={addTreeElement(index)} />
              <LawChapter
                chapterList={Chapter}
                treeElement={addTreeElement(index)}
              />
              <LawSection
                sectionList={Section}
                treeElement={addTreeElement(index)}
              />
              <LawSubsection
                subsectionList={Subsection}
                treeElement={addTreeElement(index)}
              />
              <LawDivision
                divisionList={Division}
                treeElement={addTreeElement(index)}
              />
              <LawArticle
                articleList={Article}
                treeElement={addTreeElement(index)}
              />
              <LawParagraph
                paragraphList={Paragraph}
                treeElement={addTreeElement(index)}
                parentParagraphIndex={0}
              />
              <LawItem
                itemList={Item}
                treeElement={addTreeElement(index)}
                isPrecedingParagraph={false}
              />
              <LawSubitem1
                subitem1List={Subitem1}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem2
                subitem2List={Subitem2}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem3
                subitem3List={Subitem3}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem4
                subitem4List={Subitem4}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem5
                subitem5List={Subitem5}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem6
                subitem6List={Subitem6}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem7
                subitem7List={Subitem7}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem8
                subitem8List={Subitem8}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem9
                subitem9List={Subitem9}
                treeElement={addTreeElement(index)}
              />
              <LawSubitem10
                subitem10List={Subitem10}
                treeElement={addTreeElement(index)}
              />
              <LawFigStruct
                figStructList={FigStruct}
                treeElement={addTreeElement(index)}
              />
              <LawRemarks
                remarksList={Remarks}
                treeElement={addTreeElement(index)}
              />
              <LawSentence
                sentenceList={Sentence}
                treeElement={addTreeElement(index)}
                isPrecedingSentence={false}
              />
              <LawColumn
                columnList={Column}
                treeElement={addTreeElement(index)}
              />
            </div>
          </td>
        );
      })}
    </>
  );
};
