import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  // 連続してバッチテストを実行（エラーが発生するまで）
  let testCount = 0;
  let errorOccurred = false;

  console.log('連続バッチテスト開始...');
  console.log('エラーが発生するまで実行します。Ctrl+Cで中断できます。\n');

  while (!errorOccurred) {
  testCount++;
  console.log(`\n${'='.repeat(50)}`);
  console.log(`テスト実行 #${testCount}`);
  console.log('='.repeat(50));

  try {
    const result = execSync('npx tsx batch-test.ts', {
      encoding: 'utf-8',
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024
    });

    console.log(result);

    // 全テスト完了をチェック
    if (result.includes('すべてのファイルのテストが完了')) {
      console.log('\n🎉 全テスト完了！');
      console.log(`総テスト実行回数: ${testCount}`);

      // CSVから統計を取得
      const csv = readFileSync('test-progress.csv', 'utf-8');
      const lines = csv.split('\n').slice(1).filter(l => l.trim());
      const successCount = lines.filter(l => l.includes(',SUCCESS,')).length;
      const errorCount = lines.filter(l => l.includes(',ERROR,')).length;

      console.log(`成功: ${successCount}ファイル`);
      console.log(`エラー: ${errorCount}ファイル`);
      break;
    }

    // 進捗を抽出
    const progressMatch = result.match(/進捗: (\d+)\/(\d+)/);
    if (progressMatch) {
      const current = parseInt(progressMatch[1]);
      const total = parseInt(progressMatch[2]);
      const percent = ((current / total) * 100).toFixed(2);
      console.log(`\n進捗: ${percent}% (${current}/${total})`);
    }

    // 短い待機
    await sleep(100);

  } catch (error: any) {
    errorOccurred = true;
    console.error('\n❌ エラーが発生しました！');
    console.error('エラー内容:');
    console.error(error.stdout || error.message);
    console.log(`\n成功したテスト: ${testCount - 1}回`);
    console.log('test-progress.csvでエラー詳細を確認してください。');
    process.exit(1);
  }
  }
}

// 実行
runTests().catch(err => {
  console.error('予期しないエラー:', err);
  process.exit(1);
});
