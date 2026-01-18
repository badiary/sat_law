import { existsSync, readFileSync } from 'fs';

/**
 * テスト進捗状況を確認
 */

const PROGRESS_CSV = 'test-valid-progress.csv';

if (!existsSync(PROGRESS_CSV)) {
  console.log('進捗ファイルが見つかりません。テストがまだ開始されていないか、ファイルが削除されています。');
  process.exit(0);
}

const content = readFileSync(PROGRESS_CSV, 'utf-8');
const lines = content.split('\n').slice(1).filter(l => l.trim());

let pending = 0;
let success = 0;
let error = 0;
const errors: Array<{path: string; error: string}> = [];

for (const line of lines) {
  if (!line.trim()) continue;

  const parts = line.split(',');
  const status = parts[1];

  if (status === 'pending') pending++;
  else if (status === 'success') success++;
  else if (status === 'error') {
    error++;
    errors.push({
      path: parts[0],
      error: parts[2] ? parts[2].replace(/^"|"$/g, '').replace(/""/g, '"') : 'Unknown error'
    });
  }
}

const total = pending + success + error;
const percentage = total > 0 ? ((success + error) / total * 100).toFixed(2) : '0.00';

console.log('\n📊 テスト進捗状況');
console.log('='.repeat(60));
console.log(`総ファイル数: ${total}`);
console.log(`✅ 成功: ${success} (${(success / total * 100).toFixed(2)}%)`);
console.log(`❌ エラー: ${error} (${(error / total * 100).toFixed(2)}%)`);
console.log(`⏳ 残り: ${pending}`);
console.log(`📈 進捗: ${percentage}%`);

if (error > 0) {
  console.log(`\n⚠️  エラーが発生したファイル:`);
  for (const err of errors) {
    console.log(`\nファイル: ${err.path}`);
    console.log(`エラー: ${err.error.substring(0, 200)}`);
  }
}

if (pending === 0) {
  if (error === 0) {
    console.log(`\n🎉 すべてのテストが成功しました！`);
  } else {
    console.log(`\n⚠️  ${error}個のファイルでエラーが発生しました。`);
  }
}
