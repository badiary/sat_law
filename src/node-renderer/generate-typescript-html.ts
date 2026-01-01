/**
 * TypeScriptレンダラーでXMLからHTMLを生成するスクリプト
 *
 * 目的:
 * - ローカルのXMLファイルを読み込む
 * - TypeScriptレンダラーでHTMLを生成（Reactなし）
 * - parseLaw関数を適用
 * - output/typescript-html/ に保存
 */

import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { renderLaw } from './typescript-renderer';
import { parseLaw } from './parse-law';
import { getLawComponentData } from '../api/lib/api/get-law-data';

// テスト対象のlawId情報を読み込み
interface TestLawInfo {
  lawId: string;
  name: string;
  xmlPath: string;
  lines: number;
  complexity: string;
  description: string;
}

interface TestLawIds {
  description: string;
  laws: TestLawInfo[];
  notes: string[];
}

/**
 * XMLファイルを読み込んでパースする
 */
function loadXmlFile(xmlPath: string): any {
  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');

  const xp = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    alwaysCreateTextNode: false,
    preserveOrder: true,
    textNodeName: "_",
    attributeNamePrefix: "",
  });

  const parsed = xp.parse(xmlContent);
  return parsed;
}

/**
 * TypeScriptレンダラーでHTMLを生成
 */
function generateTypescriptHtml(lawData: any): string {
  // ローカルXMLファイルの構造: 直接Lawタグから始まる
  // パース結果の構造: [{ Law: [...] }]
  const lawFullText = lawData[0];

  // getLawComponentDataで必要なデータを抽出
  const { lawTitle, lawNum, lawBody } = getLawComponentData(lawFullText);

  // TypeScriptレンダラーでHTML生成
  const html = renderLaw(lawNum, lawBody, lawTitle, []);

  return html;
}

/**
 * メイン処理：XMLファイルから「TypeScript実装のHTML」を生成
 */
async function main() {
  console.log('=== TypeScriptレンダラー HTML生成スクリプト ===\n');

  // テスト対象のlawId情報を読み込み
  const testLawIdsPath = path.join(__dirname, '../../tests/test-law-ids.json');
  const testLawIds: TestLawIds = JSON.parse(fs.readFileSync(testLawIdsPath, 'utf-8'));

  console.log(`テスト対象: ${testLawIds.laws.length}件のXMLファイル\n`);

  // 出力ディレクトリを作成
  const outputDir = path.join(__dirname, '../../output/typescript-html');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 各XMLファイルを処理
  for (const lawInfo of testLawIds.laws) {
    console.log(`処理中: ${lawInfo.lawId}`);
    console.log(`  名称: ${lawInfo.name}`);
    console.log(`  複雑さ: ${lawInfo.complexity}`);

    try {
      // XMLファイルを読み込み
      const xmlPath = path.join(__dirname, '../..', lawInfo.xmlPath);
      console.log(`  XMLファイル: ${xmlPath}`);
      const lawData = loadXmlFile(xmlPath);

      // TypeScriptレンダラーでHTMLを生成
      console.log('  TypeScriptレンダラーでHTML生成中...');
      const typescriptHtml = generateTypescriptHtml(lawData);

      // parseLaw関数を適用
      console.log('  parseLaw関数を適用中...');
      const { lawTitle, content } = parseLaw(typescriptHtml, undefined);

      // HTMLファイルとして保存
      const outputPath = path.join(outputDir, `${lawInfo.lawId}.html`);
      const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${lawTitle}</title>
</head>
<body>
${content}
</body>
</html>`;

      fs.writeFileSync(outputPath, fullHtml, 'utf-8');
      console.log(`  ✓ 保存完了: ${outputPath}\n`);

    } catch (error) {
      console.error(`  ✗ エラー: ${error}`);
      if (error instanceof Error) {
        console.error(`  スタックトレース: ${error.stack}`);
      }
      console.log('\n');
    }
  }

  console.log('=== 完了 ===');
}

// スクリプトとして実行された場合
if (require.main === module) {
  main().catch(console.error);
}

export { main, loadXmlFile, generateTypescriptHtml };
