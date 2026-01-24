/**
 * 複数XMLファイルのバッチレンダリングテスト
 * all_xmlフォルダ内のすべてのXMLファイルを処理し、
 * 未処理フィールドを検出してレポートを出力する
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { join } from 'path';

// テスト設定
const ALL_XML_DIR = './all_xml';
const OUTPUT_REPORT = './unprocessed-fields-report.json';
const SAMPLE_SIZE = process.argv[2] ? parseInt(process.argv[2]) : undefined; // 引数でサンプル数指定可能

// レポート型
interface UnprocessedFieldReport {
  totalFiles: number;
  testedFiles: number;
  filesWithUnprocessedFields: number;
  filesWithErrors: number;
  unprocessedFieldsByContext: Record<string, number>;
  details: Array<{
    xmlPath: string;
    warnings: string[];
    error?: string;
  }>;
}

async function batchRenderTest() {
  console.log('=== XMLバッチレンダリングテスト ===\n');
  console.log(`テストディレクトリ: ${ALL_XML_DIR}`);

  // all_xmlディレクトリのサブディレクトリを取得
  const dirs = readdirSync(ALL_XML_DIR);
  console.log(`総XMLディレクトリ数: ${dirs.length}`);

  // サンプリング
  const testDirs = SAMPLE_SIZE ? dirs.slice(0, SAMPLE_SIZE) : dirs;
  console.log(`テスト対象: ${testDirs.length}ファイル${SAMPLE_SIZE ? ' (サンプリング)' : ''}\n`);

  // レポート初期化
  const report: UnprocessedFieldReport = {
    totalFiles: dirs.length,
    testedFiles: testDirs.length,
    filesWithUnprocessedFields: 0,
    filesWithErrors: 0,
    unprocessedFieldsByContext: {},
    details: []
  };

  // 警告キャプチャ用
  const originalWarn = console.warn;
  let currentWarnings: string[] = [];

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('[未処理フィールド検出]')) {
      currentWarnings.push(message);
      // コンテキスト別カウント
      const match = message.match(/\[未処理フィールド検出\]\s+(\w+)/);
      if (match) {
        const context = match[1];
        report.unprocessedFieldsByContext[context] = (report.unprocessedFieldsByContext[context] || 0) + 1;
      }
    }
  };

  // 各XMLファイルをテスト
  let processedCount = 0;
  for (const dir of testDirs) {
    const xmlPath = join(ALL_XML_DIR, dir, `${dir}.xml`);
    currentWarnings = [];

    try {
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

      // レンダリング実行
      const laws = getLawComponentData(lawFullText);
      const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

      // 警告があった場合、レポートに追加
      if (currentWarnings.length > 0) {
        report.filesWithUnprocessedFields++;
        report.details.push({
          xmlPath,
          warnings: [...currentWarnings]
        });
      }

      processedCount++;
      if (processedCount % 100 === 0) {
        console.log(`進捗: ${processedCount}/${testDirs.length} ファイル処理完了`);
      }

    } catch (error: any) {
      report.filesWithErrors++;
      report.details.push({
        xmlPath,
        warnings: [...currentWarnings],
        error: error.message
      });
      // エラーは継続（すべてのファイルをテスト）
    }
  }

  // console.warnを復元
  console.warn = originalWarn;

  // レポート出力
  console.log('\n📊 バッチレンダリングテスト結果:');
  console.log(`  総ファイル数: ${report.totalFiles}`);
  console.log(`  テスト済ファイル数: ${report.testedFiles}`);
  console.log(`  未処理フィールドを含むファイル数: ${report.filesWithUnprocessedFields}`);
  console.log(`  エラーが発生したファイル数: ${report.filesWithErrors}`);
  console.log(`  未処理フィールド検出率: ${((report.filesWithUnprocessedFields / report.testedFiles) * 100).toFixed(2)}%`);

  console.log('\n📋 コンテキスト別未処理フィールド数:');
  const sortedContexts = Object.entries(report.unprocessedFieldsByContext)
    .sort((a, b) => b[1] - a[1]);

  if (sortedContexts.length === 0) {
    console.log('  未処理フィールドは検出されませんでした！');
  } else {
    sortedContexts.forEach(([context, count]) => {
      console.log(`  ${context}: ${count}件`);
    });
  }

  // JSONレポート出力
  writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2));
  console.log(`\n✅ 詳細レポートを出力: ${OUTPUT_REPORT}`);

  // エラーがあった場合、サンプルを表示
  if (report.filesWithErrors > 0) {
    console.log('\n❌ エラーサンプル（最初の5件）:');
    report.details
      .filter(d => d.error)
      .slice(0, 5)
      .forEach(d => {
        console.log(`  ${d.xmlPath}: ${d.error}`);
      });
  }

  // 未処理フィールドがあった場合、サンプルを表示
  if (report.filesWithUnprocessedFields > 0) {
    console.log('\n⚠️  未処理フィールドサンプル（最初の5件）:');
    report.details
      .filter(d => d.warnings.length > 0 && !d.error)
      .slice(0, 5)
      .forEach(d => {
        console.log(`  ${d.xmlPath}:`);
        d.warnings.slice(0, 3).forEach(w => console.log(`    ${w}`));
      });
  }
}

batchRenderTest().catch(error => {
  console.error('❌ バッチテストでエラーが発生しました:', error);
  process.exit(1);
});
