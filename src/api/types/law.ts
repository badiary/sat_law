import {
  LawType as FetchLawType,
  Era as FetchEra,
} from "@api/lib/typescript-fetch";

/**
 * 法令の型
 * @param Law 法令
 * @param ":@" 要素
 */
export type LawType = {
  Law: Array<LawNumType | LawBodyType>;
  ":@": LawAttributeType;
};

/**
 * 法令番号の型
 * @param LawNum 法令番号
 */
export type LawNumType = {
  LawNum: Array<TextType>;
};

/**
 * 法令本体の型
 * @param LawBody 法令本体
 * @param ":@" 要素
 */
export type LawBodyType = {
  LawBody: Array<
    | LawTitleType
    | EnactStatementType
    | TOCType
    | PreambleType
    | MainProvisionType
    | SupplProvisionType
    | AppdxTableType
    | AppdxNoteType
    | AppdxStyleType
    | AppdxType
    | AppdxFigType
    | AppdxFormatType
  >;
  ":@": LawBodyAttributeType;
};

/**
 * 題名の型
 * @param LawTitle 題名
 * @param ":@" 要素
 */
export type LawTitleType = {
  LawTitle: Array<TextNodeType>;
  ":@": LawTitleAttributeType;
};

/**
 * 制定⽂の型
 * @param EnactStatement 制定⽂
 */
export type EnactStatementType = {
  EnactStatement: Array<TextNodeType>;
};

/**
 * ⽬次の型
 * @param TOC ⽬次
 */
export type TOCType = {
  TOC: Array<
    | TOCLabelType
    | TOCPreambleLabelType
    | TOCPartType
    | TOCChapterType
    | TOCSectionType
    | TOCArticleType
    | TOCSupplProvisionType
    | TOCAppdxTableLabelType
  >;
};

/**
 * ⽬次ラベルの型
 * @param TOCLabel ⽬次ラベル
 */
export type TOCLabelType = {
  TOCLabel: Array<TextNodeType>;
};

/**
 * ⽬次前⽂ラベルの型
 * @param TOCPreambleLabel ⽬次前⽂ラベル
 */
export type TOCPreambleLabelType = {
  TOCPreambleLabel: Array<TextNodeType>;
};

/**
 * ⽬次編の型
 * @param TOCPart ⽬次編
 * @param ":@" 要素
 */
export type TOCPartType = {
  TOCPart: Array<PartTitleType | ArticleRangeType | TOCChapterType>;
  ":@": CommonAttributeType;
};

/**
 * ⽬次章の型
 * @param TOCChapter ⽬次章
 * @param ":@" 要素
 */
export type TOCChapterType = {
  TOCChapter: Array<ChapterTitleType | ArticleRangeType | TOCSectionType>;
  ":@": CommonAttributeType;
};

/**
 * ⽬次節の型
 * @param TOCSection ⽬次節
 * @param ":@" 要素
 */
export type TOCSectionType = {
  TOCSection: Array<
    SectionTitleType | ArticleRangeType | TOCSubsectionType | TOCDivisionType
  >;
  ":@": CommonAttributeType;
};

/**
 * ⽬次款の型
 * @param TOCSection ⽬次款
 * @param ":@" 要素
 */
export type TOCSubsectionType = {
  TOCSubsection: Array<
    SubsectionTitleType | ArticleRangeType | TOCDivisionType
  >;
  ":@": CommonAttributeType;
};

/**
 * ⽬次款の型
 * @param TOCSection ⽬次款
 * @param ":@" 要素
 */
export type TOCDivisionType = {
  TOCDivision: Array<DivisionTitleType | ArticleRangeType>;
  ":@": CommonAttributeType;
};

/**
 * ⽬次条の型
 * @param TOCArticle ⽬次条
 * @param ":@" 要素
 */
export type TOCArticleType = {
  TOCArticle: Array<ArticleTitleType | ArticleCaptionType>;
  ":@": CommonAttributeType;
};

/**
 * ⽬次附則の型
 * @param TOCSupplProvision ⽬次附則
 */
export type TOCSupplProvisionType = {
  TOCSupplProvision: Array<
    SupplProvisionLabelType | ArticleRangeType | TOCArticleType | TOCChapterType
  >;
};

/**
 * ⽬次別表ラベルの型
 * @param TOCAppdxTableLabel ⽬次別表ラベル
 */
export type TOCAppdxTableLabelType = {
  TOCAppdxTableLabel: Array<TextNodeType>;
};

/**
 * 条範囲の型
 * @param ArticleRange 条範囲
 */
export type ArticleRangeType = {
  ArticleRange: Array<TextNodeType>;
};

/**
 * 前⽂の型
 * @param Preamble 前⽂
 */
export type PreambleType = {
  Preamble: Array<ParagraphType>;
};

/**
 * 本則の型
 * @param MainProvision 本則
 * @param ":@" 要素
 */
export type MainProvisionType = {
  MainProvision: Array<
    PartType | ChapterType | SectionType | ArticleType | ParagraphType
  >;
  ":@": MainProvisionAttributeType;
};

/**
 * 編の型
 * @param Part 編
 * @param ":@" 要素
 */
export type PartType = {
  Part: Array<PartTitleType | ArticleType | ChapterType>;
  ":@": CommonAttributeType;
};

/**
 * 編名の型
 * @param PartTitle 編名
 */
export type PartTitleType = {
  PartTitle: Array<TextNodeType>;
};

/**
 * 章の型
 * @param Chapter 章
 * @param ":@" 要素
 */
export type ChapterType = {
  Chapter: Array<ChapterTitleType | ArticleType | SectionType>;
  ":@": CommonAttributeType;
};

/**
 * 章名の型
 * @param ChapterTitle 章名
 */
export type ChapterTitleType = {
  ChapterTitle: Array<TextNodeType>;
};

/**
 * 節の型
 * @param Section 節
 * @param ":@" 要素
 */
export type SectionType = {
  Section: Array<
    SectionTitleType | ArticleType | SubsectionType | DivisionType
  >;
  ":@": CommonAttributeType;
};

/**
 * 節名の型
 * @param SectionTitle 節名
 */
export type SectionTitleType = {
  SectionTitle: Array<TextNodeType>;
};

/**
 * 款の型
 * @param Subsection 款
 * @param ":@" 要素
 */
export type SubsectionType = {
  Subsection: Array<SubsectionTitleType | ArticleType | DivisionType>;
  ":@": CommonAttributeType;
};

/**
 * 款名の型
 * @param SubsectionTitle 款名
 */
export type SubsectionTitleType = {
  SubsectionTitle: Array<TextNodeType>;
};

/**
 * ⽬の型
 * @param Division ⽬
 * @param ":@" 要素
 */
export type DivisionType = {
  Division: Array<DivisionTitleType | ArticleType>;
  ":@": CommonAttributeType;
};

/**
 * ⽬名の型
 * @param DivisionTitle ⽬名
 */
export type DivisionTitleType = {
  DivisionTitle: Array<TextNodeType>;
};

/**
 * 条の型
 * @param Article 条
 * @param ":@" 要素
 */
export type ArticleType = {
  Article: Array<
    ArticleCaptionType | ArticleTitleType | ParagraphType | SupplNoteType
  >;
  ":@": CommonAttributeType;
};

/**
 * 条名の型
 * @param ArticleTitle 条名
 */
export type ArticleTitleType = {
  ArticleTitle: Array<TextNodeType>;
};

/**
 * 条⾒出しの型
 * @param Article 条⾒出し
 * @param ":@" 要素
 */
export type ArticleCaptionType = {
  ArticleCaption: Array<TextNodeType>;
  ":@": CaptionAttributeType;
};

/**
 * 項の型
 * @param Paragraph 項
 * @param ":@" 要素
 */
export type ParagraphType = {
  Paragraph: Array<
    | ParagraphCaptionType
    | ParagraphNumType
    | ParagraphSentenceType
    | AmendProvisionType
    | ClassType
    | ItemType
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": ParagraphAttributeType;
};

/**
 * 項⾒出しの型
 * @param ParagraphCaption 項⾒出し
 */
export type ParagraphCaptionType = {
  ParagraphCaption: Array<TextNodeType>;
  ":@": CaptionAttributeType;
};

/**
 * 項番号の型
 * @param ParagraphNum 項番号
 */
export type ParagraphNumType = {
  ParagraphNum: Array<TextNodeType>;
};

/**
 * 項⽂の型
 * @param ParagraphSentence 項⽂
 */
export type ParagraphSentenceType = {
  ParagraphSentence: Array<SentenceType>;
};

/**
 * 付記の型
 * @param SupplNote 付記
 */
export type SupplNoteType = {
  SupplNote: Array<TextNodeType>;
};

/**
 * 改正規定の型
 * @param AmendProvision 改正規定
 */
export type AmendProvisionType = {
  AmendProvision: Array<AmendProvisionSentenceType | NewProvisionType>;
};

/**
 * 改正規定⽂の型
 * @param AmendProvisionSentence 改正規定⽂
 */
export type AmendProvisionSentenceType = {
  AmendProvisionSentence: Array<SentenceType>;
};

/**
 * 新規定の型
 * @param NewProvision 新規定
 */
export type NewProvisionType = {
  NewProvision: Array<
    | LawTitleType
    | PreambleType
    | TOCType
    | PartType
    | PartTitleType
    | ChapterType
    | ChapterTitleType
    | SectionType
    | SectionTitleType
    | SubsectionType
    | SubsectionTitleType
    | DivisionType
    | DivisionTitleType
    | ArticleType
    | SupplNoteType
    | ParagraphType
    | ItemType
    | Subitem1Type
    | Subitem2Type
    | Subitem3Type
    | Subitem4Type
    | Subitem5Type
    | Subitem6Type
    | Subitem7Type
    | Subitem8Type
    | Subitem9Type
    | Subitem10Type
    | ListType
    | SentenceType
    | AmendProvisionType
    | AppdxTableType
    | AppdxNoteType
    | AppdxStyleType
    | AppdxType
    | AppdxFigType
    | AppdxFormatType
    | SupplProvisionAppdxStyleType
    | SupplProvisionAppdxTableType
    | SupplProvisionAppdxType
    | TableStructType
    | TableRowType
    | TableColumnType
    | FigStructType
    | NoteStructType
    | StyleStructType
    | FormatStructType
    | RemarksType
    | LawBodyType
  >;
};

/**
 * 類の型
 * @param Class 類
 * @param ":@" 要素
 */
export type ClassType = {
  Class: Array<ClassTitleType | ClassSentenceType | ItemType>;
  ":@": CommonAttributeType;
};

/**
 * 類名の型
 * @param ClassTitle 類名
 */
export type ClassTitleType = {
  ClassTitle: Array<TextNodeType>;
};

/**
 * 類⽂の型
 * @param ClassSentence 類⽂
 */
export type ClassSentenceType = {
  ClassSentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号の型
 * @param Item 号
 * @param ":@" 要素
 */
export type ItemType = {
  Item: Array<
    | ItemTitleType
    | ItemSentenceType
    | Subitem1Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号名の型
 * @param ItemTitle 号名
 */
export type ItemTitleType = {
  ItemTitle: Array<TextNodeType>;
};

/**
 * 号⽂の型
 * @param ItemSentence 号⽂
 */
export type ItemSentenceType = {
  ItemSentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分の型
 * @param Subitem1 号細分
 * @param ":@" 要素
 */
export type Subitem1Type = {
  Subitem1: Array<
    | Subitem1TitleType
    | Subitem1SentenceType
    | Subitem2Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分名の型
 * @param Subitem1Title 号細分名
 */
export type Subitem1TitleType = {
  Subitem1Title: Array<TextNodeType>;
};

/**
 * 号細分⽂の型
 * @param Subitem1Sentence 号細分⽂
 */
export type Subitem1SentenceType = {
  Subitem1Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分２の型
 * @param Subitem2 号細分２
 * @param ":@" 要素
 */
export type Subitem2Type = {
  Subitem2: Array<
    | Subitem2TitleType
    | Subitem2SentenceType
    | Subitem3Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分２名の型
 * @param Subitem2Title 号細分２名
 */
export type Subitem2TitleType = {
  Subitem2Title: Array<TextNodeType>;
};

/**
 * 号細分２⽂の型
 * @param Subitem2Sentence 号細分２⽂
 */
export type Subitem2SentenceType = {
  Subitem2Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分３の型
 * @param Subitem3 号細分３
 * @param ":@" 要素
 */
export type Subitem3Type = {
  Subitem3: Array<
    | Subitem3TitleType
    | Subitem3SentenceType
    | Subitem4Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分３名の型
 * @param Subitem3Title 号細分３名
 */
export type Subitem3TitleType = {
  Subitem3Title: Array<TextNodeType>;
};

/**
 * 号細分３⽂の型
 * @param Subitem3Sentence 号細分３⽂
 */
export type Subitem3SentenceType = {
  Subitem3Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分４の型
 * @param Subitem4 号細分４
 * @param ":@" 要素
 */
export type Subitem4Type = {
  Subitem4: Array<
    | Subitem4TitleType
    | Subitem4SentenceType
    | Subitem5Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分４名の型
 * @param Subitem4Title 号細分４名
 */
export type Subitem4TitleType = {
  Subitem4Title: Array<TextNodeType>;
};

/**
 * 号細分４⽂の型
 * @param Subitem4Sentence 号細分４⽂
 */
export type Subitem4SentenceType = {
  Subitem4Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分５の型
 * @param Subitem5 号細分５
 * @param ":@" 要素
 */
export type Subitem5Type = {
  Subitem5: Array<
    | Subitem5TitleType
    | Subitem5SentenceType
    | Subitem6Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分５名の型
 * @param Subitem5Title 号細分５名
 */
export type Subitem5TitleType = {
  Subitem5Title: Array<TextNodeType>;
};

/**
 * 号細分５⽂の型
 * @param Subitem5Sentence 号細分５⽂
 */
export type Subitem5SentenceType = {
  Subitem5Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分６の型
 * @param Subitem6 号細分６
 * @param ":@" 要素
 */
export type Subitem6Type = {
  Subitem6: Array<
    | Subitem6TitleType
    | Subitem6SentenceType
    | Subitem7Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分６名の型
 * @param Subitem6Title 号細分６名
 */
export type Subitem6TitleType = {
  Subitem6Title: Array<TextNodeType>;
};

/**
 * 号細分６⽂の型
 * @param Subitem6Sentence 号細分６⽂
 */
export type Subitem6SentenceType = {
  Subitem6Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分７の型
 * @param Subitem7 号細分７
 * @param ":@" 要素
 */
export type Subitem7Type = {
  Subitem7: Array<
    | Subitem7TitleType
    | Subitem7SentenceType
    | Subitem8Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分７名の型
 * @param Subitem7Title 号細分７名
 */
export type Subitem7TitleType = {
  Subitem7Title: Array<TextNodeType>;
};

/**
 * 号細分７⽂の型
 * @param Subitem7Sentence 号細分７⽂
 */
export type Subitem7SentenceType = {
  Subitem7Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分８の型
 * @param Subitem8 号細分８
 * @param ":@" 要素
 */
export type Subitem8Type = {
  Subitem8: Array<
    | Subitem8TitleType
    | Subitem8SentenceType
    | Subitem9Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分８名の型
 * @param Subitem8Title 号細分８名
 */
export type Subitem8TitleType = {
  Subitem8Title: Array<TextNodeType>;
};

/**
 * 号細分８⽂の型
 * @param Subitem8Sentence 号細分８⽂
 */
export type Subitem8SentenceType = {
  Subitem8Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分９の型
 * @param Subitem9 号細分９
 * @param ":@" 要素
 */
export type Subitem9Type = {
  Subitem9: Array<
    | Subitem9TitleType
    | Subitem9SentenceType
    | Subitem10Type
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分９名の型
 * @param Subitem9Title 号細分９名
 */
export type Subitem9TitleType = {
  Subitem9Title: Array<TextNodeType>;
};

/**
 * 号細分９⽂の型
 * @param Subitem9Sentence 号細分９⽂
 */
export type Subitem9SentenceType = {
  Subitem9Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 号細分１０の型
 * @param Subitem10 号細分１０
 * @param ":@" 要素
 */
export type Subitem10Type = {
  Subitem10: Array<
    | Subitem10TitleType
    | Subitem10SentenceType
    | TableStructType
    | FigStructType
    | StyleStructType
    | ListType
  >;
  ":@": CommonAttributeType;
};

/**
 * 号細分１０名の型
 * @param Subitem10Title 号細分１０名
 */
export type Subitem10TitleType = {
  Subitem10Title: Array<TextNodeType>;
};

/**
 * 号細分１０⽂の型
 * @param Subitem10Sentence 号細分１０⽂
 */
export type Subitem10SentenceType = {
  Subitem10Sentence: Array<SentenceType | ColumnType | TableType>;
};

/**
 * 段の型
 * @param Sentence 段
 * @param ":@" 要素
 */
export type SentenceType = {
  Sentence: Array<TextNodeType | QuoteStructType | ArithFormulaType>;
  ":@": SentenceAttributeType;
};

/**
 * 欄の型
 * @param Column 欄
 * @param ":@" 要素
 */
export type ColumnType = {
  Column: Array<SentenceType>;
  ":@": ColumnAttributeType;
};

/**
 * 附則の型
 * @param SupplProvision 附則
 * @param ":@" 要素
 */
export type SupplProvisionType = {
  SupplProvision: Array<
    | SupplProvisionLabelType
    | ChapterType
    | ArticleType
    | ParagraphType
    | SupplProvisionAppdxTableType
    | SupplProvisionAppdxStyleType
    | SupplProvisionAppdxType
  >;
  ":@": SupplProvisionAttributeType;
};

/**
 * 附則ラベルの型
 * @param SupplProvisionLabel 附則ラベル
 */
export type SupplProvisionLabelType = {
  SupplProvisionLabel: Array<TextNodeType>;
};

/**
 * 附則別表の型
 * @param SupplProvisionAppdxTable 附則別表
 * @param ":@" 要素
 */
export type SupplProvisionAppdxTableType = {
  SupplProvisionAppdxTable: Array<
    SupplProvisionAppdxTableTitleType | RelatedArticleNumType | TableStructType
  >;
  ":@": NumAttributeType;
};

/**
 * 附則別表名の型
 * @param SupplProvisionAppdxTableTitle 附則別表名
 * @param ":@" 要素
 */
export type SupplProvisionAppdxTableTitleType = {
  SupplProvisionAppdxTableTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 附則様式の型
 * @param SupplProvisionAppdxStyle 附則様式
 * @param ":@" 要素
 */
export type SupplProvisionAppdxStyleType = {
  SupplProvisionAppdxStyle: Array<
    SupplProvisionAppdxStyleTitleType | RelatedArticleNumType | StyleStructType
  >;
  ":@": NumAttributeType;
};

/**
 * 附則様式名の型
 * @param SupplProvisionAppdxStyleTitle 附則様式名
 * @param ":@" 要素
 */
export type SupplProvisionAppdxStyleTitleType = {
  SupplProvisionAppdxStyleTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 附則付録の型
 * @param SupplProvisionAppdx 附則付録
 * @param ":@" 要素
 */
export type SupplProvisionAppdxType = {
  SupplProvisionAppdx: Array<
    ArithFormulaNumType | RelatedArticleNumType | ArithFormulaType
  >;
  ":@": NumAttributeType;
};

/**
 * 別表の型
 * @param AppdxTable 別表
 * @param ":@" 要素
 */
export type AppdxTableType = {
  AppdxTable: Array<
    | AppdxTableTitleType
    | RelatedArticleNumType
    | TableStructType
    | ItemType
    | RemarksType
  >;
  ":@": NumAttributeType;
};

/**
 * 別表名の型
 * @param AppdxTableTitle 別表名
 * @param ":@" 要素
 */
export type AppdxTableTitleType = {
  AppdxTableTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 別記の型
 * @param AppdxNote 別記
 * @param ":@" 要素
 */
export type AppdxNoteType = {
  AppdxNote: Array<
    | AppdxNoteTitleType
    | RelatedArticleNumType
    | NoteStructType
    | FigStructType
    | TableStructType
    | RemarksType
  >;
  ":@": NumAttributeType;
};

/**
 * 別記名の型
 * @param AppdxNoteTitle 別記名
 * @param ":@" 要素
 */
export type AppdxNoteTitleType = {
  AppdxNoteTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 別記様式の型
 * @param AppdxStyle 別記様式
 * @param ":@" 要素
 */
export type AppdxStyleType = {
  AppdxStyle: Array<
    AppdxStyleTitleType | RelatedArticleNumType | StyleStructType | RemarksType
  >;
  ":@": NumAttributeType;
};

/**
 * 別記様式名の型
 * @param AppdxStyleTitle 別記様式名
 * @param ":@" 要素
 */
export type AppdxStyleTitleType = {
  AppdxStyleTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 別記書式の型
 * @param AppdxFormat 別記書式
 * @param ":@" 要素
 */
export type AppdxFormatType = {
  AppdxFormat: Array<
    | AppdxFormatTitleType
    | RelatedArticleNumType
    | FormatStructType
    | RemarksType
  >;
  ":@": NumAttributeType;
};

/**
 * 別記書式名の型
 * @param AppdxFormatTitle 別記書式名
 * @param ":@" 要素
 */
export type AppdxFormatTitleType = {
  AppdxFormatTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 付録の型
 * @param Appdx 付録
 */
export type AppdxType = {
  Appdx: Array<
    ArithFormulaNumType | RelatedArticleNumType | ArithFormulaType | RemarksType
  >;
};

/**
 * 算式番号の型
 * @param ArithFormulaNum 算式番号
 */
export type ArithFormulaNumType = {
  ArithFormulaNum: Array<TextNodeType>;
};

/**
 * 算式の型
 * @param ArithFormula 算式
 * @param ":@" 要素
 */
export type ArithFormulaType = {
  ArithFormula: Array<LawTypeList>;
  ":@": NumAttributeType;
};

/**
 * 別図の型
 * @param AppdxFig 別図
 * @param ":@" 要素
 */
export type AppdxFigType = {
  AppdxFig: Array<
    AppdxFigTitleType | RelatedArticleNumType | FigStructType | TableStructType
  >;
  ":@": NumAttributeType;
};

/**
 * 別図名の型
 * @param AppdxFigTitle 別図名
 * @param ":@" 要素
 */
export type AppdxFigTitleType = {
  AppdxFigTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 表項⽬の型
 * @param TableStruct 表項⽬
 */
export type TableStructType = {
  TableStruct: Array<TableStructTitleType | RemarksType | TableType>;
};

/**
 * 表項⽬名の型
 * @param TableStructTitle 表項⽬名
 * @param ":@" 要素
 */
export type TableStructTitleType = {
  TableStructTitle: Array<TextNodeType>;
  ":@": WritingModeAttributeType;
};

/**
 * 表の型
 * @param Table 表
 * @param ":@" 要素
 */
export type TableType = {
  Table: Array<TableRowType | TableHeaderRowType>;
  ":@": WritingModeAttributeType;
};

/**
 * 表項の型
 * @param TableRow 表項
 */
export type TableRowType = {
  TableRow: Array<TableColumnType>;
};

/**
 * 表欄名項の型
 * @param TableHeaderColumn 表欄名項
 */
export type TableHeaderRowType = {
  TableHeaderColumn: Array<TableHeaderColumnType>;
};

/**
 * 表欄名の型
 * @param TableHeaderColumn 表欄名
 */
export type TableHeaderColumnType = {
  TableHeaderColumn: Array<TextNodeType>;
};

/**
 * 表欄の型
 * @param TableColumn 表欄
 * @param ":@" 要素
 */
export type TableColumnType = {
  TableColumn: Array<
    | PartType
    | ChapterType
    | SectionType
    | SubsectionType
    | DivisionType
    | ArticleType
    | ParagraphType
    | ItemType
    | Subitem1Type
    | Subitem2Type
    | Subitem3Type
    | Subitem4Type
    | Subitem5Type
    | Subitem6Type
    | Subitem7Type
    | Subitem8Type
    | Subitem9Type
    | Subitem10Type
    | FigStructType
    | RemarksType
    | SentenceType
    | ColumnType
  >;
  ":@": TableColumnAttributeType;
};

/**
 * 図項⽬の型
 * @param FigStruct 図項⽬
 */
export type FigStructType = {
  FigStruct: Array<FigStructTitleType | RemarksType | FigType>;
};

/**
 * 図項⽬名の型
 * @param FigStructTitle 図項⽬名
 */
export type FigStructTitleType = {
  FigStructTitle: Array<TextNodeType>;
};

/**
 * 図の型
 * @param Fig 図
 * @param ":@" 要素
 */
export type FigType = {
  Fig?: string;
  ":@": SrcAttributeType;
};

/**
 * 記項⽬の型
 * @param NoteStruct 記項⽬
 */
export type NoteStructType = {
  NoteStruct: Array<NoteStructTitleType | RemarksType | NoteType>;
};

/**
 * 記項⽬名の型
 * @param NoteStructTitle 記項⽬名
 */
export type NoteStructTitleType = {
  NoteStructTitle: Array<TextNodeType>;
};

/**
 * 記の型
 * @param Note 記
 */
export type NoteType = {
  Note: Array<LawTypeList>;
};

/**
 * 様式項⽬の型
 * @param StyleStruct 様式項⽬
 */
export type StyleStructType = {
  StyleStruct: Array<StyleStructTitleType | RemarksType | StyleType>;
};

/**
 * 様式項⽬名の型
 * @param StyleStructTitle 様式項⽬名
 */
export type StyleStructTitleType = {
  StyleStructTitle: Array<TextNodeType>;
};

/**
 * 様式の型
 * @param Style 様式
 */
export type StyleType = {
  Style: Array<LawTypeList>;
};

/**
 * 書式項⽬の型
 * @param FormatStruct 書式項⽬
 */
export type FormatStructType = {
  FormatStruct: Array<FormatStructTitleType | RemarksType | FormatType>;
};

/**
 * 書式項⽬名の型
 * @param FormatStructTitle 書式項⽬名
 */
export type FormatStructTitleType = {
  FormatStructTitle: Array<TextNodeType>;
};

/**
 * 書式の型
 * @param Format 書式
 */
export type FormatType = {
  Format: Array<LawTypeList>;
};

/**
 * 関係条⽂番号の型
 * @param RelatedArticleNum 関係条⽂番号
 */
export type RelatedArticleNumType = {
  RelatedArticleNum: Array<TextNodeType>;
};

/**
 * 備考の型
 * @param Remarks 備考
 */
export type RemarksType = {
  Remarks: Array<RemarksLabelType | ItemType | SentenceType>;
};

/**
 * 備考ラベルの型
 * @param RemarksLabel 備考ラベル
 * @param ":@" 要素
 */
export type RemarksLabelType = {
  RemarksLabel: Array<TextNodeType>;
  ":@": LineBreakAttributeType;
};

/**
 * 列記の型
 * @param List 列記
 */
export type ListType = {
  List: Array<ListSentenceType | Sublist1Type>;
};

/**
 * 列記⽂の型
 * @param ListSentence 列記⽂
 */
export type ListSentenceType = {
  ListSentence: Array<SentenceType | ColumnType>;
};

/**
 * 列記細分１の型
 * @param Sublist1 列記細分１
 */
export type Sublist1Type = {
  Sublist1: Array<Sublist1SentenceType | Sublist2Type>;
};

/**
 * 列記細分１⽂の型
 * @param Sublist1Sentence 列記細分１⽂
 */
export type Sublist1SentenceType = {
  Sublist1Sentence: Array<SentenceType | ColumnType>;
};

/**
 * 列記細分２の型
 * @param Sublist2 列記細分２
 */
export type Sublist2Type = {
  Sublist2: Array<Sublist2SentenceType | Sublist3Type>;
};

/**
 * 列記細分２⽂の型
 * @param Sublist2Sentence 列記細分２⽂
 */
export type Sublist2SentenceType = {
  Sublist2Sentence: Array<SentenceType | ColumnType>;
};

/**
 * 列記細分３の型
 * @param Sublist3 列記細分３
 */
export type Sublist3Type = {
  Sublist3: Array<Sublist3SentenceType>;
};

/**
 * 列記細分３⽂の型
 * @param Sublist3Sentence 列記細分３⽂
 */
export type Sublist3SentenceType = {
  Sublist3Sentence: Array<SentenceType | ColumnType>;
};

/**
 * 構造引⽤の型
 * @param QuoteStruct 構造引⽤
 */
export type QuoteStructType = { QuoteStruct: Array<LawTypeList> };

/**
 * ルビ構造の型
 * @param Ruby ルビ構造
 */
export type RubyType = {
  Ruby: Array<TextType | RtType>;
};

/**
 * ルビの型
 * @param Rt ルビ
 */
export type RtType = {
  Rt: Array<TextType>;
};

/**
 * 傍線の型
 * @param Line 傍線
 * @param Style 線種
 */
export type LineType = {
  Line: Array<TextNodeType>;
  Style: BorderStyleType;
};

/**
 * 上付き⽂字の型
 * @param Sup 上付き⽂字
 */
export type SupType = { Sup: Array<TextType> };

/**
 * 下付き⽂字の型
 * @param Sub 下付き⽂字
 */
export type SubType = { Sub: Array<TextType> };

/**
 * テキストの型
 * @param _ テキスト
 */
export type TextType = {
  _: string;
};

/**
 * テキストノードの型
 */
export type TextNodeType =
  | LineType
  | RubyType
  | SupType
  | SubType
  | TextType
  | QuoteStructType
  | ArithFormulaType;

/**
 * 法令に関する型の一覧
 */
export type LawTypeList =
  | LawType
  | LawNumType
  | LawBodyType
  | LawTitleType
  | EnactStatementType
  | TOCType
  | TOCLabelType
  | TOCPreambleLabelType
  | TOCPartType
  | TOCChapterType
  | TOCSectionType
  | TOCSubsectionType
  | TOCDivisionType
  | TOCArticleType
  | TOCSupplProvisionType
  | TOCAppdxTableLabelType
  | ArticleRangeType
  | PreambleType
  | MainProvisionType
  | PartType
  | PartTitleType
  | ChapterType
  | ChapterTitleType
  | SectionType
  | SectionTitleType
  | SubsectionType
  | SubsectionTitleType
  | DivisionType
  | DivisionTitleType
  | ArticleType
  | ArticleTitleType
  | ArticleCaptionType
  | ParagraphType
  | ParagraphCaptionType
  | ParagraphNumType
  | ParagraphSentenceType
  | SupplNoteType
  | AmendProvisionType
  | AmendProvisionSentenceType
  | NewProvisionType
  | ClassType
  | ClassTitleType
  | ClassSentenceType
  | ItemType
  | ItemTitleType
  | ItemSentenceType
  | Subitem1Type
  | Subitem1TitleType
  | Subitem1SentenceType
  | Subitem2Type
  | Subitem2TitleType
  | Subitem2SentenceType
  | Subitem3Type
  | Subitem3TitleType
  | Subitem3SentenceType
  | Subitem4Type
  | Subitem4TitleType
  | Subitem4SentenceType
  | Subitem5Type
  | Subitem5TitleType
  | Subitem5SentenceType
  | Subitem6Type
  | Subitem6TitleType
  | Subitem6SentenceType
  | Subitem7Type
  | Subitem7TitleType
  | Subitem7SentenceType
  | Subitem8Type
  | Subitem8TitleType
  | Subitem8SentenceType
  | Subitem9Type
  | Subitem9TitleType
  | Subitem9SentenceType
  | Subitem10Type
  | Subitem10TitleType
  | Subitem10SentenceType
  | SentenceType
  | ColumnType
  | SupplProvisionType
  | SupplProvisionLabelType
  | SupplProvisionAppdxTableType
  | SupplProvisionAppdxTableTitleType
  | SupplProvisionAppdxStyleType
  | SupplProvisionAppdxStyleTitleType
  | SupplProvisionAppdxType
  | AppdxTableType
  | AppdxTableTitleType
  | AppdxNoteType
  | AppdxNoteTitleType
  | AppdxStyleType
  | AppdxStyleTitleType
  | AppdxFormatType
  | AppdxFormatTitleType
  | AppdxType
  | ArithFormulaNumType
  | ArithFormulaType
  | AppdxFigType
  | AppdxFigTitleType
  | TableStructType
  | TableStructTitleType
  | TableType
  | TableRowType
  | TableHeaderRowType
  | TableHeaderColumnType
  | TableColumnType
  | FigStructType
  | FigStructTitleType
  | FigType
  | NoteStructType
  | NoteStructTitleType
  | NoteType
  | StyleStructType
  | StyleStructTitleType
  | StyleType
  | FormatStructType
  | FormatStructTitleType
  | FormatType
  | RelatedArticleNumType
  | RemarksType
  | RemarksLabelType
  | ListType
  | ListSentenceType
  | Sublist1Type
  | Sublist1SentenceType
  | Sublist2Type
  | Sublist2SentenceType
  | Sublist3Type
  | Sublist3SentenceType
  | QuoteStructType
  | RubyType
  | RtType
  | LineType
  | SupType
  | SubType
  | TextType;

/**
 * 法令の要素の型
 * @param Era 元号
 * @param Year 年号
 * @param Num 番号
 * @param PromulgateMonth 公布⽉
 * @param PromulgateDay 公布⽇
 * @param LawType 種別
 * @param Lang ⾔語
 */
export type LawAttributeType = {
  Era: FetchEra;
  Year: number;
  Num: number;
  PromulgateMonth?: number;
  PromulgateDay?: number;
  LawType: FetchLawType;
  Lang: LangType;
  AmendmentPromulgateDate?: string;
  EnforcementDate?: string;
};

/**
 * 法令本体の要素の型
 * @param Subject 件名
 */
export type LawBodyAttributeType = {
  Subject?: string;
};

/**
 * 題名の要素の型
 * @param Kana 読み
 * @param Abbrev 略称
 * @param AbbrevKana 略称読み
 */
export type LawTitleAttributeType = {
  Kana?: string;
  Abbrev?: string;
  AbbrevKana?: string;
};

/**
 * 題名の要素の型
 * @param Num 番号
 * @param Delete 削除（true: 効⼒を有する, false: 効⼒を有しない）
 * @param Hide ⾮表⽰（true: ⾮表⽰である, false: ⾮表⽰でない）
 */
export type CommonAttributeType = {
  Num: string;
  Delete?: boolean;
  Hide?: boolean;
};

/**
 * 本則の要素の型
 * @param Extract 抄（true: 抄である, false: 抄でない）
 */
export type MainProvisionAttributeType = {
  Extract?: boolean;
};

/**
 * ⾒出しの要素の型
 * @param CommonCaption 共通⾒出し（true: 有, false: 無）
 */
export type CaptionAttributeType = {
  CommonCaption?: boolean;
};

/**
 * 項の要素の型
 * @param Num 番号
 * @param OldStyle 旧スタイル
 * @param OldNum 旧番号スタイル
 * @param Hide ⾮表⽰（true: ⾮表⽰である, false: ⾮表⽰でない）
 */
export type ParagraphAttributeType = {
  Num: number;
  OldStyle?: boolean;
  OldNum?: boolean;
  Hide?: boolean;
};

/**
 * 段の要素の型
 * @param Num 番号
 * @param Function 機能
 * @param Indent インデント
 * @param WritingMode ⾏送り⽅向
 */
export type SentenceAttributeType = {
  Function?: FunctionType;
  Indent?: IndentType;
} & NumAttributeType &
  WritingModeAttributeType;

/**
 * ⾏送り⽅向の要素の型
 * @param WritingMode ⾏送り⽅向
 */
export type WritingModeAttributeType = {
  WritingMode?: WritingModeType;
};

/**
 * 欄の要素の型
 * @param Num 番号
 * @param LineBreak 改⾏（true: 有, false: 無）
 * @param Align 位置
 */
export type ColumnAttributeType = {
  Align?: AlignType;
} & NumAttributeType &
  LineBreakAttributeType;

/**
 * 改⾏の要素の型
 * @param LineBreak 改⾏（true: 有, false: 無）
 */
export type LineBreakAttributeType = {
  LineBreak?: boolean;
};

/**
 * 欄の要素の型
 * @param Type 種類（New: 制定, Amend: 改正）
 * @param AmendLawNum 改正法令番号
 * @param Extract 抄（true: 抄である, false: 抄でない）
 */
export type SupplProvisionAttributeType = {
  Type?: "New" | "Amend";
  AmendLawNum?: number;
  Extract?: boolean;
};

/**
 * 番号の要素の型（number型）
 * @param Num 番号
 */
export type NumAttributeType = {
  Num?: number;
};

/**
 * URLの要素の型
 * @param src URL
 */
export type SrcAttributeType = {
  src: string;
};

/**
 * 表欄の要素の型
 * @param BorderTop 上罫線
 * @param BorderBottom 下罫線
 * @param BorderLeft 左罫線
 * @param BorderRight 右罫線
 * @param rowspan 項結合
 * @param colspan 欄結合
 * @param Align 欄位置
 * @param Valign 項位置
 */
export type TableColumnAttributeType = {
  BorderTop?: BorderStyleType;
  BorderBottom?: BorderStyleType;
  BorderLeft?: BorderStyleType;
  BorderRight?: BorderStyleType;
  rowspan?: number;
  colspan?: number;
  Align?: AlignType;
  Valign?: ValignType;
};

/**
 * ⾔語
 * @param ja 日本語
 * @param en 英語
 */
export const Lang = {
  ja: "ja",
  en: "en",
} as const;

/**
 * 言語の型
 */
export type LangType = (typeof Lang)[keyof typeof Lang];

/**
 * 機能
 * @param main 本⽂
 * @param proviso ただし書
 */
export const Function = {
  main: "main",
  proviso: "proviso",
} as const;

/**
 * 機能の型
 */
export type FunctionType = (typeof Function)[keyof typeof Function];

/**
 * インデント
 * @param Paragraph 項
 * @param Item 号
 * @param Subitem1 号細分
 * @param Subitem2 号細分２
 * @param Subitem3 号細分３
 * @param Subitem4 号細分４
 * @param Subitem5 号細分５
 * @param Subitem6 号細分６
 * @param Subitem7 号細分７
 * @param Subitem8 号細分８
 * @param Subitem9 号細分９
 * @param Subitem10 号細分１０
 */
export const Indent = {
  Paragraph: "Paragraph",
  Item: "Item",
  Subitem1: "Subitem1",
  Subitem2: "Subitem2",
  Subitem3: "Subitem3",
  Subitem4: "Subitem4",
  Subitem5: "Subitem5",
  Subitem6: "Subitem6",
  Subitem7: "Subitem7",
  Subitem8: "Subitem8",
  Subitem9: "Subitem9",
  Subitem10: "Subitem10",
} as const;

/**
 * インデントの型
 */
export type IndentType = (typeof Indent)[keyof typeof Indent];

/**
 * ⾏送り⽅向
 * @param vertical 縦書き
 * @param horizontal 横書き
 */
export const WritingMode = {
  vertical: "vertical",
  horizontal: "horizontal",
} as const;

/**
 * ⾏送り⽅向の型
 */
export type WritingModeType = (typeof WritingMode)[keyof typeof WritingMode];

/**
 * 傍線の種類
 * @param solid 実線
 * @param none 無
 * @param double ⼆重線
 * @param dotted 点線
 */
export const BorderStyle = {
  solid: "solid",
  none: "none",
  double: "double",
  dotted: "dotted",
} as const;

/**
 * 傍線の種類の型
 */
export type BorderStyleType = (typeof BorderStyle)[keyof typeof BorderStyle];

/**
 * ⾏送り⽅向
 * @param left 左詰め
 * @param center 中央揃え
 * @param right 右詰め
 * @param justify 均等割り付け
 */
export const Align = {
  left: "left",
  center: "center",
  right: "right",
  justify: "justify",
} as const;

/**
 * ⾏送り⽅向の型
 */
export type AlignType = (typeof Align)[keyof typeof Align];

/**
 * 項位置
 * @param top 上寄せ
 * @param middle 中央寄せ
 * @param bottom 下寄せ
 */
export const Valign = {
  top: "top",
  middle: "middle",
  bottom: "bottom",
} as const;

/**
 * 項位置の型
 */
export type ValignType = (typeof Valign)[keyof typeof Valign];
