// スクリプト: checkUnprocessedFieldsを一括変換
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/api/typescript-renderer.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// パターン1: forEach内でのcheckUnprocessedFields
// 例: const knownFields = ['Field1', 'Field2', ...]; checkUnprocessedFields(element, knownFields, `Context[${idx}]`);
const pattern1 = /(\s+)const knownFields = \[([\s\S]*?)\];\s+checkUnprocessedFields\((\w+),\s*knownFields,\s*(.*?)\);/g;

content = content.replace(pattern1, (match, indent, fields, elementVar, context) => {
  // フィールドリストを配列に変換
  const fieldList = fields.split(',').map(f => f.trim().replace(/['"]/g, '')).filter(f => f && f !== ':@' && f !== '#text');

  // 新しいコードを生成
  let newCode = `${indent}const processed = initProcessedFields();\n`;
  for (const field of fieldList) {
    newCode += `${indent}if ('${field}' in ${elementVar}) {\n`;
    newCode += `${indent}  processed.add('${field}');\n`;
    newCode += `${indent}}\n`;
  }
  newCode += `${indent}checkAllFieldsProcessed(${elementVar}, processed, ${context});`;

  return newCode;
});

// ファイルを保存
fs.writeFileSync(filePath, content, 'utf-8');
console.log('変換完了');
