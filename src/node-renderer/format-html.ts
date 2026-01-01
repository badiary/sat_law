/**
 * HTMLファイルをフォーマットするスクリプト
 *
 * 目的:
 * - React版とTypeScript版のHTMLを比較しやすくするため、フォーマットを統一
 * - js-beautifyを使用してHTMLを整形
 */

import * as fs from 'fs';
import * as path from 'path';
import { html as beautifyHtml } from 'js-beautify';

/**
 * HTMLファイルをフォーマット
 */
function formatHtmlFile(inputPath: string, outputPath: string) {
  const html = fs.readFileSync(inputPath, 'utf-8');

  const formatted = beautifyHtml(html, {
    indent_size: 2,
    indent_char: ' ',
    max_preserve_newlines: 1,
    preserve_newlines: true,
    indent_inner_html: true,
    wrap_line_length: 0, // 行の折り返しなし
    unformatted: [], // すべてのタグをフォーマット
  });

  fs.writeFileSync(outputPath, formatted, 'utf-8');
}

/**
 * ディレクトリ内のすべてのHTMLファイルをフォーマット
 */
function formatDirectory(inputDir: string, outputDir: string) {
  console.log(`=== HTMLフォーマット処理 ===\n`);
  console.log(`入力ディレクトリ: ${inputDir}`);
  console.log(`出力ディレクトリ: ${outputDir}\n`);

  // 出力ディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // HTMLファイルを取得
  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.html'));

  console.log(`処理対象: ${files.length}件のHTMLファイル\n`);

  files.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    console.log(`処理中: ${file}`);
    formatHtmlFile(inputPath, outputPath);
    console.log(`  ✓ 保存完了: ${outputPath}\n`);
  });

  console.log('=== 完了 ===');
}

/**
 * メイン処理
 */
async function main() {
  const baseDir = path.join(__dirname, '../..');

  // React版HTMLをフォーマット
  console.log('【React版HTMLのフォーマット】\n');
  formatDirectory(
    path.join(baseDir, 'output/react-html'),
    path.join(baseDir, 'output/react-html-formatted')
  );

  console.log('\n');

  // TypeScript版HTMLをフォーマット
  console.log('【TypeScript版HTMLのフォーマット】\n');
  formatDirectory(
    path.join(baseDir, 'output/typescript-html'),
    path.join(baseDir, 'output/typescript-html-formatted')
  );
}

// スクリプトとして実行された場合
if (require.main === module) {
  main().catch(console.error);
}

export { formatHtmlFile, formatDirectory };
