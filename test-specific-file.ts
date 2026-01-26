/**
 * 特定ファイルの詳細テストスクリプト
 */

import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent } from './src/api/utils/text-content-compare';
import { classifyMismatch } from './test-pattern-classifier';

// コマンドライン引数からファイルパスを取得
const xmlPath = process.argv[2] || 'all_xml/123AC0000000001_19670531_342AC0000000023/123AC0000000001_19670531_342AC0000000023.xml';

console.log('=== ファイル詳細テスト ===\n');
console.log(`ファイル: ${xmlPath}\n`);

const xp = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  alwaysCreateTextNode: false,
  preserveOrder: true,
  textNodeName: '_',
  attributeNamePrefix: '',
});

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

  console.log('--- テスト結果 ---');
  console.log(`テキスト一致: ${textCompare.match ? '✅' : '❌'}`);
  console.log(`XML長さ: ${textCompare.xmlTextNormalized.length}文字`);
  console.log(`HTML長さ: ${textCompare.htmlTextNormalized.length}文字`);

  if (!textCompare.match) {
    console.log(`\n${textCompare.diff}`);

    // パターン分類
    const pattern = classifyMismatch(
      textCompare.xmlText,
      textCompare.htmlText,
      textCompare.xmlTextNormalized,
      textCompare.htmlTextNormalized
    );

    console.log(`\n--- パターン分類 ---`);
    console.log(`パターンタイプ: ${pattern.patternType}`);
    console.log(`信頼度: ${pattern.confidence}`);
    console.log(`推奨アクション: ${pattern.recommendation}`);
    console.log(`理由: ${pattern.reason}`);
    console.log(`\n詳細: ${pattern.details}`);

    console.log(`\n--- XMLテキスト（最初の300文字） ---`);
    console.log(textCompare.xmlTextNormalized.substring(0, 300));

    console.log(`\n--- HTMLテキスト（最初の300文字） ---`);
    console.log(textCompare.htmlTextNormalized.substring(0, 300));

    // 不一致位置周辺を表示（正規化前のテキスト）
    if (textCompare.diff && textCompare.diff.includes('不一致位置:')) {
      const posMatch = textCompare.diff.match(/不一致位置: (\d+)/);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        console.log(`\n--- HTML正規化前テキスト（位置${pos}周辺） ---`);
        console.log(textCompare.htmlText.substring(Math.max(0, pos - 50), pos + 100));

        // 改正法令番号パターンチェック
        const amendPattern = /[（(](?:明治|大正|昭和|平成|令和).+?(?:法律|勅令|政令|.*?省令|規則|条例|告示)第.+?号[）)]/;
        const htmlHasPattern = amendPattern.test(textCompare.htmlText);
        const xmlHasPattern = amendPattern.test(textCompare.xmlText);
        console.log(`\n改正法令番号パターン検出: HTML=${htmlHasPattern}, XML=${xmlHasPattern}`);

        if (htmlHasPattern) {
          const match = textCompare.htmlText.match(amendPattern);
          console.log(`マッチした文字列: ${match ? match[0] : 'なし'}`);
        }
      }
    }
  }

} catch (error: any) {
  console.log(`❌ エラー: ${error.message}`);
  console.error(error.stack);
}
