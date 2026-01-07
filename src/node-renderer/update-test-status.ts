/**
 * テスト通過状態CSVを更新するユーティリティ
 */
import fs from 'fs';

const CSV_PATH = 'tests/test-status.csv';

interface TestStatus {
  lawId: string;
  xmlPath: string;
  status: 'untested' | 'passed' | 'failed' | 'skipped';
  lastTested: string;
  notes: string;
}

/**
 * CSVを読み込んでオブジェクト配列に変換
 */
function readCSV(): TestStatus[] {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const header = lines[0];

  return lines.slice(1).map(line => {
    const [lawId, xmlPath, status, lastTested, notes] = line.split(',');
    return {
      lawId,
      xmlPath,
      status: status as TestStatus['status'],
      lastTested: lastTested || '',
      notes: notes || '',
    };
  });
}

/**
 * オブジェクト配列をCSVに変換して書き込み
 */
function writeCSV(data: TestStatus[]): void {
  const header = 'lawId,xmlPath,status,lastTested,notes';
  const lines = data.map(row =>
    `${row.lawId},${row.xmlPath},${row.status},${row.lastTested},${row.notes}`
  );
  fs.writeFileSync(CSV_PATH, [header, ...lines].join('\n'), 'utf-8');
}

/**
 * 指定したlawIdのステータスを更新
 */
function updateStatus(
  lawId: string,
  status: TestStatus['status'],
  notes: string = ''
): void {
  const data = readCSV();
  const entry = data.find(row => row.lawId === lawId);

  if (!entry) {
    console.error(`❌ lawId not found: ${lawId}`);
    return;
  }

  entry.status = status;
  entry.lastTested = new Date().toISOString().split('T')[0];
  if (notes) {
    entry.notes = notes;
  }

  writeCSV(data);
  console.log(`✅ Updated ${lawId}: ${status}`);
}

/**
 * 既にテスト済みの5件を"passed"にマーク
 */
function markInitialPassedTests(): void {
  const passedLawIds = [
    '141AC0000000057_20050307_416AC0000000124',
    '323AC0000000075_20251224_507AC0000000093',
    '326AC1000000285_20230401_504AC0000000024',
    '405AC0000000088_20260521_505AC0000000063',
    '334AC0000000121_20250601_504AC0000000068',
  ];

  console.log('Marking initial passed tests...');
  for (const lawId of passedLawIds) {
    updateStatus(lawId, 'passed', 'Initial test set - verified 100% match');
  }
  console.log(`\n✅ Marked ${passedLawIds.length} tests as passed`);
}

/**
 * テスト結果の統計を表示
 */
function showStatistics(): void {
  const data = readCSV();
  const stats = {
    total: data.length,
    untested: data.filter(r => r.status === 'untested').length,
    passed: data.filter(r => r.status === 'passed').length,
    failed: data.filter(r => r.status === 'failed').length,
    skipped: data.filter(r => r.status === 'skipped').length,
  };

  console.log('\n=== Test Status Statistics ===');
  console.log(`Total:    ${stats.total}`);
  console.log(`Passed:   ${stats.passed} (${(stats.passed / stats.total * 100).toFixed(2)}%)`);
  console.log(`Failed:   ${stats.failed}`);
  console.log(`Skipped:  ${stats.skipped}`);
  console.log(`Untested: ${stats.untested}`);
}

// コマンドライン引数で操作を選択
const command = process.argv[2];

if (command === 'mark-initial') {
  markInitialPassedTests();
  showStatistics();
} else if (command === 'stats') {
  showStatistics();
} else if (command === 'update' && process.argv.length >= 5) {
  const lawId = process.argv[3];
  const status = process.argv[4] as TestStatus['status'];
  const notes = process.argv[5] || '';
  updateStatus(lawId, status, notes);
} else {
  console.log('Usage:');
  console.log('  npx tsx src/node-renderer/update-test-status.ts mark-initial');
  console.log('  npx tsx src/node-renderer/update-test-status.ts stats');
  console.log('  npx tsx src/node-renderer/update-test-status.ts update <lawId> <status> [notes]');
}
