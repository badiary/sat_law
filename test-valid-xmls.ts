import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * 正常なXMLファイルのテスト
 * all_xml内の全XMLファイルでエラーが発生しないことを確認
 */

const ALL_XML_DIR = 'all_xml';
const PROGRESS_CSV = 'test-valid-progress.csv';
const OUTPUT_HTML = 'test-output-valid.html';

interface TestResult {
  path: string;
  status: 'pending' | 'success' | 'error';
  error?: string;
  timestamp?: string;
}

/**
 * all_xml内の全XMLファイルを再帰的に取得
 */
function getAllXmlFiles(dir: string): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (entry.endsWith('.xml')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * 進捗CSVを読み込む
 */
function loadProgress(): Map<string, TestResult> {
  const progress = new Map<string, TestResult>();

  if (existsSync(PROGRESS_CSV)) {
    const content = readFileSync(PROGRESS_CSV, 'utf-8');
    const lines = content.split('\n').slice(1); // ヘッダーをスキップ

    for (const line of lines) {
      if (!line.trim()) continue;

      const [path, status, error, timestamp] = line.split(',');
      progress.set(path, {
        path,
        status: status as 'pending' | 'success' | 'error',
        error: error || undefined,
        timestamp: timestamp || undefined,
      });
    }
  }

  return progress;
}

/**
 * 進捗CSVを保存
 */
function saveProgress(progress: Map<string, TestResult>) {
  const lines = ['path,status,error,timestamp'];

  for (const [_, result] of progress) {
    const error = result.error ? `"${result.error.replace(/"/g, '""')}"` : '';
    const timestamp = result.timestamp || '';
    lines.push(`${result.path},${result.status},${error},${timestamp}`);
  }

  writeFileSync(PROGRESS_CSV, lines.join('\n'), 'utf-8');
}

/**
 * XMLファイルをテスト
 */
function testXmlFile(xmlPath: string): { success: boolean; error?: string } {
  try {
    execSync(
      `npx tsx test-render.ts "${xmlPath}" "${OUTPUT_HTML}"`,
      { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 20 * 1024 * 1024 }
    );
    return { success: true };
  } catch (error: any) {
    const errorOutput = (error.stdout || '') + '\n' + (error.stderr || '') + '\n' + (error.message || '');

    // checkAllFieldsProcessedエラーがあれば、それは不正タグ検出
    if (errorOutput.includes('checkAllFieldsProcessed') || errorOutput.includes('[未処理タグ検出]')) {
      return {
        success: false,
        error: `未処理タグ検出エラー: ${errorOutput.substring(0, 200)}`,
      };
    }

    // その他のエラー
    return {
      success: false,
      error: `実行エラー: ${error.message.substring(0, 200)}`,
    };
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('\n🧪 正常XMLファイルのテスト開始');
  console.log('=' .repeat(60));

  // 全XMLファイルを取得
  console.log(`\n📂 ${ALL_XML_DIR}ディレクトリを走査中...`);
  const allXmlFiles = getAllXmlFiles(ALL_XML_DIR);
  console.log(`✅ ${allXmlFiles.length}個のXMLファイルを検出`);

  // 進捗を読み込む
  const progress = loadProgress();

  // まだテストしていないファイルを抽出
  const pendingFiles = allXmlFiles.filter(file => {
    const result = progress.get(file);
    return !result || result.status === 'pending';
  });

  // 新しいファイルを進捗に追加
  for (const file of allXmlFiles) {
    if (!progress.has(file)) {
      progress.set(file, { path: file, status: 'pending' });
    }
  }

  // 統計を表示
  const completed = Array.from(progress.values()).filter(r => r.status === 'success').length;
  const errors = Array.from(progress.values()).filter(r => r.status === 'error').length;

  console.log(`\n📊 テスト進捗状況:`);
  console.log(`   総ファイル数: ${allXmlFiles.length}`);
  console.log(`   完了: ${completed} (${(completed / allXmlFiles.length * 100).toFixed(2)}%)`);
  console.log(`   エラー: ${errors}`);
  console.log(`   残り: ${pendingFiles.length}`);

  if (pendingFiles.length === 0) {
    console.log(`\n🎉 すべてのテストが完了しました！`);
    if (errors > 0) {
      console.log(`\n⚠️  ${errors}個のファイルでエラーが発生しました。`);
      console.log(`詳細は ${PROGRESS_CSV} を確認してください。`);
      process.exit(1);
    } else {
      console.log(`\n✅ すべてのファイルが正常に処理されました！`);
      process.exit(0);
    }
  }

  console.log(`\n🚀 テスト開始（残り${pendingFiles.length}ファイル）`);
  console.log(`進捗は ${PROGRESS_CSV} に保存されます\n`);

  // テスト実行
  let testCount = 0;
  const startTime = Date.now();

  for (const xmlPath of pendingFiles) {
    testCount++;
    const percentage = (testCount / pendingFiles.length * 100).toFixed(2);

    console.log(`[${testCount}/${pendingFiles.length}] (${percentage}%) Testing: ${xmlPath}`);

    const result = testXmlFile(xmlPath);

    if (result.success) {
      progress.set(xmlPath, {
        path: xmlPath,
        status: 'success',
        timestamp: new Date().toISOString(),
      });
      console.log(`  ✅ Success\n`);
    } else {
      progress.set(xmlPath, {
        path: xmlPath,
        status: 'error',
        error: result.error,
        timestamp: new Date().toISOString(),
      });

      console.log(`  ❌ ERROR: ${result.error}\n`);

      // エラーが発生したら進捗を保存して停止
      saveProgress(progress);

      console.log(`\n⚠️  エラーが発生したため、テストを停止しました。`);
      console.log(`エラーファイル: ${xmlPath}`);
      console.log(`エラー内容: ${result.error}`);
      console.log(`\n進捗は ${PROGRESS_CSV} に保存されました。`);
      console.log(`修正後、再度このスクリプトを実行すると続きからテストが再開されます。`);
      process.exit(1);
    }

    // 10ファイルごとに進捗を保存
    if (testCount % 10 === 0) {
      saveProgress(progress);

      const elapsed = (Date.now() - startTime) / 1000;
      const avgTime = elapsed / testCount;
      const remaining = (pendingFiles.length - testCount) * avgTime;

      console.log(`📊 進捗保存完了 (${testCount}/${pendingFiles.length})`);
      console.log(`⏱️  経過時間: ${elapsed.toFixed(1)}秒, 平均: ${avgTime.toFixed(2)}秒/ファイル`);
      console.log(`⏰ 残り推定時間: ${(remaining / 60).toFixed(1)}分\n`);
    }
  }

  // 最終保存
  saveProgress(progress);

  const totalTime = (Date.now() - startTime) / 1000;
  console.log(`\n✅ すべてのテストが完了しました！`);
  console.log(`⏱️  総実行時間: ${(totalTime / 60).toFixed(1)}分`);
  console.log(`📊 結果: ${testCount}ファイル全て成功`);
}

main().catch(error => {
  console.error('\n❌ 予期しないエラーが発生しました:', error);
  process.exit(1);
});
