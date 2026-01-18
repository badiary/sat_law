import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlPath = 'test-invalid-xmls/test-invalid-article.xml';
const xmlContent = readFileSync(xmlPath, 'utf-8');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  attributesGroupName: ':@',
  allowBooleanAttributes: true,
  parseTagValue: false,
  trimValues: false,
  parseTrueNumberOnly: true,
  preserveOrder: true,
  commentPropName: 'COMMENT',
  unpairedTags: [],
});

const lawData = parser.parse(xmlContent);

console.log('📊 パース結果の詳細確認\n');
console.log('Law要素:');
console.log(JSON.stringify(lawData, null, 2));

// LawBodyを探す
const lawBody = lawData.find((item: any) => 'Law' in item)?.Law.find((item: any) => 'LawBody' in item)?.LawBody;

console.log('\n\nLawBody要素:');
console.log(JSON.stringify(lawBody, null, 2));

// MainProvisionを探す
const mainProvision = lawBody?.find((item: any) => 'MainProvision' in item)?.MainProvision;

console.log('\n\nMainProvision要素:');
console.log(JSON.stringify(mainProvision, null, 2));

// Articleを探す
const article = mainProvision?.find((item: any) => 'Article' in item);

console.log('\n\nArticle要素全体:');
console.log(JSON.stringify(article, null, 2));

if (article && 'Article' in article) {
  console.log('\n\nArticle.Article配列の要素:');
  article.Article.forEach((item: any, index: number) => {
    console.log(`\n[${index}] キー: ${Object.keys(item).join(', ')}`);
    console.log(JSON.stringify(item, null, 2));
  });
}
