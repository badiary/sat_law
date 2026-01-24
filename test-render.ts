/**
 * ローカルでのレンダリングテスト
 * all_xml内のXMLファイルを読み込んでHTMLを生成し、出力する
 */

import { readFileSync, writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';

// XMLファイルパス
const xmlPath = process.argv[2] || './all_xml/335M50000400010.xml';
const outputPath = process.argv[3] || './test-output.html';

console.log(`XMLファイル: ${xmlPath}`);
console.log(`出力先: ${outputPath}`);

try {
  // XMLファイルを読み込み
  const xml = readFileSync(xmlPath, 'utf-8');
  console.log(`XMLファイルサイズ: ${xml.length} bytes`);

  // XMLParser設定
  const xp = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    alwaysCreateTextNode: false,
    preserveOrder: true,
    textNodeName: '_',
    attributeNamePrefix: '',
  });

  // XMLをパース
  const convertLaw = xp.parse(xml);
  console.log('XMLパース完了');

  // XMLの構造を判定（law_data_response形式 vs Law直接形式）
  let lawFullText: any;
  let attachedFilesMap = new Map<string, string>();

  if (convertLaw[0]?.law_data_response) {
    // law_data_response形式（APIレスポンス）
    const lawDataResponse = convertLaw[0].law_data_response;
    console.log(`law_data_response 要素数: ${lawDataResponse.length}`);

    lawFullText = lawDataResponse[3].law_full_text[0];
    console.log('lawFullText 取得完了');

    // attached_files_infoを取得
    const attachedFilesInfo = lawDataResponse[0];
    if (attachedFilesInfo?.attached_files_info) {
      const attachedFilesArray = attachedFilesInfo.attached_files_info.find(
        (item: any) => item.attached_files
      )?.attached_files;

      if (attachedFilesArray) {
        console.log(`attached_files 配列の要素数: ${attachedFilesArray.length}`);

        attachedFilesArray.forEach((fileItem: any) => {
          if (fileItem.attached_file) {
            const attachedFile = fileItem.attached_file;
            const lawRevisionId = attachedFile.find((item: any) => item.law_revision_id)?.law_revision_id[0]?._;
            const src = attachedFile.find((item: any) => item.src)?.src[0]?._;

            if (lawRevisionId && src) {
              attachedFilesMap.set(src, lawRevisionId);
            }
          }
        });
      }
    }
  } else if (convertLaw[0]?.Law) {
    // Law直接形式（ローカルXMLファイル）
    console.log('Law直接形式を検出');
    lawFullText = convertLaw[0];
  } else {
    throw new Error('不明なXML形式です');
  }

  console.log(`attachedFilesMap サイズ: ${attachedFilesMap.size}`);

  // law componentデータを取得
  const laws = getLawComponentData(lawFullText);
  console.log(`法令タイトル: ${laws.lawTitle.LawTitle[0]._}`);

  // HTMLをレンダリング
  const html = renderLaw(
    laws.lawNum,
    laws.lawBody,
    laws.lawTitle,
    [],
    attachedFilesMap
  );
  console.log(`HTML生成完了: ${html.length} bytes`);

  // HTMLファイルとして保存
  const fullHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>テスト出力</title>
  <link rel="stylesheet" href="./dist/api.css">
</head>
<body>
  ${html}
</body>
</html>`;

  writeFileSync(outputPath, fullHtml, 'utf-8');
  console.log(`✅ HTMLファイルを出力しました: ${outputPath}`);

  // Figタグの統計を表示
  const figCount = (html.match(/<a[^>]*href="\.\/pdfjs\/web\/viewer\.html\?file=/g) || []).length;
  console.log(`\n📊 統計:`);
  console.log(`  - Fig要素のリンク数: ${figCount}`);
  console.log(`  - attachedFilesMap サイズ: ${attachedFilesMap.size}`);

} catch (error) {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
}
