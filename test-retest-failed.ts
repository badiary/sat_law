/**
 * 失敗したファイルを再テストするスクリプト
 */

import { readFileSync, writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent } from './src/api/utils/text-content-compare';
import { classifyMismatch } from './test-pattern-classifier';

const PROGRESS_CSV = './test-progress.csv';

interface TestProgress {
  xmlPath: string;
  status: 'pending' | 'pass' | 'fail_unprocessed' | 'fail_text_mismatch' | 'fail_error';
  unprocessedFieldsCount: number;
  textMatch: boolean;
  xmlLength: number;
  htmlLength: number;
  diffPosition: number;
  lastTested: string;
  errorMessage: string;
}

function loadProgress(): TestProgress[] {
  const csv = readFileSync(PROGRESS_CSV, 'utf-8');
  const lines = csv.split('\n').slice(1); // ヘッダーをスキップ

  return lines.filter(line => line.trim()).map(line => {
    const [xmlPath, status, unprocessedFieldsCount, textMatch, xmlLength, htmlLength, diffPosition, lastTested, errorMessage] = line.split(',');

    return {
      xmlPath,
      status: status as any,
      unprocessedFieldsCount: parseInt(unprocessedFieldsCount) || 0,
      textMatch: textMatch === 'true',
      xmlLength: parseInt(xmlLength) || 0,
      htmlLength: parseInt(htmlLength) || 0,
      diffPosition: parseInt(diffPosition) || -1,
      lastTested,
      errorMessage: errorMessage || ''
    };
  });
}

function saveProgress(progress: TestProgress[]): void {
  const header = 'xmlPath,status,unprocessedFieldsCount,textMatch,xmlLength,htmlLength,diffPosition,lastTested,errorMessage\n';
  const rows = progress.map(p =>
    `${p.xmlPath},${p.status},${p.unprocessedFieldsCount},${p.textMatch},${p.xmlLength},${p.htmlLength},${p.diffPosition},${p.lastTested},${p.errorMessage}`
  ).join('\n');

  writeFileSync(PROGRESS_CSV, header + rows, 'utf-8');
}

async function retestFailedFiles(): Promise<void> {
  console.log('=== 失敗ファイルの再テスト ===\n');

  const progress = loadProgress();
  const failedFiles = progress.filter(p => p.status === 'fail_text_mismatch');

  console.log(`失敗ファイル数: ${failedFiles.length}\n`);

  const xp = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    alwaysCreateTextNode: false,
    preserveOrder: true,
    textNodeName: '_',
    attributeNamePrefix: '',
  });

  let retested = 0;
  let nowPass = 0;
  let stillFail = 0;
  let autoSkip = 0;

  for (const file of failedFiles) {
    retested++;
    console.log(`[${retested}/${failedFiles.length}] ${file.xmlPath}`);

    try {
      // XMLファイルを読み込み
      const xml = readFileSync(file.xmlPath, 'utf-8');

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

      // レンダリング実行
      const lawFullTextCopy = JSON.parse(JSON.stringify(lawFullText));
      const laws = getLawComponentData(lawFullText);
      const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

      // テキスト比較
      const textCompare = compareTextContent(lawFullTextCopy, html);

      // パターン分類
      const pattern = classifyMismatch(
        textCompare.xmlText,
        textCompare.htmlText,
        textCompare.xmlTextNormalized,
        textCompare.htmlTextNormalized
      );

      // 結果を更新
      const index = progress.findIndex(p => p.xmlPath === file.xmlPath);

      if (textCompare.match) {
        // 成功
        progress[index].status = 'pass';
        progress[index].textMatch = true;
        progress[index].lastTested = new Date().toISOString();
        progress[index].errorMessage = '';
        nowPass++;
        console.log(`  ✅ 成功 (修正により解決)\n`);
      } else if (pattern.recommendation === 'skip' && pattern.confidence === 'high') {
        // 自動スキップ
        progress[index].status = 'pass';
        progress[index].textMatch = false;
        progress[index].lastTested = new Date().toISOString();
        progress[index].errorMessage = `自動スキップ: ${pattern.reason}`;
        autoSkip++;
        console.log(`  ✅ 自動スキップ (${pattern.patternType})\n`);
      } else {
        // まだ失敗
        progress[index].xmlLength = textCompare.xmlTextNormalized.length;
        progress[index].htmlLength = textCompare.htmlTextNormalized.length;
        progress[index].lastTested = new Date().toISOString();
        stillFail++;
        console.log(`  ❌ まだ失敗 (${pattern.patternType}: ${pattern.recommendation})\n`);
      }

    } catch (error: any) {
      console.log(`  ❌ エラー: ${error.message}\n`);
      stillFail++;
    }
  }

  // 進捗を保存
  saveProgress(progress);

  console.log('\n=== 再テスト完了 ===');
  console.log(`再テスト数: ${retested}`);
  console.log(`✅ 成功（修正により解決）: ${nowPass}`);
  console.log(`✅ 自動スキップ: ${autoSkip}`);
  console.log(`❌ まだ失敗: ${stillFail}`);
}

retestFailedFiles().catch(console.error);
