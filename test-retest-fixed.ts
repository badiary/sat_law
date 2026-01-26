/**
 * 修正済みパターンのファイルを再テストするスクリプト
 */

import { readFileSync, writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent } from './src/api/utils/text-content-compare';

// テスト対象ファイル
const testFiles = [
  // 画像プレースホルダー問題のファイル
  'all_xml/106DF0000000065_18730220_000000000000000/106DF0000000065_18730220_000000000000000.xml',
  // Note要素未レンダリング問題のファイル
  'all_xml/105DF0000000337_18721109_000000000000000/105DF0000000337_18721109_000000000000000.xml',
];

console.log('=== 修正済みパターン再テスト ===\n');

const xp = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  alwaysCreateTextNode: false,
  preserveOrder: true,
  textNodeName: '_',
  attributeNamePrefix: '',
});

testFiles.forEach((xmlPath, idx) => {
  console.log(`\n[${idx + 1}/${testFiles.length}] ${xmlPath}`);
  console.log('='.repeat(80));

  try {
    // XMLファイルを読み込み
    const xml = readFileSync(xmlPath, 'utf-8');

    // XMLをパース
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

    console.log(`XML長さ: ${textCompare.xmlTextNormalized.length}文字`);
    console.log(`HTML長さ: ${textCompare.htmlTextNormalized.length}文字`);
    console.log(`テキスト一致: ${textCompare.match ? '✅ 成功' : '❌ 失敗'}`);

    if (!textCompare.match) {
      console.log(`\n差分情報:\n${textCompare.diff}`);
      console.log(`\nXML（最初の200文字）: ${textCompare.xmlTextNormalized.substring(0, 200)}`);
      console.log(`\nHTML（最初の200文字）: ${textCompare.htmlTextNormalized.substring(0, 200)}`);
    }

  } catch (error: any) {
    console.log(`❌ エラー: ${error.message}`);
  }
});

console.log('\n\n=== 再テスト完了 ===\n');
