/**
 * テストステータスを全てリセットするスクリプト
 * 全てのテストを "untested" 状態に戻す
 */

import { promises as fs } from 'fs';
import * as path from 'path';

const TEST_STATUS_CSV = path.join(__dirname, '../../tests/test-status.csv');

async function resetTestStatus() {
  console.log('テストステータスをリセットしています...');

  try {
    // CSVファイルを読み込む
    const content = await fs.readFile(TEST_STATUS_CSV, 'utf-8');
    const lines = content.split('\n');

    if (lines.length === 0) {
      console.error('❌ CSVファイルが空です');
      process.exit(1);
    }

    // ヘッダー行を保持
    const header = lines[0];
    const dataLines = lines.slice(1);

    // 各行を "untested" にリセット
    const resetLines = dataLines.map((line, index) => {
      if (!line.trim()) {
        return line; // 空行はそのまま
      }

      const columns = line.split(',');
      if (columns.length < 2) {
        console.warn(`⚠️  スキップ（行${index + 2}）: 列が不足しています`);
        return line;
      }

      // lawId と xmlPath はそのまま、残りをリセット
      const lawId = columns[0];
      const xmlPath = columns[1];

      return `${lawId},${xmlPath},untested,,`;
    });

    // 新しいCSVファイルを作成
    const newContent = [header, ...resetLines].join('\n');

    // バックアップを作成
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = TEST_STATUS_CSV.replace('.csv', `_backup_${timestamp}.csv`);
    await fs.copyFile(TEST_STATUS_CSV, backupPath);
    console.log(`📦 バックアップを作成しました: ${path.basename(backupPath)}`);

    // 上書き保存
    await fs.writeFile(TEST_STATUS_CSV, newContent, 'utf-8');

    const totalTests = dataLines.filter(line => line.trim()).length;
    console.log(`✅ ${totalTests}件のテストを "untested" にリセットしました`);
    console.log(`📝 ${TEST_STATUS_CSV}`);

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

resetTestStatus();
