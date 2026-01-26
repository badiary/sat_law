import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent } from './src/api/utils/text-content-compare';

const xmlPath = 'all_xml/123AC0000000001_19670531_342AC0000000023/123AC0000000001_19670531_342AC0000000023.xml';
const xml = readFileSync(xmlPath, 'utf-8');
const xp = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  alwaysCreateTextNode: false,
  preserveOrder: true,
  textNodeName: '_',
  attributeNamePrefix: ''
});
const convertLaw = xp.parse(xml);
const lawFullText = convertLaw[0];
const lawFullTextCopy = JSON.parse(JSON.stringify(lawFullText));
const laws = getLawComponentData(lawFullText);
const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());
const textCompare = compareTextContent(lawFullTextCopy, html);

console.log('=== 正規化前のHTMLテキスト（位置260-320） ===');
console.log(textCompare.htmlText.substring(260, 320));

console.log('\n=== 正規化後のHTMLテキスト（位置260-320） ===');
console.log(textCompare.htmlTextNormalized.substring(260, 320));

console.log('\n=== パターンチェック ===');
const pattern = /（明治三三年.*?号）/;
console.log('正規化前に含まれる:', pattern.test(textCompare.htmlText));
console.log('正規化後に含まれる:', pattern.test(textCompare.htmlTextNormalized));

if (pattern.test(textCompare.htmlText)) {
  const match = textCompare.htmlText.match(pattern);
  console.log('マッチした文字列:', match ? match[0] : 'なし');
}
