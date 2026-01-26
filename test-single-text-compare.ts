/**
 * 単一XMLファイルのテキスト比較デバッグスクリプト
 */

import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent, extractTextFromXML, extractTextFromHTML } from './src/api/utils/text-content-compare';

// テスト対象ファイル
const xmlPath = 'all_xml/108DF0000000054_20030501_414CO0000000277/108DF0000000054_20030501_414CO0000000277.xml';

console.log('=== 単一XMLファイル テキスト比較デバッグ ===\n');
console.log(`ファイル: ${xmlPath}\n`);

// XMLファイルを読み込み
const xml = readFileSync(xmlPath, 'utf-8');

// XMLをパース
const xp = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  alwaysCreateTextNode: false,
  preserveOrder: true,
  textNodeName: '_',
  attributeNamePrefix: '',
});
const convertLaw = xp.parse(xml);

// XMLの構造を判定
let lawFullText: any;
if (convertLaw[0]?.law_data_response) {
  const lawDataResponse = convertLaw[0].law_data_response;
  lawFullText = lawDataResponse[3].law_full_text[0];
} else if (convertLaw[0]?.Law) {
  lawFullText = convertLaw[0];
} else {
  throw new Error('不明なXML形式です');
}

// デバッグ: lawFullTextの構造を確認
console.log('--- lawFullText構造（最初の2000文字） ---');
console.log(JSON.stringify(lawFullText, null, 2).substring(0, 2000));
console.log('\n');

// レンダリング実行（getLawComponentDataは破壊的にlawFullTextを変更するため、先にコピー）
const lawFullTextCopy = JSON.parse(JSON.stringify(lawFullText));
const laws = getLawComponentData(lawFullText);
const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

// デバッグ: lawsの構造を確認
console.log('--- laws構造 ---');
console.log(`lawNum: ${JSON.stringify(laws.lawNum).substring(0, 200)}`);
console.log(`lawTitle: ${JSON.stringify(laws.lawTitle).substring(0, 200)}`);
console.log(`lawBody: ${JSON.stringify(laws.lawBody).substring(0, 500)}`);
console.log();

// デバッグ: XMLからのテキスト抽出を直接テスト
console.log('--- extractTextFromXML(lawFullText)のテスト ---');
const extractedXMLText = extractTextFromXML(lawFullText);
console.log(`抽出テキスト長さ: ${extractedXMLText.length}文字`);
console.log(`抽出テキスト（最初の500文字）: ${extractedXMLText.substring(0, 500)}`);
console.log();

// テキスト比較（lawFullTextのコピーから抽出 vs HTMLから抽出）
const result = compareTextContent(lawFullTextCopy, html);

// デバッグ出力
console.log('--- XML元テキスト（最初の500文字） ---');
console.log(result.xmlText.substring(0, 500));
console.log(`\n（全体: ${result.xmlText.length}文字）\n`);

console.log('--- HTML抽出テキスト（最初の500文字） ---');
console.log(result.htmlText.substring(0, 500));
console.log(`\n（全体: ${result.htmlText.length}文字）\n`);

console.log('--- XML正規化後テキスト（最初の500文字） ---');
console.log(result.xmlTextNormalized.substring(0, 500));
console.log(`\n（全体: ${result.xmlTextNormalized.length}文字）\n`);

console.log('--- HTML正規化後テキスト（最初の500文字） ---');
console.log(result.htmlTextNormalized.substring(0, 500));
console.log(`\n（全体: ${result.htmlTextNormalized.length}文字）\n`);

console.log(`--- 比較結果 ---`);
console.log(`一致: ${result.match}`);
if (!result.match) {
  console.log(`\n差分情報:\n${result.diff}`);
}

// HTMLの生出力も確認
console.log('\n--- HTML生成結果（最初の1000文字） ---');
console.log(html.substring(0, 1000));
console.log(`\n（全体: ${html.length}文字）\n`);
