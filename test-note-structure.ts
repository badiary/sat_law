/**
 * Note要素の構造を調査するスクリプト
 */

import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

// Note要素を含むXMLファイル
const xmlPath = 'all_xml/105DF0000000337_18721109_000000000000000/105DF0000000337_18721109_000000000000000.xml';

console.log('=== Note要素構造調査 ===\n');
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

// LawBodyを取得
const lawBody = lawFullText.Law.find((item: any) => 'LawBody' in item);

// AppdxNoteを探す
const appdxNote = lawBody.LawBody.find((item: any) => 'AppdxNote' in item);

if (appdxNote) {
  console.log('--- AppdxNote構造 ---');
  console.log(JSON.stringify(appdxNote, null, 2));
} else {
  console.log('AppdxNoteが見つかりませんでした');
}
