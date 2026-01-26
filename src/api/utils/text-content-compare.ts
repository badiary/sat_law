/**
 * XMLとHTMLのテキストコンテンツ比較ユーティリティ
 *
 * XMLレンダリング後のHTMLテキストが元XMLのテキストと一致するかチェックし、
 * タグのレンダリング漏れを検出する
 */

/**
 * XMLオブジェクトから全テキストコンテンツを抽出
 * fast-xml-parserでパースしたXMLから、全ての'_'フィールド（テキストノード）を再帰的に収集
 *
 * 注: Extract="true" 属性（「抄」を意味する）や AmendLawNum 属性などは
 * レンダリング時にHTMLに含まれるため、属性値もテキストとして収集する
 *
 * @param obj - XMLパース結果のオブジェクトまたは配列
 * @returns 抽出されたテキストの連結文字列
 */
export function extractTextFromXML(obj: any): string {
  let text = '';

  if (Array.isArray(obj)) {
    // preserveOrder:true 形式の場合、配列を順に処理
    for (let i = 0; i < obj.length; i++) {
      const item = obj[i];
      text += extractTextFromXML(item);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    // '_' フィールド（テキストノード）を収集
    if ('_' in obj && obj._ !== undefined && obj._ !== null) {
      text += String(obj._);
    }

    // SupplProvision要素の場合、HTMLレンダリング順序に合わせて処理
    // 順序: SupplProvisionLabel → AmendLawNum → Extract → その他の要素
    if (obj.SupplProvision !== undefined && Array.isArray(obj.SupplProvision)) {
      // 1. SupplProvisionLabelを先に処理
      obj.SupplProvision.forEach((item: any) => {
        if (item.SupplProvisionLabel) {
          text += extractTextFromXML(item.SupplProvisionLabel);
        }
      });

      // 2. 属性由来のテキストを追加（AmendLawNum → Extract の順）
      const attrs = obj[':@'];
      if (attrs) {
        // AmendLawNum属性がある場合は追加（改正法令番号）
        if (attrs.AmendLawNum) {
          text += `（${attrs.AmendLawNum}）`;
        }
        // Extract属性がtrueの場合は「抄」を追加
        if (attrs.Extract === 'true') {
          text += '抄';
        }
      }

      // 3. その他の要素を処理（SupplProvisionLabel以外）
      obj.SupplProvision.forEach((item: any) => {
        if (!item.SupplProvisionLabel) {
          text += extractTextFromXML(item);
        }
      });
    } else {
      // SupplProvision以外のフィールドを再帰的に処理（':@'属性は除外）
      Object.keys(obj).forEach(key => {
        if (key !== '_' && key !== ':@') {
          text += extractTextFromXML(obj[key]);
        }
      });
    }
  }

  return text;
}

/**
 * HTML文字列から全テキストコンテンツを抽出
 * 正規表現を使用してHTMLタグを削除し、HTML実体参照をデコード
 *
 * @param html - HTML文字列
 * @returns タグを除去したテキスト
 */
export function extractTextFromHTML(html: string): string {
  return html
    // scriptとstyleタグを完全に削除
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // 全HTMLタグを削除
    .replace(/<[^>]+>/g, '')
    // HTML実体参照をデコード
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // 数値文字参照をデコード（10進数）
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
    // 数値文字参照をデコード（16進数）
    .replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * テキストを正規化（空白削除等）
 * XMLとHTMLで空白の扱いが異なるため、比較前に全空白文字を削除
 *
 * @param text - 正規化対象のテキスト
 * @returns 正規化されたテキスト
 */
export function normalizeText(text: string): string {
  return text
    // 全空白文字（スペース、改行、タブ、全角スペース等）を削除
    .replace(/\s+/g, '')
    // ゼロ幅文字を削除
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

/**
 * テキスト比較結果の型定義
 */
export interface TextCompareResult {
  /** テキストが一致したかどうか */
  match: boolean;
  /** XML元テキスト（正規化前） */
  xmlText: string;
  /** HTML抽出テキスト（正規化前） */
  htmlText: string;
  /** XML正規化後テキスト */
  xmlTextNormalized: string;
  /** HTML正規化後テキスト */
  htmlTextNormalized: string;
  /** 不一致の場合の差分情報（一致時はundefined） */
  diff?: string;
}

/**
 * XMLとHTMLのテキストコンテンツを比較
 *
 * @param xmlObj - XMLパース結果のオブジェクト
 * @param html - レンダリング後のHTML文字列
 * @returns テキスト比較結果
 */
export function compareTextContent(
  xmlObj: any,
  html: string
): TextCompareResult {
  // XMLとHTMLからテキストを抽出
  const xmlText = extractTextFromXML(xmlObj);
  const htmlText = extractTextFromHTML(html);

  // テキストを正規化
  const xmlTextNormalized = normalizeText(xmlText);
  const htmlTextNormalized = normalizeText(htmlText);

  // 正規化後のテキストを比較
  const match = xmlTextNormalized === htmlTextNormalized;

  return {
    match,
    xmlText,
    htmlText,
    xmlTextNormalized,
    htmlTextNormalized,
    diff: match ? undefined : generateDiff(xmlTextNormalized, htmlTextNormalized)
  };
}

/**
 * 差分情報を生成（簡易版）
 * 最初の不一致位置とその周辺テキストを表示
 *
 * @param text1 - 比較元テキスト（XML）
 * @param text2 - 比較先テキスト（HTML）
 * @returns 差分情報の文字列
 */
function generateDiff(text1: string, text2: string): string {
  const maxLength = Math.max(text1.length, text2.length);
  let firstDiffIndex = -1;

  // 最初の不一致位置を検索
  for (let i = 0; i < maxLength; i++) {
    if (text1[i] !== text2[i]) {
      firstDiffIndex = i;
      break;
    }
  }

  if (firstDiffIndex === -1) {
    return '完全一致';
  }

  // 不一致位置の前後20文字を抽出
  const contextStart = Math.max(0, firstDiffIndex - 20);
  const contextEnd = Math.min(maxLength, firstDiffIndex + 20);

  return `
不一致位置: ${firstDiffIndex}文字目
XML周辺: "${text1.substring(contextStart, contextEnd)}"
HTML周辺: "${text2.substring(contextStart, contextEnd)}"
XML長さ: ${text1.length}文字
HTML長さ: ${text2.length}文字
`;
}
