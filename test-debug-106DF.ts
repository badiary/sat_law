/**
 * 106DF0000000065ファイルのデバッグ
 */

import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent } from './src/api/utils/text-content-compare';

const xmlPath = 'all_xml/106DF0000000065_18730220_000000000000000/106DF0000000065_18730220_000000000000000.xml';

console.log('=== 106DF0000000065ファイル デバッグ ===\n');

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

// レンダリング実行（getLawComponentDataは破壊的にlawFullTextを変更するため、先にコピー）
const lawFullTextCopy = JSON.parse(JSON.stringify(lawFullText));
const laws = getLawComponentData(lawFullText);
const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

// テキスト比較
const textCompare = compareTextContent(lawFullTextCopy, html);

console.log('--- テキスト比較結果 ---');
console.log(`一致: ${textCompare.match}`);
console.log(`XML長さ: ${textCompare.xmlTextNormalized.length}文字`);
console.log(`HTML長さ: ${textCompare.htmlTextNormalized.length}文字`);

if (!textCompare.match) {
  console.log(`\n${textCompare.diff}`);

  // 差分位置周辺を詳細に表示
  const diffPos = 238;
  const range = 50;
  console.log(`\n--- XML（位置${diffPos}周辺${range}文字） ---`);
  console.log(textCompare.xmlTextNormalized.substring(diffPos - range, diffPos + range));
  console.log(`\n--- HTML（位置${diffPos}周辺${range}文字） ---`);
  console.log(textCompare.htmlTextNormalized.substring(diffPos - range, diffPos + range));

  // 抜けているテキストを特定
  const missingText = '地ヲ離ル凡一尺';
  console.log(`\n抜けているテキスト: "${missingText}"`);
  console.log(`XMLに存在: ${textCompare.xmlTextNormalized.includes(missingText)}`);
  console.log(`HTMLに存在: ${textCompare.htmlTextNormalized.includes(missingText)}`);

  // 元のXMLでこのテキストがどこにあるか確認
  console.log(`\n元のXMLでの位置: ${xml.indexOf(missingText)}`);
  if (xml.includes(missingText)) {
    const startIdx = xml.indexOf(missingText) - 100;
    const endIdx = xml.indexOf(missingText) + 100;
    console.log(`\n--- 元のXML周辺 ---`);
    console.log(xml.substring(startIdx, endIdx));
  }
}
