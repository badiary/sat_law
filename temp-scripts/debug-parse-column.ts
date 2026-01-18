import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

const xmlPath = 'test-invalid-xmls/test-invalid-column.xml';
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

// ParagraphSentenceを探す
function findParagraphSentence(obj: any, depth = 0): any {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findParagraphSentence(item, depth + 1);
      if (result) return result;
    }
  } else if (obj && typeof obj === 'object') {
    if ('ParagraphSentence' in obj) {
      return obj.ParagraphSentence;
    }
    for (const key of Object.keys(obj)) {
      const result = findParagraphSentence(obj[key], depth + 1);
      if (result) return result;
    }
  }
  return null;
}

const paragraphSentence = findParagraphSentence(lawData);

console.log('\n📊 ParagraphSentence要素:');
console.log(JSON.stringify(paragraphSentence, null, 2));

console.log('\n\nColumn要素の詳細:');
const column = paragraphSentence?.find((item: any) => 'Column' in item);
if (column) {
  console.log(JSON.stringify(column, null, 2));
  console.log('\n\nColumn.Column配列:');
  console.log(JSON.stringify(column.Column, null, 2));
}
