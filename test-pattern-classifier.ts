/**
 * テキスト不一致パターン自動分類システム
 * 不一致のパターンを自動検出し、修正推奨度を判定する
 */

export type PatternType = 'image_placeholder' | 'note_missing' | 'paragraph_number' | 'amend_law_num' | 'unknown';
export type Confidence = 'high' | 'medium' | 'low';
export type Recommendation = 'fix_required' | 'skip' | 'manual_review';

export interface MismatchPattern {
  patternType: PatternType;
  confidence: Confidence;
  recommendation: Recommendation;
  reason: string;
  details: string;
}

/**
 * 不一致パターンを分類する
 */
export function classifyMismatch(
  xmlText: string,
  htmlText: string,
  xmlTextNormalized: string,
  htmlTextNormalized: string
): MismatchPattern {
  // パターン1: 画像プレースホルダーテキスト
  if (htmlText.includes('画像を読み込み中...')) {
    return {
      patternType: 'image_placeholder',
      confidence: 'high',
      recommendation: 'fix_required',
      reason: '画像プレースホルダーテキストが不要にレンダリングされています',
      details: 'HTMLに「画像を読み込み中...」が含まれているが、XMLには存在しません。renderFigStruct関数で追加されるプレースホルダーテキストを削除する必要があります。'
    };
  }

  // パターン2: 段落番号の追加（スキップ対象）
  const htmlHasCircleNumbers = /[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/.test(htmlText);
  const xmlHasCircleNumbers = /[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/.test(xmlText);

  if (htmlHasCircleNumbers && !xmlHasCircleNumbers) {
    const circleNumberCount = (htmlText.match(/[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]/g) || []).length;

    // 段落番号追加は意図的な処理として自動スキップ
    return {
      patternType: 'paragraph_number',
      confidence: 'high',
      recommendation: 'skip',
      reason: 'HTMLに段落番号（①②③等）が追加されています',
      details: `HTMLに丸数字が${circleNumberCount}個追加されています。これは段落を見やすくするための意図的な処理です。ユーザー指示により、このパターンは無視して構いません。`
    };
  }

  // パターン2.5: 改正法令番号の追加（スキップ対象）
  // 附則に（明治○○年...法律第○○号）のような改正法令番号が追加されるパターン
  // 正規化前のテキストで比較（全角スペースが含まれる可能性があるため）
  // 注意: 年号と法律番号は漢数字の場合もあるため、より柔軟なパターンを使用
  // 法律・勅令・政令・省令・規則など様々な法令形式に対応
  // 各省庁の省令（大蔵省令、文部省令など）にも対応
  const amendLawNumPattern = /[（(](?:明治|大正|昭和|平成|令和).+?(?:法律|勅令|政令|.*?省令|規則|条例|告示)第.+?号[）)]/;
  const htmlTextHasAmendLawNum = amendLawNumPattern.test(htmlText);
  const xmlTextHasAmendLawNum = amendLawNumPattern.test(xmlText);

  if (htmlTextHasAmendLawNum && !xmlTextHasAmendLawNum) {
    return {
      patternType: 'amend_law_num',
      confidence: 'high',
      recommendation: 'skip',
      reason: 'HTMLに改正法令番号が追加されています',
      details: 'HTMLに附則の改正法令番号（例: （明治三三年二月二六日法律第一八号）、（昭和一二年九月二四日勅令第五二九号））が追加されています。これはXMLの属性（AmendLawNum）から生成される意図的な処理です。このパターンは無視して構いません。'
    };
  }

  // パターン3: Note要素の未レンダリング
  const lengthRatio = xmlTextNormalized.length > 0
    ? htmlTextNormalized.length / xmlTextNormalized.length
    : 1;

  if (lengthRatio < 0.7 && xmlTextNormalized.length > 100) {
    // HTMLがXMLの70%未満の長さで、かつXMLが100文字以上の場合
    return {
      patternType: 'note_missing',
      confidence: 'medium',
      recommendation: 'fix_required',
      reason: 'XMLに比べてHTMLのテキストが大幅に短い（要素の未レンダリングの可能性）',
      details: `XML: ${xmlTextNormalized.length}文字、HTML: ${htmlTextNormalized.length}文字（HTML/XML比率: ${(lengthRatio * 100).toFixed(1)}%）。Note要素、TableStruct、FigStruct等の要素が未レンダリングの可能性があります。`
    };
  }

  // パターン4: HTMLの方が長い（テキスト追加の可能性）
  if (lengthRatio > 1.3 && htmlTextNormalized.length > 100) {
    return {
      patternType: 'unknown',
      confidence: 'medium',
      recommendation: 'manual_review',
      reason: 'HTMLの方がXMLより大幅に長い（意図しないテキスト追加の可能性）',
      details: `XML: ${xmlTextNormalized.length}文字、HTML: ${htmlTextNormalized.length}文字（HTML/XML比率: ${(lengthRatio * 100).toFixed(1)}%）。HTMLに余分なテキストが追加されている可能性があります。`
    };
  }

  // パターン5: 軽微な差分
  const lengthDiff = Math.abs(htmlTextNormalized.length - xmlTextNormalized.length);

  if (lengthDiff <= 10) {
    return {
      patternType: 'unknown',
      confidence: 'low',
      recommendation: 'manual_review',
      reason: '軽微なテキスト差分（10文字以内）',
      details: `正規化後の文字数差は${lengthDiff}文字です。句読点、空白の扱いの違い、またはHTML実体参照の問題の可能性があります。`
    };
  }

  // パターン6: その他の未知パターン
  return {
    patternType: 'unknown',
    confidence: 'low',
    recommendation: 'manual_review',
    reason: '未知のパターン（手動確認が必要）',
    details: `XML: ${xmlTextNormalized.length}文字、HTML: ${htmlTextNormalized.length}文字（差分: ${lengthDiff}文字）。パターンが特定できませんでした。個別調査が必要です。`
  };
}

/**
 * 推奨アクションを日本語で取得
 */
export function getRecommendationText(recommendation: Recommendation): string {
  switch (recommendation) {
    case 'fix_required':
      return '修正必須';
    case 'skip':
      return 'スキップ可（問題なし）';
    case 'manual_review':
      return '手動確認';
  }
}

/**
 * パターンタイプを日本語で取得
 */
export function getPatternTypeText(patternType: PatternType): string {
  switch (patternType) {
    case 'image_placeholder':
      return '画像プレースホルダー';
    case 'note_missing':
      return 'Note要素未レンダリング';
    case 'paragraph_number':
      return '段落番号追加';
    case 'amend_law_num':
      return '改正法令番号追加';
    case 'unknown':
      return '未知のパターン';
  }
}

/**
 * 信頼度を日本語で取得
 */
export function getConfidenceText(confidence: Confidence): string {
  switch (confidence) {
    case 'high':
      return '高';
    case 'medium':
      return '中';
    case 'low':
      return '低';
  }
}
