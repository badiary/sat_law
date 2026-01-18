import * as fs from 'fs';
import * as path from 'path';

/**
 * typescript-renderer.tsファイル内のprocessed.addとレンダリング処理の分離を修正するスクリプト
 *
 * 問題: 多くの関数でprocessed.add()が関数の最初の方で呼び出され、実際のレンダリングが後で行われている
 * 解決: processed.add()とcheckAllFieldsProcessed()をレンダリング処理の直前に移動する
 */

const filePath = path.join(__dirname, 'src', 'api', 'typescript-renderer.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// renderTextNode関数の修正
console.log('renderTextNode関数を修正中...');

// Line処理の修正
content = content.replace(
  /if \('Line' in dt\) \{\s+processed\.add\('Line'\);/,
  `if ('Line' in dt) {
      processed.add('Line');
      checkAllFieldsProcessed(dt, processed, 'TextNode');`
);

// Ruby処理の修正
content = content.replace(
  /\} else if \('Ruby' in dt\) \{\s+\/\/ .*?\n\s+const text = getType<TextType>\(dt\.Ruby, '_'\)\[0\]\._;\s+const rt = getType<RtType>\(dt\.Ruby, 'Rt'\)\[0\]\.Rt\[0\]\._;\s+return `<ruby>\$\{text\}<rt>\$\{rt\}<\/rt><\/ruby>`;/s,
  `} else if ('Ruby' in dt) {
      processed.add('Ruby');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // ルビ
      const text = getType<TextType>(dt.Ruby, '_')[0]._;
      const rt = getType<RtType>(dt.Ruby, 'Rt')[0].Rt[0]._;
      return \`<ruby>\${text}<rt>\${rt}</rt></ruby>\`;`
);

// Sup処理の修正
content = content.replace(
  /\} else if \('Sup' in dt\) \{\s+\/\/ .*?\n\s+const text = getType<TextType>\(dt\.Sup, '_'\)\[0\]\._;\s+return tag\('sup', \{ class: 'Sup' \}, text\);/s,
  `} else if ('Sup' in dt) {
      processed.add('Sup');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // 上付き文字
      const text = getType<TextType>(dt.Sup, '_')[0]._;
      return tag('sup', { class: 'Sup' }, text);`
);

// Sub処理の修正
content = content.replace(
  /\} else if \('Sub' in dt\) \{\s+\/\/ .*?\n\s+const text = getType<TextType>\(dt\.Sub, '_'\)\[0\]\._;\s+return tag\('sub', \{ class: 'Sub' \}, text\);/s,
  `} else if ('Sub' in dt) {
      processed.add('Sub');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // 下付き文字
      const text = getType<TextType>(dt.Sub, '_')[0]._;
      return tag('sub', { class: 'Sub' }, text);`
);

// QuoteStruct処理の修正
content = content.replace(
  /\} else if \('QuoteStruct' in dt\) \{\s+\/\/ .*?\n\s+\/\/ .*?\n\s+const quoteStructList = Array\.isArray\(dt\.QuoteStruct\) \? dt\.QuoteStruct : \[dt\.QuoteStruct\];\s+return renderLawTypeList\(quoteStructList, treeElement, 'QuoteStruct'\);/s,
  `} else if ('QuoteStruct' in dt) {
      processed.add('QuoteStruct');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // 引用構造 - QuoteStruct内の要素を処理（TableStructが含まれる場合もある）
      // QuoteStructは配列でない場合もあるので、配列に変換
      const quoteStructList = Array.isArray(dt.QuoteStruct) ? dt.QuoteStruct : [dt.QuoteStruct];
      return renderLawTypeList(quoteStructList, treeElement, 'QuoteStruct');`
);

// ArithFormula処理の修正
content = content.replace(
  /\} else if \('ArithFormula' in dt\) \{\s+\/\/ .*?\n\s+\/\/ .*?\n\s+const arithContent = dt\.ArithFormula\.map/s,
  `} else if ('ArithFormula' in dt) {
      processed.add('ArithFormula');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // 算術式 - Reactと同様に<div class="pl-4">でラップ
      // Sub/Supタグを正しく<sub>/<sup>として出力(e-gov法令APIの仕様に準拠)
      const arithContent = dt.ArithFormula.map`
);

// プレーンテキスト処理の修正
content = content.replace(
  /\} else \{\s+\/\/ .*?\n\s+\/\/ .*?\n\s+return dt\._ !== undefined && dt\._ !== null \? String\(dt\._\) : '';/s,
  `} else {
      processed.add('_');
      checkAllFieldsProcessed(dt, processed, 'TextNode');
      // プレーンテキスト
      // 注意: dt._が値0の場合も正常に返す必要がある
      return dt._ !== undefined && dt._ !== null ? String(dt._) : '';`
);

console.log('renderTextNode関数の修正が完了しました');

// renderLawTypeList関数の修正
console.log('renderLawTypeList関数を修正中...');

// renderLawTypeListのパターンを検出して修正
// すべてのprocessed.add()がレンダリング直前に来るように、既存の構造を変更

const renderLawTypeListMatch = content.match(/const renderLawTypeList = \([^)]+\)[^{]+\{[\s\S]+?^};/m);
if (renderLawTypeListMatch) {
  const originalFunc = renderLawTypeListMatch[0];

  // 新しい関数の構造を作成
  const newFunc = originalFunc
    // processed.add呼び出しをコメントアウトして、後で各分岐に移動
    .replace(/\n(\s+)if \('(\w+)' in dt\) \{\s*\n\s*processed\.add\('\2'\);\s*\n\s*\}/g, '')
    .replace(/\n(\s+)checkAllFieldsProcessed\(dt, processed, `LawTypeList\[\$\{parentElement\}\]\[\$\{index\}\]`\);/, '')
    // 各レンダリング分岐の直前にprocessed.addとcheckを追加
    .replace(/(\s+if \('(\w+)' in dt\) \{\s*\n\s*return render)/g, (match, p1, fieldName) => {
      const indent = p1.match(/^\s*/)[0];
      return `${indent}if ('${fieldName}' in dt) {
${indent}  processed.add('${fieldName}');
${indent}  checkAllFieldsProcessed(dt, processed, \`LawTypeList[\${parentElement}][\${index}]\`);
${indent}  return render`;
    })
    // else if分岐の修正
    .replace(/(\s+\} else if \('(\w+)' in dt\) \{\s*\n\s*return render)/g, (match, p1, fieldName) => {
      const indent = p1.match(/\n(\s+)\}/)[1];
      return `${p1.substring(0, p1.indexOf('{') + 1)}
${indent}  processed.add('${fieldName}');
${indent}  checkAllFieldsProcessed(dt, processed, \`LawTypeList[\${parentElement}][\${index}]\`);
${indent}  return render`;
    });

  content = content.replace(originalFunc, newFunc);
}

console.log('renderLawTypeList関数の修正が完了しました');

// ファイルを保存
fs.writeFileSync(filePath, content, 'utf-8');
console.log('修正が完了しました: ' + filePath);
