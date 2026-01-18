import { readFileSync, readdirSync } from 'fs';
import { execSync } from 'child_process';

/**
 * 不正なXMLファイルのテスト
 * checkUnprocessedFieldsが正しくエラーを検出することを確認する
 */

const invalidXmlDir = 'test-invalid-xmls';
const outputHtml = 'test-output-invalid.html';

// test-invalid-xmls内のすべてのXMLファイルを取得
const invalidXmlFiles = readdirSync(invalidXmlDir)
  .filter(f => f.endsWith('.xml'))
  .map(f => `${invalidXmlDir}/${f}`);

console.log(`\n🧪 不正XMLファイルのテスト開始`);
console.log(`テスト対象: ${invalidXmlFiles.length}ファイル\n`);

let passCount = 0;
let failCount = 0;

for (const xmlFile of invalidXmlFiles) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📝 テスト中: ${xmlFile}`);
  console.log('='.repeat(60));

  try {
    // test-render.tsを実行
    const result = execSync(
      `npx tsx test-render.ts "${xmlFile}" "${outputHtml}"`,
      { encoding: 'utf-8', stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 }
    );

    // エラーが発生しなかった場合は、テスト失敗
    console.log(`❌ テスト失敗: エラーが検出されませんでした`);
    console.log(`   期待: checkUnprocessedFieldsがエラーを検出する`);
    console.log(`   実際: エラーなく処理が完了`);
    failCount++;

  } catch (error: any) {
    // エラーが発生した場合、その内容を確認
    const errorOutput = (error.stdout || '') + '\n' + (error.stderr || '') + '\n' + (error.message || '');

    if (errorOutput.includes('checkAllFieldsProcessed') || errorOutput.includes('[未処理タグ検出]')) {
      // 期待通りのエラーが検出された
      console.log(`✅ テスト成功: 未処理タグが正しく検出されました`);

      // エラーメッセージを抽出して表示
      const errorLines = errorOutput.split('\n').filter((line: string) =>
        line.includes('checkAllFieldsProcessed') || line.includes('[未処理タグ検出]') || line.includes('オブジェクト詳細')
      );
      errorLines.slice(0, 5).forEach((line: string) => {
        console.log(`   ${line.trim()}`);
      });
      passCount++;

    } else {
      // 予期しないエラーが発生
      console.log(`⚠️  予期しないエラー:`);
      console.log(`Exit code: ${error.status || 'N/A'}`);
      console.log(`Message: ${error.message}`);
      console.log(`Stdout (first 500 chars):`, (error.stdout || '').substring(0, 500));
      if (error.stderr) {
        console.log(`Stderr (first 500 chars):`, error.stderr.substring(0, 500));
      }
      console.log(`\n⚠️ Error output does not contain expected patterns. Checking for checkAllFieldsProcessed: ${errorOutput.includes('checkAllFieldsProcessed')}`);
      console.log(`Checking for [未処理タグ検出]: ${errorOutput.includes('[未処理タグ検出]')}`);
      failCount++;
    }
  }
}

// 結果サマリー
console.log(`\n${'='.repeat(60)}`);
console.log(`📊 テスト結果サマリー`);
console.log('='.repeat(60));
console.log(`総テスト数: ${invalidXmlFiles.length}`);
console.log(`✅ 成功（エラーが正しく検出された）: ${passCount}`);
console.log(`❌ 失敗（エラーが検出されなかった）: ${failCount}`);

if (failCount > 0) {
  console.log(`\n⚠️  ${failCount}個のテストが失敗しました。checkUnprocessedFieldsの実装を確認してください。`);
  process.exit(1);
} else {
  console.log(`\n🎉 すべてのテストが成功しました！checkUnprocessedFieldsは正しく動作しています。`);
  process.exit(0);
}
