/**
 * TypeScript��XML����HTML�𐶐�����iReact�Ȃ��j
 *
 * �ړI:
 * - ������React�R���|�[�l���g�Ɠ���HTML��������TypeScript�Ő���
 * - React�R���|�[�l���g�̃��W�b�N�𒉎��ɍČ�
 */

import { getType, getTypeByFind, getParentElement } from './lib/law/law';

// �Y�t�t�@�C���}�b�v���O���[�o���ϐ��Ƃ��ĕێ�
let globalAttachedFilesMap: Map<string, string> | undefined;

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
  StyleStructType,
  AppdxType,
  ArithFormulaType,
  ArithFormulaNumType,
  NewProvisionType,
  AmendProvisionType,
  AmendProvisionSentenceType,
} from '../api/types/law';

/**
 * HTML�^�O�𐶐�����⏕�֐�
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
 * �ǐՃA�v���[�`�ɂ�関�����^�O���o�@�\
 *
 * �����_�����O���ɏ��������t�B�[���h��Set�ɋL�^���A
 * �֐��̍Ō�ɂ��ׂẴt�B�[���h���������ꂽ���`�F�b�N���܂��B
 */

/**
 * �����ς݃t�B�[���h��ǐՂ���Set�^
 */
type ProcessedFieldsSet = Set<string>;

/**
 * �����ς݃t�B�[���h��Set��������
 * ���^�f�[�^ (':@', '#text') �͍ŏ����珜�O���܂�
 */
const initProcessedFields = (): ProcessedFieldsSet => {
  return new Set<string>([':@', '#text']);
};

/**
 * ���ׂẴt�B�[���h���������ꂽ���`�F�b�N
 *
 * @param obj - �����Ώۂ̃I�u�W�F�N�g
 * @param processed - �����ς݃t�B�[���h��Set
 * @param context - �G���[���b�Z�[�W�ɕ\������R���e�L�X�g���
 */
const checkAllFieldsProcessed = (
  obj: any,
  processed: ProcessedFieldsSet,
  context: string
): void => {
  // �I�u�W�F�N�g�łȂ��ꍇ�̓X�L�b�v
  if (!obj || typeof obj !== 'object') {
    return;
  }

  // �I�u�W�F�N�g�̑S�L�[���擾
  const actualFields = Object.keys(obj);

  // �������̃t�B�[���h�����o
  const unprocessedFields = actualFields.filter(field => !processed.has(field));

  // �������̃t�B�[���h�����݂���ꍇ�Ɍx��
  if (unprocessedFields.length > 0) {
    const errorMessage = `[�������^�O���o] ${context}: �ȉ��̃t�B�[���h����������Ă��܂���: ${unprocessedFields.join(', ')}`;

    console.error(errorMessage);
    console.error('�I�u�W�F�N�g�ڍ�:', obj);

    // ���[�U�[�ւ̒ʒm�i����̂݃A���[�g��\���A�u���E�U���̂݁j
    if (typeof window !== 'undefined' && !(window as any).__unprocessedFieldsAlertShown) {
      alert(`�@��XML�ɖ������̃^�O��������܂����B\n\n�R���\�[���ŏڍׂ��m�F���Ă��������B\n\n�ŏ��̖������^�O:\n${errorMessage}`);
      (window as any).__unprocessedFieldsAlertShown = true;
    }

    // Node.js���ł̓G���[��throw
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      throw new Error(errorMessage);
    }
  }
};
/**
 * TextNodeType�z���HTML�e�L�X�g�ɕϊ�
 * src/api/components/law/text-node.tsx �� getTextNode �֐����Č�
 */
const renderTextNode = (val: Array<TextNodeType>, treeElement: string[]): string => {
  return val.map((dt) => {
    // TextNodeTypeの既知のフィールド: Line, Ruby, Sup, Sub, QuoteStruct, ArithFormula, _
    const processed = initProcessedFields();

    if ('Line' in dt) {
      processed.add('Line');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // �����E��d�����̃X�^�C��
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
      // ���r
      processed.add('Ruby');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      const text = getType<TextType>(dt.Ruby, '_')[0]._;
      const rt = getType<RtType>(dt.Ruby, 'Rt')[0].Rt[0]._;
      return `<ruby>${text}<rt>${rt}</rt></ruby>`;
    } else if ('Sup' in dt) {
      // ��t������
      processed.add('Sup');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      const text = getType<TextType>(dt.Sup, '_')[0]._;
      return tag('sup', { class: 'Sup' }, text);
    } else if ('Sub' in dt) {
      // ���t������
      processed.add('Sub');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      const text = getType<TextType>(dt.Sub, '_')[0]._;
      return tag('sub', { class: 'Sub' }, text);
    } else if ('QuoteStruct' in dt) {
      // ���p�\�� - QuoteStruct���̗v�f�������iTableStruct�����܂܂��\��������j
      // QuoteStruct�͔z��łȂ��ꍇ������̂ŁA�z��ɕϊ�
      processed.add('QuoteStruct');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      const quoteStructList = Array.isArray(dt.QuoteStruct) ? dt.QuoteStruct : [dt.QuoteStruct];
      return renderLawTypeList(quoteStructList, treeElement, 'QuoteStruct');
    } else if ('ArithFormula' in dt) {
      // �Z�p�� - React���Ɠ�����<div class="pl-4">�Ń��b�v
      // Sub/Sup�^�O�𐳂���<sub>/<sup>�Ƃ��ďo�́ie-gov�@��API�d�l�ɏ����j
      processed.add('ArithFormula');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      const arithContent = dt.ArithFormula.map((item: any, itemIdx: number) => {
        // ArithFormula���̗v�f�����o�Ώہi�ǐՃA�v���[�`�j
        const arithProcessed = initProcessedFields();

        if ('Sub' in item) {
          arithProcessed.add('Sub');
          // ���t��������K�؂ɏo��
          const text = getType<TextType>(item.Sub, '_')[0]._;
          checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
          return tag('sub', { class: 'Sub' }, text);
        } else if ('Sup' in item) {
          arithProcessed.add('Sup');
          // ��t��������K�؂ɏo��
          const text = getType<TextType>(item.Sup, '_')[0]._;
          checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
          return tag('sup', { class: 'Sup' }, text);
        } else if ('Fig' in item) {
          arithProcessed.add('Fig');
          checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
          // ArithFormula内のFig要素処理
          const result = renderFig(item, treeElement);
          return result;
        } else if ('QuoteStruct' in item) {
          arithProcessed.add('QuoteStruct');
          checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
          // ArithFormula内のQuoteStruct要素処理
          const quoteStructList = Array.isArray(item.QuoteStruct) ? item.QuoteStruct : [item.QuoteStruct];
          return renderLawTypeList(quoteStructList, treeElement, 'ArithFormula');
        } else if ('_' in item) {
          arithProcessed.add('_');
          checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
          return item._;
        }
        checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
        return '';
      }).join('');
      return tag('div', { class: 'pl-4' }, arithContent);
    } else {
      processed.add('_');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // �v���[���e�L�X�g
      // ����: dt._�����l��0�̏ꍇ���������Ԃ��K�v������
      return dt._ !== undefined && dt._ !== null ? String(dt._) : '';
    }
  }).join('');
};

/**
 * ArithFormula要素をHTMLに変換
 * 算術式を含む要素を処理し、Sub/Sup/Fig/QuoteStruct/テキストを適切にレンダリング
 */
const renderArithFormula = (
  arithFormulaObj: any,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('ArithFormula');
  checkAllFieldsProcessed(arithFormulaObj, processed, 'ArithFormula');

  const arithContent = arithFormulaObj.ArithFormula.map((item: any, itemIdx: number) => {
    // ArithFormula内の要素を個別に処理（追跡アプローチ）
    const arithProcessed = initProcessedFields();

    if ('Sub' in item) {
      arithProcessed.add('Sub');
      // 下付き文字を適切に出力
      const text = getType<TextType>(item.Sub, '_')[0]._;
      checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
      return tag('sub', { class: 'Sub' }, text);
    } else if ('Sup' in item) {
      arithProcessed.add('Sup');
      // 上付き文字を適切に出力
      const text = getType<TextType>(item.Sup, '_')[0]._;
      checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
      return tag('sup', { class: 'Sup' }, text);
    } else if ('Fig' in item) {
      arithProcessed.add('Fig');
      checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
      // ArithFormula内のFig要素処理
      const result = renderFig(item, treeElement);
      return result;
    } else if ('QuoteStruct' in item) {
      arithProcessed.add('QuoteStruct');
      checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
      // ArithFormula内のQuoteStruct要素処理
      const quoteStructList = Array.isArray(item.QuoteStruct) ? item.QuoteStruct : [item.QuoteStruct];
      return renderLawTypeList(quoteStructList, treeElement, 'ArithFormula');
    } else if ('_' in item) {
      arithProcessed.add('_');
      checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
      return item._;
    }
    checkAllFieldsProcessed(item, arithProcessed, `ArithFormula[${itemIdx}]`);
    return '';
  }).join('');
  return tag('div', { class: 'pl-4' }, arithContent);
};

/**
 * LawTypeList�z���HTML�ɕϊ�
 * src/api/components/law/any.tsx �� LawAny �R���|�[�l���g���Č�
 * QuoteStruct, ArithFormula���̒��Ɋ܂܂��l�X�ȗv�f������
 */
const renderLawTypeList = (
  lawTypeList: any[],
  treeElement: string[],
  parentElement: string
): string => {
  return lawTypeList.map((dt: any, index: number) => {
    // LawTypeList�̊��m�̃t�B�[���h
    const processed = initProcessedFields();




























    const addTreeElement = [...treeElement, `${parentElement}_${index}`];

    if ('Sentence' in dt) {
      processed.add('Sentence');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSentence([dt], addTreeElement, false);
    } else if ('TableStruct' in dt) {
      processed.add('TableStruct');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderTableStruct([dt], addTreeElement);
    } else if ('Table' in dt) {
      processed.add('Table');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderTable(dt, addTreeElement);
    } else if ('FigStruct' in dt) {
      processed.add('FigStruct');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderFigStruct([dt], addTreeElement);
    } else if ('Fig' in dt) {
      processed.add('Fig');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      // QuoteStruct���ɒ���Fig���܂܂��ꍇ�̏���
      // dt���̂�n���idt[':@'].src��src����������j
      return renderFig(dt, addTreeElement);
    } else if ('StyleStruct' in dt) {
      processed.add('StyleStruct');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderStyleStruct([dt], addTreeElement);
    } else if ('List' in dt) {
      processed.add('List');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderList([dt], addTreeElement);
    } else if ('Paragraph' in dt) {
      processed.add('Paragraph');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderParagraph([dt], addTreeElement, 0);
    } else if ('Item' in dt) {
      processed.add('Item');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderItem([dt], addTreeElement, false);
    } else if ('Subitem1' in dt) {
      processed.add('Subitem1');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem1([dt], addTreeElement);
    } else if ('Subitem2' in dt) {
      processed.add('Subitem2');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem2([dt], addTreeElement);
    } else if ('Subitem3' in dt) {
      processed.add('Subitem3');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem3([dt], addTreeElement);
    } else if ('Subitem4' in dt) {
      processed.add('Subitem4');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem4([dt], addTreeElement);
    } else if ('Subitem5' in dt) {
      processed.add('Subitem5');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem5([dt], addTreeElement);
    } else if ('Subitem6' in dt) {
      processed.add('Subitem6');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem6([dt], addTreeElement);
    } else if ('Subitem7' in dt) {
      processed.add('Subitem7');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem7([dt], addTreeElement);
    } else if ('Subitem8' in dt) {
      processed.add('Subitem8');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem8([dt], addTreeElement);
    } else if ('Subitem9' in dt) {
      processed.add('Subitem9');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem9([dt], addTreeElement);
    } else if ('Subitem10' in dt) {
      processed.add('Subitem10');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderSubitem10([dt], addTreeElement);
    } else if ('AppdxTable' in dt) {
      processed.add('AppdxTable');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderAppdxTable([dt], addTreeElement);
    } else if ('AppdxNote' in dt) {
      processed.add('AppdxNote');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderAppdxNote([dt], addTreeElement);
    } else if ('AppdxStyle' in dt) {
      processed.add('AppdxStyle');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderAppdxStyle(dt, addTreeElement);
    } else if ('Appdx' in dt) {
      processed.add('Appdx');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderAppdx([dt], addTreeElement);
    } else if ('AppdxFig' in dt) {
      processed.add('AppdxFig');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderAppdxFig(dt, addTreeElement);
    } else if ('AppdxFormat' in dt) {
      processed.add('AppdxFormat');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderAppdxFormat(dt, addTreeElement);
    } else if ('TOC' in dt) {
      processed.add('TOC');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return renderTOC(dt, addTreeElement);
    } else if ('ArithFormula' in dt) {
      processed.add('ArithFormula');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      // QuoteStruct内のArithFormula要素処理
      return renderArithFormula(dt, addTreeElement);
    } else if ('TOCSection' in dt) {
      processed.add('TOCSection');
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      // QuoteStruct内のTOCSection要素処理
      return renderTOCSection([dt], addTreeElement);
    } else {
      // その他の要素型は空文字を返す
      checkAllFieldsProcessed(dt, processed, `LawTypeList[${parentElement}][${index}]`);
      return '';
    }
  }).join('');
};

/**
 * SentenceType�z���HTML�ɕϊ�
 * src/api/components/law/sentence.tsx �� LawSentence �R���|�[�l���g���Č�
 */
const renderSentence = (
  sentenceList: SentenceType[],
  treeElement: string[],
  isPrecedingSentence: boolean
): string => {
  return sentenceList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Sentence');

    const addTreeElement = [...treeElement, `Sentence_${index}`];
    const textContent = renderTextNode(dt.Sentence, addTreeElement);

    checkAllFieldsProcessed(dt, processed, `Sentence[${index}]`);

    if (getParentElement(treeElement) === 'Remarks') {
      return tag('div', {}, textContent + ' ');
    } else {
      // TableColumn, ArithFormula �̏ꍇ�͉��s������\������iReact�R�[�h�ł͋󕶎���o�́j
      return textContent;
    }
  }).join('');
};

/**
 * ColumnType�z���HTML�ɕϊ�
 * src/api/components/law/column.tsx �� LawColumn �R���|�[�l���g���Č�
 */
const renderColumn = (columnList: ColumnType[], treeElement: string[]): string => {
  let isLineBreak = false;
  return columnList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Column');

    const addTreeElement = [...treeElement, `Column_${index}`];

    if (!isLineBreak && (dt[':@'].LineBreak === undefined || !dt[':@'].LineBreak)) {
      isLineBreak = true;
    }

    let result = '';

    // index > 0 && isLineBreak �̏ꍇ�A�S�p�X�y�[�X�ǉ�
    if (index > 0 && isLineBreak) {
      result += '�@';
    }

    // Num > 1 �̏ꍇ���S�p�X�y�[�X�ǉ��i����ǋL�R�����g���j
    if (dt[':@'].Num && Number(dt[':@'].Num) > 1) {
      result += '�@';
    }

    result += renderSentence(dt.Column, addTreeElement, false);

    if (dt[':@'].LineBreak) {
      result += '<br>';
    }

    checkAllFieldsProcessed(dt, processed, `Column[${index}]`);

    return result;
  }).join('');
};

/**
 * ParagraphSentenceType��HTML�ɕϊ�
 * src/api/components/law/paragraph-sentence.tsx �� LawParagraphSentence �R���|�[�l���g���Č�
 */
const renderParagraphSentence = (
  paragraphSentence: ParagraphSentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('ParagraphSentence');

  const Sentence = getType<SentenceType>(
    paragraphSentence.ParagraphSentence,
    'Sentence'
  );

  // ParagraphSentence配列要素をチェック
  paragraphSentence.ParagraphSentence.forEach((elem, idx) => {
    const childProcessed = initProcessedFields();
    if ('Sentence' in elem) childProcessed.add('Sentence');
    checkAllFieldsProcessed(elem, childProcessed, `ParagraphSentence.ParagraphSentence[${idx}]`);
  });

  checkAllFieldsProcessed(paragraphSentence, processed, 'ParagraphSentence');
  return renderSentence(Sentence, [...treeElement, 'ParagraphSentence'], false);
};

/**
 * ItemSentenceType��HTML�ɕϊ�
 * src/api/components/law/item-sentence.tsx �� LawItemSentence �R���|�[�l���g���Č�
 */
const renderItemSentence = (
  itemSentence: ItemSentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('ItemSentence');

  const result = itemSentence.ItemSentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `ItemSentence_${index}`];
    const childProcessed = initProcessedFields();

    if ('Sentence' in dt) {
      const isPrecedingSentence =
        index > 0 &&
        itemSentence.ItemSentence.slice(0, index).some((dt) => 'Sentence' in dt);
      childProcessed.add('Sentence');
      checkAllFieldsProcessed(dt, childProcessed, `ItemSentence.ItemSentence[${index}]`);
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      childProcessed.add('Column');
      checkAllFieldsProcessed(dt, childProcessed, `ItemSentence.ItemSentence[${index}]`);
      return renderColumn([dt], addTreeElement);
    } else if ('Table' in dt) {
      childProcessed.add('Table');
      checkAllFieldsProcessed(dt, childProcessed, `ItemSentence.ItemSentence[${index}]`);
      return renderTable(dt, addTreeElement);
    } else {
      checkAllFieldsProcessed(dt, childProcessed, `ItemSentence.ItemSentence[${index}]`);
      return '';
    }
  }).join('');

  checkAllFieldsProcessed(itemSentence, processed, 'ItemSentence');
  return result;
};

/**
 * ���ԍ����x�����擾
 * src/api/components/law/paragraph.tsx �� getOldNumLabel �֐����Č�
 */
const getOldNumLabel = (val: number): string => {
  const numLabelList = [
    '?', '�@', '�A', '�B', '�C', '�D', '�E', '�F', '�G', '�H',
    '�I', '�J', '�J', '�K', '�L', '�M', '�N', '�O', '�P', '�Q',
    '�R', '�S', '?', '?', '?', '?', '?', '?', '?', '?',
    '?', '?', '?', '?', '?', '?', '?', '?', '?', '?',
    '?', '?', '?', '?', '?', '?', '?', '?', '?', '?',
    '?', '?',
  ];
  return val < numLabelList.length ? numLabelList[val] : val.toString();
};

/**
 * �c��m�[�h�̓��ɂQ���ڈȍ~��Paragraph�����݂��邩
 * src/api/components/law/subitem.tsx �� isParentParagraphPreceding �֐����Č�
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
 * Subitem1SentenceType ��HTML�ɕϊ�
 * src/api/components/law/subitem-sentence.tsx �� LawSubitem1Sentence �R���|�[�l���g���Č�
 */
const renderSubitem1Sentence = (
  subitem1Sentence: Subitem1SentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('Subitem1Sentence');

  const result = subitem1Sentence.Subitem1Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem1Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem1Sentence.Subitem1Sentence.slice(0, index).some((dt) => 'Sentence' in dt);
    const childProcessed = initProcessedFields();

    if ('Sentence' in dt) {
      childProcessed.add('Sentence');
      checkAllFieldsProcessed(dt, childProcessed, `Subitem1Sentence.Subitem1Sentence[${index}]`);
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      childProcessed.add('Column');
      checkAllFieldsProcessed(dt, childProcessed, `Subitem1Sentence.Subitem1Sentence[${index}]`);
      return renderColumn([dt], addTreeElement);
    } else if ('Table' in dt) {
      childProcessed.add('Table');
      checkAllFieldsProcessed(dt, childProcessed, `Subitem1Sentence.Subitem1Sentence[${index}]`);
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');

  checkAllFieldsProcessed(subitem1Sentence, processed, 'Subitem1Sentence');
  return result;
};

/**
 * Subitem2SentenceType ��HTML�ɕϊ�
 */
const renderSubitem2Sentence = (
  subitem2Sentence: Subitem2SentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('Subitem2Sentence');

  const result = subitem2Sentence.Subitem2Sentence.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem2Sentence_${index}`];
    const isPrecedingSentence =
      index > 0 &&
      subitem2Sentence.Subitem2Sentence.slice(0, index).some((dt) => 'Sentence' in dt);
    const childProcessed = initProcessedFields();

    if ('Sentence' in dt) {
      childProcessed.add('Sentence');
      checkAllFieldsProcessed(dt, childProcessed, `Subitem2Sentence.Subitem2Sentence[${index}]`);
      return renderSentence([dt], addTreeElement, isPrecedingSentence);
    } else if ('Column' in dt) {
      childProcessed.add('Column');
      checkAllFieldsProcessed(dt, childProcessed, `Subitem2Sentence.Subitem2Sentence[${index}]`);
      return renderColumn([dt], addTreeElement);
    } else if ('Table' in dt) {
      childProcessed.add('Table');
      checkAllFieldsProcessed(dt, childProcessed, `Subitem2Sentence.Subitem2Sentence[${index}]`);
      return renderTable(dt, addTreeElement);
    } else {
      return '';
    }
  }).join('');

  checkAllFieldsProcessed(subitem2Sentence, processed, 'Subitem2Sentence');
  return result;
};

/**
 * Subitem3SentenceType ��HTML�ɕϊ�
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
 * Subitem4SentenceType ��HTML�ɕϊ�
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
 * Subitem5SentenceType ��HTML�ɕϊ�
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
 * Subitem6SentenceType ��HTML�ɕϊ�
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
 * Subitem7SentenceType ��HTML�ɕϊ�
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
 * Subitem8SentenceType ��HTML�ɕϊ�
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
 * Subitem9SentenceType ��HTML�ɕϊ�
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
 * Subitem10SentenceType ��HTML�ɕϊ�
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
 * Subitem10Type�z���HTML�ɕϊ�
 */
const renderSubitem10 = (
  subitem10List: Subitem10Type[],
  treeElement: string[]
): string => {
  return subitem10List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem10');

    const addTreeElement = [...treeElement, `Subitem10_${index}`];
    const Subitem10Title = getType<Subitem10TitleType>(dt.Subitem10, 'Subitem10Title');
    const Subitem10Sentence = getType<Subitem10SentenceType>(dt.Subitem10, 'Subitem10Sentence')[0];

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-48' : 'pl-44';

    let content = '';
    if (Subitem10Title.length > 0) {
      const titleText = renderTextNode(Subitem10Title[0].Subitem10Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem10Sentence(Subitem10Sentence, addTreeElement);

    dt.Subitem10.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem10_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem10Title' in dt2) childProcessed.add('Subitem10Title');
      if ('Subitem10Sentence' in dt2) childProcessed.add('Subitem10Sentence');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem10[${index}].Subitem10[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem10[${index}]`);

    return tag('div', { class: `_div_Subitem10Sentence ${paddingClass} indent-1` }, content);
  }).join('');
};

/**
 * Subitem9Type�z���HTML�ɕϊ�
 */
const renderSubitem9 = (
  subitem9List: Subitem9Type[],
  treeElement: string[]
): string => {
  return subitem9List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem9');

    const addTreeElement = [...treeElement, `Subitem9_${index}`];
    const Subitem9Title = getType<Subitem9TitleType>(dt.Subitem9, 'Subitem9Title');
    const Subitem9Sentence = getType<Subitem9SentenceType>(dt.Subitem9, 'Subitem9Sentence')[0];
    const Subitem10 = getType<Subitem10Type>(dt.Subitem9, 'Subitem10');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-44' : 'pl-40';

    let content = '';
    if (Subitem9Title.length > 0) {
      const titleText = renderTextNode(Subitem9Title[0].Subitem9Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem9Sentence(Subitem9Sentence, addTreeElement);

    dt.Subitem9.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem9_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem9Title' in dt2) childProcessed.add('Subitem9Title');
      if ('Subitem9Sentence' in dt2) childProcessed.add('Subitem9Sentence');
      if ('Subitem10' in dt2) childProcessed.add('Subitem10');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem9[${index}].Subitem9[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem9[${index}]`);

    return (
      tag('div', { class: `_div_Subitem9Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem10(Subitem10, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem8Type�z���HTML�ɕϊ�
 */
const renderSubitem8 = (
  subitem8List: Subitem8Type[],
  treeElement: string[]
): string => {
  return subitem8List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem8');

    const addTreeElement = [...treeElement, `Subitem8_${index}`];
    const Subitem8Title = getType<Subitem8TitleType>(dt.Subitem8, 'Subitem8Title');
    const Subitem8Sentence = getType<Subitem8SentenceType>(dt.Subitem8, 'Subitem8Sentence')[0];
    const Subitem9 = getType<Subitem9Type>(dt.Subitem8, 'Subitem9');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-40' : 'pl-36';

    let content = '';
    if (Subitem8Title.length > 0) {
      const titleText = renderTextNode(Subitem8Title[0].Subitem8Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem8Sentence(Subitem8Sentence, addTreeElement);

    dt.Subitem8.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem8_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem8Title' in dt2) childProcessed.add('Subitem8Title');
      if ('Subitem8Sentence' in dt2) childProcessed.add('Subitem8Sentence');
      if ('Subitem9' in dt2) childProcessed.add('Subitem9');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem8[${index}].Subitem8[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem8[${index}]`);

    return (
      tag('div', { class: `_div_Subitem8Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem9(Subitem9, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem7Type�z���HTML�ɕϊ�
 */
const renderSubitem7 = (
  subitem7List: Subitem7Type[],
  treeElement: string[]
): string => {
  return subitem7List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem7');

    const addTreeElement = [...treeElement, `Subitem7_${index}`];
    const Subitem7Title = getType<Subitem7TitleType>(dt.Subitem7, 'Subitem7Title');
    const Subitem7Sentence = getType<Subitem7SentenceType>(dt.Subitem7, 'Subitem7Sentence')[0];
    const Subitem8 = getType<Subitem8Type>(dt.Subitem7, 'Subitem8');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-36' : 'pl-32';

    let content = '';
    if (Subitem7Title.length > 0) {
      const titleText = renderTextNode(Subitem7Title[0].Subitem7Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem7Sentence(Subitem7Sentence, addTreeElement);

    dt.Subitem7.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem7_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem7Title' in dt2) childProcessed.add('Subitem7Title');
      if ('Subitem7Sentence' in dt2) childProcessed.add('Subitem7Sentence');
      if ('Subitem8' in dt2) childProcessed.add('Subitem8');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem7[${index}].Subitem7[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem7[${index}]`);

    return (
      tag('div', { class: `_div_Subitem7Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem8(Subitem8, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem6Type�z���HTML�ɕϊ�
 */
const renderSubitem6 = (
  subitem6List: Subitem6Type[],
  treeElement: string[]
): string => {
  return subitem6List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem6');

    const addTreeElement = [...treeElement, `Subitem6_${index}`];
    const Subitem6Title = getType<Subitem6TitleType>(dt.Subitem6, 'Subitem6Title');
    const Subitem6Sentence = getType<Subitem6SentenceType>(dt.Subitem6, 'Subitem6Sentence')[0];
    const Subitem7 = getType<Subitem7Type>(dt.Subitem6, 'Subitem7');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-32' : 'pl-28';

    let content = '';
    if (Subitem6Title.length > 0) {
      const titleText = renderTextNode(Subitem6Title[0].Subitem6Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem6Sentence(Subitem6Sentence, addTreeElement);

    dt.Subitem6.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem6_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem6Title' in dt2) childProcessed.add('Subitem6Title');
      if ('Subitem6Sentence' in dt2) childProcessed.add('Subitem6Sentence');
      if ('Subitem7' in dt2) childProcessed.add('Subitem7');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem6[${index}].Subitem6[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem6[${index}]`);

    return (
      tag('div', { class: `_div_Subitem6Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem7(Subitem7, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem5Type�z���HTML�ɕϊ�
 */
const renderSubitem5 = (
  subitem5List: Subitem5Type[],
  treeElement: string[]
): string => {
  return subitem5List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem5');

    const addTreeElement = [...treeElement, `Subitem5_${index}`];
    const Subitem5Title = getType<Subitem5TitleType>(dt.Subitem5, 'Subitem5Title');
    const Subitem5Sentence = getType<Subitem5SentenceType>(dt.Subitem5, 'Subitem5Sentence')[0];
    const Subitem6 = getType<Subitem6Type>(dt.Subitem5, 'Subitem6');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-28' : 'pl-24';

    let content = '';
    if (Subitem5Title.length > 0) {
      const titleText = renderTextNode(Subitem5Title[0].Subitem5Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem5Sentence(Subitem5Sentence, addTreeElement);

    dt.Subitem5.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem5_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem5Title' in dt2) childProcessed.add('Subitem5Title');
      if ('Subitem5Sentence' in dt2) childProcessed.add('Subitem5Sentence');
      if ('Subitem6' in dt2) childProcessed.add('Subitem6');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem5[${index}].Subitem5[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem5[${index}]`);

    return (
      tag('div', { class: `_div_Subitem5Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem6(Subitem6, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem4Type�z���HTML�ɕϊ�
 */
const renderSubitem4 = (
  subitem4List: Subitem4Type[],
  treeElement: string[]
): string => {
  return subitem4List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subitem4');

    const addTreeElement = [...treeElement, `Subitem4_${index}`];
    const Subitem4Title = getType<Subitem4TitleType>(dt.Subitem4, 'Subitem4Title');
    const Subitem4Sentence = getType<Subitem4SentenceType>(dt.Subitem4, 'Subitem4Sentence')[0];
    const Subitem5 = getType<Subitem5Type>(dt.Subitem4, 'Subitem5');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-24' : 'pl-20';

    let content = '';
    if (Subitem4Title.length > 0) {
      const titleText = renderTextNode(Subitem4Title[0].Subitem4Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem4Sentence(Subitem4Sentence, addTreeElement);

    // React�łƓ��l�ɁAdt.Subitem4�z�񂩂�TableStruct, FigStruct, StyleStruct, List������
    dt.Subitem4.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem4_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem4Title' in dt2) childProcessed.add('Subitem4Title');
      if ('Subitem4Sentence' in dt2) childProcessed.add('Subitem4Sentence');
      if ('Subitem5' in dt2) childProcessed.add('Subitem5');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      } else if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      } else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      } else if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem4[${index}].Subitem4[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem4[${index}]`);

    return (
      tag('div', { class: `_div_Subitem4Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem5(Subitem5, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem3Type�z���HTML�ɕϊ�
 */
const renderSubitem3 = (
  subitem3List: Subitem3Type[],
  treeElement: string[]
): string => {
  return subitem3List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem3_${index}`];

    // Subitem3要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Subitem3');

    const Subitem3Title = getType<Subitem3TitleType>(dt.Subitem3, 'Subitem3Title');
    const Subitem3Sentence = getType<Subitem3SentenceType>(dt.Subitem3, 'Subitem3Sentence')[0];
    const Subitem4 = getType<Subitem4Type>(dt.Subitem3, 'Subitem4');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-20' : 'pl-16';

    let content = '';
    if (Subitem3Title.length > 0) {
      const titleText = renderTextNode(Subitem3Title[0].Subitem3Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem3Sentence(Subitem3Sentence, addTreeElement);

    // React�łƓ��l�ɁAdt.Subitem3�z�񂩂�TableStruct, FigStruct, StyleStruct, List������
    dt.Subitem3.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem3_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem3Title' in dt2) childProcessed.add('Subitem3Title');
      if ('Subitem3Sentence' in dt2) childProcessed.add('Subitem3Sentence');
      if ('Subitem4' in dt2) childProcessed.add('Subitem4');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      }
      if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      }
      if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      }
      if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem3[${index}].Subitem3[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem3[${index}]`);

    return (
      tag('div', { class: `_div_Subitem3Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem4(Subitem4, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem2Type�z���HTML�ɕϊ�
 */
const renderSubitem2 = (
  subitem2List: Subitem2Type[],
  treeElement: string[]
): string => {
  return subitem2List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem2_${index}`];

    // Subitem2要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Subitem2');

    const Subitem2Title = getType<Subitem2TitleType>(dt.Subitem2, 'Subitem2Title');
    const Subitem2Sentence = getType<Subitem2SentenceType>(dt.Subitem2, 'Subitem2Sentence')[0];
    const Subitem3 = getType<Subitem3Type>(dt.Subitem2, 'Subitem3');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-16' : 'pl-12';

    let content = '';
    if (Subitem2Title.length > 0) {
      const titleText = renderTextNode(Subitem2Title[0].Subitem2Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem2Sentence(Subitem2Sentence, addTreeElement);

    // React�łƓ��l�ɁAdt.Subitem2�z�񂩂�TableStruct, FigStruct, StyleStruct, List������
    // �����̗v�f��_div_Subitem2Sentence�̒��ɏo�͂����
    dt.Subitem2.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem2_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem2Title' in dt2) childProcessed.add('Subitem2Title');
      if ('Subitem2Sentence' in dt2) childProcessed.add('Subitem2Sentence');
      if ('Subitem3' in dt2) childProcessed.add('Subitem3');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      }
      if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      }
      if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      }
      if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem2[${index}].Subitem2[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem2[${index}]`);

    return (
      tag('div', { class: `_div_Subitem2Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem3(Subitem3, addTreeElement)
    );
  }).join('');
};

/**
 * Subitem1Type�z���HTML�ɕϊ�
 * src/api/components/law/subitem.tsx �� LawSubitem1 �R���|�[�l���g���Č�
 */
const renderSubitem1 = (
  subitem1List: Subitem1Type[],
  treeElement: string[]
): string => {
  return subitem1List.map((dt, index) => {
    const addTreeElement = [...treeElement, `Subitem1_${index}`];

    // Subitem1要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Subitem1');

    const Subitem1Title = getType<Subitem1TitleType>(dt.Subitem1, 'Subitem1Title');
    const Subitem1Sentence = getType<Subitem1SentenceType>(dt.Subitem1, 'Subitem1Sentence')[0];
    const Subitem2 = getType<Subitem2Type>(dt.Subitem1, 'Subitem2');

    const paddingClass = isParentParagraphPreceding(treeElement) ? 'pl-12' : 'pl-8';

    let content = '';
    if (Subitem1Title.length > 0) {
      const titleText = renderTextNode(Subitem1Title[0].Subitem1Title, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }
    content += renderSubitem1Sentence(Subitem1Sentence, addTreeElement);

    // React�łƓ��l�ɁAdt.Subitem1�z�񂩂�TableStruct, FigStruct, StyleStruct, List������
    // �����̗v�f��_div_Subitem1Sentence�̒��ɏo�͂����
    dt.Subitem1.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Subitem1_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('Subitem1Title' in dt2) childProcessed.add('Subitem1Title');
      if ('Subitem1Sentence' in dt2) childProcessed.add('Subitem1Sentence');
      if ('Subitem2' in dt2) childProcessed.add('Subitem2');
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        content += renderTableStruct([dt2], addTreeElement2);
      }
      if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([dt2], addTreeElement2);
      }
      if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        content += renderStyleStruct([dt2], addTreeElement2);
      }
      if ('List' in dt2) {
        childProcessed.add('List');
        content += renderList([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subitem1[${index}].Subitem1[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subitem1[${index}]`);

    return (
      tag('div', { class: `_div_Subitem1Sentence ${paddingClass} indent-1` }, content) +
      renderSubitem2(Subitem2, addTreeElement)
    );
  }).join('');
};

/**
 * ItemType�z���HTML�ɕϊ�
 * src/api/components/law/item.tsx �� LawItem �R���|�[�l���g���Č�
 */
const renderItem = (
  itemList: ItemType[],
  treeElement: string[],
  isPrecedingParagraph: boolean
): string => {
  // padding �N���X������
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

    // Item要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Item');

    const ItemTitle = getType<ItemTitleType>(dt.Item, 'ItemTitle');
    const ItemSentence = getType<ItemSentenceType>(dt.Item, 'ItemSentence')[0];

    // Subitem1���擾 - getType�Ō�����Ȃ��ꍇ�́Adt.Item�z��𒼐ڃt�B���^�����O
    let Subitem1 = getType<Subitem1Type>(dt.Item, 'Subitem1');
    if (Subitem1.length === 0) {
      // dt.Item�z�񂩂璼��Subitem1�����v�f�𒊏o
      const subitem1Elements = dt.Item.filter((item: any) => 'Subitem1' in item);
      if (subitem1Elements.length > 0) {
        // Subitem1�v�f��z��Ƃ��Ē��o
        Subitem1 = subitem1Elements.flatMap((item: any) =>
          Array.isArray(item.Subitem1) ? item.Subitem1 : [item.Subitem1]
        ).map((s: any) => ({ Subitem1: s })) as any;
      }
    }

    let content = '';

    // ItemTitle ������΃{�[���h�\��
    if (ItemTitle.length > 0) {
      const titleText = renderTextNode(ItemTitle[0].ItemTitle, addTreeElement);
      content += tag('span', { class: 'font-bold' }, titleText + '�@');
    }

    // ItemSentence �̓��e
    content += renderItemSentence(ItemSentence, addTreeElement);

    // ItemSentence��div���o��
    const itemSentenceHtml = tag('div', { class: `_div_ItemSentence ${padding()} indent-1` }, content);

    // Subitem1�̃����_�����O
    const subitem1Html = renderSubitem1(Subitem1, addTreeElement);

    // �q�v�f�iList, TableStruct, FigStruct, StyleStruct�j�̃����_�����O
    // React���Ɠ��l�� dt.Item �z������[�v���ď���
    let childrenHtml = '';
    dt.Item.forEach((dt2: any, index2: number) => {
      const addTreeElement2 = [...treeElement, `Item_${index}`, `Child_${index2}`];
      const childProcessed = initProcessedFields();
      if ('ItemTitle' in dt2) childProcessed.add('ItemTitle');
      if ('ItemSentence' in dt2) childProcessed.add('ItemSentence');
      if ('Subitem1' in dt2) childProcessed.add('Subitem1');
      if ('List' in dt2) {
        childProcessed.add('List');
        childrenHtml += renderList([dt2], addTreeElement2);
      }
      if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        childrenHtml += renderTableStruct([dt2], addTreeElement2);
      }
      if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        childrenHtml += renderFigStruct([dt2], addTreeElement2);
      }
      if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        childrenHtml += renderStyleStruct([dt2], addTreeElement2);
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Item[${index}].Item[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Item[${index}]`);

    // ���ׂĂ�HTML������
    return itemSentenceHtml + subitem1Html + childrenHtml;
  }).join('');
};

/**
 * AmendProvisionSentenceType ��HTML�ɕϊ�
 * src/api/components/law/amend-provision-sentence.tsx �� LawAmendProvisionSentence �R���|�[�l���g���Č�
 */
const renderAmendProvisionSentence = (
  amendProvisionSentence: any,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('AmendProvisionSentence');

  const Sentence = getType(amendProvisionSentence.AmendProvisionSentence, 'Sentence');

  // AmendProvisionSentence配列要素をチェック
  amendProvisionSentence.AmendProvisionSentence.forEach((elem: any, idx: number) => {
    const childProcessed = initProcessedFields();
    if ('Sentence' in elem) childProcessed.add('Sentence');
    checkAllFieldsProcessed(elem, childProcessed, `AmendProvisionSentence.AmendProvisionSentence[${idx}]`);
  });

  checkAllFieldsProcessed(amendProvisionSentence, processed, 'AmendProvisionSentence');
  return renderSentence(Sentence as any, [...treeElement, 'AmendProvisionSentence'], false);
};

/**
 * NewProvisionType�z���HTML�ɕϊ�
 * src/api/components/law/new-provision.tsx �� LawNewProvision �R���|�[�l���g���Č�
 */
const renderNewProvision = (
  newProvisionList: NewProvisionType[],
  treeElement: string[]
): string => {
  let isParagraph = false;
  let paragraphIndex = 0;

  return newProvisionList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('NewProvision');

    const addTreeElement = (index2?: number) => [
      ...treeElement,
      `NewProvision_${index}${index2 !== undefined ? `_Child_${index2}` : ''}`,
    ];

    const result = dt.NewProvision.map((dt2, index2) => {
      const childTreeElement = addTreeElement(index2);
      const childProcessed = initProcessedFields();

      // FigStruct����
      if ('FigStruct' in dt2) {
        childProcessed.add('FigStruct');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderFigStruct([dt2], childTreeElement);
      }
      // TableStruct����
      else if ('TableStruct' in dt2) {
        childProcessed.add('TableStruct');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderTableStruct([dt2], childTreeElement);
      }
      // Paragraph����
      else if ('Paragraph' in dt2) {
        isParagraph = true;
        paragraphIndex++;
        childProcessed.add('Paragraph');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderParagraph([dt2], childTreeElement, paragraphIndex - 1);
      }
      // Item����
      else if ('Item' in dt2) {
        childProcessed.add('Item');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderItem([dt2], childTreeElement, isParagraph);
      }
      // Article����
      else if ('Article' in dt2) {
        childProcessed.add('Article');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderArticle([dt2], childTreeElement);
      }
      // Section����
      else if ('Section' in dt2) {
        childProcessed.add('Section');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderSection([dt2], childTreeElement);
      }
      // Chapter����
      else if ('Chapter' in dt2) {
        childProcessed.add('Chapter');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderChapter([dt2], childTreeElement);
      }
      // Part����
      else if ('Part' in dt2) {
        childProcessed.add('Part');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderPart([dt2], childTreeElement);
      }
      // List����
      else if ('List' in dt2) {
        childProcessed.add('List');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderList([dt2], childTreeElement);
      }
      // Sentence����
      else if ('Sentence' in dt2) {
        const isPrecedingSentence = index2 > 0 &&
          dt.NewProvision.slice(0, index2).some((item: any) => 'Sentence' in item);
        childProcessed.add('Sentence');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderSentence([dt2], childTreeElement, isPrecedingSentence);
      }
      // Remarks����
      else if ('Remarks' in dt2) {
        childProcessed.add('Remarks');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderRemarks([dt2], childTreeElement);
      }
      // AppdxTable����
      else if ('AppdxTable' in dt2) {
        childProcessed.add('AppdxTable');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderAppdxTable([dt2], childTreeElement);
      }
      // AppdxNote����
      else if ('AppdxNote' in dt2) {
        childProcessed.add('AppdxNote');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderAppdxNote([dt2], childTreeElement);
      }
      // StyleStruct����
      else if ('StyleStruct' in dt2) {
        childProcessed.add('StyleStruct');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderStyleStruct([dt2], childTreeElement);
      }
      // FormatStruct����
      else if ('FormatStruct' in dt2) {
        childProcessed.add('FormatStruct');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderFormatStruct([dt2], childTreeElement);
      }
      // NoteStruct����
      else if ('NoteStruct' in dt2) {
        childProcessed.add('NoteStruct');
        checkAllFieldsProcessed(dt2, childProcessed, `NewProvision[${index}].NewProvision[${index2}]`);
        return renderNoteStruct(dt2, childTreeElement);
      }
      // ���̑��̃T�|�[�g����Ă��Ȃ��v�f�̓X�L�b�v
      return '';
    }).join('');

    checkAllFieldsProcessed(dt, processed, `NewProvision[${index}]`);
    return result;
  }).join('');
};

/**
 * AmendProvisionType�z���HTML�ɕϊ�
 * src/api/components/law/amend-provision.tsx �� LawAmendProvision �R���|�[�l���g���Č�
 */
const renderAmendProvision = (
  amendProvisionList: any[],
  treeElement: string[]
): string => {
  return amendProvisionList.map((dt, index) => {
    const addTreeElement = [...treeElement, `AmendProvision_${index}`];

    // AmendProvision要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('AmendProvision');

    const AmendProvisionSentence = getType(dt.AmendProvision, 'AmendProvisionSentence');
    const NewProvision = getType<NewProvisionType>(dt.AmendProvision, 'NewProvision');

    let html = '';

    // AmendProvisionSentence����
    if (AmendProvisionSentence.length > 0) {
      const parentElement = getParentElement(treeElement);
      const paddingClass = ['Paragraph', 'Article'].includes(parentElement) ? 'pl-4' : '';
      const sentenceHtml = renderAmendProvisionSentence(AmendProvisionSentence[0], addTreeElement);
      html += tag('div', { class: `_div_AmendProvisionSentence ${paddingClass} indent-1` }, sentenceHtml);
    }

    // NewProvision����
    if (NewProvision.length > 0) {
      const newProvisionContent = renderNewProvision(NewProvision, addTreeElement);
      html += tag('div', { class: 'pl-4' }, newProvisionContent);
    }

    // AmendProvision配列の各要素をチェック
    dt.AmendProvision.forEach((amendElem: any, elemIdx: number) => {
      const amendProcessed = initProcessedFields();
      if ('AmendProvisionSentence' in amendElem) amendProcessed.add('AmendProvisionSentence');
      if ('NewProvision' in amendElem) amendProcessed.add('NewProvision');
      checkAllFieldsProcessed(amendElem, amendProcessed, `AmendProvision[${index}].AmendProvision[${elemIdx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `AmendProvision[${index}]`);
    return html;
  }).join('');
};

/**
 * ParagraphType�z���HTML�ɕϊ�
 * src/api/components/law/paragraph.tsx �� LawParagraph �R���|�[�l���g���Č�
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

    // Paragraph要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Paragraph');

    const ParagraphCaption = getType<ParagraphCaptionType>(dt.Paragraph, 'ParagraphCaption');
    const ParagraphNum = getType<ParagraphNumType>(dt.Paragraph, 'ParagraphNum')[0];
    const ParagraphSentence = getType<ParagraphSentenceType>(dt.Paragraph, 'ParagraphSentence')[0];

    // ���ԍ��m�[�h
    let paragraphNumNode = '';
    if (dt[':@'].OldNum !== undefined && dt[':@'].OldNum) {
      paragraphNumNode = tag('span', { class: 'font-bold' }, getOldNumLabel(dt[':@'].Num)) + '�@';
    } else if (ParagraphNum.ParagraphNum.length > 0) {
      const numText = renderTextNode(ParagraphNum.ParagraphNum, addTreeElement);
      paragraphNumNode = tag('span', { class: 'font-bold' }, numText) + '�@';
    }

    // ���L���v�V�����i���o���j
    let captionHtml = '';
    if (ParagraphCaption.length > 0) {
      const captionText = renderTextNode(
        ParagraphCaption[0].ParagraphCaption,
        addTreeElement
      );
      captionHtml = tag('div', { class: '_div_ParagraphCaption font-bold pl-4' }, captionText);
    }

    // ������div
    const sentenceClass = ParagraphNum.ParagraphNum.length > 0
      ? '_div_ParagraphSentence pl-4 indent-1'
      : '_div_ParagraphSentence indent1';

    const sentenceContent = paragraphNumNode + renderParagraphSentence(ParagraphSentence, addTreeElement);
    const sentenceHtml = tag('div', { class: sentenceClass }, sentenceContent);

    // �q�v�f�iItem, TableStruct, FigStruct, List���j�̃����_�����O
    // React�łƓ������Adt.Paragraph�z������Ԃɏ������邱�ƂŐ������������ێ�
    let childrenHtml = '';
    dt.Paragraph.forEach((dt2: any, index2: number) => {
      // Paragraph�̊��m�̃t�B�[���h
      const processed = initProcessedFields();
      if ('ParagraphCaption' in dt2) {
        processed.add('ParagraphCaption');
      }
      if ('ParagraphNum' in dt2) {
        processed.add('ParagraphNum');
      }
      if ('ParagraphSentence' in dt2) {
        processed.add('ParagraphSentence');
      }
      const addTreeElementChild = [
        ...treeElement,
        `Paragraph_${index + parentParagraphIndex}_Child_${index2}`
      ];
      if ('AmendProvision' in dt2) {
        processed.add('AmendProvision');
        childrenHtml += renderAmendProvision([dt2], addTreeElementChild);
      }
      if ('Class' in dt2) {
        processed.add('Class');
        // Class�����i�������̏ꍇ�̓X�L�b�v�j
      }
      if ('TableStruct' in dt2) {
        processed.add('TableStruct');
        childrenHtml += renderTableStruct([dt2], addTreeElementChild);
      }
      if ('FigStruct' in dt2) {
        processed.add('FigStruct');
        childrenHtml += renderFigStruct([dt2], addTreeElementChild);
      }
      if ('StyleStruct' in dt2) {
        processed.add('StyleStruct');
        childrenHtml += renderStyleStruct([dt2], addTreeElementChild);
      }
      if ('Item' in dt2) {
        processed.add('Item');
        childrenHtml += renderItem([dt2], addTreeElementChild, index + parentParagraphIndex > 0);
      }
      if ('List' in dt2) {
        processed.add('List');
        childrenHtml += renderList([dt2], addTreeElementChild);
      }
      checkAllFieldsProcessed(dt2, processed, `Paragraph[${index}].Paragraph[${index2}]`);
    });

    // �e�v�f�ɉ����ă��b�s���O
    const parentElement = getParentElement(treeElement);

    checkAllFieldsProcessed(dt, processed, `Paragraph[${index}]`);

    if (parentElement === 'TableColumn') {
      // TableColumn����Paragraph�̏ꍇ�Adiv�Ń��b�v�����A���ڏo��
      // �q�v�f������ꍇ��index > 0�̏ꍇ��<br />��ǉ�
      const hasChildren = childrenHtml.length > 0;
      const brTag = (hasChildren || index > 0) ? '<br>' : '';
      return paragraphNumNode + renderParagraphSentence(ParagraphSentence, addTreeElement) + brTag + childrenHtml;
    } else if (parentElement === 'Article' && index + parentParagraphIndex === 0) {
      // Article �̑�1���̏ꍇ�AArticleTitle �ɒ��ڑ�����idiv�s�v�j
      return renderParagraphSentence(ParagraphSentence, addTreeElement) + childrenHtml;
    } else if (['MainProvision', 'SupplProvision'].includes(parentElement)) {
      // MainProvision, SupplProvision�����̏ꍇ�Asection�ň͂�
      return tag('section', { class: 'active Paragraph' }, captionHtml + sentenceHtml + childrenHtml);
    } else {
      // ���̑��̏ꍇ
      return captionHtml + sentenceHtml + childrenHtml;
    }
  }).join('');
};

/**
 * DivisionType��HTML�ɕϊ�
 * src/api/components/law/division.tsx �� LawDivision �R���|�[�l���g���Č�
 */
const renderDivision = (
  divisionList: DivisionType[],
  treeElement: string[]
): string => {
  return divisionList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Division');

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

    // Division配列要素をチェック
    dt.Division.forEach((elem, idx) => {
      const childProcessed = initProcessedFields();
      if ('DivisionTitle' in elem) childProcessed.add('DivisionTitle');
      if ('Article' in elem) childProcessed.add('Article');
      checkAllFieldsProcessed(elem, childProcessed, `Division[${index}].Division[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Division[${index}]`);
    return content;
  }).join('');
};

/**
 * SubsectionType��HTML�ɕϊ�
 * src/api/components/law/subsection.tsx �� LawSubsection �R���|�[�l���g���Č�
 */
const renderSubsection = (
  subsectionList: SubsectionType[],
  treeElement: string[]
): string => {
  return subsectionList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Subsection');

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

    // �q�v�f�iArticle�ADivision�j
    dt.Subsection.forEach((dt2, index2) => {
      const childProcessed = initProcessedFields();
      if ('SubsectionTitle' in dt2) childProcessed.add('SubsectionTitle');
      if ('Article' in dt2) {
        childProcessed.add('Article');
        content += renderArticle([dt2], addTreeElement(index2));
      } else if ('Division' in dt2) {
        childProcessed.add('Division');
        content += renderDivision([dt2], addTreeElement(index2));
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Subsection[${index}].Subsection[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Subsection[${index}]`);

    return content;
  }).join('');
};

/**
 * SectionType��HTML�ɕϊ�
 * src/api/components/law/section.tsx �� LawSection �R���|�[�l���g���Č�
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

    // Section要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Section');

    const SectionTitle = getType<SectionTitleType>(dt.Section, 'SectionTitle')[0];

    let content = '';

    // SectionTitle
    content += tag('section', { class: 'active Section pb-4' },
      tag('div', { class: 'SectionTitle _div_SectionTitle pl-16 font-bold' },
        renderTextNode(SectionTitle.SectionTitle, addTreeElement())
      )
    );

    // �q�v�f�iArticle�ASubsection�ADivision�j
    dt.Section.forEach((dt2, index2) => {
      const childProcessed = initProcessedFields();
      if ('SectionTitle' in dt2) childProcessed.add('SectionTitle');
      if ('Article' in dt2) {
        childProcessed.add('Article');
        content += renderArticle([dt2], addTreeElement(index2));
      }
      if ('Subsection' in dt2) {
        childProcessed.add('Subsection');
        content += renderSubsection([dt2], addTreeElement(index2));
      }
      if ('Division' in dt2) {
        childProcessed.add('Division');
        content += renderDivision([dt2], addTreeElement(index2));
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Section[${index}].Section[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Section[${index}]`);
    return content;
  }).join('');
};

/**
 * ChapterType��HTML�ɕϊ�
 * src/api/components/law/chapter.tsx �� LawChapter �R���|�[�l���g���Č�
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

    // Chapter要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Chapter');

    const ChapterTitle = getType<ChapterTitleType>(chapter.Chapter, 'ChapterTitle')[0];

    let content = '';

    // ChapterTitle
    content += tag('section', { class: 'active Chapter pb-4' },
      tag('div', { class: 'ChapterTitle _div_ChapterTitle font-bold pl-12' },
        renderTextNode(ChapterTitle.ChapterTitle, addTreeElement())
      )
    );

    // �q�v�f�iArticle�ASection�j
    chapter.Chapter.forEach((dt2, index2) => {
      const childProcessed = initProcessedFields();
      if ('ChapterTitle' in dt2) childProcessed.add('ChapterTitle');
      if ('Article' in dt2) {
        childProcessed.add('Article');
        content += renderArticle([dt2], addTreeElement(index2));
      }
      if ('Section' in dt2) {
        childProcessed.add('Section');
        content += renderSection([dt2], addTreeElement(index2));
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Chapter[${index}].Chapter[${index2}]`);
    });

    checkAllFieldsProcessed(chapter, processed, `Chapter[${index}]`);
    return content;
  }).join('');
};

/**
 * PartType��HTML�ɕϊ�
 * src/api/components/law/part.tsx �� LawPart �R���|�[�l���g���Č�
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

    // Part要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Part');

    const PartTitle = getType<PartTitleType>(dt.Part, 'PartTitle')[0];

    let content = '';

    // PartTitle
    content += tag('section', { class: 'active Part followingPart Part pb-4' },
      tag('div', { class: '_div_PartTitle PartTitle font-bold pl-8' },
        renderTextNode(PartTitle.PartTitle, addTreeElement())
      )
    );

    // �q�v�f�iChapter�AArticle�j
    dt.Part.forEach((dt2, index2) => {
      const childProcessed = initProcessedFields();
      if ('PartTitle' in dt2) childProcessed.add('PartTitle');
      if ('Chapter' in dt2) {
        childProcessed.add('Chapter');
        content += renderChapter([dt2], addTreeElement(index2));
      }
      if ('Article' in dt2) {
        childProcessed.add('Article');
        content += renderArticle([dt2], addTreeElement(index2));
      }
      checkAllFieldsProcessed(dt2, childProcessed, `Part[${index}].Part[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Part[${index}]`);
    return content;
  }).join('');
};

/**
 * ArticleType�z���HTML�ɕϊ�
 * src/api/components/law/article.tsx �� LawArticle �R���|�[�l���g���Č�
 */
const renderArticle = (
  articleList: ArticleType[],
  treeElement: string[]
): string => {
  return articleList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Article_${index}`];

    // Article要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('Article');

    const ArticleCaption = getType<ArticleCaptionType>(dt.Article, 'ArticleCaption');
    const ArticleTitle = getType<ArticleTitleType>(dt.Article, 'ArticleTitle')[0];
    const Paragraph = getType<ParagraphType>(dt.Article, 'Paragraph');
    const SupplNote = getType<SupplNoteType>(dt.Article, 'SupplNote');

    let content = '';

    // ArticleCaption�i���̌��o���j- Article[0]�ɂ���ꍇ
    if ('ArticleCaption' in dt.Article[0]) {
      const captionText = renderTextNode(
        ArticleCaption[0].ArticleCaption,
        addTreeElement
      );
      content += tag('div', { class: '_div_ArticleCaption font-bold pl-4' }, captionText);
    }

    // ArticleTitle�i���^�C�g���j+ ��1��
    let articleTitleContent = '';

    // ArticleTitle�̃e�L�X�g
    const titleText = renderTextNode(ArticleTitle.ArticleTitle, addTreeElement);
    articleTitleContent += tag('span', { class: 'font-bold' }, titleText);

    // ArticleCaption �� Article[1] �ɂ���ꍇ�i�H�ȃP�[�X�j
    if ('ArticleCaption' in dt.Article[1]) {
      const captionText = renderTextNode(
        ArticleCaption[0].ArticleCaption,
        addTreeElement
      );
      articleTitleContent += tag('span', { class: 'font-bold' }, captionText);
    }

    // �S�p�X�y�[�X
    articleTitleContent += '�@';

    // ��1���i���ԍ��Ȃ��j
    articleTitleContent += renderParagraph([Paragraph[0]], addTreeElement, 0);

    content += tag('div', { class: '_div_ArticleTitle pl-4 indent-1' }, articleTitleContent);

    // ��2���ȍ~
    if (Paragraph.length > 1) {
      content += renderParagraph(
        Paragraph.filter((dt, i) => i > 0),
        [...treeElement, `Article_${index}_Second`],
        1
      );
    }

    // SupplNote�i�⑫�j
    if (SupplNote.length > 0) {
      const noteText = renderTextNode(SupplNote[0].SupplNote, addTreeElement);
      content += tag('div', { class: '_div_SupplNote pl-8 indent-1' }, noteText);
    }

    // Article配列の各要素をチェック
    dt.Article.forEach((articleElem: any, elemIdx: number) => {
      const articleProcessed = initProcessedFields();
      if ('ArticleCaption' in articleElem) articleProcessed.add('ArticleCaption');
      if ('ArticleTitle' in articleElem) articleProcessed.add('ArticleTitle');
      if ('Paragraph' in articleElem) articleProcessed.add('Paragraph');
      if ('SupplNote' in articleElem) articleProcessed.add('SupplNote');
      checkAllFieldsProcessed(articleElem, articleProcessed, `Article[${index}].Article[${elemIdx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Article[${index}]`);
    return tag('section', { class: 'active Article pb-4' }, content);
  }).join('');
};

/**
 * MainProvisionType��HTML�ɕϊ�
 * src/api/components/law/main-provision.tsx �� LawMainProvision �R���|�[�l���g���Č�
 */
const renderMainProvision = (
  mainProvision: MainProvisionType,
  treeElement: string[]
): string => {
  let paragraphIndex = 0;

  return mainProvision.MainProvision.map((dt, index) => {
    const addTreeElement = [...treeElement, `MainProvision_${index}`];

    // MainProvision���v�f�̃t�B�[���h�`�F�b�N
    const processed = initProcessedFields();

    if ('Part' in dt) {

      processed.add('Part');

    }

    if ('Chapter' in dt) {

      processed.add('Chapter');

    }

    if ('Section' in dt) {

      processed.add('Section');

    }

    if ('Article' in dt) {

      processed.add('Article');

    }

    if ('Paragraph' in dt) {

      processed.add('Paragraph');

    }

    checkAllFieldsProcessed(dt, processed, `MainProvision[${index}]`);

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
 * SupplProvisionType��HTML�ɕϊ�
 * src/api/components/law/suppl-provision.tsx �� LawSupplProvision �R���|�[�l���g���Č�
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

  // SupplProvisionLabel�i�����̃^�C�g���j
  let labelText = '';
  if (SupplProvisionLabel.SupplProvisionLabel) {
    labelText = renderTextNode(SupplProvisionLabel.SupplProvisionLabel, addTreeElement());
  }

  // AmendLawNum�����i�����@�ߔԍ��j
  if (supplProvision[':@']?.AmendLawNum) {
    labelText += `�@�i${supplProvision[':@'].AmendLawNum}�j`;
  }

  // Extract�����i���j
  if (supplProvision[':@']?.Extract) {
    labelText += '�@��';
  }

  content += tag('div', { class: '_div_SupplProvisionLabel SupplProvisionLabel pl-12 font-bold pb-4' }, labelText);

  // Paragraph�v�f�i���j
  content += renderParagraph(Paragraph, addTreeElement(), 0);

  // Chapter�v�f�i�́j
  content += renderChapter(Chapter, addTreeElement(1));

  // Article�v�f�i���j
  content += renderArticle(Article, addTreeElement(1));

  // SupplProvisionAppdxTable�ASupplProvisionAppdxStyle�ASupplProvisionAppdx���̏���
  // React���Ɠ������AXML���ł̏o��������ێ�����K�v������
  supplProvision.SupplProvision.forEach((dt: any, dtIdx: number) => {
    const childProcessed = initProcessedFields();
    if ('SupplProvisionLabel' in dt) childProcessed.add('SupplProvisionLabel');
    if ('Paragraph' in dt) childProcessed.add('Paragraph');
    if ('Chapter' in dt) childProcessed.add('Chapter');
    if ('Article' in dt) childProcessed.add('Article');
    if ('SupplProvisionAppdxTable' in dt) {
      childProcessed.add('SupplProvisionAppdxTable');
      content += renderSupplProvisionAppdxTable([dt], addTreeElement(2));
    }
    if ('SupplProvisionAppdxStyle' in dt) {
      childProcessed.add('SupplProvisionAppdxStyle');
      content += renderSupplProvisionAppdxStyle([dt], addTreeElement(2));
    }
    if ('SupplProvisionAppdx' in dt) {
      childProcessed.add('SupplProvisionAppdx');
      content += renderSupplProvisionAppdx([dt], addTreeElement(2));
    }
    checkAllFieldsProcessed(dt, childProcessed, `SupplProvision.SupplProvision[${dtIdx}]`);
  });

  return tag('section', { class: 'active SupplProvision pb-4', style: 'display:none' }, content);
};

/**
 * SupplProvisionAppdxTableType�z���HTML�ɕϊ�
 * src/api/components/law/suppl-provision-appdx-table.tsx �� LawSupplProvisionAppdxTable �R���|�[�l���g���Č�
 */
const renderSupplProvisionAppdxTable = (
  supplProvisionAppdxTableList: SupplProvisionAppdxTableType[],
  treeElement: string[]
): string => {
  return supplProvisionAppdxTableList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('SupplProvisionAppdxTable');

    const addTreeElement = [...treeElement, `SupplProvisionAppdxTable_${index}`];
    let content = '';

    // SupplProvisionAppdxTableTitle + RelatedArticleNum
    dt.SupplProvisionAppdxTable.forEach((elem: any, index2: number) => {
      const elemProcessed = initProcessedFields();

      if ('SupplProvisionAppdxTableTitle' in elem) {
        elemProcessed.add('SupplProvisionAppdxTableTitle');
        content += tag('div', { class: '_div_SupplProvisionAppdxStyleTitle font-bold' },
          renderTextNode(elem.SupplProvisionAppdxTableTitle, addTreeElement)
        );
      }
      if ('RelatedArticleNum' in elem) {
        elemProcessed.add('RelatedArticleNum');
        content += renderRelatedArticleNum([elem], addTreeElement);
      }
      if ('TableStruct' in elem) {
        elemProcessed.add('TableStruct');
        content += renderTableStruct([elem], addTreeElement);
      }

      // 各要素が持つすべてのフィールドをチェック
      checkAllFieldsProcessed(elem, elemProcessed, `SupplProvisionAppdxTable[${index}].SupplProvisionAppdxTable[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `SupplProvisionAppdxTable[${index}]`);

    return tag('section', { class: 'active SupplProvisionAppdxTable' }, content);
  }).join('');
};

/**
 * SupplProvisionAppdxStyleType�z���HTML�ɕϊ�
 * src/api/components/law/suppl-provision-appdx-style.tsx �� LawSupplProvisionAppdxStyle �R���|�[�l���g���Č�
 */
const renderSupplProvisionAppdxStyle = (
  supplProvisionAppdxStyleList: SupplProvisionAppdxStyleType[],
  treeElement: string[]
): string => {
  return supplProvisionAppdxStyleList.map((dt, index) => {
    const addTreeElement = [...treeElement, `SupplProvisionAppdxStyle_${index}`];

    // SupplProvisionAppdxStyle要素のフィールドチェック
    const processed = initProcessedFields();
    processed.add('SupplProvisionAppdxStyle');

    let content = '';

    // dt.SupplProvisionAppdxStyle配列を走査して、各要素を処理しながらprocessed.addする
    dt.SupplProvisionAppdxStyle.forEach((elem: any, index2: number) => {
      const elemProcessed = initProcessedFields();

      if ('SupplProvisionAppdxStyleTitle' in elem) {
        elemProcessed.add('SupplProvisionAppdxStyleTitle');
        content += tag('div', { class: '_div_SupplProvisionAppdxStyleTitle font-bold' },
          renderTextNode(elem.SupplProvisionAppdxStyleTitle, addTreeElement)
        );
      }
      if ('RelatedArticleNum' in elem) {
        elemProcessed.add('RelatedArticleNum');
        content += renderRelatedArticleNum([elem], addTreeElement);
      }
      if ('StyleStruct' in elem) {
        elemProcessed.add('StyleStruct');
        content += renderStyleStruct([elem], addTreeElement);
      }

      // 各要素が持つすべてのフィールドをチェック
      checkAllFieldsProcessed(elem, elemProcessed, `SupplProvisionAppdxStyle[${index}].SupplProvisionAppdxStyle[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `SupplProvisionAppdxStyle[${index}]`);

    return tag('section', { class: 'active SupplProvisionAppdxStyle' }, content);
  }).join('');
};

/**
 * SupplProvisionAppdxType�z���HTML�ɕϊ�
 * src/api/components/law/suppl-provision-appdx.tsx �� LawSupplProvisionAppdx �R���|�[�l���g���Č�
 */
const renderSupplProvisionAppdx = (
  supplProvisionAppdxList: SupplProvisionAppdxType[],
  treeElement: string[]
): string => {
  return supplProvisionAppdxList.map((dt, index) => {
    const addTreeElement = [...treeElement, `SupplProvisionAppdx_${index}`];

    // SupplProvisionAppdx要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('SupplProvisionAppdx');

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

    // ArithFormulaNum �܂��� RelatedArticleNum �����݂���ꍇ
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

    // ArithFormula (getTextNode����)
    // React�łł� ArithFormula �� <div class="pl-4"> �Ń��b�v�����
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

    checkAllFieldsProcessed(dt, processed, `SupplProvisionAppdx[${index}]`);
    return tag('section', { class: 'active SupplProvisionAppdx' }, content);
  }).join('');
};

/**
 * ArticleRangeType��HTML�ɕϊ�
 * src/api/components/law/article-range.tsx �� LawArticleRange �R���|�[�l���g���Č�
 */
const renderArticleRange = (
  articleRange: ArticleRangeType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('ArticleRange');

  const result = renderTextNode(articleRange.ArticleRange, [...treeElement, 'ArticleRange']);

  checkAllFieldsProcessed(articleRange, processed, 'ArticleRange');
  return result;
};

/**
 * TOCArticleType�z���HTML�ɕϊ�
 * src/api/components/law/toc-article.tsx �� LawTOCArticle �R���|�[�l���g���Č�
 */
const renderTOCArticle = (
  tocArticleList: TOCArticleType[],
  treeElement: string[]
): string => {
  return tocArticleList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TOCArticle');

    const addTreeElement = [...treeElement, `TOCArticle_${index}`];

    const ArticleTitle = getType<ArticleTitleType>(dt.TOCArticle, 'ArticleTitle')[0];
    const ArticleCaption = getType<ArticleCaptionType>(dt.TOCArticle, 'ArticleCaption')[0];

    // TOCArticle配列要素をチェック
    dt.TOCArticle.forEach((elem, idx) => {
      const childProcessed = initProcessedFields();
      if ('ArticleTitle' in elem) childProcessed.add('ArticleTitle');
      if ('ArticleCaption' in elem) childProcessed.add('ArticleCaption');
      checkAllFieldsProcessed(elem, childProcessed, `TOCArticle[${index}].TOCArticle[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `TOCArticle[${index}]`);
    return tag('div', { class: '_div_TOCArticle pl-4' },
      renderTextNode(ArticleTitle.ArticleTitle, addTreeElement) +
      renderTextNode(ArticleCaption.ArticleCaption, addTreeElement)
    );
  }).join('');
};

/**
 * TOCDivisionType�z���HTML�ɕϊ�
 * src/api/components/law/toc-division.tsx �� LawTOCDivision �R���|�[�l���g���Č�
 */
const renderTOCDivision = (
  tocDivisionList: TOCDivisionType[],
  treeElement: string[]
): string => {
  return tocDivisionList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TOCDivision');

    const addTreeElement = [...treeElement, `TOCDivision_${index}`];

    const DivisionTitle = getType<any>(dt.TOCDivision, 'DivisionTitle')[0];
    const ArticleRange = getType<ArticleRangeType>(dt.TOCDivision, 'ArticleRange');

    // TOCDivision配列要素をチェック
    dt.TOCDivision.forEach((elem, idx) => {
      const childProcessed = initProcessedFields();
      if ('DivisionTitle' in elem) childProcessed.add('DivisionTitle');
      if ('ArticleRange' in elem) childProcessed.add('ArticleRange');
      checkAllFieldsProcessed(elem, childProcessed, `TOCDivision[${index}].TOCDivision[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `TOCDivision[${index}]`);
    return tag('div', { class: '_div_TOCDivision pl-16' },
      renderTextNode(DivisionTitle.DivisionTitle, addTreeElement) +
      (ArticleRange.length > 0 ? renderArticleRange(ArticleRange[0], addTreeElement) : '')
    );
  }).join('');
};

/**
 * TOCSubsectionType ��HTML�ɕϊ�
 * src/api/components/law/toc-subsection.tsx �� LawTOCSubsection �R���|�[�l���g���Č�
 */
const renderTOCSubsection = (
  tocSubsection: TOCSubsectionType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('TOCSubsection');

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

  // TOCSubsection配列要素をチェック
  tocSubsection.TOCSubsection.forEach((elem, idx) => {
    const childProcessed = initProcessedFields();
    if ('SubsectionTitle' in elem) childProcessed.add('SubsectionTitle');
    if ('ArticleRange' in elem) childProcessed.add('ArticleRange');
    if ('TOCDivision' in elem) childProcessed.add('TOCDivision');
    checkAllFieldsProcessed(elem, childProcessed, `TOCSubsection.TOCSubsection[${idx}]`);
  });

  checkAllFieldsProcessed(tocSubsection, processed, 'TOCSubsection');
  return content;
};

/**
 * TOCSectionType�z���HTML�ɕϊ�
 * src/api/components/law/toc-section.tsx �� LawTOCSection �R���|�[�l���g���Č�
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

    // �q�v�f�iTOCSubsection�ATOCDivision�j
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
 * TOCChapterType�z���HTML�ɕϊ�
 * src/api/components/law/toc-chapter.tsx �� LawTOCChapter �R���|�[�l���g���Č�
 */
const renderTOCChapter = (
  tocChapterList: TOCChapterType[],
  treeElement: string[]
): string => {
  return tocChapterList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TOCChapter');

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

    // TOCChapter配列要素をチェック
    dt.TOCChapter.forEach((elem, idx) => {
      const childProcessed = initProcessedFields();
      if ('ChapterTitle' in elem) childProcessed.add('ChapterTitle');
      if ('ArticleRange' in elem) childProcessed.add('ArticleRange');
      if ('TOCSection' in elem) childProcessed.add('TOCSection');
      checkAllFieldsProcessed(elem, childProcessed, `TOCChapter[${index}].TOCChapter[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `TOCChapter[${index}]`);
    return content;
  }).join('');
};

/**
 * TOCPartType�z���HTML�ɕϊ�
 * src/api/components/law/toc-part.tsx �� LawTOCPart �R���|�[�l���g���Č�
 */
const renderTOCPart = (
  tocPartList: TOCPartType[],
  treeElement: string[]
): string => {
  return tocPartList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TOCPart');

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

    // TOCPart配列要素をチェック
    dt.TOCPart.forEach((elem, idx) => {
      const childProcessed = initProcessedFields();
      if ('PartTitle' in elem) childProcessed.add('PartTitle');
      if ('ArticleRange' in elem) childProcessed.add('ArticleRange');
      if ('TOCChapter' in elem) childProcessed.add('TOCChapter');
      checkAllFieldsProcessed(elem, childProcessed, `TOCPart[${index}].TOCPart[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `TOCPart[${index}]`);
    return content;
  }).join('');
};

/**
 * TOCSupplProvisionType��HTML�ɕϊ�
 * src/api/components/law/toc-suppl-provision.tsx �� LawTOCSupplProvision �R���|�[�l���g���Č�
 */
const renderTOCSupplProvision = (
  tocSupplProvision: TOCSupplProvisionType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('TOCSupplProvision');

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

  // �q�v�f�iTOCArticle�ATOCChapter�j
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
 * TOCAppdxTableLabelType�z���HTML�ɕϊ�
 * src/api/components/law/toc-appdx-table-label.tsx �� LawTOCAppdxTableLabel �R���|�[�l���g���Č�
 */
const renderTOCAppdxTableLabel = (
  tocAppdxTableLabelList: TOCAppdxTableLabelType[],
  treeElement: string[]
): string => {
  return tocAppdxTableLabelList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TOCAppdxTableLabel');

    const addTreeElement = [...treeElement, `TOCAppdxTableLabel_${index}`];

    checkAllFieldsProcessed(dt, processed, `TOCAppdxTableLabel[${index}]`);
    return tag('div', { class: '_div_TOCAppdxTableLabel pl-4' },
      renderTextNode(dt.TOCAppdxTableLabel, addTreeElement)
    );
  }).join('');
};

/**
 * TOCType��HTML�ɕϊ�
 * src/api/components/law/toc.tsx �� LawTOC �R���|�[�l���g���Č�
 */
const renderTOC = (
  toc: TOCType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('TOC');

  const addTreeElement = (index?: number) => [
    ...treeElement,
    `TOC${index ? `_${index}` : ''}`,
  ];

  const TOCLabel = getTypeByFind<TOCLabelType>(toc.TOC, 'TOCLabel');
  const TOCPreambleLabel = getTypeByFind<TOCPreambleLabelType>(toc.TOC, 'TOCPreambleLabel');
  const TOCSupplProvision = getTypeByFind<TOCSupplProvisionType>(toc.TOC, 'TOCSupplProvision');
  const TOCAppdxTableLabel = getType<TOCAppdxTableLabelType>(toc.TOC, 'TOCAppdxTableLabel');

  let content = '';

  // TOCLabel�i�ڎ����x���j - React���Ɠ������A���݂��Ȃ��ꍇ�ł���div���o��
  content += tag('div', { class: '_div_TOCLabel' },
    TOCLabel !== undefined ? renderTextNode(TOCLabel.TOCLabel, addTreeElement()) : ''
  );

  // TOCPreambleLabel�i�O�����x���j
  if (TOCPreambleLabel !== undefined) {
    content += tag('div', { class: '_div_TOCPreambleLabel' },
      renderTextNode(TOCPreambleLabel.TOCPreambleLabel, addTreeElement())
    );
  }

  // �ڎ��̖{�́iTOCPart�ATOCChapter�ATOCSection�ATOCArticle�j
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

  // TOCSupplProvision�i�����j
  if (TOCSupplProvision !== undefined) {
    content += renderTOCSupplProvision(TOCSupplProvision, addTreeElement());
  }

  // TOCAppdxTableLabel�i�ʕ\���x���j
  content += renderTOCAppdxTableLabel(TOCAppdxTableLabel, addTreeElement());

  return content;
};

/**
 * PreambleType ��HTML�ɕϊ�
 * src/api/components/law/preamble.tsx �� LawPreamble �R���|�[�l���g���Č�
 */
const renderPreamble = (
  preamble: PreambleType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('Preamble');

  const addTreeElement = [...treeElement, 'Preamble'];
  const Paragraph = getType<ParagraphType>(preamble.Preamble, 'Paragraph');

  // Preamble配列の各要素をチェック
  preamble.Preamble.forEach((preambleElem: any, elemIdx: number) => {
    const preambleProcessed = initProcessedFields();
    if ('Paragraph' in preambleElem) preambleProcessed.add('Paragraph');
    checkAllFieldsProcessed(preambleElem, preambleProcessed, `Preamble.Preamble[${elemIdx}]`);
  });

  checkAllFieldsProcessed(preamble, processed, 'Preamble');

  return renderParagraph(Paragraph, addTreeElement, 0);
};

/**
 * ListSentenceType ��HTML�ɕϊ�
 * src/api/components/law/list-sentence.tsx �� LawListSentence �R���|�[�l���g���Č�
 */
const renderListSentence = (
  listSentence: ListSentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('ListSentence');

  const addTreeElement = [...treeElement, 'ListSentence'];
  const Sentence = getType<SentenceType>(listSentence.ListSentence, 'Sentence');
  const Column = getType<ColumnType>(listSentence.ListSentence, 'Column');

  // ListSentence配列要素をチェック
  listSentence.ListSentence.forEach((elem, idx) => {
    const childProcessed = initProcessedFields();
    if ('Sentence' in elem) childProcessed.add('Sentence');
    if ('Column' in elem) childProcessed.add('Column');
    checkAllFieldsProcessed(elem, childProcessed, `ListSentence.ListSentence[${idx}]`);
  });

  checkAllFieldsProcessed(listSentence, processed, 'ListSentence');
  return renderSentence(Sentence, addTreeElement, false) + renderColumn(Column, addTreeElement);
};

/**
 * ListType ��HTML�ɕϊ�
 * src/api/components/law/list.tsx �� LawList �R���|�[�l���g���Č�
 */
const renderList = (
  listList: ListType[],
  treeElement: string[]
): string => {
  return listList.map((dt, index) => {
    const addTreeElement = [...treeElement, `List_${index}`];

    // List要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('List');

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

    // List配列の各要素をチェック
    dt.List.forEach((listElem: any, elemIdx: number) => {
      const listProcessed = initProcessedFields();
      if ('ListSentence' in listElem) listProcessed.add('ListSentence');
      if ('Sublist1' in listElem) listProcessed.add('Sublist1');
      checkAllFieldsProcessed(listElem, listProcessed, `List[${index}].List[${elemIdx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `List[${index}]`);
    return content;
  }).join('');
};

/**
 * SublistSentence���ʏ���
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
 * Sublist1SentenceType ��HTML�ɕϊ�
 */
const renderSublist1Sentence = (
  sublist1Sentence: Sublist1SentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('Sublist1Sentence');

  // Sublist1Sentence配列要素をチェック
  sublist1Sentence.Sublist1Sentence.forEach((elem, idx) => {
    const childProcessed = initProcessedFields();
    if ('Sentence' in elem) childProcessed.add('Sentence');
    if ('Column' in elem) childProcessed.add('Column');
    checkAllFieldsProcessed(elem, childProcessed, `Sublist1Sentence.Sublist1Sentence[${idx}]`);
  });

  checkAllFieldsProcessed(sublist1Sentence, processed, 'Sublist1Sentence');
  return renderSublistSentence(
    sublist1Sentence.Sublist1Sentence,
    [...treeElement, 'Sublist1Sentence']
  );
};

/**
 * Sublist2SentenceType ��HTML�ɕϊ�
 */
const renderSublist2Sentence = (
  sublist2Sentence: Sublist2SentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('Sublist2Sentence');

  // Sublist2Sentence配列要素をチェック
  sublist2Sentence.Sublist2Sentence.forEach((elem, idx) => {
    const childProcessed = initProcessedFields();
    if ('Sentence' in elem) childProcessed.add('Sentence');
    if ('Column' in elem) childProcessed.add('Column');
    checkAllFieldsProcessed(elem, childProcessed, `Sublist2Sentence.Sublist2Sentence[${idx}]`);
  });

  checkAllFieldsProcessed(sublist2Sentence, processed, 'Sublist2Sentence');
  return renderSublistSentence(
    sublist2Sentence.Sublist2Sentence,
    [...treeElement, 'Sublist2Sentence']
  );
};

/**
 * Sublist3SentenceType ��HTML�ɕϊ�
 */
const renderSublist3Sentence = (
  sublist3Sentence: Sublist3SentenceType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('Sublist3Sentence');

  // Sublist3Sentence配列要素をチェック
  sublist3Sentence.Sublist3Sentence.forEach((elem, idx) => {
    const childProcessed = initProcessedFields();
    if ('Sentence' in elem) childProcessed.add('Sentence');
    if ('Column' in elem) childProcessed.add('Column');
    checkAllFieldsProcessed(elem, childProcessed, `Sublist3Sentence.Sublist3Sentence[${idx}]`);
  });

  checkAllFieldsProcessed(sublist3Sentence, processed, 'Sublist3Sentence');
  return renderSublistSentence(
    sublist3Sentence.Sublist3Sentence,
    [...treeElement, 'Sublist3Sentence']
  );
};

/**
 * Sublist1Type ��HTML�ɕϊ�
 * src/api/components/law/sublist.tsx �� LawSublist1 �R���|�[�l���g���Č�
 */
const renderSublist1 = (
  sublist1List: Sublist1Type[],
  treeElement: string[]
): string => {
  return sublist1List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Sublist1');

    const addTreeElement = [...treeElement, `Sublist1_${index}`];
    const Sublist1Sentence = getType<Sublist1SentenceType>(dt.Sublist1, 'Sublist1Sentence')[0];
    const Sublist2 = getType<Sublist2Type>(dt.Sublist1, 'Sublist2');

    // Sublist1配列の各要素をチェック
    dt.Sublist1.forEach((sublistElem: any, elemIdx: number) => {
      const sublistProcessed = initProcessedFields();
      if ('Sublist1Sentence' in sublistElem) sublistProcessed.add('Sublist1Sentence');
      if ('Sublist2' in sublistElem) sublistProcessed.add('Sublist2');
      checkAllFieldsProcessed(sublistElem, sublistProcessed, `Sublist1[${index}].Sublist1[${elemIdx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Sublist1[${index}]`);

    let content = tag('div', { class: '_div_Sublist1Sentence pl-8' },
      renderSublist1Sentence(Sublist1Sentence, addTreeElement)
    );
    content += renderSublist2(Sublist2, addTreeElement);

    return content;
  }).join('');
};

/**
 * Sublist2Type ��HTML�ɕϊ�
 * src/api/components/law/sublist.tsx �� LawSublist2 �R���|�[�l���g���Č�
 */
const renderSublist2 = (
  sublist2List: Sublist2Type[],
  treeElement: string[]
): string => {
  return sublist2List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Sublist2');

    const addTreeElement = [...treeElement, `Sublist2_${index}`];
    const Sublist2Sentence = getType<Sublist2SentenceType>(dt.Sublist2, 'Sublist2Sentence')[0];
    const Sublist3 = getType<Sublist3Type>(dt.Sublist2, 'Sublist3');

    // Sublist2配列の各要素をチェック
    dt.Sublist2.forEach((sublistElem: any, elemIdx: number) => {
      const sublistProcessed = initProcessedFields();
      if ('Sublist2Sentence' in sublistElem) sublistProcessed.add('Sublist2Sentence');
      if ('Sublist3' in sublistElem) sublistProcessed.add('Sublist3');
      checkAllFieldsProcessed(sublistElem, sublistProcessed, `Sublist2[${index}].Sublist2[${elemIdx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Sublist2[${index}]`);

    let content = tag('div', { class: '_div_Sublist2Sentence pl-12' },
      renderSublist2Sentence(Sublist2Sentence, addTreeElement)
    );
    content += renderSublist3(Sublist3, addTreeElement);

    return content;
  }).join('');
};

/**
 * Sublist3Type ��HTML�ɕϊ�
 * src/api/components/law/sublist.tsx �� LawSublist3 �R���|�[�l���g���Č�
 */
const renderSublist3 = (
  sublist3List: Sublist3Type[],
  treeElement: string[]
): string => {
  return sublist3List.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Sublist3');

    const addTreeElement = [...treeElement, `Sublist3_${index}`];
    const Sublist3Sentence = getType<Sublist3SentenceType>(dt.Sublist3, 'Sublist3Sentence')[0];

    // Sublist3配列の各要素をチェック
    dt.Sublist3.forEach((sublistElem: any, elemIdx: number) => {
      const sublistProcessed = initProcessedFields();
      if ('Sublist3Sentence' in sublistElem) sublistProcessed.add('Sublist3Sentence');
      checkAllFieldsProcessed(sublistElem, sublistProcessed, `Sublist3[${index}].Sublist3[${elemIdx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Sublist3[${index}]`);

    return tag('div', { class: 'pl-16' },
      renderSublist3Sentence(Sublist3Sentence, [...treeElement, 'Sublist3'])
    );
  }).join('');
};

/**
 * EnactStatementType ��HTML�ɕϊ�
 * src/api/components/law/enact-statement.tsx �� LawEnactStatement �R���|�[�l���g���Č�
 */
const renderEnactStatement = (
  enactStatementList: EnactStatementType[],
  treeElement: string[]
): string => {
  return enactStatementList.map((dt, index) => {
    // EnactStatement要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('EnactStatement');

    const addTreeElement = [...treeElement, `EnactStatement_${index}`];
    const result = tag('div', { class: '_div_EnactStatement' },
      renderTextNode(dt.EnactStatement, addTreeElement)
    );

    checkAllFieldsProcessed(dt, processed, `EnactStatement[${index}]`);
    return result;
  }).join('');
};

/**
 * LawBodyType��HTML�ɕϊ�
 * src/api/components/law/law-body.tsx �� LawBodyComponent �R���|�[�l���g���Č�
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

  // EnactStatement�i���蕶�j
  if (EnactStatement.length > 0) {
    html += tag('section', { id: 'EnactStatement', class: 'active EnactStatement' },
      renderEnactStatement(EnactStatement, addTreeElement)
    );
  }

  // TOC�i�ڎ��j
  if (TOC.length > 0) {
    html += tag('section', { class: 'active TOC pb-4' },
      renderTOC(TOC[0], addTreeElement)
    );
  }

  // Preamble�i�O���j
  if (Preamble !== undefined) {
    html += tag('section', { class: 'active Preamble' },
      renderPreamble(Preamble, addTreeElement)
    );
  }

  // MainProvision�i�{���j
  html += tag('section', { id: 'MainProvision', class: 'active MainProvision' },
    tag('div', {}, renderMainProvision(MainProvision, addTreeElement))
  );

  // SupplProvision, Appdx, AppdxTable, AppdxNote, AppdxFig �Ȃ�
  lawBody.LawBody.forEach((dt, index) => {
    // LawBody�̊��m�̃t�B�[���h
    const processed = initProcessedFields();

    if ('LawTitle' in dt) {

      processed.add('LawTitle');

    }

    if ('EnactStatement' in dt) {

      processed.add('EnactStatement');

    }

    if ('TOC' in dt) {

      processed.add('TOC');

    }

    if ('Preamble' in dt) {

      processed.add('Preamble');

    }

    if ('MainProvision' in dt) {

      processed.add('MainProvision');

    }

    if ('SupplProvision' in dt) {

      processed.add('SupplProvision');

    }

    if ('AppdxTable' in dt) {

      processed.add('AppdxTable');

    }

    if ('AppdxNote' in dt) {

      processed.add('AppdxNote');

    }

    if ('AppdxStyle' in dt) {

      processed.add('AppdxStyle');

    }

    if ('Appdx' in dt) {

      processed.add('Appdx');

    }

    if ('AppdxFig' in dt) {

      processed.add('AppdxFig');

    }

    if ('AppdxFormat' in dt) {

      processed.add('AppdxFormat');

    }

    checkAllFieldsProcessed(dt, processed, `LawBody[${index}]`);

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
 * RelatedArticleNumType ��HTML�ɕϊ�
 * src/api/components/law/related-article-num.tsx �� LawRelatedArticleNum �R���|�[�l���g���Č�
 */
const renderRelatedArticleNum = (
  relatedArticleNumList: RelatedArticleNumType[],
  treeElement: string[]
): string => {
  if (relatedArticleNumList.length === 0) return '';

  const dt = relatedArticleNumList[0];
  const processed = initProcessedFields();
  processed.add('RelatedArticleNum');

  const result = renderTextNode(dt.RelatedArticleNum, [
    ...treeElement,
    'RelatedArticleNum',
  ]);

  checkAllFieldsProcessed(dt, processed, 'RelatedArticleNum[0]');
  return result;
};

/**
 * AppdxFigType ��HTML�ɕϊ�
 * src/api/components/law/appdx-fig.tsx �� LawAppdxFig �R���|�[�l���g���Č�
 */
const renderAppdxFig = (
  appdxFig: AppdxFigType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'AppdxFig'];

  const AppdxFigTitle = getType<AppdxFigTitleType>(appdxFig.AppdxFig, 'AppdxFigTitle');
  const RelatedArticleNum = getType<RelatedArticleNumType>(appdxFig.AppdxFig, 'RelatedArticleNum');

  let html = '';

  // AppdxFigTitle �� RelatedArticleNum
  if (AppdxFigTitle.length > 0 || RelatedArticleNum.length > 0) {
    let titleContent = '';
    if (AppdxFigTitle.length > 0) {
      titleContent += renderTextNode(AppdxFigTitle[0].AppdxFigTitle, addTreeElement);
    }
    titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement);
    html += tag('div', { class: '_div_AppdxFigTitle' }, titleContent);
  }

  // FigStruct �� TableStruct
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
 * StyleStructType ��HTML�ɕϊ�
 * src/api/components/law/style-struct.tsx �� LawStyleStruct �R���|�[�l���g���Č�
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

    // StyleStruct要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('StyleStruct');

    let content = '';

    // StyleStruct配列を走査して、各要素を処理しながらprocessed.addとレンダリングを実行
    dt.StyleStruct.forEach((dt2: any, index2: number) => {
      const childProcessed = initProcessedFields();

      if ('StyleStructTitle' in dt2) {
        childProcessed.add('StyleStructTitle');
        content += tag('div', { class: '_div_StyleStructTitle' },
          renderTextNode(dt2.StyleStructTitle, addTreeElement())
        );
      }
      if ('Style' in dt2) {
        childProcessed.add('Style');
        // Style内の要素を処理（Sentence, Fig, List, TableStruct, FigStruct, Item等）
        dt2.Style.forEach((styleItem: any) => {
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
      }
      if ('Remarks' in dt2) {
        childProcessed.add('Remarks');
        content += renderRemarks([dt2], addTreeElement(index2));
      }

      checkAllFieldsProcessed(dt2, childProcessed, `StyleStruct[${index}].StyleStruct[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `StyleStruct[${index}]`);
    return content;
  }).join('');
};

/**
 * AppdxStyleType ��HTML�ɕϊ�
 * src/api/components/law/appdx-style.tsx �� LawAppdxStyle �R���|�[�l���g���Č�
 */
const renderAppdxStyle = (
  appdxStyle: AppdxStyleType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('AppdxStyle');

  const addTreeElement = [...treeElement, 'AppdxStyle'];

  const AppdxStyleTitle = getType<AppdxStyleTitleType>(appdxStyle.AppdxStyle, 'AppdxStyleTitle');
  const RelatedArticleNum = getType<RelatedArticleNumType>(appdxStyle.AppdxStyle, 'RelatedArticleNum');

  let html = '';

  // AppdxStyleTitle �� RelatedArticleNum
  if (AppdxStyleTitle.length > 0 || RelatedArticleNum.length > 0) {
    let titleContent = '';
    if (AppdxStyleTitle.length > 0) {
      titleContent += renderTextNode(AppdxStyleTitle[0].AppdxStyleTitle, addTreeElement);
    }
    titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement);
    html += tag('div', { class: '_div_AppdxStyleTitle font-bold' }, titleContent);
  }

  // StyleStruct �� Remarks
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
 * AppdxFormatType ��HTML�ɕϊ�
 * src/api/components/law/appdx-format.tsx �� LawAppdxFormat �R���|�[�l���g���Č�
 */
const renderAppdxFormat = (
  appdxFormat: AppdxFormatType,
  treeElement: string[]
): string => {
  const processed = initProcessedFields();
  processed.add('AppdxFormat');

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

  // AppdxFormatTitle �� RelatedArticleNum
  if (AppdxFormatTitle.length > 0 || RelatedArticleNum.length > 0) {
    let titleContent = '';
    if (AppdxFormatTitle.length > 0) {
      titleContent += renderTextNode(AppdxFormatTitle[0].AppdxFormatTitle, addTreeElement());
    }
    titleContent += renderRelatedArticleNum(RelatedArticleNum, addTreeElement());
    html += tag('div', { class: '_div_AppdxFormatTitle' }, titleContent);
  }

  // FormatStruct �� Remarks
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
 * FigType ��HTML�ɕϊ�
 * src/api/components/law/fig.tsx �� LawFig �R���|�[�l���g���Č�
 */
const renderFig = (
  fig: any,
  treeElement: string[]
): string => {
  // fig���z��̏ꍇ�͍ŏ��̗v�f���g�p
  const figObj = Array.isArray(fig) ? fig[0] : fig;
  // figObj��������i�󕶎���j�̏ꍇ�́Asrc�����������Ȃ�Fig�v�f

  // figObjが文字列やnullの場合はチェック不要
  if (typeof figObj === 'object' && figObj !== null) {
    const processed = initProcessedFields();
    if ('Fig' in figObj) processed.add('Fig');
    checkAllFieldsProcessed(figObj, processed, 'Fig');
  }
  const src = (typeof figObj === 'string' || !figObj) ? '' : (figObj[':@']?.src || '');

  if (/\.pdf$/i.test(src)) {
    // PDF: attached_files����law_revision_id���擾���ă����N�𐶐�
    const lawRevisionId = globalAttachedFilesMap?.get(src);
    if (lawRevisionId && src) {
      // API��URL: https://laws.e-gov.go.jp/api/2/attachment/{law_revision_id}?src={src}
      const encodedSrc = encodeURIComponent(src);
      const attachmentUrl = `https://laws.e-gov.go.jp/api/2/attachment/${lawRevisionId}?src=${encodedSrc}`;
      // Mozilla PDF.js �����r���[�A�ւ̃����N
      const viewerUrl = `./pdfjs/web/viewer.html?file=${encodeURIComponent(attachmentUrl)}`;
      return tag('a', {
        href: viewerUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'text-blue-600 hover:text-blue-800 underline',
        'aria-label': 'PDF�t�@�C�����J��',
        title: 'PDF�t�@�C�����J��'
      }, 'PDF���J��');
    } else {
      // law_revision_id��������Ȃ��ꍇ�͋��span
      return tag('span', {
        class: 'text-gray-400',
        'aria-label': 'PDF�t�@�C��',
        title: 'PDF�t�@�C��'
      }, '');
    }
  } else if (src === '') {
    // �u�����N: Style�̎q�v�f���ǂ����ŕ���
    if (treeElement.some(dt => /^Style(Struct)?_.*/.test(dt))) {
      return tag('div', { class: '_div_Fig_noPdf pl-8' }, '�i���j');
    } else {
      return tag('span', { class: '_span_Fig_noImg inline-block pl-4' }, '�i���j');
    }
  } else {
    // �摜: attached_files����law_revision_id���擾���ă����N�𐶐�
    const lawRevisionId = globalAttachedFilesMap?.get(src);
    if (lawRevisionId && src) {
      const encodedSrc = encodeURIComponent(src);
      const attachmentUrl = `https://laws.e-gov.go.jp/api/2/attachment/${lawRevisionId}?src=${encodedSrc}`;
      return tag('a', {
        href: attachmentUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'inline-block',
        'aria-label': '�摜���J��',
        title: '�摜���J��'
      }, tag('img', {
        src: attachmentUrl,
        alt: '�Y�t�摜',
        class: 'max-w-full h-auto'
      }, ''));
    } else {
      // law_revision_id��������Ȃ��ꍇ�̓v���[�X�z���_�[
      const innerContent = tag('span', {
        class: 'text-xs text-light-Text-PlaceHolder font-bold'
      }, '�摜��ǂݍ��ݒ�...');
      const innerWrapper = tag('div', {
        class: 'flex flex-col justify-center items-center'
      }, innerContent);
      return tag('div', {
        class: 'flex items-center justify-center w-80 h-48 rounded-md bg-light-Background-Secondary animate-pulse'
      }, innerWrapper);
    }
  }
};

/**
 * FormatStructType�z���HTML�ɕϊ�
 * src/api/components/law/format-struct.tsx �� LawFormatStruct �R���|�[�l���g���Č�
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

    // FormatStruct要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('FormatStruct');

    let html = '';

    // FormatStruct配列を走査して、各要素を処理しながらprocessed.addとレンダリングを実行
    dt.FormatStruct.forEach((dt2: any, index2: number) => {
      const childProcessed = initProcessedFields();

      if ('FormatStructTitle' in dt2) {
        childProcessed.add('FormatStructTitle');
        html += tag('div', {},
          renderTextNode(dt2.FormatStructTitle, addTreeElement())
        );
      }
      if ('Format' in dt2) {
        childProcessed.add('Format');
        // Format内の要素を処理（Fig等）
        dt2.Format.forEach((formatItem: any) => {
          if ('Fig' in formatItem) {
            html += renderFig(formatItem, addTreeElement(index2));
          }
        });
      }
      if ('Remarks' in dt2) {
        childProcessed.add('Remarks');
        html += renderRemarks([dt2], addTreeElement(index2));
      }

      checkAllFieldsProcessed(dt2, childProcessed, `FormatStruct[${index}].FormatStruct[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `FormatStruct[${index}]`);
    return html;
  }).join('');
};

/**
 * AppdxType ��HTML�ɕϊ�
 * src/api/components/law/appdx.tsx �� LawAppdx �R���|�[�l���g���Č�
 */
const renderAppdx = (
  appdxList: AppdxType[],
  treeElement: string[]
): string => {
  return appdxList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Appdx');

    const addTreeElement = [...treeElement, `Appdx_${index}`];
    let html = '';

    // Appdx配列要素を走査して、各要素を処理しながらprocessed.addとレンダリングを実行
    let divContent = '';
    dt.Appdx.forEach((elem: any, idx: number) => {
      const childProcessed = initProcessedFields();

      if ('ArithFormulaNum' in elem) {
        childProcessed.add('ArithFormulaNum');
        const arithFormulaNumText = renderTextNode(
          elem.ArithFormulaNum,
          [...addTreeElement, 'ArithFormulaNum']
        );
        divContent += tag('span', { class: '_span_ArithFormulaNum' }, arithFormulaNumText);
      }
      if ('RelatedArticleNum' in elem) {
        childProcessed.add('RelatedArticleNum');
        const relatedArticleNumText = renderTextNode(
          elem.RelatedArticleNum,
          [...addTreeElement, 'RelatedArticleNum']
        );
        divContent += relatedArticleNumText;
      }
      if ('ArithFormula' in elem) {
        childProcessed.add('ArithFormula');
        // divContentがあれば先に出力
        if (divContent) {
          html += tag('div', { class: '_div_ArithFormulaNum' }, divContent);
          divContent = '';
        }
        const arithFormulaContent = renderLawTypeList(
          elem.ArithFormula,
          addTreeElement,
          'ArithFormula'
        );
        html += tag('div', { class: 'pl-4' }, arithFormulaContent);
      }
      if ('Remarks' in elem) {
        childProcessed.add('Remarks');
        // divContentがあれば先に出力
        if (divContent) {
          html += tag('div', { class: '_div_ArithFormulaNum' }, divContent);
          divContent = '';
        }
        html += renderRemarks([elem], addTreeElement);
      }

      checkAllFieldsProcessed(elem, childProcessed, `Appdx[${index}].Appdx[${idx}]`);
    });

    // 残ったdivContentを出力
    if (divContent) {
      html += tag('div', { class: '_div_ArithFormulaNum' }, divContent);
    }

    checkAllFieldsProcessed(dt, processed, `Appdx[${index}]`);
    return tag('section', { class: 'active Appdx' }, html);
  }).join('');
};

/**
 * RemarksType ��HTML�ɕϊ�
 * src/api/components/law/remarks.tsx �� LawRemarks �R���|�[�l���g���Č�
 */
const renderRemarks = (
  remarksList: RemarksType[],
  treeElement: string[]
): string => {
  return remarksList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('Remarks');

    const addTreeElement = [...treeElement, `Remarks_${index}`];
    let content = '';

    // Remarks配列要素を走査して、各要素を処理しながらprocessed.addとレンダリングを実行
    dt.Remarks.forEach((elem: any, idx: number) => {
      const childProcessed = initProcessedFields();

      if ('RemarksLabel' in elem) {
        childProcessed.add('RemarksLabel');
        const remarksLabelText = renderTextNode(elem.RemarksLabel, addTreeElement);
        content += tag('div', { class: '_div_RemarksLabel' }, remarksLabelText);
      }
      if ('Sentence' in elem) {
        childProcessed.add('Sentence');
        content += tag('div', {}, renderTextNode(elem.Sentence, addTreeElement) + ' ');
      }
      if ('Item' in elem) {
        childProcessed.add('Item');
        content += renderItem([elem], addTreeElement, false);
      }

      checkAllFieldsProcessed(elem, childProcessed, `Remarks[${index}].Remarks[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `Remarks[${index}]`);
    return content;
  }).join('');
};

/**
 * TableHeaderColumnType ��HTML�ɕϊ�
 * src/api/components/law/table-header-column.tsx �� LawTableHeaderColumn �R���|�[�l���g���Č�
 */
const renderTableHeaderColumn = (
  tableHeaderColumnList: TableHeaderColumnType[],
  treeElement: string[]
): string => {
  return tableHeaderColumnList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TableHeaderColumn');

    const addTreeElement = [...treeElement, `TableHeaderColumn_${index}`];
    const style = 'border-top:black solid 1px;border-bottom:black solid 1px;border-left:black solid 1px;border-right:black solid 1px';

    checkAllFieldsProcessed(dt, processed, `TableHeaderColumn[${index}]`);
    return tag('td', { class: 'TableHeaderColumn', style },
      renderTextNode(dt.TableHeaderColumn, [...treeElement, 'TableHeaderColumn'])
    );
  }).join('');
};

/**
 * TableHeaderRowType ��HTML�ɕϊ�
 * src/api/components/law/table-header-row.tsx �� LawTableHeaderRow �R���|�[�l���g���Č�
 */
const renderTableHeaderRow = (
  tableHeaderRowList: TableHeaderRowType[],
  treeElement: string[]
): string => {
  return tableHeaderRowList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TableHeaderRow');
    processed.add('TableHeaderColumn');

    const addTreeElement = [...treeElement, `TableHeaderRow_${index}`];

    checkAllFieldsProcessed(dt, processed, `TableHeaderRow[${index}]`);
    return tag('tr', { class: 'TableHeaderRow' },
      renderTableHeaderColumn(dt.TableHeaderColumn, [...treeElement, 'TableHeaderRow'])
    );
  }).join('');
};

/**
 * TableColumnAttributeType ����border�X�^�C���𐶐�
 */
const getBorderStyle = (border: TableColumnAttributeType | undefined): string => {
  const styles: string[] = [];

  // �{�[�_�[�X�^�C���͏�ɏo�́iborder��undefined�̏ꍇ�̓f�t�H���g�l'solid'���g�p�j
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
 * TableColumnType ��HTML�ɕϊ�
 * src/api/components/law/table-column.tsx �� LawTableColumn �R���|�[�l���g���Č�
 */
const renderTableColumn = (
  tableColumnList: TableColumnType[],
  treeElement: string[]
): string => {
  return tableColumnList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('TableColumn');

    const addTreeElement = [...treeElement, `TableColumn_${index}`];

    const attrs: Record<string, string | number> = {
      class: 'p-2',
      style: getBorderStyle(dt[':@']),
    };

    if (dt[':@']?.colspan) attrs.colspan = dt[':@'].colspan;
    if (dt[':@']?.rowspan) attrs.rowspan = dt[':@'].rowspan;

    let content = '';

    // TableColumn配列要素を走査して、各要素を処理しながらprocessed.addとレンダリングを実行
    dt.TableColumn.forEach((elem: any, idx: number) => {
      const childProcessed = initProcessedFields();

      if ('Part' in elem) {
        childProcessed.add('Part');
        content += renderPart([elem], addTreeElement);
      }
      if ('Chapter' in elem) {
        childProcessed.add('Chapter');
        content += renderChapter([elem], addTreeElement);
      }
      if ('Section' in elem) {
        childProcessed.add('Section');
        content += renderSection([elem], addTreeElement);
      }
      if ('Article' in elem) {
        childProcessed.add('Article');
        content += renderArticle([elem], addTreeElement);
      }
      if ('Paragraph' in elem) {
        childProcessed.add('Paragraph');
        content += renderParagraph([elem], addTreeElement, 0);
      }
      if ('Item' in elem) {
        childProcessed.add('Item');
        content += renderItem([elem], addTreeElement, false);
      }
      if ('Subitem1' in elem) {
        childProcessed.add('Subitem1');
        content += renderSubitem1([elem], addTreeElement);
      }
      if ('Subitem2' in elem) {
        childProcessed.add('Subitem2');
        content += renderSubitem2([elem], addTreeElement);
      }
      if ('Subitem3' in elem) {
        childProcessed.add('Subitem3');
        content += renderSubitem3([elem], addTreeElement);
      }
      if ('Subitem4' in elem) {
        childProcessed.add('Subitem4');
        content += renderSubitem4([elem], addTreeElement);
      }
      if ('Subitem5' in elem) {
        childProcessed.add('Subitem5');
        content += renderSubitem5([elem], addTreeElement);
      }
      if ('Subitem6' in elem) {
        childProcessed.add('Subitem6');
        content += renderSubitem6([elem], addTreeElement);
      }
      if ('Subitem7' in elem) {
        childProcessed.add('Subitem7');
        content += renderSubitem7([elem], addTreeElement);
      }
      if ('Subitem8' in elem) {
        childProcessed.add('Subitem8');
        content += renderSubitem8([elem], addTreeElement);
      }
      if ('Subitem9' in elem) {
        childProcessed.add('Subitem9');
        content += renderSubitem9([elem], addTreeElement);
      }
      if ('Subitem10' in elem) {
        childProcessed.add('Subitem10');
        content += renderSubitem10([elem], addTreeElement);
      }
      if ('FigStruct' in elem) {
        childProcessed.add('FigStruct');
        content += renderFigStruct([elem], addTreeElement);
      }
      if ('Remarks' in elem) {
        childProcessed.add('Remarks');
        content += renderRemarks([elem], addTreeElement);
      }
      if ('Sentence' in elem) {
        childProcessed.add('Sentence');
        content += renderSentence([elem], addTreeElement, false);
      }
      if ('Column' in elem) {
        childProcessed.add('Column');
        content += renderColumn([elem], addTreeElement);
      }

      checkAllFieldsProcessed(elem, childProcessed, `TableColumn[${index}].TableColumn[${idx}]`);
    });

    checkAllFieldsProcessed(dt, processed, `TableColumn[${index}]`);
    return tag('td', attrs, tag('div', {}, content));
  }).join('');
};

/**
 * TableRowType ��HTML�ɕϊ�
 * src/api/components/law/table-row.tsx �� LawTableRow �R���|�[�l���g���Č�
 */
const renderTableRow = (
  tableRowList: TableRowType[],
  treeElement: string[]
): string => {
  return tableRowList.map((dt, index) => {
    // TableRow要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('TableRow');

    const addTreeElement = [...treeElement, `TableRow_${index}`];
    const result = tag('tr', { class: 'TableRow' },
      renderTableColumn(dt.TableRow, [...treeElement, 'TableRow'])
    );

    checkAllFieldsProcessed(dt, processed, `TableRow[${index}]`);
    return result;
  }).join('');
};

/**
 * TableType ��HTML�ɕϊ�
 * src/api/components/law/table.tsx �� LawTable �R���|�[�l���g���Č�
 */
const renderTable = (
  table: TableType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'Table'];

  // Table要素のフィールドを追跡
  const processed = initProcessedFields();
  processed.add('Table');

  const TableHeaderRow = getType<TableHeaderRowType>(table.Table, 'TableHeaderRow');
  const TableRow = getType<TableRowType>(table.Table, 'TableRow');

  const tbody =
    renderTableHeaderRow(TableHeaderRow, addTreeElement) +
    renderTableRow(TableRow, addTreeElement);

  checkAllFieldsProcessed(table, processed, 'Table');
  return tag('table', { class: 'Table' }, tag('tbody', {}, tbody));
};

/**
 * TableStructType ��HTML�ɕϊ�
 * src/api/components/law/table-struct.tsx �� LawTableStruct �R���|�[�l���g���Č�
 */
const renderTableStruct = (
  tableStructList: TableStructType[],
  treeElement: string[]
): string => {
  return tableStructList.map((dt, index) => {
    const addTreeElement = [...treeElement, `TableStruct_${index}`];

    // TableStruct要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('TableStruct');

    const TableStructTitle = getType<any>(dt.TableStruct, 'TableStructTitle');

    let content = '';

    // TableStructTitle
    if (TableStructTitle.length > 0) {
      content += tag('div', { class: '_div_TableStructTitle' },
        renderTextNode(TableStructTitle[0].TableStructTitle, addTreeElement));
    }

    // Table �� Remarks ������
    dt.TableStruct.forEach((dt2, index2) => {
      const childTreeElement = [...addTreeElement, `_Child_${index2}`];
      if ('Table' in dt2) {
        content += renderTable(dt2, childTreeElement);
      } else if ('Remarks' in dt2) {
        content += renderRemarks([dt2], childTreeElement);
      }
    });

    checkAllFieldsProcessed(dt, processed, `TableStruct[${index}]`);
    return content;
  }).join('');
};

/**
 * AppdxTableType ��HTML�ɕϊ�
 * src/api/components/law/appdx-table.tsx �� LawAppdxTable �R���|�[�l���g���Č�
 */
const renderAppdxTable = (
  appdxTableList: AppdxTableType[],
  treeElement: string[]
): string => {
  return appdxTableList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('AppdxTable');

    const addTreeElement = [...treeElement, `AppdxTable_${index}`];
    let content = '';

    // dt.AppdxTable配列を走査して、各要素を処理しながらprocessed.addする
    dt.AppdxTable.forEach((elem: any, index2: number) => {
      const childTreeElement = [...addTreeElement, `_Child_${index2}`];
      const elemProcessed = initProcessedFields();

      if ('AppdxTableTitle' in elem) {
        elemProcessed.add('AppdxTableTitle');
        content += tag('div', { class: '_div_AppdxTableTitle font-bold' },
          renderTextNode(elem.AppdxTableTitle, addTreeElement)
        );
      }
      if ('RelatedArticleNum' in elem) {
        elemProcessed.add('RelatedArticleNum');
        content += renderRelatedArticleNum([elem], addTreeElement);
      }
      if ('Item' in elem) {
        elemProcessed.add('Item');
        content += renderItem([elem], childTreeElement, false);
      }
      if ('TableStruct' in elem) {
        elemProcessed.add('TableStruct');
        content += renderTableStruct([elem], childTreeElement);
      }
      if ('Remarks' in elem) {
        elemProcessed.add('Remarks');
        content += renderRemarks([elem], addTreeElement);
      }

      // 各要素が持つすべてのフィールドをチェック
      checkAllFieldsProcessed(elem, elemProcessed, `AppdxTable[${index}].AppdxTable[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `AppdxTable[${index}]`);

    return tag('section', { class: 'active AppdxTable' }, content);
  }).join('');
};

/**
 * NoteStructType ��HTML�ɕϊ�
 * src/api/components/law/note-struct.tsx �� LawNoteStruct �R���|�[�l���g���Č�
 */
const renderNoteStruct = (
  noteStruct: NoteStructType,
  treeElement: string[]
): string => {
  const addTreeElement = [...treeElement, 'NoteStruct'];

  // NoteStruct要素のフィールドを追跡
  const processed = initProcessedFields();
  processed.add('NoteStruct');

  let content = '';

  // noteStruct.NoteStruct配列を走査して、各要素を処理しながらprocessed.addする
  noteStruct.NoteStruct.forEach((elem: any, index: number) => {
    const childTreeElement = [...addTreeElement, `_${index}`];

    if ('NoteStructTitle' in elem) {
      processed.add('NoteStructTitle');
      content += tag('div', {}, renderTextNode(elem.NoteStructTitle, addTreeElement));
    }
    if ('Remarks' in elem) {
      processed.add('Remarks');
      content += renderRemarks([elem], childTreeElement);
    }
    if ('Note' in elem) {
      processed.add('Note');
      // React仕様: LawNoteStructはNote要素をLawAnyに渡すが、
      // LawAnyには"Note"ケースが実装されていないため、空Fragmentを返す
      // したがって、Note要素は何も出力しない
      content += '';
    }
  });

  checkAllFieldsProcessed(noteStruct, processed, 'NoteStruct');

  return content;
};

/**
 * FigStructType ��HTML�ɕϊ�
 * src/api/components/law/fig-struct.tsx �� LawFigStruct �R���|�[�l���g���Č�
 */
const renderFigStruct = (
  figStructList: FigStructType[],
  treeElement: string[]
): string => {
  return figStructList.map((dt, index) => {
    const addTreeElement = [...treeElement, `FigStruct_${index}`];

    // FigStruct要素のフィールドを追跡
    const processed = initProcessedFields();
    processed.add('FigStruct');

    let content = '';

    // dt.FigStruct配列を走査して、各要素を処理しながらprocessed.addする
    dt.FigStruct.forEach((elem: any, index2: number) => {
      const childTreeElement = [...addTreeElement, `_Child_${index2}`];
      const elemProcessed = initProcessedFields();

      if ('FigStructTitle' in elem) {
        elemProcessed.add('FigStructTitle');
        content += renderTextNode(elem.FigStructTitle, addTreeElement);
      }
      if ('Remarks' in elem) {
        elemProcessed.add('Remarks');
        content += renderRemarks([elem], childTreeElement);
      }
      if ('Fig' in elem) {
        elemProcessed.add('Fig');
        // Fig要素の処理（PDF/画像/ブランクの判定はrenderFig関数が行う）
        content += renderFig(elem, childTreeElement);
      }

      // 各要素が持つすべてのフィールドをチェック
      checkAllFieldsProcessed(elem, elemProcessed, `FigStruct[${index}].FigStruct[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `FigStruct[${index}]`);
    return content;
  }).join('');
};

/**
 * AppdxNoteType ��HTML�ɕϊ�
 * src/api/components/law/appdx-note.tsx �� LawAppdxNote �R���|�[�l���g���Č�
 */
const renderAppdxNote = (
  appdxNoteList: AppdxNoteType[],
  treeElement: string[]
): string => {
  return appdxNoteList.map((dt, index) => {
    const processed = initProcessedFields();
    processed.add('AppdxNote');

    const addTreeElement = [...treeElement, `AppdxNote_${index}`];
    let content = '';

    // dt.AppdxNote配列を走査して、各要素を処理しながらprocessed.addする
    dt.AppdxNote.forEach((elem: any, index2: number) => {
      const childTreeElement = [...addTreeElement, `_Child_${index2}`];
      const elemProcessed = initProcessedFields();

      if ('AppdxNoteTitle' in elem) {
        elemProcessed.add('AppdxNoteTitle');
        content += tag('div', { class: '_div_AppdxNoteTitle' },
          renderTextNode(elem.AppdxNoteTitle, addTreeElement)
        );
      }
      if ('RelatedArticleNum' in elem) {
        elemProcessed.add('RelatedArticleNum');
        content += renderRelatedArticleNum([elem], addTreeElement);
      }
      if ('NoteStruct' in elem) {
        elemProcessed.add('NoteStruct');
        content += renderNoteStruct(elem, childTreeElement);
      }
      if ('FigStruct' in elem) {
        elemProcessed.add('FigStruct');
        content += renderFigStruct([elem], childTreeElement);
      }
      if ('TableStruct' in elem) {
        elemProcessed.add('TableStruct');
        content += renderTableStruct([elem], childTreeElement);
      }
      if ('Remarks' in elem) {
        elemProcessed.add('Remarks');
        content += renderRemarks([elem], addTreeElement);
      }

      // 各要素が持つすべてのフィールドをチェック
      checkAllFieldsProcessed(elem, elemProcessed, `AppdxNote[${index}].AppdxNote[${index2}]`);
    });

    checkAllFieldsProcessed(dt, processed, `AppdxNote[${index}]`);

    return tag('section', { class: 'active AppdxNote' }, content);
  }).join('');
};

/**
 * Law�S�̂�HTML�ɕϊ�
 * src/api/components/law/law.tsx �� LawComponent �R���|�[�l���g���Č�
 */
const renderLaw = (
  lawNum: LawNumType,
  lawBody: LawBodyType,
  lawTitle: LawTitleType,
  treeElement: string[],
  attachedFilesMap?: Map<string, string>
): string => {
  // �O���[�o���ϐ��ɐݒ�irenderFig���Ŏg�p�j
  globalAttachedFilesMap = attachedFilesMap;

  const addTreeElement = [...treeElement, 'Law'];

  let html = '';

  // LawNum �� LawTitle
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
