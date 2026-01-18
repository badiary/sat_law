const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'github', 'sat_law', 'src', 'api', 'typescript-renderer.ts');
console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf-8');

// StyleStructの文字化けした重複行を削除 (2777-2779行付近)
// 文字化けしたコメント行と、その下のknownFieldsの定義・checkUnprocessedFieldsInArray呼び出しを削除
content = content.replace(
  /(\s+const addTreeElement = \(index2\?: number\) => \[[\s\S]{1,200}?\];\s+)\n\s+\/\/ StyleStruct[^\n]+\n\s+const knownFields = \['StyleStructTitle'[^\n]+\n\s+checkUnprocessedFieldsInArray\(styleStructList[^\n]+\n/,
  '$1\n'
);

// FormatStructの文字化けした重複行を削除 (3004-3006行付近)
content = content.replace(
  /(\s+const addTreeElement = \(index2\?: number\) => \[[\s\S]{1,200}?\];\s+)\n\s+\/\/ FormatStruct[^\n]+\n\s+const knownFields = \['FormatStructTitle'[^\n]+\n\s+checkUnprocessedFieldsInArray\(formatStructList[^\n]+\n/,
  '$1\n'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Duplicate field checks removed');
