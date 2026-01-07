/**
 * test:nextを繰り返し実行して、passedでないテストを順次実行する
 */
import { execSync } from 'child_process';

function main() {
  let consecutivePassed = 0;
  let totalTested = 0;

  console.log('Starting continuous testing of unpassed laws...\n');

  while (true) {
    try {
      // test:nextを実行
      execSync('npm run test:next', {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      consecutivePassed++;
      totalTested++;

      console.log(`\n✅ Test ${totalTested} passed (${consecutivePassed} consecutive)`);
    } catch (error) {
      // テストが失敗したら終了
      console.log(`\n❌ Test failed after ${totalTested} tests (${consecutivePassed} passed)`);
      process.exit(1);
    }
  }
}

main();
