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
  TOCType,
  TOCLabelType,
  TOCPreambleLabelType,
  TOCPartType,
  TOCChapterType,
  TOCSectionType,
  TOCArticleType,
  TOCSupplProvisionType,
  TOCAppdxTableLabelType,
  ArticleRangeType,
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
            return 'text-decoration-line: underline; text-decoration-style: solid;';
          case 'none':
            return 'text-decoration-line: none;';
          default:
            return `text-decoration-line: ${Style}; text-decoration-style: solid;`;
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
      // 引用構造（複雑なので一旦スキップ）
      return '<!-- QuoteStruct: 未実装 -->';
    } else if ('ArithFormula' in dt) {
      // 算術式（複雑なので一旦スキップ）
      return '<!-- ArithFormula: 未実装 -->';
    } else {
      // プレーンテキスト
      return dt._ || '';
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
    } else {
      // Table要素（複雑なので一旦スキップ）
      return '<!-- Table: 未実装 -->';
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

    let content = '';

    // ItemTitle があればボールド表示
    if (ItemTitle.length > 0) {
      const titleText = renderTextNode(ItemTitle[0].ItemTitle, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '　');
    }

    // ItemSentence の内容
    content += renderItemSentence(ItemSentence, addTreeElement);

    return tag('div', { class: `_div_ItemSentence ${padding()} indent-1` }, content);
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
    const Item = getType<ItemType>(dt.Paragraph, 'Item');

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

    // 子要素（Item等）のレンダリング
    let childrenHtml = '';
    if (Item.length > 0) {
      childrenHtml = renderItem(Item, addTreeElement, index + parentParagraphIndex > 0);
    }

    // 親要素に応じてラッピング
    const parentElement = getParentElement(treeElement);

    if (parentElement === 'Article' && index + parentParagraphIndex === 0) {
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
      } else if ('Subsection' in dt2 || 'Division' in dt2) {
        // Subsection、Divisionは未実装なのでスキップ
        content += '<!-- Subsection/Division: 未実装 -->';
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

  // SupplProvisionAppdxTable等は一旦スキップ

  return tag('section', { class: 'active SupplProvision pb-4', style: 'display:none' }, content);
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

    // 子要素（TOCSubsection、TOCDivision）は一旦スキップ

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

  // TOCLabel（目次ラベル）
  if (TOCLabel !== undefined) {
    content += tag('div', { class: '_div_TOCLabel' },
      renderTextNode(TOCLabel.TOCLabel, addTreeElement())
    );
  }

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
 * LawBodyTypeをHTMLに変換
 * src/api/components/law/law-body.tsx の LawBodyComponent コンポーネントを再現
 */
const renderLawBody = (
  lawBody: LawBodyType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'LawBody'];

  const TOC = getType<TOCType>(lawBody.LawBody, 'TOC');
  const MainProvision = getTypeByFind<MainProvisionType>(lawBody.LawBody, 'MainProvision') ??
    ({ MainProvision: [] } as unknown as MainProvisionType);

  let html = '';

  // TOC（目次）
  if (TOC.length > 0) {
    html += tag('section', { class: 'active TOC pb-4' },
      renderTOC(TOC[0], addTreeElement)
    );
  }

  // MainProvision（本則）
  html += tag('section', { id: 'MainProvision', class: 'active MainProvision' },
    tag('div', {}, renderMainProvision(MainProvision, addTreeElement))
  );

  // SupplProvision（附則）
  lawBody.LawBody.forEach((dt, index) => {
    if ('SupplProvision' in dt && dt.SupplProvision.length > 0) {
      html += renderSupplProvision(dt, addTreeElement, index);
    }
  });

  return html;
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
