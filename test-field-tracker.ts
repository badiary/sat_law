/**
 * field-tracker.tsのユニットテスト
 * TDD: テストを先に作成し、期待される動作を定義する
 */

import { deleteField, deleteFieldFromArray, checkUnprocessedFields } from './src/api/utils/field-tracker';

// テスト用のヘルパー関数
function assertEqual(actual: any, expected: any, testName: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    console.error(`❌ ${testName} 失敗`);
    console.error(`  期待値: ${JSON.stringify(expected)}`);
    console.error(`  実際値: ${JSON.stringify(actual)}`);
    return false;
  } else {
    console.log(`✅ ${testName} 成功`);
    return true;
  }
}

function assertWarningLogged(testName: string, expectedPattern: RegExp, fn: () => void) {
  const originalWarn = console.warn;
  let warningLogged = false;
  let loggedMessage = '';

  console.warn = (...args: any[]) => {
    loggedMessage = args.join(' ');
    if (expectedPattern.test(loggedMessage)) {
      warningLogged = true;
    }
  };

  fn();

  console.warn = originalWarn;

  if (warningLogged) {
    console.log(`✅ ${testName} 成功`);
    return true;
  } else {
    console.error(`❌ ${testName} 失敗`);
    console.error(`  期待パターン: ${expectedPattern}`);
    console.error(`  実際のログ: ${loggedMessage}`);
    return false;
  }
}

// テストケース
console.log('=== field-tracker.ts ユニットテスト ===\n');

let testResults: boolean[] = [];

// テスト1: deleteField - 基本的な削除
(() => {
  const obj = { name: 'test', value: 123, other: 'data' };
  deleteField(obj, 'value');
  testResults.push(assertEqual(obj, { name: 'test', other: 'data' }, 'deleteField - 基本的な削除'));
})();

// テスト2: deleteField - 存在しないフィールド
(() => {
  const obj = { name: 'test' };
  deleteField(obj, 'nonexistent');
  testResults.push(assertEqual(obj, { name: 'test' }, 'deleteField - 存在しないフィールド'));
})();

// テスト3: deleteFieldFromArray - 配列の全要素から削除
(() => {
  const arr = [
    { Article: 'data1', other: 'x' },
    { Article: 'data2', other: 'y' },
    { other: 'z' }
  ];
  deleteFieldFromArray(arr, 'Article');
  testResults.push(assertEqual(
    arr,
    [
      { other: 'x' },
      { other: 'y' },
      { other: 'z' }
    ],
    'deleteFieldFromArray - 配列の全要素から削除'
  ));
})();

// テスト4: checkUnprocessedFields - 未処理フィールドなし
(() => {
  const obj = { ':@': { attr: 'value' } };
  const originalWarn = console.warn;
  let warnCalled = false;

  console.warn = () => { warnCalled = true; };
  checkUnprocessedFields(obj, 'TestContext', ['Root', 'Test']);
  console.warn = originalWarn;

  testResults.push(assertEqual(warnCalled, false, 'checkUnprocessedFields - 未処理フィールドなし（警告なし）'));
})();

// テスト5: checkUnprocessedFields - 未処理フィールドあり
(() => {
  const obj = {
    ':@': { attr: 'value' },
    UnprocessedField1: 'data',
    UnprocessedField2: 'data'
  };

  const result = assertWarningLogged(
    'checkUnprocessedFields - 未処理フィールドあり',
    /\[未処理フィールド検出\]\s+TestContext\s+\(Root>Test\):\s+\{\s*UnprocessedField1,\s*UnprocessedField2\s*\}/,
    () => {
      checkUnprocessedFields(obj, 'TestContext', ['Root', 'Test']);
    }
  );

  testResults.push(result);
})();

// テスト6: checkUnprocessedFields - :@属性は除外
(() => {
  const obj = {
    ':@': { src: 'image.png', id: '123' }
  };

  const originalWarn = console.warn;
  let warnCalled = false;

  console.warn = () => { warnCalled = true; };
  checkUnprocessedFields(obj, 'TestContext', ['Root']);
  console.warn = originalWarn;

  testResults.push(assertEqual(warnCalled, false, 'checkUnprocessedFields - :@属性は除外'));
})();

// テスト7: deleteFieldFromArray - 空配列
(() => {
  const arr: any[] = [];
  deleteFieldFromArray(arr, 'Field');
  testResults.push(assertEqual(arr, [], 'deleteFieldFromArray - 空配列'));
})();

// テスト8: checkUnprocessedFields - 空オブジェクト
(() => {
  const obj = {};
  const originalWarn = console.warn;
  let warnCalled = false;

  console.warn = () => { warnCalled = true; };
  checkUnprocessedFields(obj, 'TestContext', ['Root']);
  console.warn = originalWarn;

  testResults.push(assertEqual(warnCalled, false, 'checkUnprocessedFields - 空オブジェクト（警告なし）'));
})();

// テスト結果サマリー
console.log('\n=== テスト結果サマリー ===');
const passedTests = testResults.filter(result => result).length;
const totalTests = testResults.length;

console.log(`成功: ${passedTests}/${totalTests}`);
console.log(`失敗: ${totalTests - passedTests}/${totalTests}`);

if (passedTests === totalTests) {
  console.log('\n✅ すべてのテストが成功しました！');
  process.exit(0);
} else {
  console.log('\n❌ いくつかのテストが失敗しました。');
  process.exit(1);
}
