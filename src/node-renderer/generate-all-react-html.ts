/**
 * 全XMLファイルについてReact SSRでHTMLを一括生成
 *
 * メモリ不足を防ぐため、--expose-gc フラグ付きで実行してください:
 * node --expose-gc --max-old-space-size=4096 -r tsx/register src/node-renderer/generate-all-react-html.ts
 */
import fs from 'fs';
import path from 'path';
import { renderToStaticMarkup } from 'react-dom/server';
import { XMLParser } from 'fast-xml-parser';
import React from 'react';
import { LawComponent } from '../api/components/law/law';
import { getLawComponentData } from '../api/lib/api/get-law-data';
import { parseLaw } from './parse-law';
import beautify from 'js-beautify';

// テスト状態CSVを読み込み
interface TestStatus {
  lawId: string;
  xmlPath: string;
  status: string;
  lastTested: string;
  notes: string;
}

function readTestStatusCSV(): TestStatus[] {
  const content = fs.readFileSync('tests/test-status.csv', 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  return lines.slice(1).map(line => {
    const [lawId, xmlPath, status, lastTested, notes] = line.split(',');
    return { lawId, xmlPath, status, lastTested, notes };
  });
}

// XMLパーサー設定
const xp = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  preserveOrder: true,
  textNodeName: '_',
  attributeNamePrefix: '',
});

// 1つのXMLファイルからHTMLを生成
function generateHTMLForLaw(lawId: string, xmlPath: string): { success: boolean; error?: string; skipped?: boolean } {
  try {
    // 既にReact HTMLが存在するかチェック
    const outputDir = 'output/react-html-formatted';
    const outputPath = path.join(outputDir, `${lawId}.html`);
    if (fs.existsSync(outputPath)) {
      return { success: true, skipped: true };
    }

    // XMLファイルを読み込み
    if (!fs.existsSync(xmlPath)) {
      return { success: false, error: 'XML file not found' };
    }

    // XMLを読み込んでパース
    let xmlContent = fs.readFileSync(xmlPath, 'utf-8');
    let parsedXml = xp.parse(xmlContent);
    xmlContent = ''; // メモリ解放

    // Law要素を取得
    const lawFullText = parsedXml[0];
    parsedXml = null as any; // メモリ解放

    if (!lawFullText || !lawFullText.Law) {
      return { success: false, error: 'Law element not found in XML' };
    }

    // データ抽出とレンダリング
    const { lawTitle, lawNum, lawBody } = getLawComponentData(lawFullText);

    let reactHtml = renderToStaticMarkup(
      React.createElement(LawComponent, {
        lawNum: lawNum,
        lawBody: lawBody,
        lawTitle: lawTitle,
        treeElement: [],
        lawRevisionId: '',
      })
    );

    // parseLaw適用
    const { content: processedHTML } = parseLaw(reactHtml, null);
    reactHtml = ''; // メモリ解放

    // HTMLフォーマット（format-html.tsと同じ設定を使用）
    const formattedHTML = beautify.html(processedHTML, {
      indent_size: 2,
      indent_char: ' ',
      max_preserve_newlines: 1,
      preserve_newlines: true,
      indent_inner_html: true,
      wrap_line_length: 0,
      unformatted: [],
    });

    // 出力ディレクトリを作成（既にチェック済みだが念のため）
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // HTMLファイルを保存
    fs.writeFileSync(outputPath, formattedHTML, 'utf-8');

    return { success: true };
  } catch (error) {
    const errorDetails = error instanceof Error
      ? `${error.message}\n\nStack trace:\n${error.stack}`
      : String(error);
    return { success: false, error: errorDetails };
  }
}

// メイン処理
function main() {
  const testStatuses = readTestStatusCSV();
  const total = testStatuses.length;

  console.log(`React HTML生成開始: 全${total}ファイル`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: { lawId: string; error: string }[] = [];

  const startTime = Date.now();

  for (let i = 0; i < total; i++) {
    const { lawId, xmlPath } = testStatuses[i];

    // 進捗表示（全件）
    const remaining = total - (i + 1);
    process.stdout.write(`\r[${i + 1}/${total}] ${lawId} (残り: ${remaining}, スキップ: ${skippedCount})                    `);

    const result = generateHTMLForLaw(lawId, xmlPath);

    if (result.success) {
      if (result.skipped) {
        skippedCount++;
      } else {
        successCount++;
      }
    } else {
      errorCount++;
      errors.push({ lawId, error: result.error || 'Unknown error' });
    }

    // メモリ解放: 1件ごとにガベージコレクションを促す
    if ((i + 1) % 1 === 0 && global.gc) {
      global.gc();
    }
  }

  console.log(''); // 改行

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n完了: 生成 ${successCount}, スキップ ${skippedCount}, エラー ${errorCount}/${total}, 時間 ${totalTime}s`);

  // エラーログを保存
  if (errors.length > 0) {
    const errorLog = errors.map(e => `\n${'='.repeat(80)}\nLaw ID: ${e.lawId}\n${'='.repeat(80)}\n${e.error}`).join('\n');
    fs.writeFileSync('tests/react-html-generation-errors.log', errorLog, 'utf-8');
    console.log(`エラーログ: tests/react-html-generation-errors.log`);
  }
}

main();
