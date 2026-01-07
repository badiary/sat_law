/**
 * 1つの法令XMLについてTypeScript方式でHTML生成してdiff比較するテストフロー
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { XMLParser } from 'fast-xml-parser';
import { renderLaw } from './typescript-renderer';
import { getLawComponentData } from '../api/lib/api/get-law-data';
import { parseLaw } from './parse-law';
import beautify from 'js-beautify';

// テスト状態CSVを読み書き
interface TestStatus {
  lawId: string;
  xmlPath: string;
  status: 'untested' | 'passed' | 'failed' | 'skipped' | '';
  lastTested: string;
  notes: string;
}

function readTestStatusCSV(): TestStatus[] {
  const content = fs.readFileSync('tests/test-status.csv', 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  return lines.slice(1).map(line => {
    const [lawId, xmlPath, status, lastTested, notes] = line.split(',');
    return {
      lawId,
      xmlPath,
      status: status as TestStatus['status'],
      lastTested,
      notes,
    };
  });
}

function writeTestStatusCSV(data: TestStatus[]): void {
  const header = 'lawId,xmlPath,status,lastTested,notes';
  const lines = data.map(row =>
    `${row.lawId},${row.xmlPath},${row.status},${row.lastTested},${row.notes}`
  );
  fs.writeFileSync('tests/test-status.csv', [header, ...lines].join('\n'), 'utf-8');
}

function updateTestStatus(lawId: string, status: TestStatus['status'], notes: string): void {
  const data = readTestStatusCSV();
  const entry = data.find(row => row.lawId === lawId);
  if (entry) {
    entry.status = status;
    entry.lastTested = new Date().toISOString().split('T')[0];
    entry.notes = notes;
    writeTestStatusCSV(data);
  }
}

// XMLパーサー設定
const xp = new XMLParser({
  ignoreDeclaration: true,
  ignoreAttributes: false,
  preserveOrder: true,
  textNodeName: '_',
  attributeNamePrefix: '',
});

/**
 * TypeScript方式でHTMLを生成
 */
function generateTypescriptHTML(lawId: string, xmlPath: string): { success: boolean; html?: string; error?: string } {
  try {
    if (!fs.existsSync(xmlPath)) {
      return { success: false, error: 'XML file not found' };
    }

    // XMLファイルを読み込み・パース
    const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

    // 積極的なGC: XMLパース前
    if (global.gc) global.gc();

    const parsedXml = xp.parse(xmlContent);

    // ローカルXMLファイルの構造: 直接Lawタグから始まる
    const lawFullText = parsedXml[0];
    if (!lawFullText || !lawFullText.Law) {
      return { success: false, error: 'Law element not found in XML' };
    }

    // 積極的なGC: データ抽出前
    if (global.gc) global.gc();

    // getLawComponentDataで必要なデータを抽出
    const { lawTitle, lawNum, lawBody } = getLawComponentData(lawFullText);

    // 積極的なGC: レンダリング前
    if (global.gc) global.gc();

    // TypeScriptレンダラーでHTML生成
    const generatedHTML = renderLaw(lawNum, lawBody, lawTitle, []);

    // 積極的なGC: parseLaw前
    if (global.gc) global.gc();

    // parseLaw関数を適用（ArithFormula内の括弧も処理される）
    const { content: processedHTML } = parseLaw(generatedHTML, null);

    // 積極的なGC: フォーマット前
    if (global.gc) global.gc();

    // HTMLをフォーマット（format-html.tsと同じ設定を使用）
    const formattedHTML = beautify.html(processedHTML, {
      indent_size: 2,
      indent_char: ' ',
      max_preserve_newlines: 1,
      preserve_newlines: true,
      indent_inner_html: true,
      wrap_line_length: 0,
      unformatted: [],
    });

    return { success: true, html: formattedHTML };
  } catch (error) {
    return { success: false, error: String(error) };
  } finally {
    // メモリ解放: 大きなオブジェクトをクリア
    if (global.gc) {
      global.gc();
    }
  }
}

/**
 * 1つの法令をテスト
 */
function testSingleLaw(lawId: string): {
  success: boolean;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  diffOutput?: string;
} {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${lawId}`);
  console.log('='.repeat(80));

  // テスト状態を取得
  const testStatuses = readTestStatusCSV();
  const testStatus = testStatuses.find(row => row.lawId === lawId);

  if (!testStatus) {
    return {
      success: false,
      status: 'skipped',
      message: 'Law ID not found in test status CSV',
    };
  }

  const { xmlPath } = testStatus;

  // React版HTMLが存在するか確認
  const reactHTMLPath = path.join('output/react-html-formatted', `${lawId}.html`);
  if (!fs.existsSync(reactHTMLPath)) {
    return {
      success: false,
      status: 'skipped',
      message: 'React HTML not found - run generate:all-react-html first',
    };
  }

  console.log(`📄 XML: ${xmlPath}`);
  console.log(`📄 React HTML: ${reactHTMLPath}`);

  // TypeScript方式でHTML生成
  console.log('🔨 Generating TypeScript HTML...');
  const tsResult = generateTypescriptHTML(lawId, xmlPath);

  if (!tsResult.success) {
    const errorMsg = `TypeScript generation failed: ${tsResult.error}`;
    console.error(`❌ ${errorMsg}`);
    updateTestStatus(lawId, 'failed', errorMsg);
    return {
      success: false,
      status: 'failed',
      message: errorMsg,
    };
  }

  // TypeScript版HTMLを保存
  const tsHTMLPath = path.join('output/typescript-html-formatted', `${lawId}.html`);
  const tsDir = path.dirname(tsHTMLPath);
  if (!fs.existsSync(tsDir)) {
    fs.mkdirSync(tsDir, { recursive: true });
  }
  fs.writeFileSync(tsHTMLPath, tsResult.html!, 'utf-8');
  console.log(`💾 Saved TypeScript HTML: ${tsHTMLPath}`);

  // ファイルサイズ比較
  const reactSize = fs.statSync(reactHTMLPath).size;
  const tsSize = fs.statSync(tsHTMLPath).size;
  console.log(`📊 Size comparison:`);
  console.log(`   React:      ${reactSize.toLocaleString()} bytes`);
  console.log(`   TypeScript: ${tsSize.toLocaleString()} bytes`);
  console.log(`   Match: ${reactSize === tsSize ? '✅ YES' : '❌ NO'}`);

  // diffコマンドで比較
  console.log('🔍 Running diff...');
  try {
    execSync(`diff "${reactHTMLPath}" "${tsHTMLPath}"`, { encoding: 'utf-8' });
    // diff成功 = 差分なし
    console.log('✅ PASSED - Files are identical!');
    updateTestStatus(lawId, 'passed', '100% match verified');
    return {
      success: true,
      status: 'passed',
      message: 'Files are identical',
    };
  } catch (error: any) {
    // diff失敗 = 差分あり
    const diffOutput = error.stdout || error.message;
    console.log('❌ FAILED - Files differ');

    // 差分の最初の50行を表示
    const diffLines = diffOutput.split('\n').slice(0, 50);
    console.log('\n📋 First 50 lines of diff:');
    console.log(diffLines.join('\n'));

    if (diffOutput.split('\n').length > 50) {
      console.log(`\n... (${diffOutput.split('\n').length - 50} more lines)`);
    }

    // 差分ファイルを保存
    const diffPath = path.join('tests/diffs', `${lawId}.diff`);
    const diffDir = path.dirname(diffPath);
    if (!fs.existsSync(diffDir)) {
      fs.mkdirSync(diffDir, { recursive: true });
    }
    fs.writeFileSync(diffPath, diffOutput, 'utf-8');
    console.log(`\n💾 Full diff saved to: ${diffPath}`);

    updateTestStatus(lawId, 'failed', `Diff found - saved to ${diffPath}`);
    return {
      success: false,
      status: 'failed',
      message: 'Files differ',
      diffOutput: diffLines.join('\n'),
    };
  }
}

/**
 * 次にテストすべきlawIdを取得（未テストまたは失敗したテストの中から1つ）
 */
function getNextUntested(): string | null {
  const testStatuses = readTestStatusCSV();
  const untested = testStatuses.find(row => row.status === 'untested' || row.status === '' || row.status === 'failed');
  return untested ? untested.lawId : null;
}

// コマンドライン引数
const command = process.argv[2];

if (command === 'next') {
  // 次の未テストを自動選択してループ実行
  let consecutivePassed = 0;

  while (true) {
    const nextLawId = getNextUntested();
    if (!nextLawId) {
      console.log('\n✅ All tests completed!');
      console.log(`Total passed: ${consecutivePassed}`);
      process.exit(0);
    }

    const result = testSingleLaw(nextLawId);

    if (result.status === 'passed') {
      consecutivePassed++;
      console.log(`\n✅ Test passed (${consecutivePassed} consecutive)\n`);
      // 次のテストに進む
      continue;
    } else {
      console.log(`\n❌ Test failed after ${consecutivePassed} passed tests`);
      process.exit(1);
    }
  }
} else if (command) {
  // 指定されたlawIdをテスト
  const lawId = command;
  const result = testSingleLaw(lawId);
  process.exit(result.status === 'passed' ? 0 : 1);
} else {
  console.log('Usage:');
  console.log('  npx tsx src/node-renderer/test-single-law.ts <lawId>');
  console.log('  npx tsx src/node-renderer/test-single-law.ts next');
}
