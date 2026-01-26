/**
 * 段階的XMLレンダリングテスト
 * 1ファイルずつテストし、問題があれば停止して原因調査を促す
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync, appendFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { compareTextContent, TextCompareResult } from './src/api/utils/text-content-compare';
import { join } from 'path';
import {
  classifyMismatch,
  MismatchPattern,
  getPatternTypeText,
  getConfidenceText,
  getRecommendationText
} from './test-pattern-classifier';

// テスト設定
const ALL_XML_DIR = './all_xml';
const PROGRESS_CSV = './test-progress.csv';
const DETAIL_REPORT_DIR = './test-reports';
const JUDGMENT_LOG = './test-judgment-log.md';

// CSV行の型定義
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

/**
 * CSVファイルを初期化（未存在の場合）
 */
function initializeProgressCSV(): void {
  if (existsSync(PROGRESS_CSV)) {
    console.log(`✓ 進捗CSVファイルが存在します: ${PROGRESS_CSV}`);
    return;
  }

  console.log('進捗CSVファイルを初期化中...');

  // all_xmlディレクトリのサブディレクトリを取得（ディレクトリのみ）
  const allEntries = readdirSync(ALL_XML_DIR);
  const dirs = allEntries.filter(entry => {
    const fullPath = join(ALL_XML_DIR, entry);
    return statSync(fullPath).isDirectory();
  });

  console.log(`総XMLファイル数: ${dirs.length}`);

  // CSVヘッダーとデータ行を生成
  const header = 'xmlPath,status,unprocessedFieldsCount,textMatch,xmlLength,htmlLength,diffPosition,lastTested,errorMessage';
  const rows = dirs.map(dir => {
    const xmlPath = join(ALL_XML_DIR, dir, `${dir}.xml`);
    return `${xmlPath},pending,0,false,0,0,-1,,`;
  });

  const csvContent = [header, ...rows].join('\n');
  writeFileSync(PROGRESS_CSV, csvContent, 'utf-8');

  console.log(`✓ 進捗CSVファイルを作成しました: ${PROGRESS_CSV}`);
  console.log(`  総エントリ数: ${dirs.length}\n`);
}

/**
 * CSVファイルから進捗データを読み込み
 */
function loadProgress(): TestProgress[] {
  const csvContent = readFileSync(PROGRESS_CSV, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const [header, ...dataLines] = lines;

  return dataLines.map(line => {
    const [
      xmlPath,
      status,
      unprocessedFieldsCount,
      textMatch,
      xmlLength,
      htmlLength,
      diffPosition,
      lastTested,
      errorMessage
    ] = line.split(',');

    return {
      xmlPath,
      status: status as TestProgress['status'],
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

/**
 * 進捗データをCSVファイルに保存
 */
function saveProgress(progress: TestProgress[]): void {
  const header = 'xmlPath,status,unprocessedFieldsCount,textMatch,xmlLength,htmlLength,diffPosition,lastTested,errorMessage';
  const rows = progress.map(p => {
    const errorMsg = p.errorMessage.replace(/,/g, ';').replace(/\n/g, ' ');
    return `${p.xmlPath},${p.status},${p.unprocessedFieldsCount},${p.textMatch},${p.xmlLength},${p.htmlLength},${p.diffPosition},${p.lastTested},${errorMsg}`;
  });

  const csvContent = [header, ...rows].join('\n');
  writeFileSync(PROGRESS_CSV, csvContent, 'utf-8');
}

/**
 * 次のpendingファイルを取得
 */
function getNextPendingFile(progress: TestProgress[]): TestProgress | null {
  return progress.find(p => p.status === 'pending') || null;
}

/**
 * 単一XMLファイルをテスト
 */
function testSingleFile(xmlPath: string): { result: TestProgress; textCompareResult?: TextCompareResult } {
  const result: TestProgress = {
    xmlPath,
    status: 'pending',
    unprocessedFieldsCount: 0,
    textMatch: false,
    xmlLength: 0,
    htmlLength: 0,
    diffPosition: -1,
    lastTested: new Date().toISOString(),
    errorMessage: ''
  };

  // 警告キャプチャ用
  const warnings: string[] = [];
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('[未処理フィールド検出]')) {
      warnings.push(message);
    }
  };

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

    // レンダリング実行（getLawComponentDataは破壊的にlawFullTextを変更するため、先にコピー）
    const lawFullTextCopy = JSON.parse(JSON.stringify(lawFullText));
    const laws = getLawComponentData(lawFullText);
    const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

    // テキストコンテンツ比較
    const textCompare = compareTextContent(lawFullTextCopy, html);

    // 結果を記録
    result.unprocessedFieldsCount = warnings.length;
    result.textMatch = textCompare.match;
    result.xmlLength = textCompare.xmlTextNormalized.length;
    result.htmlLength = textCompare.htmlTextNormalized.length;

    if (!textCompare.match && textCompare.diff) {
      const match = textCompare.diff.match(/不一致位置: (\d+)文字目/);
      if (match) {
        result.diffPosition = parseInt(match[1]);
      }
    }

    // ステータス判定
    if (warnings.length > 0) {
      result.status = 'fail_unprocessed';
      result.errorMessage = `未処理フィールド${warnings.length}件検出`;
    } else if (!textCompare.match) {
      result.status = 'fail_text_mismatch';
      result.errorMessage = `テキスト不一致 (XML:${result.xmlLength}文字 vs HTML:${result.htmlLength}文字)`;
    } else {
      result.status = 'pass';
    }

    return { result, textCompareResult: textCompare };

  } catch (error: any) {
    result.status = 'fail_error';
    result.errorMessage = error.message;
    return { result };
  } finally {
    console.warn = originalWarn;
  }
}

/**
 * 詳細レポートを出力
 */
function generateDetailReport(result: TestProgress): void {
  // レポートディレクトリを作成
  const fs = require('fs');
  if (!existsSync(DETAIL_REPORT_DIR)) {
    fs.mkdirSync(DETAIL_REPORT_DIR, { recursive: true });
  }

  const reportPath = join(DETAIL_REPORT_DIR, `${result.xmlPath.replace(/[\\/:]/g, '_')}.json`);
  writeFileSync(reportPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`  詳細レポート: ${reportPath}`);
}

/**
 * 判断ログに記録を追加
 */
function appendToJudgmentLog(
  xmlPath: string,
  pattern: MismatchPattern,
  textCompare: TextCompareResult
): void {
  const timestamp = new Date().toISOString();
  const fileBaseName = xmlPath.split(/[/\\]/).pop() || xmlPath;

  // 不一致のサンプルテキストを抽出（最初の200文字）
  const xmlSample = textCompare.xmlText.substring(0, 200);
  const htmlSample = textCompare.htmlText.substring(0, 200);

  const logEntry = `
---

## ファイル: ${fileBaseName}

**フルパス**: \`${xmlPath}\`

**テスト日時**: ${timestamp}

### ステータス: ${pattern.recommendation === 'skip' ? 'スキップ' : '調査中'}

### 不一致概要

- **XML長さ**: ${textCompare.xmlTextNormalized.length}文字
- **HTML長さ**: ${textCompare.htmlTextNormalized.length}文字
- **長さ比率**: ${((textCompare.htmlTextNormalized.length / textCompare.xmlTextNormalized.length) * 100).toFixed(1)}%
- **差分**: ${textCompare.diff ? '詳細は下記参照' : 'なし'}

### パターン分類

- **パターンタイプ**: ${getPatternTypeText(pattern.patternType)}
- **信頼度**: ${getConfidenceText(pattern.confidence)}
- **推奨アクション**: ${getRecommendationText(pattern.recommendation)}

### 判断理由

${pattern.reason}

### 詳細分析

${pattern.details}

### 不一致サンプル

**XML（最初の200文字）**:
\`\`\`
${xmlSample}${textCompare.xmlText.length > 200 ? '...' : ''}
\`\`\`

**HTML（最初の200文字）**:
\`\`\`
${htmlSample}${textCompare.htmlText.length > 200 ? '...' : ''}
\`\`\`

### 判断: ${pattern.recommendation === 'fix_required' ? '修正必須' : pattern.recommendation === 'skip' ? 'スキップ可（問題なし）' : '手動確認が必要'}

${pattern.recommendation === 'skip'
  ? '✅ このパターンは意図的な処理であり、XMLの情報は失われていません。修正不要と判断します。'
  : pattern.recommendation === 'fix_required'
  ? '⚠️ このパターンはレンダリング漏れまたは不要なテキスト追加と判断されます。修正が必要です。'
  : '❓ パターンが不明確です。個別に調査して判断する必要があります。'}

### 対応内容

${pattern.recommendation === 'skip'
  ? '- [x] スキップ済み（問題なし）'
  : '- [ ] 原因調査\n- [ ] 修正実装\n- [ ] 再テスト'}

`;

  appendFileSync(JUDGMENT_LOG, logEntry, 'utf-8');
}

/**
 * 進捗サマリーを表示
 */
function showProgress(progress: TestProgress[]): void {
  const total = progress.length;
  const pending = progress.filter(p => p.status === 'pending').length;
  const pass = progress.filter(p => p.status === 'pass').length;
  const failUnprocessed = progress.filter(p => p.status === 'fail_unprocessed').length;
  const failTextMismatch = progress.filter(p => p.status === 'fail_text_mismatch').length;
  const failError = progress.filter(p => p.status === 'fail_error').length;

  console.log('\n📊 進捗サマリー:');
  console.log(`  総ファイル数: ${total}`);
  console.log(`  ✅ 成功: ${pass} (${(pass / total * 100).toFixed(2)}%)`);
  console.log(`  ⚠️  未処理フィールド: ${failUnprocessed}`);
  console.log(`  ⚠️  テキスト不一致: ${failTextMismatch}`);
  console.log(`  ❌ エラー: ${failError}`);
  console.log(`  ⏳ 未テスト: ${pending}\n`);
}

/**
 * メイン処理
 */
async function main() {
  console.log('=== 段階的XMLレンダリングテスト ===\n');

  // CSVを初期化
  initializeProgressCSV();

  // 進捗を読み込み
  const progress = loadProgress();

  // 進捗サマリーを表示
  showProgress(progress);

  // 次のpendingファイルを取得
  const nextFile = getNextPendingFile(progress);

  if (!nextFile) {
    console.log('🎉 全てのファイルのテストが完了しました！');
    return;
  }

  console.log(`📝 テスト中: ${nextFile.xmlPath}\n`);

  // テスト実行
  const { result, textCompareResult } = testSingleFile(nextFile.xmlPath);

  // 進捗を更新
  const index = progress.findIndex(p => p.xmlPath === nextFile.xmlPath);
  progress[index] = result;
  saveProgress(progress);

  // 結果を表示
  console.log('\n--- テスト結果 ---');
  console.log(`ステータス: ${result.status}`);
  console.log(`未処理フィールド数: ${result.unprocessedFieldsCount}`);
  console.log(`テキスト一致: ${result.textMatch}`);
  console.log(`XML長さ: ${result.xmlLength}文字`);
  console.log(`HTML長さ: ${result.htmlLength}文字`);

  if (result.errorMessage) {
    console.log(`エラーメッセージ: ${result.errorMessage}`);
  }

  // テキスト不一致の場合、パターン分類を実行
  let pattern: MismatchPattern | undefined;
  if (result.status === 'fail_text_mismatch' && textCompareResult) {
    pattern = classifyMismatch(
      textCompareResult.xmlText,
      textCompareResult.htmlText,
      textCompareResult.xmlTextNormalized,
      textCompareResult.htmlTextNormalized
    );

    console.log('\n--- パターン分類 ---');
    console.log(`パターンタイプ: ${getPatternTypeText(pattern.patternType)}`);
    console.log(`信頼度: ${getConfidenceText(pattern.confidence)}`);
    console.log(`推奨アクション: ${getRecommendationText(pattern.recommendation)}`);
    console.log(`理由: ${pattern.reason}`);
    console.log(`\n詳細:\n${pattern.details}\n`);

    // 判断ログに記録
    appendToJudgmentLog(nextFile.xmlPath, pattern, textCompareResult);
    console.log(`✅ 判断ログに記録しました: ${JUDGMENT_LOG}\n`);

    // 自動スキップ可能な場合
    if (pattern.recommendation === 'skip' && pattern.confidence === 'high') {
      console.log('✅ このパターンは自動スキップ可能です（問題なし）\n');

      // ステータスをpassに変更
      result.status = 'pass';
      progress[index] = result;
      saveProgress(progress);

      // 進捗サマリーを再表示
      showProgress(progress);

      console.log('次のファイルをテストするには、再度このスクリプトを実行してください:');
      console.log('  npm run test:incremental\n');
      return;
    }
  }

  // 失敗の場合、詳細レポートを出力して停止
  if (result.status !== 'pass') {
    console.log('\n⚠️  テスト失敗: 原因を調査してください\n');
    generateDetailReport(result);

    // 進捗サマリーを再表示
    showProgress(progress);

    console.log('修正後、再度このスクリプトを実行してください:');
    console.log('  npm run test:incremental\n');

    process.exit(1);
  }

  // 成功の場合
  console.log('\n✅ テスト成功！次のファイルに進みます...\n');

  // 進捗サマリーを再表示
  showProgress(progress);

  console.log('次のファイルをテストするには、再度このスクリプトを実行してください:');
  console.log('  npm run test:incremental\n');
}

main().catch(error => {
  console.error('❌ テストでエラーが発生しました:', error);
  process.exit(1);
});
