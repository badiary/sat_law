/**
 * 全XMLファイルのテスト通過状態を管理するCSVファイルを作成
 */
import fs from 'fs';
import path from 'path';

const XML_FILES_LIST = 'tests/all-xml-files.txt';
const OUTPUT_CSV = 'tests/test-status.csv';

// XMLファイル一覧を読み込み
const xmlFiles = fs.readFileSync(XML_FILES_LIST, 'utf-8')
  .split('\n')
  .filter(line => line.trim().length > 0);

console.log(`Total XML files: ${xmlFiles.length}`);

// CSVヘッダー
const csvLines = ['lawId,xmlPath,status,lastTested,notes'];

// 各XMLファイルからlawIdを抽出してCSV行を作成
for (const xmlPath of xmlFiles) {
  // パスから lawId を抽出: all_xml/141AC0000000057_20050307_416AC0000000124/141AC0000000057_20050307_416AC0000000124.xml
  // → 141AC0000000057_20050307_416AC0000000124
  const basename = path.basename(xmlPath, '.xml');
  const lawId = basename;

  // 初期状態: untested
  csvLines.push(`${lawId},${xmlPath},untested,,`);
}

// CSVファイルを書き込み
fs.writeFileSync(OUTPUT_CSV, csvLines.join('\n'), 'utf-8');

console.log(`✅ Created ${OUTPUT_CSV} with ${xmlFiles.length} entries`);
console.log(`Sample entries:`);
console.log(csvLines.slice(0, 6).join('\n'));
