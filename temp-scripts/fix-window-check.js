const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'github', 'sat_law', 'src', 'api', 'typescript-renderer.ts');
console.log('Reading file:', filePath);
let content = fs.readFileSync(filePath, 'utf-8');

// windowオブジェクトのチェックをtypeof windowで保護
content = content.replace(
  /(console\.error\('オブジェクト詳細:', obj\);\s+)\/\/ ユーザーへの通知（初回のみアラートを表示）\s+if \(\!\(window as any\).__unprocessedFieldsAlertShown\) \{[\s\S]{1,300}?\}/,
  `$1// ユーザーへの通知（初回のみアラートを表示、ブラウザ環境のみ）
    if (typeof window !== 'undefined' && !(window as any).__unprocessedFieldsAlertShown) {
      alert(\`法令XMLに未処理のタグが見つかりました。\n\nコンソールで詳細を確認してください。\n\n最初の未処理タグ:\n\${errorMessage}\`);
      (window as any).__unprocessedFieldsAlertShown = true;
    }`
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Window check fixed');
