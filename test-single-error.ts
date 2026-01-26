import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import { getLawComponentData } from './src/api/lib/api/get-law-data';
import { renderLaw } from './src/api/typescript-renderer';

const xmlPath = 'all_xml/110DT0000000097_20030501_414CO0000000277/110DT0000000097_20030501_414CO0000000277.xml';

try {
  console.log(`Testing: ${xmlPath}\n`);

  // XMLファイルを読み込み
  const xml = readFileSync(xmlPath, 'utf-8');

  // XMLをパース
  const xp = new XMLParser({
    ignoreDeclaration: true,
    ignoreAttributes: false,
    alwaysCreateTextNode: false,
    preserveOrder: true,
    textNodeName: '_',
    attributeNamePrefix: '',
  });
  const convertLaw = xp.parse(xml);

  // XMLの構造を判定
  let lawFullText: any;
  if (convertLaw[0]?.law_data_response) {
    const lawDataResponse = convertLaw[0].law_data_response;
    lawFullText = lawDataResponse[3].law_full_text[0];
  } else if (convertLaw[0]?.Law) {
    lawFullText = convertLaw[0];
  } else {
    throw new Error('不明なXML形式です');
  }

  // レンダリング実行
  console.log('Calling getLawComponentData...');
  const laws = getLawComponentData(lawFullText);

  console.log('Calling renderLaw...');
  const html = renderLaw(laws.lawNum, laws.lawBody, laws.lawTitle, [], new Map());

  console.log('\n✅ Success! HTML length:', html.length);

} catch (error: any) {
  console.error('\n❌ Error:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
}
