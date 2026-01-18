import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { execSync } from 'child_process';
import { XMLParser } from 'fast-xml-parser';
import { glob } from 'glob';

// CSVファイルのパス
const csvPath = 'test-progress.csv';

// CSVファイルの初期化または読み込み
let testedFiles = new Set<string>();
if (existsSync(csvPath)) {
  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // ヘッダーをスキップ
  lines.forEach(line => {
    if (line.trim()) {
      // ダブルクォートで囲まれたフィールドを正しく解析
      const match = line.match(/^"([^"]+)",(\w+)/);
      if (match) {
        const filePath = match[1];
        const status = match[2];
        if (status === 'SUCCESS' || status === 'ERROR') {
          testedFiles.add(filePath);
        }
      }
    }
  });
  console.log(`既にテスト済み: ${testedFiles.size}ファイル`);
} else {
  // CSVヘッダーを作成
  writeFileSync(csvPath, 'FilePath,Status,ErrorMessage,FileSize,HtmlSize,FigCount,Timestamp\n');
  console.log('test-progress.csvを作成しました');
}

// 全XMLファイルを取得
const allXmlFiles = glob.sync('all_xml/**/*.xml');
console.log(`総XMLファイル数: ${allXmlFiles.length}`);

// 未テストのファイルを抽出
const untested = allXmlFiles.filter(f => !testedFiles.has(f));
console.log(`未テスト: ${untested.length}ファイル`);

if (untested.length === 0) {
  console.log('✅ すべてのファイルのテストが完了しています！');
  process.exit(0);
}

// 最初の未テストファイルをテスト
const testFile = untested[0];
console.log(`\n📝 テスト中: ${testFile}`);
console.log(`進捗: ${testedFiles.size + 1}/${allXmlFiles.length}`);

const timestamp = new Date().toISOString();
const outputHtml = `test-output-batch.html`;

try {
  // ファイルサイズを取得
  const fileSize = readFileSync(testFile).length;

  // test-render.tsを実行
  const result = execSync(
    `npx tsx test-render.ts "${testFile}" "${outputHtml}"`,
    { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }
  );

  // 結果を解析
  const figMatch = result.match(/Fig要素のリンク数: (\d+)/);
  const figCount = figMatch ? figMatch[1] : '0';

  const htmlSize = existsSync(outputHtml) ? readFileSync(outputHtml).length : 0;

  // 成功をCSVに記録
  const csvLine = `"${testFile}",SUCCESS,,${fileSize},${htmlSize},${figCount},${timestamp}\n`;
  appendFileSync(csvPath, csvLine);

  console.log(`✅ 成功: ${testFile}`);
  console.log(`   ファイルサイズ: ${fileSize} bytes`);
  console.log(`   HTML出力: ${htmlSize} bytes`);
  console.log(`   Fig要素数: ${figCount}`);
  console.log(`\n次のファイルをテストするには、このコマンドをもう一度実行してください。`);

} catch (error: any) {
  // エラーをCSVに記録
  const errorMsg = error.message.replace(/"/g, '""').replace(/\n/g, ' ');
  const fileSize = existsSync(testFile) ? readFileSync(testFile).length : 0;
  const csvLine = `"${testFile}",ERROR,"${errorMsg}",${fileSize},0,0,${timestamp}\n`;
  appendFileSync(csvPath, csvLine);

  console.error(`\n❌ エラー発生: ${testFile}`);
  console.error(`エラー内容:\n${error.message}`);
  console.error(`\nテストを停止しました。エラーを解消してから再実行してください。`);
  process.exit(1);
}
