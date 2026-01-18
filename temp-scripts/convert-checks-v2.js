// スクリプト: checkUnprocessedFieldsを一括変換（改良版）
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/api/typescript-renderer.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 単純パターン: const knownFields = [...]; checkUnprocessedFields(...);
// マルチライン対応で、1行または複数行のknownFields配列をキャプチャ
const pattern = /(\s+)const knownFields = \[([^\]]+)\];\s+checkUnprocessedFields\((\w+), knownFields, ([^)]+)\);/g;

content = content.replace(pattern, (match, indent, fieldsStr, elementVar, context) => {
  // フィールドリストを抽出（':@'と'#text'は除外）
  const fields = fieldsStr
    .split(',')
    .map(f => f.trim().replace(/['"]/g, ''))
    .filter(f => f && f !== ':@' && f !== '#text');

  // 新しいコードを生成
  let newCode = `${indent}const processed = initProcessedFields();\n`;
  for (const field of fields) {
    newCode += `${indent}if ('${field}' in ${elementVar}) {\n`;
    newCode += `${indent}  processed.add('${field}');\n`;
    newCode += `${indent}}\n`;
  }
  newCode += `${indent}checkAllFieldsProcessed(${elementVar}, processed, ${context});`;

  return newCode;
});

// ファイルを保存
fs.writeFileSync(filePath, content, 'utf-8');
console.log('変換完了: ' + filePath);
