import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const CSV_PATH = 'test-valid-progress.csv';

interface TestRecord {
  filePath: string;
  status: string;
  errorMessage: string;
  timestamp: string;
}

// CSVファイルを読み込む
function readCSV(): TestRecord[] {
  const content = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  return lines.map(line => {
    const match = line.match(/^([^,]+),([^,]+),(".*?"|[^,]*),(.*)$/);
    if (!match) {
      throw new Error(`Invalid CSV line: ${line}`);
    }
    return {
      filePath: match[1],
      status: match[2],
      errorMessage: match[3].replace(/^"|"$/g, ''),
      timestamp: match[4]
    };
  });
}

// CSVファイルを書き込む
function writeCSV(records: TestRecord[]): void {
  const lines = records.map(record => {
    const errorMsg = record.errorMessage.includes(',') || record.errorMessage.includes('"')
      ? `"${record.errorMessage.replace(/"/g, '""')}"`
      : record.errorMessage;
    return `${record.filePath},${record.status},${errorMsg},${record.timestamp}`;
  });
  fs.writeFileSync(CSV_PATH, lines.join('\n') + '\n', 'utf-8');
}

// ファイルをテストする
function testFile(filePath: string): { success: boolean; error?: string } {
  try {
    const outputFile = 'test-output-retest.html';
    const command = `npx tsx test-render.ts "${filePath}" "${outputFile}"`;
    execSync(command, {
      stdio: 'pipe',
      timeout: 60000 // 60秒タイムアウト
    });
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

async function main() {
  console.log('🔄 過去にエラーが発生したファイルを再テスト中...\n');

  // CSVを読み込む
  const records = readCSV();

  // エラーステータスのレコードを抽出
  const errorRecords = records.filter(r => r.status === 'error');

  if (errorRecords.length === 0) {
    console.log('✅ エラーステータスのレコードはありません');
    return;
  }

  console.log(`📊 エラーレコード数: ${errorRecords.length}\n`);

  let successCount = 0;
  let stillErrorCount = 0;

  for (let i = 0; i < errorRecords.length; i++) {
    const record = errorRecords[i];
    console.log(`[${i + 1}/${errorRecords.length}] Testing: ${record.filePath}`);

    const result = testFile(record.filePath);

    if (result.success) {
      console.log('  ✅ Success - CSVを更新します\n');

      // レコードを更新
      const index = records.findIndex(r => r.filePath === record.filePath);
      if (index !== -1) {
        records[index].status = 'success';
        records[index].errorMessage = '';
        records[index].timestamp = new Date().toISOString();
      }

      successCount++;
    } else {
      console.log(`  ❌ Still Error: ${result.error}\n`);
      stillErrorCount++;
    }
  }

  // CSVを書き込む
  writeCSV(records);

  console.log('============================================================');
  console.log('📊 再テスト結果サマリー');
  console.log('============================================================');
  console.log(`総エラーレコード数: ${errorRecords.length}`);
  console.log(`✅ 成功（修正された）: ${successCount}`);
  console.log(`❌ 依然としてエラー: ${stillErrorCount}`);
  console.log('');
  console.log('✅ CSVファイルを更新しました');
}

main().catch(console.error);
