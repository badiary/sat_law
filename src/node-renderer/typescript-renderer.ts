/**
 * TypeScriptでXMLからHTMLを生成する（Reactなし）
 *
 * 目的:
 * - 既存のReactコンポーネントと同じHTMLを純粋なTypeScriptで生成
 * - Reactコンポーネントのロジックを忠実に再現
 */

import { getType, getTypeByFind, getParentElement } from '../api/lib/law/law';
import {
  ArticleType,
  ParagraphType,
  ItemType,
  ArticleCaptionType,
  ArticleTitleType,
  ParagraphCaptionType,
  ParagraphNumType,
  ParagraphSentenceType,
  ItemTitleType,
  ItemSentenceType,
  SentenceType,
  ColumnType,
  SupplNoteType,
  TextNodeType,
  TextType,
  RtType,
  MainProvisionType,
  LawBodyType,
  LawNumType,
  LawTitleType,
  SupplProvisionType,
  SupplProvisionLabelType,
  ChapterType,
  ChapterTitleType,
  PartType,
  PartTitleType,
  SectionType,
  SectionTitleType,
  SubsectionType,
  SubsectionTitleType,
  DivisionType,
  DivisionTitleType,
  TOCType,
  TOCLabelType,
  TOCPreambleLabelType,
  TOCPartType,
  TOCChapterType,
  TOCSectionType,
  TOCSubsectionType,
  TOCDivisionType,
  TOCArticleType,
  TOCSupplProvisionType,
  TOCAppdxTableLabelType,
  ArticleRangeType,
  Subitem1Type,
  Subitem1TitleType,
  Subitem1SentenceType,
  Subitem2Type,
  Subitem2TitleType,
  Subitem2SentenceType,
  Subitem3Type,
  Subitem3TitleType,
  Subitem3SentenceType,
  Subitem4Type,
  Subitem4TitleType,
  Subitem4SentenceType,
  Subitem5Type,
  Subitem5TitleType,
  Subitem5SentenceType,
  Subitem6Type,
  Subitem6TitleType,
  Subitem6SentenceType,
  Subitem7Type,
  Subitem7TitleType,
  Subitem7SentenceType,
  Subitem8Type,
  Subitem8TitleType,
  Subitem8SentenceType,
  Subitem9Type,
  Subitem9TitleType,
  Subitem9SentenceType,
  Subitem10Type,
  Subitem10TitleType,
  Subitem10SentenceType,
  AppdxTableType,
  AppdxTableTitleType,
  AppdxNoteType,
  AppdxNoteTitleType,
  NoteStructType,
  FigStructType,
  RelatedArticleNumType,
  RemarksType,
  RemarksLabelType,
  TableType,
  TableRowType,
  TableHeaderRowType,
  TableColumnType,
  TableHeaderColumnType,
  TableColumnAttributeType,
  TableStructType,
  PreambleType,
  ListType,
  ListSentenceType,
  Sublist1Type,
  Sublist1SentenceType,
  Sublist2Type,
  Sublist2SentenceType,
  Sublist3Type,
  Sublist3SentenceType,
  AppdxFigType,
  AppdxFigTitleType,
  FigType,
  EnactStatementType,
  AppdxStyleType,
  AppdxStyleTitleType,
  SupplProvisionAppdxTableType,
  SupplProvisionAppdxTableTitleType,
  SupplProvisionAppdxStyleType,
  SupplProvisionAppdxStyleTitleType,
  SupplProvisionAppdxType,
  AppdxFormatType,
  AppdxFormatTitleType,
  FormatStructType,
  FormatStructTitleType,
  FormatType,
  StyleStructType,
  AppdxType,
  ArithFormulaType,
  ArithFormulaNumType,
  NewProvisionType,
  AmendProvisionType,
  AmendProvisionSentenceType,
} from '../api/types/law';

/**
 * HTMLタグを生成する補助関数
 */
const tag = (
  name: string,
  attrs: Record<string, string | number | boolean> = {},
  children: string = ''
): string => {
  const attrStr = Object.entries(attrs)
    .filter(([_, value]) => value !== false && value !== undefined)
    .map(([key, value]) => {
      if (value === true) return key;
      return `${key}="${value}"`;
    })
    .join(' ');
  const openTag = attrStr ? `<${name} ${attrStr}>` : `<${name}>`;
  return `${openTag}${children}</${name}>`;
};

/**
 * TextNodeType配列をHTMLテキストに変換
 * src/api/components/law/text-node.tsx の getTextNode 関数を再現
 */
const renderTextNode = (val: Array<TextNodeType>, treeElement: string[]): string => {
  return val.map((dt, index) => {
    if ('Line' in dt) {
      // 下線・二重線等のスタイル
      const getLineStyle = (Style?: 'dotted' | 'double' | 'none' | 'solid'): string => {
        switch (Style) {
          case undefined:
            return 'text-decoration-line:underline;text-decoration-style:solid';
          case 'none':
            return 'text-decoration-line:none';
          default:
            return `text-decoration-line:${Style};text-decoration-style:solid`;
        }
      };
      const style = getLineStyle(dt.Style);
      return tag('span', { style }, renderTextNode(dt.Line, treeElement));
    } else if ('Ruby' in dt) {
      // ルビ
      const text = getType<TextType>(dt.Ruby, '_')[0]._;
      const rt = getType<RtType>(dt.Ruby, 'Rt')[0].Rt[0]._;
      return `<ruby>${text}<rt>${rt}</rt></ruby>`;
    } else if ('Sup' in dt) {
      // 上付き文字
      const text = getType<TextType>(dt.Sup, '_')[0]._;
      return tag('sup', { class: 'Sup' }, text);
    } else if ('Sub' in dt) {
      // 下付き文字
      const text = getType<TextType>(dt.Sub, '_')[0]._;
      return tag('sub', { class: 'Sub' }, text);
    } else if ('QuoteStruct' in dt) {
      // 引用構造 - QuoteStruct内の要素を処理（TableStruct等が含まれる可能性がある）
      // QuoteStructは配列でない場合があるので、配列に変換
      const quoteStructList = Array.isArray(dt.QuoteStruct) ? dt.QuoteStruct : [dt.QuoteStruct];
      return renderLawTypeList(quoteStructList, treeElement, 'QuoteStruct');
    } else if ('ArithFormula' in dt) {
      // 算術式 - React側と同じく<div class="pl-4">でラップ
      // Sub/Supタグを正しく<sub>/<sup>として出力（e-gov法令API仕様に準拠）
      const arithContent = dt.ArithFormula.map((item: any) => {
        if ('Sub' in item) {
          // 下付き文字を適切に出力
          const text = getType<TextType>(item.Sub, '_')[0]._;
          return tag('sub', { class: 'Sub' }, text);
        } else if ('Sup' in item) {
          // 上付き文字を適切に出力
          const text = getType<TextType>(item.Sup, '_')[0]._;
          return tag('sup', { class: 'Sup' }, text);
        } else if ('Fig' in item) {
          // ArithFormula内のFigを処理
          return renderFig(item, treeElement);
        } else if ('_' in item) {
          return item._;
        }
        return '';
      }).join('');
      return tag('div', { class: 'pl-4' }, arithContent);
    } else {
      // プレーンテキスト
      // 注意: dt._が数値の0の場合も正しく返す必要がある
      return dt._ !== undefined && dt._ !== null ? String(dt._) : '';
    }
  }).join('');
};

/**
 * LawTypeList配列をHTMLに変換
 * src/api/components/law/any.tsx の LawAny コンポーネントを再現
 * QuoteStruct, ArithFormula等の中に含まれる様々な要素を処理
 */
const renderLawTypeList = (
  lawTypeList: any[],
  treeElement: string[],
  parentElement: string
): string => {
  return lawTypeList.map((dt: any, index: number) => {
    const addTreeElement = [...treeElement, `${parentElement}_${index}`];

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, false);
    } else if ('TableStruct' in dt) {
      return renderTableStruct([dt], addTreeElement);
    } else if ('FigStruct' in dt) {
      return renderFigStruct([dt], addTreeElement);
    } else if ('Fig' in dt) {
      // QuoteStruct内に直接Figが含まれる場合の処理
      // dt自体を渡す（dt[':@'].srcにsrc属性がある）
      return renderFig(dt, addTreeElement);
    } else if ('StyleStruct' in dt) {
      return renderStyleStruct([dt], addTreeElement);
    } else if ('List' in dt) {
      return renderList([dt], addTreeElement);
    } else if ('Paragraph' in dt) {
      return renderParagraph([dt], addTreeElement, 0);
    } else if ('Item' in dt) {
      return renderItem([dt], addTreeElement, false);
    } else if ('Subitem1' in dt) {
      return renderSubitem1([dt], addTreeElement);
    } else if ('Subitem2' in dt) {
      return renderSubitem2([dt], addTreeElement);
    } else if ('Subitem3' in dt) {
      return renderSubitem3([dt], addTreeElement);
    } else if ('Subitem4' in dt) {
      return renderSubitem4([dt], addTreeElement);
    } else if ('Subitem5' in dt) {
      return renderSubitem5([dt], addTreeElement);
    } else if ('Subitem6' in dt) {
      return renderSubitem6([dt], addTreeElement);
    } else if ('Subitem7' in dt) {
      return renderSubitem7([dt], addTreeElement);
    } else if ('Subitem8' in dt) {
      return renderSubitem8([dt], addTreeElement);
    } else if ('Subitem9' in dt) {
      return renderSubitem9([dt], addTreeElement);
    } else if ('Subitem10' in dt) {
      return renderSubitem10([dt], addTreeElement);
    } else if ('AppdxTable' in dt) {
      return renderAppdxTable([dt], addTreeElement);
    } else if ('AppdxNote' in dt) {
      return renderAppdxNote([dt], addTreeElement);
    } else if ('AppdxStyle' in dt) {
      return renderAppdxStyle(dt, addTreeElement);
    } else if ('Appdx' in dt) {
      return renderAppdx([dt], addTreeElement);
    } else if ('AppdxFig' in dt) {
      return renderAppdxFig(dt, addTreeElement);
    } else if ('AppdxFormat' in dt) {
      return renderAppdxFormat(dt, addTreeElement);
    } else if ('TOC' in dt) {
      return renderTOC(dt, addTreeElement);
    } else {
      // その他の要素型は空文字列を返す（React側と同じくTableは処理しない）
      return '';
    }
  }).join('');
};

/**
 * SentenceType配列をHTMLに変換
 * src/api/components/law/sentence.tsx の LawSentence コンポーネントを再現
 */
const renderSentence = (
  sentenceList: SentenceType[],
  treeElement: string[],
  isPrecedingSentence: boolean
): string => {
  return sentenceList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Sentence_${index}`];
    const textContent = renderTextNode(dt.Sentence, addTreeElement);

    if (getParentElement(treeElement) === 'Remarks') {
      return tag('div', {}, textContent + ' ');
    } else {
      // TableColumn, ArithFormula の場合は改行が入る可能性あり（Reactコードでは空文字列出力）
      return textContent;
    }
  }).join('');
};

/**
 * ColumnType配列をHTMLに変換
 * src/api/components/law/column.tsx の LawColumn コンポーネントを再現
 */
const renderColumn = (columnList: ColumnType[], treeElement: string[]): string => {
  let isLineBreak = false;
  return columnList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Column_${index}`];

    if (!isLineBreak && (dt[':@'].LineBreak === undefined || !dt[':@'].LineBreak)) {
      isLineBreak = true;
    }

    let result = '';

    // index > 0 && isLineBreak の場合、全角スペース追加
    if (index > 0 && isLineBreak) {
      result += '　';
    }

    // Num > 1 の場合も全角スペース追加（樋口追記コメントより）
    if (dt[':@'].Num && Number(dt[':@'].Num) > 1) {
      result += '　';
    }

    result += renderSentence(dt.Column, addTreeElement, false);

    if (dt[':@'].LineBreak) {
      result += '<br>';
    }

    return result;
  }).join('');
};

/**
 * ParagraphSentenceTypeをHTMLに変換
 * src/api/components/law/paragraph-sentence.tsx の LawParagraphSentence コンポーネントを再現
 */
const renderParagraphSentence = (
  paragraphSentence: ParagraphSentenceType,
  treeElement: string[]
): string => {
  const Sentence = getType<SentenceType>(
    paragraphSentence.ParagraphSentence,
    'Sentence'
  );
  return renderSentence(Sentence, [...treeElement, 'ParagraphSentence'], false);
};

/**
 * ItemSentenceTypeをHTMLに変換
 * src/api/components/law/item-sentence.tsx の LawItemSentence コンポーネントを再現
 */
const renderItemSentence = (
  itemSentence: ItemSentenceType,
  treeElement: string[]
): string => {
  return itemSentence.ItemSentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `ItemSentence_${index}`];

    if ('Sentence' in dt) {
      const isPrecedingSentence =
        index > 0 &&
        itemSentence.ItemSentence.slice(0, index).some((dt) => 'Sentence' in dt);
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);
    } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * 項番号ラベルを取得
 * src/api/components/law/paragraph.tsx の getOldNumLabel 関数を再現
 */
const getOldNumLabel = (val: number): string => {
  const numLabelList = [
    '⓪', '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨',
    '⑩', '⑪', '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱',
    '⑲', '⑳', '㉑', '㉒', '㉓', '㉔', '㉕', '㉖', '㉗', '㉘',
    '㉙', '㉚', '㉛', '㉜', '㉝', '㉞', '㉟', '㊱', '㊲', '㊳',
    '㊴', '㊵', '㊶', '㊷', '㊸', '㊹', '㊺', '㊻', '㊼', '㊽',
    '㊾', '㊿',
  ];
  return val < numLabelList.length ? numLabelList[val] : val.toString();
};

/**
 * 祖先ノードの内に２件目以降のParagraphが存在するか
 * src/api/components/law/subitem.tsx の isParentParagraphPreceding 関数を再現
 */
const isParentParagraphPreceding = (treeElement: string[]): boolean => {
  return treeElement.some((dt) => {
    const spDt = dt.split('_');
    if (spDt[0] === 'Paragraph') {
      return spDt[1] !== '0';
    }
    return false;
  });
};

/**
 * Subitem1SentenceType をHTMLに変換
 * src/api/components/law/subitem-sentence.tsx の LawSubitem1Sentence コンポーネントを再現
 */
const renderSubitem1Sentence = (
  subitem1Sentence: Subitem1SentenceType,
  treeElement: string[]
): string => {
  return subitem1Sentence.Subitem1Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem1Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem1Sentence.Subitem1Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);
    } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem2SentenceType をHTMLに変換
 */
const renderSubitem2Sentence = (
  subitem2Sentence: Subitem2SentenceType,
  treeElement: string[]
): string => {
  return subitem2Sentence.Subitem2Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem2Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem2Sentence.Subitem2Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);
    } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem3SentenceType をHTMLに変換
 */
const renderSubitem3Sentence = (
  subitem3Sentence: Subitem3SentenceType,
  treeElement: string[]
): string => {
  return subitem3Sentence.Subitem3Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem3Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem3Sentence.Subitem3Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem4SentenceType をHTMLに変換
 */
const renderSubitem4Sentence = (
  subitem4Sentence: Subitem4SentenceType,
  treeElement: string[]
): string => {
  return subitem4Sentence.Subitem4Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem4Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem4Sentence.Subitem4Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem5SentenceType をHTMLに変換
 */
const renderSubitem5Sentence = (
  subitem5Sentence: Subitem5SentenceType,
  treeElement: string[]
): string => {
  return subitem5Sentence.Subitem5Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem5Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem5Sentence.Subitem5Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem6SentenceType をHTMLに変換
 */
const renderSubitem6Sentence = (
  subitem6Sentence: Subitem6SentenceType,
  treeElement: string[]
): string => {
  return subitem6Sentence.Subitem6Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem6Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem6Sentence.Subitem6Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem7SentenceType をHTMLに変換
 */
const renderSubitem7Sentence = (
  subitem7Sentence: Subitem7SentenceType,
  treeElement: string[]
): string => {
  return subitem7Sentence.Subitem7Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem7Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem7Sentence.Subitem7Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem8SentenceType をHTMLに変換
 */
const renderSubitem8Sentence = (
  subitem8Sentence: Subitem8SentenceType,
  treeElement: string[]
): string => {
  return subitem8Sentence.Subitem8Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem8Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem8Sentence.Subitem8Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem9SentenceType をHTMLに変換
 */
const renderSubitem9Sentence = (
  subitem9Sentence: Subitem9SentenceType,
  treeElement: string[]
): string => {
  return subitem9Sentence.Subitem9Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem9Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem9Sentence.Subitem9Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem10SentenceType をHTMLに変換
 */
const renderSubitem10Sentence = (
  subitem10Sentence: Subitem10SentenceType,
  treeElement: string[]
): string => {
  return subitem10Sentence.Subitem10Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem10Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem10Sentence.Subitem10Sentence.slice(0, index).some((dt) => 'Sentence' in dt);

    if ('Sentence' in dt) {
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      return renderColumn([dt], addTreeElement);

      } else if ('Table' in dt) {
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * Subitem10Type配列をHTMLに変換
 */
const renderSubitem10 = (
  subitem10List: Subitem10Type[],
  treeElement: string[]
): string => {
  return subitem10List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem10_${index}`];
    const Subitem10Title = getType<Subitem10TitleType>(dt.Subitem10, 'Subitem10Title');
    const Subitem10Sentence = getType<Subitem10SentenceType>(dt.Subitem10, 'Subitem10Sentence')[0];

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-48' : 'pl-44';

    let content = '';
    if (Subitem10Title.length > 0) {
      const titleText = renderTextNode(Subitem10Title[0].Subitem10Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem10Sentence(Subitem10Sentence, addTreeElement);

    dt.Subitem10.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem10_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return tag('div', { class: `_div_Subitem10Sentence ${paddingClass} indent-1` }, content);
  }).join('');
};

/**
 * Subitem9Type配列をHTMLに変換
 */
const renderSubitem9 = (
  subitem9List: Subitem9Type[],
  treeElement: string[]
): string => {
  return subitem9List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem9_${index}`];
    const Subitem9Title = getType<Subitem9TitleType>(dt.Subitem9, 'Subitem9Title');
    const Subitem9Sentence = getType<Subitem9SentenceType>(dt.Subitem9, 'Subitem9Sentence')[0];
    const Subitem10 = getType<Subitem10Type>(dt.Subitem9, 'Subitem10');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-44' : 'pl-40';

    let content = '';
    if (Subitem9Title.length > 0) {
      const titleText = renderTextNode(Subitem9Title[0].Subitem9Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem9Sentence(Subitem9Sentence, addTreeElement);

    dt.Subitem9.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem9_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem9Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem10(Subitem10, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem8Type配列をHTMLに変換
 */
const renderSubitem8 = (
  subitem8List: Subitem8Type[],
  treeElement: string[]
): string => {
  return subitem8List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem8_${index}`];
    const Subitem8Title = getType<Subitem8TitleType>(dt.Subitem8, 'Subitem8Title');
    const Subitem8Sentence = getType<Subitem8SentenceType>(dt.Subitem8, 'Subitem8Sentence')[0];
    const Subitem9 = getType<Subitem9Type>(dt.Subitem8, 'Subitem9');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-40' : 'pl-36';

    let content = '';
    if (Subitem8Title.length > 0) {
      const titleText = renderTextNode(Subitem8Title[0].Subitem8Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem8Sentence(Subitem8Sentence, addTreeElement);

    dt.Subitem8.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem8_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem8Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem9(Subitem9, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem7Type配列をHTMLに変換
 */
const renderSubitem7 = (
  subitem7List: Subitem7Type[],
  treeElement: string[]
): string => {
  return subitem7List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem7_${index}`];
    const Subitem7Title = getType<Subitem7TitleType>(dt.Subitem7, 'Subitem7Title');
    const Subitem7Sentence = getType<Subitem7SentenceType>(dt.Subitem7, 'Subitem7Sentence')[0];
    const Subitem8 = getType<Subitem8Type>(dt.Subitem7, 'Subitem8');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-36' : 'pl-32';

    let content = '';
    if (Subitem7Title.length > 0) {
      const titleText = renderTextNode(Subitem7Title[0].Subitem7Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem7Sentence(Subitem7Sentence, addTreeElement);

    dt.Subitem7.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem7_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem7Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem8(Subitem8, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem6Type配列をHTMLに変換
 */
const renderSubitem6 = (
  subitem6List: Subitem6Type[],
  treeElement: string[]
): string => {
  return subitem6List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem6_${index}`];
    const Subitem6Title = getType<Subitem6TitleType>(dt.Subitem6, 'Subitem6Title');
    const Subitem6Sentence = getType<Subitem6SentenceType>(dt.Subitem6, 'Subitem6Sentence')[0];
    const Subitem7 = getType<Subitem7Type>(dt.Subitem6, 'Subitem7');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-32' : 'pl-28';

    let content = '';
    if (Subitem6Title.length > 0) {
      const titleText = renderTextNode(Subitem6Title[0].Subitem6Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem6Sentence(Subitem6Sentence, addTreeElement);

    dt.Subitem6.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem6_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem6Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem7(Subitem7, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem5Type配列をHTMLに変換
 */
const renderSubitem5 = (
  subitem5List: Subitem5Type[],
  treeElement: string[]
): string => {
  return subitem5List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem5_${index}`];
    const Subitem5Title = getType<Subitem5TitleType>(dt.Subitem5, 'Subitem5Title');
    const Subitem5Sentence = getType<Subitem5SentenceType>(dt.Subitem5, 'Subitem5Sentence')[0];
    const Subitem6 = getType<Subitem6Type>(dt.Subitem5, 'Subitem6');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-28' : 'pl-24';

    let content = '';
    if (Subitem5Title.length > 0) {
      const titleText = renderTextNode(Subitem5Title[0].Subitem5Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem5Sentence(Subitem5Sentence, addTreeElement);

    dt.Subitem5.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem5_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem5Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem6(Subitem6, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem4Type配列をHTMLに変換
 */
const renderSubitem4 = (
  subitem4List: Subitem4Type[],
  treeElement: string[]
): string => {
  return subitem4List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem4_${index}`];
    const Subitem4Title = getType<Subitem4TitleType>(dt.Subitem4, 'Subitem4Title');
    const Subitem4Sentence = getType<Subitem4SentenceType>(dt.Subitem4, 'Subitem4Sentence')[0];
    const Subitem5 = getType<Subitem5Type>(dt.Subitem4, 'Subitem5');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-24' : 'pl-20';

    let content = '';
    if (Subitem4Title.length > 0) {
      const titleText = renderTextNode(Subitem4Title[0].Subitem4Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem4Sentence(Subitem4Sentence, addTreeElement);

    // React版と同様に、dt.Subitem4配列からTableStruct, FigStruct, StyleStruct, Listを処理
    dt.Subitem4.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem4_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem4Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem5(Subitem5, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem3Type配列をHTMLに変換
 */
const renderSubitem3 = (
  subitem3List: Subitem3Type[],
  treeElement: string[]
): string => {
  return subitem3List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem3_${index}`];
    const Subitem3Title = getType<Subitem3TitleType>(dt.Subitem3, 'Subitem3Title');
    const Subitem3Sentence = getType<Subitem3SentenceType>(dt.Subitem3, 'Subitem3Sentence')[0];
    const Subitem4 = getType<Subitem4Type>(dt.Subitem3, 'Subitem4');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-20' : 'pl-16';

    let content = '';
    if (Subitem3Title.length > 0) {
      const titleText = renderTextNode(Subitem3Title[0].Subitem3Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem3Sentence(Subitem3Sentence, addTreeElement);

    // React版と同様に、dt.Subitem3配列からTableStruct, FigStruct, StyleStruct, Listを処理
    dt.Subitem3.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem3_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem3Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem4(Subitem4, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem2Type配列をHTMLに変換
 */
const renderSubitem2 = (
  subitem2List: Subitem2Type[],
  treeElement: string[]
): string => {
  return subitem2List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem2_${index}`];
    const Subitem2Title = getType<Subitem2TitleType>(dt.Subitem2, 'Subitem2Title');
    const Subitem2Sentence = getType<Subitem2SentenceType>(dt.Subitem2, 'Subitem2Sentence')[0];
    const Subitem3 = getType<Subitem3Type>(dt.Subitem2, 'Subitem3');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-16' : 'pl-12';

    let content = '';
    if (Subitem2Title.length > 0) {
      const titleText = renderTextNode(Subitem2Title[0].Subitem2Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem2Sentence(Subitem2Sentence, addTreeElement);

    // React版と同様に、dt.Subitem2配列からTableStruct, FigStruct, StyleStruct, Listを処理
    // これらの要素は_div_Subitem2Sentenceの中に出力される
    dt.Subitem2.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem2_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem2Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem3(Subitem3, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem1Type配列をHTMLに変換
 * src/api/components/law/subitem.tsx の LawSubitem1 コンポーネントを再現
 */
const renderSubitem1 = (
  subitem1List: Subitem1Type[],
  treeElement: string[]
): string => {
  return subitem1List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem1_${index}`];
    const Subitem1Title = getType<Subitem1TitleType>(dt.Subitem1, 'Subitem1Title');
    const Subitem1Sentence = getType<Subitem1SentenceType>(dt.Subitem1, 'Subitem1Sentence')[0];
    const Subitem2 = getType<Subitem2Type>(dt.Subitem1, 'Subitem2');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-12' : 'pl-8';

    let content = '';
    if (Subitem1Title.length > 0) {
      const titleText = renderTextNode(Subitem1Title[0].Subitem1Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }
    content += renderSubitem1Sentence(Subitem1Sentence, addTreeElement);

    // React版と同様に、dt.Subitem1配列からTableStruct, FigStruct, StyleStruct, Listを処理
    // これらの要素は_div_Subitem1Sentenceの中に出力される
    dt.Subitem1.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem1_${index}`, `Child_${index2}`];
      if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        content += renderList([dt2], addTreeElement2);
      }
    });

    return (
      tag('div', { class: `_div_Subitem1Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem2(Subitem2, addTreeElement)
    );
  }).join('');
};

/**
 * ItemType配列をHTMLに変換
 * src/api/components/law/item.tsx の LawItem コンポーネントを再現
 */
const renderItem = (
  itemList: ItemType[],
  treeElement: string[],
  isPrecedingParagraph: boolean
): string => {
  // padding クラスを決定
  const padding = () => {
    if (
      (treeElement.some((dt) => /^TableColumn.*/.test(dt)) &&
        getParentElement(treeElement) === 'Paragraph') ||
      (treeElement.some((dt) => /^Paragraph_.*/.test(dt)) &&
        isPrecedingParagraph)
    ) {
      return 'pl-8';
    } else {
      return 'pl-4';
    }
  };

  return itemList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Item_${index}`];
    const ItemTitle = getType<ItemTitleType>(dt.Item, 'ItemTitle');
    const ItemSentence = getType<ItemSentenceType>(dt.Item, 'ItemSentence')[0];

    // Subitem1を取得 - getTypeで見つからない場合は、dt.Item配列を直接フィルタリング
    let Subitem1 = getType<Subitem1Type>(dt.Item, 'Subitem1');
    if (Subitem1.length === 0) {
      // dt.Item配列から直接Subitem1を持つ要素を抽出
      const subitem1Elements = dt.Item.filter((item: any) => 'Subitem1' in item);
      if (subitem1Elements.length > 0) {
        // Subitem1要素を配列として抽出
        Subitem1 = subitem1Elements.flatMap((item: any) =>
          Array.isArray(item.Subitem1) ? item.Subitem1 : [item.Subitem1]
        ).map((s: any) => ({ Subitem1: s })) as any;
      }
    }

    let content = '';

    // ItemTitle があればボールド表示
    if (ItemTitle.length > 0) {
      const titleText = renderTextNode(ItemTitle[0].ItemTitle, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }

    // ItemSentence の内容
    content += renderItemSentence(ItemSentence, addTreeElement);

    // ItemSentenceのdivを出力
    const itemSentenceHtml = tag('div', { class: `_div_ItemSentence ${padding()} indent-1` }, content);

    // Subitem1のレンダリング
    const subitem1Html = renderSubitem1(Subitem1, addTreeElement);

    // 子要素（List, TableStruct, FigStruct, StyleStruct）のレンダリング
    // React側と同様に dt.Item 配列をループして処理
    let childrenHtml = '';
    dt.Item.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Item_${index}`, `Child_${index2}`];
      if ('List' in dt2) {
        childrenHtml += renderList([dt2], addTreeElement2);
      } else if ('TableStruct' in dt2) {
        childrenHtml += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childrenHtml += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childrenHtml += renderStyleStruct([dt2], addTreeElement2);
      }
    });

    // すべてのHTMLを結合
    return itemSentenceHtml + subitem1Html + childrenHtml;
  }).join('');
};

/**
 * AmendProvisionSentenceType をHTMLに変換
 * src/api/components/law/amend-provision-sentence.tsx の LawAmendProvisionSentence コンポーネントを再現
 */
const renderAmendProvisionSentence = (
  amendProvisionSentence: any,
  treeElement: string[]
): string => {
  const Sentence = getType(amendProvisionSentence.AmendProvisionSentence, 'Sentence');
  return renderSentence(Sentence as any, [...treeElement, 'AmendProvisionSentence'], false);
};

/**
 * NewProvisionType配列をHTMLに変換
 * src/api/components/law/new-provision.tsx の LawNewProvision コンポーネントを再現
 */
const renderNewProvision = (
  newProvisionList: NewProvisionType[],
  treeElement: string[]
): string => {
  let isParagraph = false;
  let paragraphIndex = 0;

  return newProvisionList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `NewProvision_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    return dt.NewProvision.map((dt2, index2) => {
      const childTreeElement = addTreeElement(index2);

      // FigStruct処理
      if ('FigStruct' in dt2) {
        return renderFigStruct([dt2], childTreeElement);
      }
      // TableStruct処理
      else if ('TableStruct' in dt2) {
        return renderTableStruct([dt2], childTreeElement);
      }
      // Paragraph処理
      else if ('Paragraph' in dt2) {
        isParagraph = true;
        paragraphIndex++;
        return renderParagraph([dt2], childTreeElement, paragraphIndex - 1);
      }
      // Item処理
      else if ('Item' in dt2) {
        return renderItem([dt2], childTreeElement, isParagraph);
      }
      // Article処理
      else if ('Article' in dt2) {
        return renderArticle([dt2], childTreeElement);
      }
      // Section処理
      else if ('Section' in dt2) {
        return renderSection([dt2], childTreeElement);
      }
      // Chapter処理
      else if ('Chapter' in dt2) {
        return renderChapter([dt2], childTreeElement);
      }
      // Part処理
      else if ('Part' in dt2) {
        return renderPart([dt2], childTreeElement);
      }
      // List処理
      else if ('List' in dt2) {
        return renderList([dt2], childTreeElement);
      }
      // Sentence処理
      else if ('Sentence' in dt2) {
        const isPrecedingSentence = index2 > 0 &&
          dt.NewProvision.slice(0, index2).some((item: any) => 'Sentence' in item);
        return renderSentence([dt2], childTreeElement, isPrecedingSentence);
      }
      // Remarks処理
      else if ('Remarks' in dt2) {
        return renderRemarks([dt2], childTreeElement);
      }
      // AppdxTable処理
      else if ('AppdxTable' in dt2) {
        return renderAppdxTable([dt2], childTreeElement);
      }
      // AppdxNote処理
      else if ('AppdxNote' in dt2) {
        return renderAppdxNote([dt2], childTreeElement);
      }
      // StyleStruct処理
      else if ('StyleStruct' in dt2) {
        return renderStyleStruct([dt2], childTreeElement);
      }
      // FormatStruct処理
      else if ('FormatStruct' in dt2) {
        return renderFormatStruct([dt2], childTreeElement);
      }
      // NoteStruct処理
      else if ('NoteStruct' in dt2) {
        return renderNoteStruct(dt2, childTreeElement);
      }
      // その他のサポートされていない要素はスキップ
      return '';
    }).join('');
  }).join('');
};

/**
 * AmendProvisionType配列をHTMLに変換
 * src/api/components/law/amend-provision.tsx の LawAmendProvision コンポーネントを再現
 */
const renderAmendProvision = (
  amendProvisionList: any[],
  treeElement: string[]
): string => {
  return amendProvisionList.map((dt, index) => {
    const addTreeElement = [...treeElement, `AmendProvision_${index}`];
    const AmendProvisionSentence = getType(dt.AmendProvision, 'AmendProvisionSentence');
    const NewProvision = getType<NewProvisionType>(dt.AmendProvision, 'NewProvision');

    let html = '';

    // AmendProvisionSentence処理
    if (AmendProvisionSentence.length > 0) {
      const parentElement = getParentElement(treeElement);
      const paddingClass = ['Paragraph', 'Article'].includes(parentElement) ? 'pl-4' : '';
      const sentenceHtml = renderAmendProvisionSentence(AmendProvisionSentence[0], addTreeElement);
      html += tag('div', { class: `_div_AmendProvisionSentence ${paddingClass} indent-1` }, sentenceHtml);
    }

    // NewProvision処理
    if (NewProvision.length > 0) {
      const newProvisionContent = renderNewProvision(NewProvision, addTreeElement);
      html += tag('div', { class: 'pl-4' }, newProvisionContent);
    }

    return html;
  }).join('');
};

/**
 * ParagraphType配列をHTMLに変換
 * src/api/components/law/paragraph.tsx の LawParagraph コンポーネントを再現
 */
const renderParagraph = (
  paragraphList: ParagraphType[],
  treeElement: string[],
  parentParagraphIndex: number
): string => {
  return paragraphList.map((dt, index) => {
    const addTreeElement = [
      ...treeElement,
      `Paragraph_${index + parentParagraphIndex}`,
    ];

    const ParagraphCaption = getType<ParagraphCaptionType>(dt.Paragraph, 'ParagraphCaption');
    const ParagraphNum = getType<ParagraphNumType>(dt.Paragraph, 'ParagraphNum')[0];
    const ParagraphSentence = getType<ParagraphSentenceType>(dt.Paragraph, 'ParagraphSentence')[0];

    // 項番号ノード
    let paragraphNumNode = '';
    if (dt[':@'].OldNum !== undefined && dt[':@'].OldNum) {
      paragraphNumNode = tag('span', { class: 'font-bold' }, getOldNumLabel(dt[':@'].Num)) + '　';
    } else if (ParagraphNum.ParagraphNum.length > 0) {
      const numText = renderTextNode(ParagraphNum.ParagraphNum, addTreeElement);
      paragraphNumNode = tag('span', { class: 'font-bold' }, numText) + '　';
    }

    // 項キャプション（見出し）
    let captionHtml = '';
    if (ParagraphCaption.length > 0) {
      const captionText = renderTextNode(
        ParagraphCaption[0].ParagraphCaption,
        addTreeElement
      );
      captionHtml = tag('div', { class: '_div_ParagraphCaption font-bold pl-4' }, captionText);
    }

    // 項文のdiv
    const sentenceClass = ParagraphNum.ParagraphNum.length > 0
      ? '_div_ParagraphSentence pl-4 indent-1'
      : '_div_ParagraphSentence indent1';

    const sentenceContent = paragraphNumNode + renderParagraphSentence(ParagraphSentence, addTreeElement);
    const sentenceHtml = tag('div', { class: sentenceClass }, sentenceContent);

    // 子要素（Item, TableStruct, FigStruct, List等）のレンダリング
    // React版と同じく、dt.Paragraph配列を順番に処理することで正しい順序を維持
    let childrenHtml = '';
    dt.Paragraph.forEach((dt2: any, index2: number) => {
      const addTreeElementChild = [
        ...treeElement,
        `Paragraph_${index + parentParagraphIndex}_Child_${index2}`
      ];
      if ('AmendProvision' in dt2) {
        childrenHtml += renderAmendProvision([dt2], addTreeElementChild);
      } else if ('Class' in dt2) {
        // Class処理（未実装の場合はスキップ）
      } else if ('TableStruct' in dt2) {
        childrenHtml += renderTableStruct([dt2], addTreeElementChild);
      } else if ('FigStruct' in dt2) {
        childrenHtml += renderFigStruct([dt2], addTreeElementChild);
      } else if ('StyleStruct' in dt2) {
        childrenHtml += renderStyleStruct([dt2], addTreeElementChild);
      } else if ('Item' in dt2) {
        childrenHtml += renderItem([dt2], addTreeElementChild, index + parentParagraphIndex > 0);
      } else if ('List' in dt2) {
        childrenHtml += renderList([dt2], addTreeElementChild);
      }
    });

    // 親要素に応じてラッピング
    const parentElement = getParentElement(treeElement);

    if (parentElement === 'TableColumn') {
      // TableColumn内のParagraphの場合、divでラップせず、直接出力
      // 子要素がある場合やindex > 0の場合は<br />を追加
      const hasChildren = childrenHtml.length > 0;
      const brTag = (hasChildren || index > 0) ? '<br>' : '';
      return paragraphNumNode + renderParagraphSentence(ParagraphSentence, addTreeElement) + brTag + childrenHtml;
    } else if (parentElement === 'Article' && index + parentParagraphIndex === 0) {
      // Article の第1項の場合、ArticleTitle に直接続ける（div不要）
      return renderParagraphSentence(ParagraphSentence, addTreeElement) + childrenHtml;
    } else if (['MainProvision', 'SupplProvision'].includes(parentElement)) {
      // MainProvision, SupplProvision直下の場合、sectionで囲む
      return tag('section', { class: 'active Paragraph' }, captionHtml + sentenceHtml + childrenHtml);
    } else {
      // その他の場合
      return captionHtml + sentenceHtml + childrenHtml;
    }
  }).join('');
};

/**
 * DivisionTypeをHTMLに変換
 * src/api/components/law/division.tsx の LawDivision コンポーネントを再現
 */
const renderDivision = (
  divisionList: DivisionType[],
  treeElement: string[]
): string => {
  return divisionList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Division_${index}`];

    const DivisionTitle = getType<DivisionTitleType>(dt.Division, 'DivisionTitle')[0];
    const Article = getType<ArticleType>(dt.Division, 'Article');

    let content = '';

    // DivisionTitle
    content += tag('section', { class: 'active Division' },
      tag('div', { class: '_div_DivisionTitle DivisionTitle pl-24 font-bold' },
        renderTextNode(DivisionTitle.DivisionTitle, addTreeElement)
      )
    );

    // Article
    content += renderArticle(Article, addTreeElement);

    return content;
  }).join('');
};

/**
 * SubsectionTypeをHTMLに変換
 * src/api/components/law/subsection.tsx の LawSubsection コンポーネントを再現
 */
const renderSubsection = (
  subsectionList: SubsectionType[],
  treeElement: string[]
): string => {
  return subsectionList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `Subsection_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const SubsectionTitle = getType<SubsectionTitleType>(dt.Subsection, 'SubsectionTitle')[0];

    let content = '';

    // SubsectionTitle
    content += tag('section', {},
      tag('div', { class: 'SubsectionTitle _div_SubsectionTitle pl-5 font-bold' },
        renderTextNode(SubsectionTitle.SubsectionTitle, addTreeElement())
      )
    );

    // 子要素（Article、Division）
    dt.Subsection.forEach((dt2, index2) => {
      if ('Article' in dt2) {
        content += renderArticle([dt2], addTreeElement(index2));
      } else if ('Division' in dt2) {
        content += renderDivision([dt2], addTreeElement(index2));
      }
    });

    return content;
  }).join('');
};

/**
 * SectionTypeをHTMLに変換
 * src/api/components/law/section.tsx の LawSection コンポーネントを再現
 */
const renderSection = (
  sectionList: SectionType[],
  treeElement: string[]
): string => {
  return sectionList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `Section_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const SectionTitle = getType<SectionTitleType>(dt.Section, 'SectionTitle')[0];

    let content = '';

    // SectionTitle
    content += tag('section', { class: 'active Section pb-4' },
      tag('div', { class: 'SectionTitle _div_SectionTitle pl-16 font-bold' },
        renderTextNode(SectionTitle.SectionTitle, addTreeElement())
      )
    );

    // 子要素（Article、Subsection、Division）
    dt.Section.forEach((dt2, index2) => {
      if ('Article' in dt2) {
        content += renderArticle([dt2], addTreeElement(index2));
      } else if ('Subsection' in dt2) {
        content += renderSubsection([dt2], addTreeElement(index2));
      } else if ('Division' in dt2) {
        content += renderDivision([dt2], addTreeElement(index2));
      }
    });

    return content;
  }).join('');
};

/**
 * ChapterTypeをHTMLに変換
 * src/api/components/law/chapter.tsx の LawChapter コンポーネントを再現
 */
const renderChapter = (
  chapterList: ChapterType[],
  treeElement: string[]
): string => {
  return chapterList.map((chapter, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `Chapter_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const ChapterTitle = getType<ChapterTitleType>(chapter.Chapter, 'ChapterTitle')[0];

    let content = '';

    // ChapterTitle
    content += tag('section', { class: 'active Chapter pb-4' },
      tag('div', { class: 'ChapterTitle _div_ChapterTitle font-bold pl-12' },
        renderTextNode(ChapterTitle.ChapterTitle, addTreeElement())
      )
    );

    // 子要素（Article、Section）
    chapter.Chapter.forEach((dt2, index2) => {
      if ('Article' in dt2) {
        content += renderArticle([dt2], addTreeElement(index2));
      } else if ('Section' in dt2) {
        content += renderSection([dt2], addTreeElement(index2));
      }
    });

    return content;
  }).join('');
};

/**
 * PartTypeをHTMLに変換
 * src/api/components/law/part.tsx の LawPart コンポーネントを再現
 */
const renderPart = (
  partList: PartType[],
  treeElement: string[]
): string => {
  return partList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `Part_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const PartTitle = getType<PartTitleType>(dt.Part, 'PartTitle')[0];

    let content = '';

    // PartTitle
    content += tag('section', { class: 'active Part followingPart Part pb-4' },
      tag('div', { class: '_div_PartTitle PartTitle font-bold pl-8' },
        renderTextNode(PartTitle.PartTitle, addTreeElement())
      )
    );

    // 子要素（Chapter、Article）
    dt.Part.forEach((dt2, index2) => {
      if ('Chapter' in dt2) {
        content += renderChapter([dt2], addTreeElement(index2));
      } else if ('Article' in dt2) {
        content += renderArticle([dt2], addTreeElement(index2));
      }
    });

    return content;
  }).join('');
};

/**
 * ArticleType配列をHTMLに変換
 * src/api/components/law/article.tsx の LawArticle コンポーネントを再現
 */
const renderArticle = (
  articleList: ArticleType[],
  treeElement: string[]
): string => {
  return articleList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Article_${index}`];

    const ArticleCaption = getType<ArticleCaptionType>(dt.Article, 'ArticleCaption');
    const ArticleTitle = getType<ArticleTitleType>(dt.Article, 'ArticleTitle')[0];
    const Paragraph = getType<ParagraphType>(dt.Article, 'Paragraph');
    const SupplNote = getType<SupplNoteType>(dt.Article, 'SupplNote');

    let content = '';

    // ArticleCaption（条の見出し）- Article[0]にある場合
    if ('ArticleCaption' in dt.Article[0]) {
      const captionText = renderTextNode(
        ArticleCaption[0].ArticleCaption,
        addTreeElement
      );
      content += tag('div', { class: '_div_ArticleCaption font-bold pl-4' }, captionText);
    }

    // ArticleTitle（条タイトル）+ 第1項
    let articleTitleContent = '';

    // ArticleTitleのテキスト
    const titleText = renderTextNode(ArticleTitle.ArticleTitle, addTreeElement);
    articleTitleContent += tag('span', { class: 'font-bold' }, titleText);

    // ArticleCaption が Article[1] にある場合（稀なケース）
    if ('ArticleCaption' in dt.Article[1]) {
      const captionText = renderTextNode(
        ArticleCaption[0].ArticleCaption,
        addTreeElement
      );
      articleTitleContent += tag('span', { class: 'font-bold' }, captionText);
    }

    // 全角スペース
    articleTitleContent += '　';

    // 第1項（項番号なし）
    articleTitleContent += renderParagraph([Paragraph[0]], addTreeElement, 0);

    content += tag('div', { class: '_div_ArticleTitle pl-4 indent-1' }, articleTitleContent);

    // 第2項以降
    if (Paragraph.length > 1) {
      content += renderParagraph(
        Paragraph.filter((dt, i) => i > 0),
        [...treeElement, `Article_${index}_Second`],
        1
      );
    }

    // SupplNote（補足）
    if (SupplNote.length > 0) {
      const noteText = renderTextNode(SupplNote[0].SupplNote, addTreeElement);
      content += tag('div', { class: '_div_SupplNote pl-8 indent-1' }, noteText);
    }

    return tag('section', { class: 'active Article pb-4' }, content);
  }).join('');
};

/**
 * MainProvisionTypeをHTMLに変換
 * src/api/components/law/main-provision.tsx の LawMainProvision コンポーネントを再現
 */
const renderMainProvision = (
  mainProvision: MainProvisionType,
  treeElement: string[]
): string => {
  let paragraphIndex = 0;

  return mainProvision.MainProvision.map((dt, index) => {
    const addTreeElement = [...treeElement, `MainProvision_${index}`];

    if ('Chapter' in dt) {
      return renderChapter([dt], addTreeElement);
    } else if ('Paragraph' in dt) {
      paragraphIndex++;
      return renderParagraph([dt], addTreeElement, paragraphIndex - 1);
    } else if ('Article' in dt) {
      return renderArticle([dt], addTreeElement);
    } else if ('Part' in dt) {
      return renderPart([dt], addTreeElement);
    } else if ('Section' in dt) {
      return renderSection([dt], addTreeElement);
    } else {
      return '';
    }
  }).join('');
};

/**
 * SupplProvisionTypeをHTMLに変換
 * src/api/components/law/suppl-provision.tsx の LawSupplProvision コンポーネントを再現
 */
const renderSupplProvision = (
  supplProvision: SupplProvisionType,
  treeElement: string[],
  index: number
): string => {
  const addTreeElement = (childNum?: number) => [
    ...treeElement,
    `SupplProvision_${index}${childNum ? `_Child${childNum > 1 ? `_${childNum}` : ''}` : ''}`,
  ];

  const SupplProvisionLabel: SupplProvisionLabelType =
    getTypeByFind<SupplProvisionLabelType>(
      supplProvision.SupplProvision,
      'SupplProvisionLabel'
    ) ?? ([] as unknown as SupplProvisionLabelType);

  const Paragraph = getType<ParagraphType>(
    supplProvision.SupplProvision,
    'Paragraph'
  );

  const Article = getType<ArticleType>(
    supplProvision.SupplProvision,
    'Article'
  );

  const Chapter = getType<ChapterType>(
    supplProvision.SupplProvision,
    'Chapter'
  );

  let content = '';

  // SupplProvisionLabel（附則のタイトル）
  let labelText = '';
  if (SupplProvisionLabel.SupplProvisionLabel) {
    labelText = renderTextNode(SupplProvisionLabel.SupplProvisionLabel, addTreeElement());
  }

  // AmendLawNum属性（改正法令番号）
  if (supplProvision[':@']?.AmendLawNum) {
    labelText += `　（${supplProvision[':@'].AmendLawNum}）`;
  }

  // Extract属性（抄）
  if (supplProvision[':@']?.Extract) {
    labelText += '　抄';
  }

  content += tag('div', { class: '_div_SupplProvisionLabel SupplProvisionLabel pl-12 font-bold pb-4' }, labelText);

  // Paragraph要素（項）
  content += renderParagraph(Paragraph, addTreeElement(), 0);

  // Chapter要素（章）
  content += renderChapter(Chapter, addTreeElement(1));

  // Article要素（条）
  content += renderArticle(Article, addTreeElement(1));

  // SupplProvisionAppdxTable、SupplProvisionAppdxStyle、SupplProvisionAppdx等の処理
  // React側と同じく、XML内での出現順序を保持する必要がある
  supplProvision.SupplProvision.forEach((dt: any) => {
    if ('SupplProvisionAppdxTable' in dt) {
      content += renderSupplProvisionAppdxTable([dt], addTreeElement(2));
    } else if ('SupplProvisionAppdxStyle' in dt) {
      content += renderSupplProvisionAppdxStyle([dt], addTreeElement(2));
    } else if ('SupplProvisionAppdx' in dt) {
      content += renderSupplProvisionAppdx([dt], addTreeElement(2));
    }
  });

  return tag('section', { class: 'active SupplProvision pb-4', style: 'display:none' }, content);
};

/**
 * SupplProvisionAppdxTableType配列をHTMLに変換
 * src/api/components/law/suppl-provision-appdx-table.tsx の LawSupplProvisionAppdxTable コンポーネントを再現
 */
const renderSupplProvisionAppdxTable = (
  supplProvisionAppdxTableList: SupplProvisionAppdxTableType[],
  treeElement: string[]
): string => {
  return supplProvisionAppdxTableList.map((dt, index) => {
    const addTreeElement = [...treeElement, `SupplProvisionAppdxTable_${index}`];

    const SupplProvisionAppdxTableTitle = getType<SupplProvisionAppdxTableTitleType>(
      dt.SupplProvisionAppdxTable,
      'SupplProvisionAppdxTableTitle'
    )[0];

    const RelatedArticleNum = getType<RelatedArticleNumType>(
      dt.SupplProvisionAppdxTable,
      'RelatedArticleNum'
    );

    const TableStruct = getType<TableStructType>(
      dt.SupplProvisionAppdxTable,
      'TableStruct'
    );

    let content = '';

    // SupplProvisionAppdxTableTitle
    content += tag('div', { class: '_div_SupplProvisionAppdxStyleTitle font-bold' },
      renderTextNode(SupplProvisionAppdxTableTitle.SupplProvisionAppdxTableTitle, addTreeElement) +
      renderRelatedArticleNum(RelatedArticleNum, addTreeElement)
    );

    // TableStruct
    content += renderTableStruct(TableStruct, addTreeElement);

    return tag('section', { class: 'active SupplProvisionAppdxTable' }, content);
  }).join('');
};

/**
 * SupplProvisionAppdxStyleType配列をHTMLに変換
 * src/api/components/law/suppl-provision-appdx-style.tsx の LawSupplProvisionAppdxStyle コンポーネントを再現
 */
const renderSupplProvisionAppdxStyle = (
  supplProvisionAppdxStyleList: SupplProvisionAppdxStyleType[],
  treeElement: string[]
): string => {
  return supplProvisionAppdxStyleList.map((dt, index) => {
    const addTreeElement = [...treeElement, `SupplProvisionAppdxStyle_${index}`];

    const SupplProvisionAppdxStyleTitle = getType<SupplProvisionAppdxStyleTitleType>(
      dt.SupplProvisionAppdxStyle,
      'SupplProvisionAppdxStyleTitle'
    )[0];

    const RelatedArticleNum = getType<RelatedArticleNumType>(
      dt.SupplProvisionAppdxStyle,
      'RelatedArticleNum'
    );

    const StyleStruct = getType<StyleStructType>(
      dt.SupplProvisionAppdxStyle,
      'StyleStruct'
    );

    let content = '';

    // SupplProvisionAppdxStyleTitle
    content += tag('div', { class: '_div_SupplProvisionAppdxStyleTitle font-bold' },
      renderTextNode(SupplProvisionAppdxStyleTitle.SupplProvisionAppdxStyleTitle, addTreeElement) +
      renderRelatedArticleNum(RelatedArticleNum, addTreeElement)
    );

    // StyleStruct
    content += renderStyleStruct(StyleStruct, addTreeElement);

    return tag('section', { class: 'active SupplProvisionAppdxStyle' }, content);
  }).join('');
};

/**
 * SupplProvisionAppdxType配列をHTMLに変換
 * src/api/components/law/suppl-provision-appdx.tsx の LawSupplProvisionAppdx コンポーネントを再現
 */
const renderSupplProvisionAppdx = (
  supplProvisionAppdxList: SupplProvisionAppdxType[],
  treeElement: string[]
): string => {
  return supplProvisionAppdxList.map((dt, index) => {
    const addTreeElement = [...treeElement, `SupplProvisionAppdx_${index}`];

    const ArithFormulaNum = getType<ArithFormulaNumType>(
      dt.SupplProvisionAppdx,
      'ArithFormulaNum'
    );

    const RelatedArticleNum = getType<RelatedArticleNumType>(
      dt.SupplProvisionAppdx,
      'RelatedArticleNum'
    );

    const ArithFormula = getType<ArithFormulaType>(
      dt.SupplProvisionAppdx,
      'ArithFormula'
    );

    let content = '';

    // ArithFormulaNum または RelatedArticleNum が存在する場合
    if (ArithFormulaNum.length > 0 || RelatedArticleNum.length > 0) {
      let divContent = '';

      // ArithFormulaNum
      if (ArithFormulaNum.length > 0) {
        const arithFormulaNumText = renderTextNode(
          ArithFormulaNum[0].ArithFormulaNum,
          addTreeElement
        );
        divContent += tag('span', { class: '_span_ArithFormulaNum' }, arithFormulaNumText);
      }

      // RelatedArticleNum
      if (RelatedArticleNum.length > 0) {
        const relatedArticleNumText = renderTextNode(
          RelatedArticleNum[0].RelatedArticleNum,
          addTreeElement
        );
        divContent += relatedArticleNumText;
      }

      content += tag('div', { class: '_div_ArithFormulaNum' }, divContent);
    }

    // ArithFormula (getTextNode相当)
    // React版では ArithFormula は <div class="pl-4"> でラップされる
    if (ArithFormula.length > 0) {
      ArithFormula.forEach((arithFormula) => {
        const arithFormulaContent = renderLawTypeList(
          arithFormula.ArithFormula,
          addTreeElement,
          'ArithFormula'
        );
        content += tag('div', { class: 'pl-4' }, arithFormulaContent);
      });
    }

    return tag('section', { class: 'active SupplProvisionAppdx' }, content);
  }).join('');
};

/**
 * ArticleRangeTypeをHTMLに変換
 * src/api/components/law/article-range.tsx の LawArticleRange コンポーネントを再現
 */
const renderArticleRange = (
  articleRange: ArticleRangeType,
  treeElement: string[]
): string => {
  return renderTextNode(articleRange.ArticleRange, [...treeElement, 'ArticleRange']);
};

/**
 * TOCArticleType配列をHTMLに変換
 * src/api/components/law/toc-article.tsx の LawTOCArticle コンポーネントを再現
 */
const renderTOCArticle = (
  tocArticleList: TOCArticleType[],
  treeElement: string[]
): string => {
  return tocArticleList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TOCArticle_${index}`];

    const ArticleTitle = getType<ArticleTitleType>(dt.TOCArticle, 'ArticleTitle')[0];
    const ArticleCaption = getType<ArticleCaptionType>(dt.TOCArticle, 'ArticleCaption')[0];

    return tag('div', { class: '_div_TOCArticle pl-4' },
      renderTextNode(ArticleTitle.ArticleTitle, addTreeElement) +
      renderTextNode(ArticleCaption.ArticleCaption, addTreeElement)
    );
  }).join('');
};

/**
 * TOCDivisionType配列をHTMLに変換
 * src/api/components/law/toc-division.tsx の LawTOCDivision コンポーネントを再現
 */
const renderTOCDivision = (
  tocDivisionList: TOCDivisionType[],
  treeElement: string[]
): string => {
  return tocDivisionList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TOCDivision_${index}`];

    const DivisionTitle = getType<any>(dt.TOCDivision, 'DivisionTitle')[0];
    const ArticleRange = getType<ArticleRangeType>(dt.TOCDivision, 'ArticleRange');

    return tag('div', { class: '_div_TOCDivision pl-16' },
      renderTextNode(DivisionTitle.DivisionTitle, addTreeElement) +
      (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement) : '')
    );
  }).join('');
};

/**
 * TOCSubsectionType をHTMLに変換
 * src/api/components/law/toc-subsection.tsx の LawTOCSubsection コンポーネントを再現
 */
const renderTOCSubsection = (
  tocSubsection: TOCSubsectionType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'TOCSubsection'];

  const SubsectionTitle = getType<any>(tocSubsection.TOCSubsection, 'SubsectionTitle')[0];
  const ArticleRange = getType<ArticleRangeType>(tocSubsection.TOCSubsection, 'ArticleRange');
  const TOCDivision = getType<TOCDivisionType>(tocSubsection.TOCSubsection, 'TOCDivision');

  let content = '';

  // SubsectionTitle
  content += tag('div', { class: '_div_TOCSubsection pl-12' },
    renderTextNode(SubsectionTitle.SubsectionTitle, addTreeElement) +
    (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement) : '')
  );

  // TOCDivision
  content += renderTOCDivision(TOCDivision, addTreeElement);

  return content;
};

/**
 * TOCSectionType配列をHTMLに変換
 * src/api/components/law/toc-section.tsx の LawTOCSection コンポーネントを再現
 */
const renderTOCSection = (
  tocSectionList: TOCSectionType[],
  treeElement: string[]
): string => {
  return tocSectionList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `TOCSection_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const SectionTitle = getType<SectionTitleType>(dt.TOCSection, 'SectionTitle')[0];
    const ArticleRange = getType<ArticleRangeType>(dt.TOCSection, 'ArticleRange');

    let content = '';

    // SectionTitle
    content += tag('div', { class: '_div_TOCSection pl-8' },
      renderTextNode(SectionTitle.SectionTitle, addTreeElement()) +
      (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement()) : '')
    );

    // 子要素（TOCSubsection、TOCDivision）
    dt.TOCSection.forEach((dt2, index2) => {
      if ('TOCSubsection' in dt2) {
        content += renderTOCSubsection(dt2, addTreeElement(index2));
      } else if ('TOCDivision' in dt2) {
        content += renderTOCDivision([dt2], addTreeElement(index2));
      }
    });

    return content;
  }).join('');
};

/**
 * TOCChapterType配列をHTMLに変換
 * src/api/components/law/toc-chapter.tsx の LawTOCChapter コンポーネントを再現
 */
const renderTOCChapter = (
  tocChapterList: TOCChapterType[],
  treeElement: string[]
): string => {
  return tocChapterList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TOCChapter_${index}`];

    const ChapterTitle = getType<ChapterTitleType>(dt.TOCChapter, 'ChapterTitle')[0];
    const ArticleRange = getType<ArticleRangeType>(dt.TOCChapter, 'ArticleRange');
    const TOCSection = getType<TOCSectionType>(dt.TOCChapter, 'TOCSection');

    let content = '';

    // ChapterTitle
    content += tag('div', { class: '_div_TOCChapter pl-4' },
      renderTextNode(ChapterTitle.ChapterTitle, addTreeElement) +
      (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement) : '')
    );

    // TOCSection
    content += renderTOCSection(TOCSection, addTreeElement);

    return content;
  }).join('');
};

/**
 * TOCPartType配列をHTMLに変換
 * src/api/components/law/toc-part.tsx の LawTOCPart コンポーネントを再現
 */
const renderTOCPart = (
  tocPartList: TOCPartType[],
  treeElement: string[]
): string => {
  return tocPartList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TOCPart_${index}`];

    const PartTitle = getType<PartTitleType>(dt.TOCPart, 'PartTitle')[0];
    const ArticleRange = getType<ArticleRangeType>(dt.TOCPart, 'ArticleRange');
    const TOCChapter = getType<TOCChapterType>(dt.TOCPart, 'TOCChapter');

    let content = '';

    // PartTitle
    content += tag('div', { class: '_div_TOCPart' },
      renderTextNode(PartTitle.PartTitle, addTreeElement) +
      (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement) : '')
    );

    // TOCChapter
    content += renderTOCChapter(TOCChapter, addTreeElement);

    return content;
  }).join('');
};

/**
 * TOCSupplProvisionTypeをHTMLに変換
 * src/api/components/law/toc-suppl-provision.tsx の LawTOCSupplProvision コンポーネントを再現
 */
const renderTOCSupplProvision = (
  tocSupplProvision: TOCSupplProvisionType,
  treeElement: string[]
): string => {
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `TOCSupplProvision${index ? `_${index}` : ''}`,
  ];

  const SupplProvisionLabel = getType<SupplProvisionLabelType>(
    tocSupplProvision.TOCSupplProvision,
    'SupplProvisionLabel'
  )[0];
  const ArticleRange = getType<ArticleRangeType>(
    tocSupplProvision.TOCSupplProvision,
    'ArticleRange'
  );

  let content = '';

  // SupplProvisionLabel
  content += tag('div', { class: '_div_TOCSupplProvision pl-4' },
    renderTextNode(SupplProvisionLabel.SupplProvisionLabel, addTreeElement()) +
    (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement()) : '')
  );

  // 子要素（TOCArticle、TOCChapter）
  tocSupplProvision.TOCSupplProvision.forEach((dt, index) => {
    if ('TOCArticle' in dt) {
      content += renderTOCArticle([dt], addTreeElement(index));
    } else if ('TOCChapter' in dt) {
      content += renderTOCChapter([dt], addTreeElement(index));
    }
  });

  return content;
};

/**
 * TOCAppdxTableLabelType配列をHTMLに変換
 * src/api/components/law/toc-appdx-table-label.tsx の LawTOCAppdxTableLabel コンポーネントを再現
 */
const renderTOCAppdxTableLabel = (
  tocAppdxTableLabelList: TOCAppdxTableLabelType[],
  treeElement: string[]
): string => {
  return tocAppdxTableLabelList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TOCAppdxTableLabel_${index}`];

    return tag('div', { class: '_div_TOCAppdxTableLabel pl-4' },
      renderTextNode(dt.TOCAppdxTableLabel, addTreeElement)
    );
  }).join('');
};

/**
 * TOCTypeをHTMLに変換
 * src/api/components/law/toc.tsx の LawTOC コンポーネントを再現
 */
const renderTOC = (
  toc: TOCType,
  treeElement: string[]
): string => {
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `TOC${index ? `_${index}` : ''}`,
  ];

  const TOCLabel = getTypeByFind<TOCLabelType>(toc.TOC, 'TOCLabel');
  const TOCPreambleLabel = getTypeByFind<TOCPreambleLabelType>(toc.TOC, 'TOCPreambleLabel');
  const TOCSupplProvision = getTypeByFind<TOCSupplProvisionType>(toc.TOC, 'TOCSupplProvision');
  const TOCAppdxTableLabel = getType<TOCAppdxTableLabelType>(toc.TOC, 'TOCAppdxTableLabel');

  let content = '';

  // TOCLabel（目次ラベル） - React側と同じく、存在しない場合でも空divを出力
  content += tag('div', { class: '_div_TOCLabel' },
    TOCLabel !== undefined ? renderTextNode(TOCLabel.TOCLabel, addTreeElement()) : ''
  );

  // TOCPreambleLabel（前文ラベル）
  if (TOCPreambleLabel !== undefined) {
    content += tag('div', { class: '_div_TOCPreambleLabel' },
      renderTextNode(TOCPreambleLabel.TOCPreambleLabel, addTreeElement())
    );
  }

  // 目次の本体（TOCPart、TOCChapter、TOCSection、TOCArticle）
  toc.TOC.forEach((dt, index) => {
    if ('TOCPart' in dt) {
      content += renderTOCPart([dt], addTreeElement(index));
    } else if ('TOCChapter' in dt) {
      content += renderTOCChapter([dt], addTreeElement(index));
    } else if ('TOCSection' in dt) {
      content += renderTOCSection([dt], addTreeElement(index));
    } else if ('TOCArticle' in dt) {
      content += renderTOCArticle([dt], addTreeElement(index));
    }
  });

  // TOCSupplProvision（附則）
  if (TOCSupplProvision !== undefined) {
    content += renderTOCSupplProvision(TOCSupplProvision, addTreeElement());
  }

  // TOCAppdxTableLabel（別表ラベル）
  content += renderTOCAppdxTableLabel(TOCAppdxTableLabel, addTreeElement());

  return content;
};

/**
 * PreambleType をHTMLに変換
 * src/api/components/law/preamble.tsx の LawPreamble コンポーネントを再現
 */
const renderPreamble = (
  preamble: PreambleType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'Preamble'];
  const Paragraph = getType<ParagraphType>(preamble.Preamble, 'Paragraph');

  return renderParagraph(Paragraph, addTreeElement, 0);
};

/**
 * ListSentenceType をHTMLに変換
 * src/api/components/law/list-sentence.tsx の LawListSentence コンポーネントを再現
 */
const renderListSentence = (
  listSentence: ListSentenceType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'ListSentence'];
  const Sentence = getType<SentenceType>(listSentence.ListSentence, 'Sentence');
  const Column = getType<ColumnType>(listSentence.ListSentence, 'Column');

  return renderSentence(Sentence, addTreeElement, false) + renderColumn(Column, addTreeElement);
};

/**
 * ListType をHTMLに変換
 * src/api/components/law/list.tsx の LawList コンポーネントを再現
 */
const renderList = (
  listList: ListType[],
  treeElement: string[]
): string => {
  return listList.map((dt, index) => {
    const addTreeElement = [...treeElement, `List_${index}`];
    const ListSentence = getType<ListSentenceType>(dt.List, 'ListSentence')[0];
    const Sublist1 = getType<Sublist1Type>(dt.List, 'Sublist1');

    const parentElement = getParentElement(treeElement);
    const plClass =
      parentElement === 'Paragraph' &&
      treeElement.length > 1 &&
      treeElement[treeElement.length - 2] === 'TableColumn'
        ? 'pl-8'
        : 'pl-4';

    let content = tag('div', { class: `_div_ListSentence ${plClass}` },
      renderListSentence(ListSentence, addTreeElement)
    );

    content += renderSublist1(Sublist1, addTreeElement);

    return content;
  }).join('');
};

/**
 * SublistSentence共通処理
 */
const renderSublistSentence = (
  sublistSentence: (SentenceType | ColumnType)[],
  treeElement: string[]
): string => {
  const Sentence = getType<SentenceType>(sublistSentence, 'Sentence');
  const Column = getType<ColumnType>(sublistSentence, 'Column');
  return renderSentence(Sentence, treeElement, false) + renderColumn(Column, treeElement);
};

/**
 * Sublist1SentenceType をHTMLに変換
 */
const renderSublist1Sentence = (
  sublist1Sentence: Sublist1SentenceType,
  treeElement: string[]
): string => {
  return renderSublistSentence(
    sublist1Sentence.Sublist1Sentence,
    [...treeElement, 'Sublist1Sentence']
  );
};

/**
 * Sublist2SentenceType をHTMLに変換
 */
const renderSublist2Sentence = (
  sublist2Sentence: Sublist2SentenceType,
  treeElement: string[]
): string => {
  return renderSublistSentence(
    sublist2Sentence.Sublist2Sentence,
    [...treeElement, 'Sublist2Sentence']
  );
};

/**
 * Sublist3SentenceType をHTMLに変換
 */
const renderSublist3Sentence = (
  sublist3Sentence: Sublist3SentenceType,
  treeElement: string[]
): string => {
  return renderSublistSentence(
    sublist3Sentence.Sublist3Sentence,
    [...treeElement, 'Sublist3Sentence']
  );
};

/**
 * Sublist1Type をHTMLに変換
 * src/api/components/law/sublist.tsx の LawSublist1 コンポーネントを再現
 */
const renderSublist1 = (
  sublist1List: Sublist1Type[],
  treeElement: string[]
): string => {
  return sublist1List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Sublist1_${index}`];
    const Sublist1Sentence = getType<Sublist1SentenceType>(dt.Sublist1, 'Sublist1Sentence')[0];
    const Sublist2 = getType<Sublist2Type>(dt.Sublist1, 'Sublist2');

    let content = tag('div', { class: '_div_Sublist1Sentence pl-8' },
      renderSublist1Sentence(Sublist1Sentence, addTreeElement)
    );
    content += renderSublist2(Sublist2, addTreeElement);

    return content;
  }).join('');
};

/**
 * Sublist2Type をHTMLに変換
 * src/api/components/law/sublist.tsx の LawSublist2 コンポーネントを再現
 */
const renderSublist2 = (
  sublist2List: Sublist2Type[],
  treeElement: string[]
): string => {
  return sublist2List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Sublist2_${index}`];
    const Sublist2Sentence = getType<Sublist2SentenceType>(dt.Sublist2, 'Sublist2Sentence')[0];
    const Sublist3 = getType<Sublist3Type>(dt.Sublist2, 'Sublist3');

    let content = tag('div', { class: '_div_Sublist2Sentence pl-12' },
      renderSublist2Sentence(Sublist2Sentence, addTreeElement)
    );
    content += renderSublist3(Sublist3, addTreeElement);

    return content;
  }).join('');
};

/**
 * Sublist3Type をHTMLに変換
 * src/api/components/law/sublist.tsx の LawSublist3 コンポーネントを再現
 */
const renderSublist3 = (
  sublist3List: Sublist3Type[],
  treeElement: string[]
): string => {
  return sublist3List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Sublist3_${index}`];
    const Sublist3Sentence = getType<Sublist3SentenceType>(dt.Sublist3, 'Sublist3Sentence')[0];

    return tag('div', { class: 'pl-16' },
      renderSublist3Sentence(Sublist3Sentence, [...treeElement, 'Sublist3'])
    );
  }).join('');
};

/**
 * EnactStatementType をHTMLに変換
 * src/api/components/law/enact-statement.tsx の LawEnactStatement コンポーネントを再現
 */
const renderEnactStatement = (
  enactStatementList: EnactStatementType[],
  treeElement: string[]
): string => {
  return enactStatementList.map((dt, index) => {
    const addTreeElement = [...treeElement, `EnactStatement_${index}`];
    return tag('div', { class: '_div_EnactStatement' },
      renderTextNode(dt.EnactStatement, addTreeElement)
    );
  }).join('');
};

/**
 * LawBodyTypeをHTMLに変換
 * src/api/components/law/law-body.tsx の LawBodyComponent コンポーネントを再現
 */
const renderLawBody = (
  lawBody: LawBodyType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'LawBody'];

  const EnactStatement = getType<EnactStatementType>(lawBody.LawBody, 'EnactStatement');
  const TOC = getType<TOCType>(lawBody.LawBody, 'TOC');
  const Preamble = getTypeByFind<PreambleType>(lawBody.LawBody, 'Preamble');
  const MainProvision = getTypeByFind<MainProvisionType>(lawBody.LawBody, 'MainProvision') ??
    ({ MainProvision: [] } as unknown as MainProvisionType);

  let html = '';

  // EnactStatement（制定文）
  if (EnactStatement.length > 0) {
    html += tag('section', { id: 'EnactStatement', class: 'active EnactStatement' },
      renderEnactStatement(EnactStatement, addTreeElement)
    );
  }

  // TOC（目次）
  if (TOC.length > 0) {
    html += tag('section', { class: 'active TOC pb-4' },
      renderTOC(TOC[0], addTreeElement)
    );
  }

  // Preamble（前文）
  if (Preamble !== undefined) {
    html += tag('section', { class: 'active Preamble' },
      renderPreamble(Preamble, addTreeElement)
    );
  }

  // MainProvision（本則）
  html += tag('section', { id: 'MainProvision', class: 'active MainProvision' },
    tag('div', {}, renderMainProvision(MainProvision, addTreeElement))
  );

  // SupplProvision, Appdx, AppdxTable, AppdxNote, AppdxFig など
  lawBody.LawBody.forEach((dt, index) => {
    const addTreeElementWithIndex = [...treeElement, `LawBody_${index}`];
    if ('SupplProvision' in dt && dt.SupplProvision.length > 0) {
      html += renderSupplProvision(dt, addTreeElement, index);
    } else if ('Appdx' in dt) {
      html += renderAppdx([dt], addTreeElementWithIndex);
    } else if ('AppdxTable' in dt) {
      html += renderAppdxTable([dt], addTreeElementWithIndex);
    } else if ('AppdxNote' in dt) {
      html += renderAppdxNote([dt], addTreeElementWithIndex);
    } else if ('AppdxFig' in dt) {
      html += renderAppdxFig(dt, addTreeElementWithIndex);
    } else if ('AppdxStyle' in dt) {
      html += renderAppdxStyle(dt, addTreeElementWithIndex);
    } else if ('AppdxFormat' in dt) {
      html += renderAppdxFormat(dt, addTreeElementWithIndex);
    }
  });

  return html;
};

/**
 * RelatedArticleNumType をHTMLに変換
 * src/api/components/law/related-article-num.tsx の LawRelatedArticleNum コンポーネントを再現
 */
const renderRelatedArticleNum = (
  relatedArticleNumList: RelatedArticleNumType[],
  treeElement: string[]
): string => {
  if (relatedArticleNumList.length === 0) return '';
  return renderTextNode(relatedArticleNumList[0].RelatedArticleNum, [
    ...treeElement,
    'RelatedArticleNum',
  ]);
};

/**
 * AppdxFigType をHTMLに変換
 * src/api/components/law/appdx-fig.tsx の LawAppdxFig コンポーネントを再現
 */
const renderAppdxFig = (
  appdxFig: AppdxFigType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'AppdxFig'];

  const AppdxFigTitle = getType<AppdxFigTitleType>(appdxFig.AppdxFig, 'AppdxFigTitle');
  const RelatedArticleNum = getType<RelatedArticleNumType>(appdxFig.AppdxFig, 'RelatedArticleNum');

  let html = '';

  // AppdxFigTitle と RelatedArticleNum
  if (AppdxFigTitle.length > 0 || RelatedArticleNum.length > 0) {
    let titleContent = '';
    if (AppdxFigTitle.length > 0) {
      titleContent += renderTextNode(AppdxFigTitle[0].AppdxFigTitle, addTreeElement);
    }
    titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement);
    html += tag('div', { class: '_div_AppdxFigTitle' }, titleContent);
  }

  // FigStruct と TableStruct
  appdxFig.AppdxFig.forEach((dt, index) => {
    const addTreeElementWithIndex = [...treeElement, `AppdxFig_${index}`];
    if ('FigStruct' in dt) {
      html += renderFigStruct([dt], addTreeElementWithIndex);
    } else if ('TableStruct' in dt) {
      html += renderTableStruct([dt], addTreeElementWithIndex);
    }
  });

  return tag('section', { class: 'active AppdxFig' }, html);
};

/**
 * StyleStructType をHTMLに変換
 * src/api/components/law/style-struct.tsx の LawStyleStruct コンポーネントを再現
 */
const renderStyleStruct = (
  styleStructList: any[],
  treeElement: string[]
): string => {
  return styleStructList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `StyleStruct_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const StyleStructTitle = getType<any>(dt.StyleStruct, 'StyleStructTitle');
    const Remarks = getType<RemarksType>(dt.StyleStruct, 'Remarks');
    const Style = getType<any>(dt.StyleStruct, 'Style')[0];

    let content = '';

    // StyleStructTitle
    if (StyleStructTitle.length > 0) {
      content += tag('div', { class: '_div_StyleStructTitle' },
        renderTextNode(StyleStructTitle[0].StyleStructTitle, addTreeElement())
      );
    }

    // Style と Remarks（LawAny経由で処理）
    dt.StyleStruct.forEach((dt2: any, index2: number) => {
      if ('Style' in dt2) {
        // Style内の要素を処理（Sentence, Fig, List, TableStruct, FigStruct, Item等）
        Style.Style.forEach((styleItem: any) => {
          if ('Sentence' in styleItem) {
            content += renderSentence([styleItem], addTreeElement(index2), false);
          } else if ('Fig' in styleItem) {
            content += renderFig(styleItem, addTreeElement(index2));
          } else if ('List' in styleItem) {
            content += renderList([styleItem], addTreeElement(index2));
          } else if ('TableStruct' in styleItem) {
            content += renderTableStruct([styleItem], addTreeElement(index2));
          } else if ('FigStruct' in styleItem) {
            content += renderFigStruct([styleItem], addTreeElement(index2));
          } else if ('Paragraph' in styleItem) {
            content += renderParagraph([styleItem], addTreeElement(index2), 0);
          } else if ('Item' in styleItem) {
            content += renderItem([styleItem], addTreeElement(index2), false);
          }
        });
      } else if ('Remarks' in dt2) {
        content += renderRemarks(Remarks, addTreeElement(index2));
      }
    });

    return content;
  }).join('');
};

/**
 * AppdxStyleType をHTMLに変換
 * src/api/components/law/appdx-style.tsx の LawAppdxStyle コンポーネントを再現
 */
const renderAppdxStyle = (
  appdxStyle: AppdxStyleType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'AppdxStyle'];

  const AppdxStyleTitle = getType<AppdxStyleTitleType>(appdxStyle.AppdxStyle, 'AppdxStyleTitle');
  const RelatedArticleNum = getType<RelatedArticleNumType>(appdxStyle.AppdxStyle, 'RelatedArticleNum');

  let html = '';

  // AppdxStyleTitle と RelatedArticleNum
  if (AppdxStyleTitle.length > 0 || RelatedArticleNum.length > 0) {
    let titleContent = '';
    if (AppdxStyleTitle.length > 0) {
      titleContent += renderTextNode(AppdxStyleTitle[0].AppdxStyleTitle, addTreeElement);
    }
    titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement);
    html += tag('div', { class: '_div_AppdxStyleTitle font-bold' }, titleContent);
  }

  // StyleStruct と Remarks
  appdxStyle.AppdxStyle.forEach((dt, index) => {
    const addTreeElementWithIndex = [...treeElement, `AppdxStyle_${index}`];
    if ('StyleStruct' in dt) {
      html += renderStyleStruct([dt], addTreeElementWithIndex);
    } else if ('Remarks' in dt) {
      html += renderRemarks([dt], addTreeElementWithIndex);
    }
  });

  return tag('section', { class: 'active AppdxStyle' }, html);
};

/**
 * AppdxFormatType をHTMLに変換
 * src/api/components/law/appdx-format.tsx の LawAppdxFormat コンポーネントを再現
 */
const renderAppdxFormat = (
  appdxFormat: AppdxFormatType,
  treeElement: string[]
): string => {
  const addTreeElement = (index?: number) => [
    ...treeElement,
    `AppdxFormat${index !== undefined ? `_${index}` : ''}`,
  ];

  const AppdxFormatTitle = getType<AppdxFormatTitleType>(
    appdxFormat.AppdxFormat,
    'AppdxFormatTitle'
  );
  const RelatedArticleNum = getType<RelatedArticleNumType>(
    appdxFormat.AppdxFormat,
    'RelatedArticleNum'
  );

  let html = '';

  // AppdxFormatTitle と RelatedArticleNum
  if (AppdxFormatTitle.length > 0 || RelatedArticleNum.length > 0) {
    let titleContent = '';
    if (AppdxFormatTitle.length > 0) {
      titleContent += renderTextNode(AppdxFormatTitle[0].AppdxFormatTitle, addTreeElement());
    }
    titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement());
    html += tag('div', { class: '_div_AppdxFormatTitle' }, titleContent);
  }

  // FormatStruct と Remarks
  appdxFormat.AppdxFormat.forEach((dt, index) => {
    if ('FormatStruct' in dt) {
      html += renderFormatStruct([dt], addTreeElement(index));
    } else if ('Remarks' in dt) {
      html += renderRemarks([dt], addTreeElement(index));
    }
  });

  return tag('section', { class: 'active AppdxFormat' }, html);
};

/**
 * FigType をHTMLに変換
 * src/api/components/law/fig.tsx の LawFig コンポーネントを再現
 */
const renderFig = (
  fig: any,
  treeElement: string[]
): string => {
  // figが配列の場合は最初の要素を使用
  const figObj = Array.isArray(fig) ? fig[0] : fig;
  // figObjが文字列（空文字列）の場合は、src属性を持たないFig要素
  const src = (typeof figObj === 'string' || !figObj) ? '' : (figObj[':@']?.src || '');

  if (/\.pdf$/i.test(src)) {
    // PDF: buttonタグを出力
    return tag('button', {
      type: 'button',
      'aria-label': 'PDFファイルをダウンロード',
      title: 'PDFファイルをダウンロード'
    }, '');
  } else if (src === '') {
    // ブランク: Styleの子要素かどうかで分岐
    if (treeElement.some(dt => /^Style(Struct)?_.*/.test(dt))) {
      return tag('div', { class: '_div_Fig_noPdf pl-8' }, '（略）');
    } else {
      return tag('span', { class: '_span_Fig_noImg inline-block pl-4' }, '（略）');
    }
  } else {
    // 画像: LoadingImageプレースホルダーを出力（React SSRと同じ）
    const innerContent = tag('span', {
      class: 'text-xs text-light-Text-PlaceHolder font-bold'
    }, '画像を読み込み中...');
    const innerWrapper = tag('div', {
      class: 'flex flex-col justify-center items-center'
    }, innerContent);
    return tag('div', {
      class: 'flex items-center justify-center w-80 h-48 rounded-md bg-light-Background-Secondary animate-pulse'
    }, innerWrapper);
  }
};

/**
 * FormatStructType配列をHTMLに変換
 * src/api/components/law/format-struct.tsx の LawFormatStruct コンポーネントを再現
 */
const renderFormatStruct = (
  formatStructList: FormatStructType[],
  treeElement: string[]
): string => {
  return formatStructList.map((dt, index) => {
    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `FormatStruct_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const FormatStructTitle = getType<FormatStructTitleType>(
      dt.FormatStruct,
      'FormatStructTitle'
    );
    const Format = getType<FormatType>(dt.FormatStruct, 'Format')[0];
    const Remarks = getType<RemarksType>(dt.FormatStruct, 'Remarks');

    let html = '';

    // FormatStructTitle
    if (FormatStructTitle.length > 0) {
      html += tag('div', {},
        renderTextNode(FormatStructTitle[0].FormatStructTitle, addTreeElement())
      );
    }

    // Format と Remarks
    dt.FormatStruct.forEach((dt2, index2) => {
      if ('Format' in dt2) {
        // Format内の要素を処理（Fig等）
        Format.Format.forEach((formatItem) => {
          if ('Fig' in formatItem) {
            html += renderFig(formatItem, addTreeElement(index2));
          }
        });
      } else if ('Remarks' in dt2) {
        html += renderRemarks(Remarks, addTreeElement(index2));
      }
    });

    return html;
  }).join('');
};

/**
 * AppdxType をHTMLに変換
 * src/api/components/law/appdx.tsx の LawAppdx コンポーネントを再現
 */
const renderAppdx = (
  appdxList: AppdxType[],
  treeElement: string[]
): string => {
  return appdxList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Appdx_${index}`];
    const ArithFormulaNum = getType<ArithFormulaNumType>(dt.Appdx, 'ArithFormulaNum');
    const RelatedArticleNum = getType<RelatedArticleNumType>(dt.Appdx, 'RelatedArticleNum');
    const ArithFormula = getType<ArithFormulaType>(dt.Appdx, 'ArithFormula');
    const Remarks = getType<RemarksType>(dt.Appdx, 'Remarks');

    let html = '';

    // ArithFormulaNum または RelatedArticleNum が存在する場合
    if (ArithFormulaNum.length > 0 || RelatedArticleNum.length > 0) {
      let divContent = '';

      // ArithFormulaNum
      if (ArithFormulaNum.length > 0) {
        const arithFormulaNumText = renderTextNode(
          ArithFormulaNum[0].ArithFormulaNum,
          [...addTreeElement, 'ArithFormulaNum']
        );
        divContent += tag('span', { class: '_span_ArithFormulaNum' }, arithFormulaNumText);
      }

      // RelatedArticleNum
      if (RelatedArticleNum.length > 0) {
        const relatedArticleNumText = renderTextNode(
          RelatedArticleNum[0].RelatedArticleNum,
          [...addTreeElement, 'RelatedArticleNum']
        );
        divContent += relatedArticleNumText;
      }

      html += tag('div', { class: '_div_ArithFormulaNum' }, divContent);
    }

    // ArithFormula (getTextNode相当)
    // React版では ArithFormula は <div class="pl-4"> でラップされる
    if (ArithFormula.length > 0) {
      ArithFormula.forEach((arithFormula) => {
        const arithFormulaContent = renderLawTypeList(
          arithFormula.ArithFormula,
          addTreeElement,
          'ArithFormula'
        );
        html += tag('div', { class: 'pl-4' }, arithFormulaContent);
      });
    }

    // Remarks
    html += renderRemarks(Remarks, addTreeElement);

    return tag('section', { class: 'active Appdx' }, html);
  }).join('');
};

/**
 * RemarksType をHTMLに変換
 * src/api/components/law/remarks.tsx の LawRemarks コンポーネントを再現
 */
const renderRemarks = (
  remarksList: RemarksType[],
  treeElement: string[]
): string => {
  return remarksList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Remarks_${index}`];
    const RemarksLabelArray = getType<RemarksLabelType>(dt.Remarks, 'RemarksLabel');
    const Sentence = getType<SentenceType>(dt.Remarks, 'Sentence');
    const Item = getType<ItemType>(dt.Remarks, 'Item');

    let content = '';
    // RemarksLabelは空でもdivを出力
    const remarksLabelText = RemarksLabelArray.length > 0
      ? renderTextNode(RemarksLabelArray[0].RemarksLabel, addTreeElement)
      : '';
    content += tag('div', { class: '_div_RemarksLabel' }, remarksLabelText);

    // Sentenceをdivでラップ（React仕様: Remarks内のSentenceは末尾にスペースを追加）
    Sentence.forEach((sentence) => {
      content += tag('div', {}, renderTextNode(sentence.Sentence, addTreeElement) + ' ');
    });

    content += renderItem(Item, addTreeElement, false);

    return content;
  }).join('');
};

/**
 * TableHeaderColumnType をHTMLに変換
 * src/api/components/law/table-header-column.tsx の LawTableHeaderColumn コンポーネントを再現
 */
const renderTableHeaderColumn = (
  tableHeaderColumnList: TableHeaderColumnType[],
  treeElement: string[]
): string => {
  return tableHeaderColumnList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TableHeaderColumn_${index}`];
    const style = 'border-top:black solid 1px;border-bottom:black solid 1px;border-left:black solid 1px;border-right:black solid 1px';

    return tag('td', { class: 'TableHeaderColumn', style },
      renderTextNode(dt.TableHeaderColumn, [...treeElement, 'TableHeaderColumn'])
    );
  }).join('');
};

/**
 * TableHeaderRowType をHTMLに変換
 * src/api/components/law/table-header-row.tsx の LawTableHeaderRow コンポーネントを再現
 */
const renderTableHeaderRow = (
  tableHeaderRowList: TableHeaderRowType[],
  treeElement: string[]
): string => {
  return tableHeaderRowList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TableHeaderRow_${index}`];
    return tag('tr', { class: 'TableHeaderRow' },
      renderTableHeaderColumn(dt.TableHeaderColumn, [...treeElement, 'TableHeaderRow'])
    );
  }).join('');
};

/**
 * TableColumnAttributeType からborderスタイルを生成
 */
const getBorderStyle = (border: TableColumnAttributeType | undefined): string => {
  const styles: string[] = [];

  // ボーダースタイルは常に出力（borderがundefinedの場合はデフォルト値'solid'を使用）
  styles.push(`border-top:black ${border?.BorderTop ?? 'solid'} 1px`);
  styles.push(`border-bottom:black ${border?.BorderBottom ?? 'solid'} 1px`);
  styles.push(`border-left:black ${border?.BorderLeft ?? 'solid'} 1px`);
  styles.push(`border-right:black ${border?.BorderRight ?? 'solid'} 1px`);

  if (border?.Align) {
    styles.push(`text-align:${border.Align}`);
  }
  if (border?.Valign) {
    styles.push(`vertical-align:${border.Valign}`);
  }

  return styles.join(';');
};

/**
 * TableColumnType をHTMLに変換
 * src/api/components/law/table-column.tsx の LawTableColumn コンポーネントを再現
 */
const renderTableColumn = (
  tableColumnList: TableColumnType[],
  treeElement: string[]
): string => {
  return tableColumnList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TableColumn_${index}`];
    const Part = getType<PartType>(dt.TableColumn, 'Part');
    const Chapter = getType<ChapterType>(dt.TableColumn, 'Chapter');
    const Section = getType<SectionType>(dt.TableColumn, 'Section');
    const Article = getType<ArticleType>(dt.TableColumn, 'Article');
    const Paragraph = getType<ParagraphType>(dt.TableColumn, 'Paragraph');
    const Item = getType<ItemType>(dt.TableColumn, 'Item');
    const Subitem1 = getType<Subitem1Type>(dt.TableColumn, 'Subitem1');
    const Subitem2 = getType<Subitem2Type>(dt.TableColumn, 'Subitem2');
    const Subitem3 = getType<Subitem3Type>(dt.TableColumn, 'Subitem3');
    const Subitem4 = getType<Subitem4Type>(dt.TableColumn, 'Subitem4');
    const Subitem5 = getType<Subitem5Type>(dt.TableColumn, 'Subitem5');
    const Subitem6 = getType<Subitem6Type>(dt.TableColumn, 'Subitem6');
    const Subitem7 = getType<Subitem7Type>(dt.TableColumn, 'Subitem7');
    const Subitem8 = getType<Subitem8Type>(dt.TableColumn, 'Subitem8');
    const Subitem9 = getType<Subitem9Type>(dt.TableColumn, 'Subitem9');
    const Subitem10 = getType<Subitem10Type>(dt.TableColumn, 'Subitem10');
    const FigStruct = getType<FigStructType>(dt.TableColumn, 'FigStruct');
    const Remarks = getType<RemarksType>(dt.TableColumn, 'Remarks');
    const Sentence = getType<SentenceType>(dt.TableColumn, 'Sentence');
    const Column = getType<ColumnType>(dt.TableColumn, 'Column');

    const attrs: Record<string, string | number> = {
      class: 'p-2',
      style: getBorderStyle(dt[':@']),
    };

    if (dt[':@']?.colspan) attrs.colspan = dt[':@'].colspan;
    if (dt[':@']?.rowspan) attrs.rowspan = dt[':@'].rowspan;

    let content = '';
    content += renderPart(Part, addTreeElement);
    content += renderChapter(Chapter, addTreeElement);
    content += renderSection(Section, addTreeElement);
    content += renderArticle(Article, addTreeElement);
    content += renderParagraph(Paragraph, addTreeElement, 0);
    content += renderItem(Item, addTreeElement, false);
    content += renderSubitem1(Subitem1, addTreeElement);
    content += renderSubitem2(Subitem2, addTreeElement);
    content += renderSubitem3(Subitem3, addTreeElement);
    content += renderSubitem4(Subitem4, addTreeElement);
    content += renderSubitem5(Subitem5, addTreeElement);
    content += renderSubitem6(Subitem6, addTreeElement);
    content += renderSubitem7(Subitem7, addTreeElement);
    content += renderSubitem8(Subitem8, addTreeElement);
    content += renderSubitem9(Subitem9, addTreeElement);
    content += renderSubitem10(Subitem10, addTreeElement);
    content += renderFigStruct(FigStruct, addTreeElement);
    content += renderRemarks(Remarks, addTreeElement);
    content += renderSentence(Sentence, addTreeElement, false);
    content += renderColumn(Column, addTreeElement);

    return tag('td', attrs, tag('div', {}, content));
  }).join('');
};

/**
 * TableRowType をHTMLに変換
 * src/api/components/law/table-row.tsx の LawTableRow コンポーネントを再現
 */
const renderTableRow = (
  tableRowList: TableRowType[],
  treeElement: string[]
): string => {
  return tableRowList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TableRow_${index}`];
    return tag('tr', { class: 'TableRow' },
      renderTableColumn(dt.TableRow, [...treeElement, 'TableRow'])
    );
  }).join('');
};

/**
 * TableType をHTMLに変換
 * src/api/components/law/table.tsx の LawTable コンポーネントを再現
 */
const renderTable = (
  table: TableType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'Table'];
  const TableHeaderRow = getType<TableHeaderRowType>(table.Table, 'TableHeaderRow');
  const TableRow = getType<TableRowType>(table.Table, 'TableRow');

  const tbody =
    renderTableHeaderRow(TableHeaderRow, addTreeElement) +
    renderTableRow(TableRow, addTreeElement);

  return tag('table', { class: 'Table' }, tag('tbody', {}, tbody));
};

/**
 * TableStructType をHTMLに変換
 * src/api/components/law/table-struct.tsx の LawTableStruct コンポーネントを再現
 */
const renderTableStruct = (
  tableStructList: TableStructType[],
  treeElement: string[]
): string => {
  return tableStructList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TableStruct_${index}`];
    const TableStructTitle = getType<any>(dt.TableStruct, 'TableStructTitle');

    let content = '';

    // TableStructTitle
    if (TableStructTitle.length > 0) {
      content += tag('div', { class: '_div_TableStructTitle' },
        renderTextNode(TableStructTitle[0].TableStructTitle, addTreeElement));
    }

    // Table と Remarks を処理
    dt.TableStruct.forEach((dt2, index2) => {
      const childTreeElement = [...addTreeElement, `_Child_${index2}`];
      if ('Table' in dt2) {
        content += renderTable(dt2, childTreeElement);
      } else if ('Remarks' in dt2) {
        content += renderRemarks([dt2], childTreeElement);
      }
    });

    return content;
  }).join('');
};

/**
 * AppdxTableType をHTMLに変換
 * src/api/components/law/appdx-table.tsx の LawAppdxTable コンポーネントを再現
 */
const renderAppdxTable = (
  appdxTableList: AppdxTableType[],
  treeElement: string[]
): string => {
  return appdxTableList.map((dt, index) => {
    const addTreeElement = [...treeElement, `AppdxTable_${index}`];
    const AppdxTableTitle = getType<AppdxTableTitleType>(dt.AppdxTable, 'AppdxTableTitle');
    const RelatedArticleNum = getType<RelatedArticleNumType>(dt.AppdxTable, 'RelatedArticleNum');
    const Remarks = getType<RemarksType>(dt.AppdxTable, 'Remarks');

    let content = '';

    // AppdxTableTitle + RelatedArticleNum
    if (AppdxTableTitle.length > 0 || RelatedArticleNum.length > 0) {
      let titleContent = '';
      if (AppdxTableTitle.length > 0) {
        titleContent += renderTextNode(AppdxTableTitle[0].AppdxTableTitle, addTreeElement);
      }
      titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement);
      content += tag('div', { class: '_div_AppdxTableTitle font-bold' }, titleContent);
    }

    // Item と TableStruct
    dt.AppdxTable.forEach((dt2, index2) => {
      const childTreeElement = [
        ...addTreeElement,
        index2 !== undefined ? `_Child_${index2}` : ''
      ];

      if ('Item' in dt2) {
        content += renderItem([dt2], childTreeElement, false);
      } else if ('TableStruct' in dt2) {
        // TableStruct内の要素（Table、Remarks）をレンダリング
        content += renderTableStruct([dt2], childTreeElement);
      }
    });

    // Remarks
    content += renderRemarks(Remarks, addTreeElement);

    return tag('section', { class: 'active AppdxTable' }, content);
  }).join('');
};

/**
 * NoteStructType をHTMLに変換
 * src/api/components/law/note-struct.tsx の LawNoteStruct コンポーネントを再現
 */
const renderNoteStruct = (
  noteStruct: NoteStructType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'NoteStruct'];
  const NoteStructTitle = getType<any>(noteStruct.NoteStruct, 'NoteStructTitle');

  let content = '';

  if (NoteStructTitle.length > 0) {
    content += tag('div', {}, renderTextNode(NoteStructTitle[0].NoteStructTitle, addTreeElement));
  }

  // Note と Remarks を処理
  noteStruct.NoteStruct.forEach((dt, index) => {
    const childTreeElement = [...addTreeElement, `_${index}`];
    if ('Remarks' in dt) {
      content += renderRemarks([dt], childTreeElement);
    } else if ('Note' in dt) {
      // React仕様: LawNoteStructはNote要素をLawAnyに渡すが、
      // LawAnyには"Note"ケースが実装されていないため、空のFragmentを返す
      // したがって、Note要素は何も出力しない
      content += '';
    }
  });

  return content;
};

/**
 * FigStructType をHTMLに変換
 * src/api/components/law/fig-struct.tsx の LawFigStruct コンポーネントを再現
 */
const renderFigStruct = (
  figStructList: FigStructType[],
  treeElement: string[]
): string => {
  return figStructList.map((dt, index) => {
    const addTreeElement = [...treeElement, `FigStruct_${index}`];
    const FigStructTitle = getType<any>(dt.FigStruct, 'FigStructTitle');
    const Remarks = getType<RemarksType>(dt.FigStruct, 'Remarks');

    let content = '';

    if (FigStructTitle.length > 0) {
      content += renderTextNode(FigStructTitle[0].FigStructTitle, addTreeElement);
    }

    // Fig と Remarks を処理
    dt.FigStruct.forEach((dt2, index2) => {
      const childTreeElement = [...addTreeElement, `_Child_${index2}`];
      if ('Remarks' in dt2) {
        content += renderRemarks(Remarks, childTreeElement);
      } else if ('Fig' in dt2) {
        // Fig要素を処理（PDF/画像/ブランクの判定はrenderFig関数が行う）
        content += renderFig(dt2, childTreeElement);
      }
    });

    return content;
  }).join('');
};

/**
 * AppdxNoteType をHTMLに変換
 * src/api/components/law/appdx-note.tsx の LawAppdxNote コンポーネントを再現
 */
const renderAppdxNote = (
  appdxNoteList: AppdxNoteType[],
  treeElement: string[]
): string => {
  return appdxNoteList.map((dt, index) => {
    const addTreeElement = [...treeElement, `AppdxNote_${index}`];
    const AppdxNoteTitle = getType<AppdxNoteTitleType>(dt.AppdxNote, 'AppdxNoteTitle');
    const RelatedArticleNum = getType<RelatedArticleNumType>(dt.AppdxNote, 'RelatedArticleNum');
    const Remarks = getType<RemarksType>(dt.AppdxNote, 'Remarks');

    let content = '';

    // AppdxNoteTitle + RelatedArticleNum
    if (AppdxNoteTitle.length > 0 || RelatedArticleNum.length > 0) {
      let titleContent = '';
      if (AppdxNoteTitle.length > 0) {
        titleContent += renderTextNode(AppdxNoteTitle[0].AppdxNoteTitle, addTreeElement);
      }
      titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement);
      content += tag('div', { class: '_div_AppdxNoteTitle' }, titleContent);
    }

    // NoteStruct, FigStruct, TableStruct を処理
    dt.AppdxNote.forEach((dt2, index2) => {
      const childTreeElement = [
        ...addTreeElement,
        `_Child_${index2}`
      ];

      if ('NoteStruct' in dt2) {
        content += renderNoteStruct(dt2, childTreeElement);
      } else if ('FigStruct' in dt2) {
        content += renderFigStruct([dt2], childTreeElement);
      } else if ('TableStruct' in dt2) {
        content += renderTableStruct([dt2], childTreeElement);
      }
    });

    // Remarks
    content += renderRemarks(Remarks, addTreeElement);

    return tag('section', { class: 'active AppdxNote' }, content);
  }).join('');
};

/**
 * Law全体をHTMLに変換
 * src/api/components/law/law.tsx の LawComponent コンポーネントを再現
 */
const renderLaw = (
  lawNum: LawNumType,
  lawBody: LawBodyType,
  lawTitle: LawTitleType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'Law'];

  let html = '';

  // LawNum と LawTitle
  html += tag('div', { class: 'pb-4' },
    tag('div', { class: 'font-bold' }, renderTextNode(lawNum.LawNum, addTreeElement)) +
    tag('div', { class: 'text-xl font-bold' }, renderTextNode(lawTitle.LawTitle, addTreeElement))
  );

  // LawBody
  html += renderLawBody(lawBody, addTreeElement);

  return html;
};

export {
  renderArticle,
  renderParagraph,
  renderItem,
  renderTextNode,
  renderChapter,
  renderPart,
  renderSection,
  renderMainProvision,
  renderSupplProvision,
  renderLawBody,
  renderLaw
};
