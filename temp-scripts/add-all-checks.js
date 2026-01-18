const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'github', 'sat_law', 'src', 'api', 'typescript-renderer.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 0. window check fix
content = content.replace(
  /(\/\/ ユーザーへの通知（初回のみアラートを表示）\s+if \(\!\(window as any\).__unprocessedFieldsAlertShown\))/,
  '// ユーザーへの通知（初回のみアラートを表示、ブラウザ環境のみ)\n    if (typeof window !== \'undefined\' && !(window as any).__unprocessedFieldsAlertShown)'
);

// 1. renderEnactStatement
content = content.replace(
  /(const renderEnactStatement = \([^)]+\): string => \{\s+return enactStatementList\.map\(\(dt, index\) => \{\s+)(const addTreeElement)/,
  '$1// EnactStatement要素のフィールドチェック\n    const knownFields = [\'_\', \'Line\', \'Ruby\', \'Sup\', \'Sub\', \'QuoteStruct\', \'ArithFormula\', \'Style\', \':@\'];\n    checkUnprocessedFields(dt.EnactStatement, knownFields, `EnactStatement[${index}]`);\n\n    $2'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Changes applied');
