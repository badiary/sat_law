/**
 * 不正XMLテストランナー
 *
 * test-invalid-xml-generator.tsで生成したテストケースを実行し、
 * 未処理フィールド検出機構が正しく警告を出力することを検証する
 */

import { writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';
import { getAllInvalidXMLTestCases, InvalidXMLTestCase } from './test-invalid-xml-generator';

interface TestResult {
  testCase: InvalidXMLTestCase;
  passed: boolean;
  capturedWarnings: string[];
  missingWarnings: string[];  // 期待されたが出力されなかった警告
  unexpectedWarnings: string[]; // 予期しない警告
  error?: string;
}

interface TestReport {
  totalTests: number;
  passed: number;
  failed: number;
  details: TestResult[];
}

async function runInvalidXMLTests(): Promise<TestReport> {
  console.log('=== 不正XMLテスト開始 ===\n');

  const testCases = getAllInvalidXMLTestCases();
  console.log(`総テストケース数: ${testCases.length}\n`);

  const results: TestResult[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const testCase of testCases) {
    const testLabel = `${testCase.elementName}/${testCase.patternName}`;
    console.log(`テスト実行中: ${testLabel}`);

    // console.warnをフック
    const capturedWarnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      capturedWarnings.push(message);
    };

    try {
      // XMLをパース
      const xp = new XMLParser({
        ignoreDeclaration: true,
        ignoreAttributes: false,
        alwaysCreateTextNode: false,
        preserveOrder: true,
        textNodeName: '_',
        attributeNamePrefix: '',
      });
      const convertLaw = xp.parse(testCase.xmlContent);

      // XMLの構造を判定
      // テスト用XMLは <Law> をルート要素として持つため、convertLaw[0] 自体が lawFullText
      const lawFullText = convertLaw[0];

      // レンダリング実行
      const laws = getLawComponentData(lawFullText);
      renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

      // 警告の検証
      const missingWarnings = testCase.expectedWarnings.filter(expected =>
        !capturedWarnings.some(captured => captured.includes(expected))
      );

      const passed = missingWarnings.length === 0;

      if (passed) {
        console.log(`  ✅ 成功 - 期待される警告が全て検出されました`);
        passedCount++;
      } else {
        console.log(`  ❌ 失敗 - 期待される警告が検出されませんでした`);
        console.log(`     期待: ${testCase.expectedWarnings.join(', ')}`);
        console.log(`     実際: ${capturedWarnings.join(', ')}`);
        failedCount++;
      }

      results.push({
        testCase,
        passed,
        capturedWarnings,
        missingWarnings,
        unexpectedWarnings: []
      });

    } catch (error: any) {
      console.log(`  ❌ エラー発生: ${error.message}`);
      console.log(`  スタックトレース:\n${error.stack}`);
      failedCount++;

      results.push({
        testCase,
        passed: false,
        capturedWarnings,
        missingWarnings: testCase.expectedWarnings,
        unexpectedWarnings: [],
        error: error.message
      });
    } finally {
      // console.warnを復元
      console.warn = originalWarn;
    }

    console.log('');
  }

  // レポート生成
  const report: TestReport = {
    totalTests: testCases.length,
    passed: passedCount,
    failed: failedCount,
    details: results
  };

  return report;
}

// メイン実行
async function main() {
  const report = await runInvalidXMLTests();

  // サマリー表示
  console.log('=== 不正XMLテスト結果 ===');
  console.log(`総テストケース数: ${report.totalTests}`);
  console.log(`成功: ${report.passed}`);
  console.log(`失敗: ${report.failed}`);
  console.log(`成功率: ${((report.passed / report.totalTests) * 100).toFixed(2)}%\n`);

  // 失敗したテストケースを表示
  if (report.failed > 0) {
    console.log('失敗したテストケース:');
    report.details
      .filter(d => !d.passed)
      .forEach((d, index) => {
        console.log(`${index + 1}. ${d.testCase.elementName}/${d.testCase.patternName}`);
        if (d.error) {
          console.log(`   エラー: ${d.error}`);
        } else {
          console.log(`   期待: ${d.testCase.expectedWarnings.join(', ')}`);
          console.log(`   実際: ${d.capturedWarnings.join(', ') || '警告なし'}`);
        }
      });
    console.log('');
  }

  // JSONレポート出力
  const reportPath = './invalid-xml-test-report.json';
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ 詳細レポートを出力: ${reportPath}`);

  // テスト失敗時は終了コード1を返す
  if (report.failed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ テスト実行中にエラーが発生しました:', error);
  process.exit(1);
});
