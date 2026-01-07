/**
 * 全テストを自動的に実行し続けるスクリプト
 * test:nextを繰り返し実行して全10,514件のテストを完了させる
 *
 * - 既にパスしたテストは自動的にスキップされます
 * - 100件ごとに進捗レポートを表示
 * - エラーが発生しても継続実行
 */

import { spawn } from 'child_process';
import * as path from 'path';
import { readFileSync } from 'fs';

const MAX_TESTS = 10514;  // 全テスト件数
let testsRun = 0;
let consecutivePasses = 0;
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 10;  // 連続失敗の上限を増やす

// 現在のテスト統計を取得
function getTestStats(): { total: number; passed: number; failed: number; untested: number } {
  try {
    const content = readFileSync('tests/test-status.csv', 'utf-8');
    const lines = content.split('\n').filter(line => line.trim()).slice(1);

    let passed = 0;
    let failed = 0;
    let untested = 0;

    for (const line of lines) {
      const status = line.split(',')[2];
      if (status === 'passed') passed++;
      else if (status === 'failed') failed++;
      else untested++;
    }

    return { total: lines.length, passed, failed, untested };
  } catch (error) {
    return { total: MAX_TESTS, passed: 0, failed: 0, untested: MAX_TESTS };
  }
}

function runNextTest(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const stats = getTestStats();

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`テスト進捗: ${stats.passed}/${stats.total} (残り: ${stats.untested})`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

    // 未テストが0の場合は終了
    if (stats.untested === 0) {
      console.log('\n🎉 全テスト完了！');
      resolve(false);
      return;
    }

    const child = spawn('npm', ['run', 'test:next'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '../..')
    });

    child.on('close', (code) => {
      testsRun++;

      if (code === 0) {
        consecutivePasses++;
        consecutiveFailures = 0;
        resolve(true);
      } else {
        consecutiveFailures++;
        consecutivePasses = 0;

        console.error(`\n❌ テストが失敗しました（${consecutiveFailures}回連続）`);

        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          console.error(`\n🛑 ${MAX_CONSECUTIVE_FAILURES}回連続で失敗したため、テストを中断します`);
          console.error('修正が必要な問題がある可能性があります。');
          reject(new Error('Too many consecutive failures'));
        } else {
          console.log('次のテストに進みます...');
          resolve(false);
        }
      }
    });

    child.on('error', (error) => {
      console.error('プロセス実行エラー:', error);
      // エラーでも継続
      console.log('エラーを無視して次のテストに進みます...');
      testsRun++;
      resolve(false);
    });
  });
}

async function runAllTests() {
  console.log('🚀 全テストの実行を開始します...');

  const initialStats = getTestStats();
  console.log(`総テスト数: ${initialStats.total}件`);
  console.log(`既にパス済み: ${initialStats.passed}件`);
  console.log(`残りテスト: ${initialStats.untested}件\n`);

  const startTime = Date.now();

  try {
    while (true) {
      const shouldContinue = await runNextTest();

      if (!shouldContinue) {
        // 全テスト完了または未テストがなくなった
        break;
      }

      // 進捗状況を定期的に表示
      if (testsRun % 100 === 0 && testsRun > 0) {
        const stats = getTestStats();
        const elapsed = Date.now() - startTime;
        const avgTime = elapsed / testsRun;
        const remaining = stats.untested * avgTime;
        const remainingMinutes = Math.ceil(remaining / 60000);

        console.log(`\n📊 進捗レポート:`);
        console.log(`   完了: ${stats.passed}/${stats.total}件 (${((stats.passed / stats.total) * 100).toFixed(1)}%)`);
        console.log(`   残り: ${stats.untested}件`);
        console.log(`   連続成功: ${consecutivePasses}件`);
        console.log(`   実行したテスト数: ${testsRun}件`);
        console.log(`   推定残り時間: 約${remainingMinutes}分\n`);
      }
    }

    const finalStats = getTestStats();
    const totalTime = Date.now() - startTime;
    const totalMinutes = Math.floor(totalTime / 60000);
    const totalSeconds = Math.floor((totalTime % 60000) / 1000);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 全テスト完了！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`総テスト数: ${finalStats.total}件`);
    console.log(`パス: ${finalStats.passed}件`);
    console.log(`失敗: ${finalStats.failed}件`);
    console.log(`未テスト: ${finalStats.untested}件`);
    console.log(`実行時間: ${totalMinutes}分${totalSeconds}秒`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ テスト実行中にエラーが発生しました');
    const stats = getTestStats();
    console.error(`現在の進捗: ${stats.passed}/${stats.total} (残り: ${stats.untested})`);
    process.exit(1);
  }
}

runAllTests();
