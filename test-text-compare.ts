/**
 * テキスト比較ユーティリティの単体テスト
 * text-content-compare.tsの各関数が正しく動作することを確認
 */

import {
  extractTextFromXML,
  extractTextFromHTML,
  normalizeText,
  compareTextContent
} from './src/api/utils/text-content-compare';

console.log('=== テキスト比較ユーティリティ 単体テスト ===\n');

// テスト1: XMLからのテキスト抽出
console.log('テスト1: XMLからのテキスト抽出');
const sampleXML1 = {
  Law: [{
    LawNum: [{ _: '平成二十五年法律第三十六号' }],
    LawTitle: [{ _: 'テスト法' }]
  }]
};
const xmlText1 = extractTextFromXML(sampleXML1);
console.log(`  抽出結果: "${xmlText1}"`);
console.log(`  期待値: "平成二十五年法律第三十六号テスト法"`);
console.log(`  ✅ 結果: ${xmlText1 === '平成二十五年法律第三十六号テスト法' ? '成功' : '失敗'}\n`);

// テスト2: ネストしたXMLからのテキスト抽出
console.log('テスト2: ネストしたXMLからのテキスト抽出');
const sampleXML2 = {
  Article: [{
    ArticleTitle: [{ _: '第一条' }],
    Paragraph: [{
      Sentence: [{ _: 'この法律は、' }, { _: 'テストである。' }]
    }]
  }]
};
const xmlText2 = extractTextFromXML(sampleXML2);
console.log(`  抽出結果: "${xmlText2}"`);
console.log(`  期待値: "第一条この法律は、テストである。"`);
console.log(`  ✅ 結果: ${xmlText2 === '第一条この法律は、テストである。' ? '成功' : '失敗'}\n`);

// テスト3: 属性を除外してテキスト抽出
console.log('テスト3: 属性を除外してテキスト抽出');
const sampleXML3 = {
  Article: [{
    ':@': { Num: '1' },  // 属性は除外される
    ArticleTitle: [{ _: '第一条' }]
  }]
};
const xmlText3 = extractTextFromXML(sampleXML3);
console.log(`  抽出結果: "${xmlText3}"`);
console.log(`  期待値: "第一条" (属性"Num: 1"は含まれない)`);
console.log(`  ✅ 結果: ${xmlText3 === '第一条' ? '成功' : '失敗'}\n`);

// テスト4: HTMLからのテキスト抽出（基本）
console.log('テスト4: HTMLからのテキスト抽出（基本）');
const sampleHTML1 = '<div>平成二十五年法律第三十六号</div><div>テスト法</div>';
const htmlText1 = extractTextFromHTML(sampleHTML1);
console.log(`  抽出結果: "${htmlText1}"`);
console.log(`  期待値: "平成二十五年法律第三十六号テスト法"`);
console.log(`  ✅ 結果: ${htmlText1 === '平成二十五年法律第三十六号テスト法' ? '成功' : '失敗'}\n`);

// テスト5: HTMLからのテキスト抽出（HTML実体参照）
console.log('テスト5: HTMLからのテキスト抽出（HTML実体参照）');
const sampleHTML2 = '<div>&lt;Test&gt; &amp; &quot;Quote&quot;</div>';
const htmlText2 = extractTextFromHTML(sampleHTML2);
console.log(`  抽出結果: "${htmlText2}"`);
console.log(`  期待値: "<Test> & \\"Quote\\""`);
console.log(`  ✅ 結果: ${htmlText2 === '<Test> & "Quote"' ? '成功' : '失敗'}\n`);

// テスト6: HTMLからのテキスト抽出（数値文字参照）
console.log('テスト6: HTMLからのテキスト抽出（数値文字参照）');
const sampleHTML3 = '<div>&#x7B2C;&#x4E00;&#x6761;</div>';  // 第一条
const htmlText3 = extractTextFromHTML(sampleHTML3);
console.log(`  抽出結果: "${htmlText3}"`);
console.log(`  期待値: "第一条"`);
console.log(`  ✅ 結果: ${htmlText3 === '第一条' ? '成功' : '失敗'}\n`);

// テスト7: テキスト正規化（空白削除）
console.log('テスト7: テキスト正規化（空白削除）');
const textWithSpaces = '  第 一 条\n\n  テスト  法  \t';
const normalized = normalizeText(textWithSpaces);
console.log(`  正規化前: "${textWithSpaces}"`);
console.log(`  正規化後: "${normalized}"`);
console.log(`  期待値: "第一条テスト法"`);
console.log(`  ✅ 結果: ${normalized === '第一条テスト法' ? '成功' : '失敗'}\n`);

// テスト8: テキスト正規化（全角スペース）
console.log('テスト8: テキスト正規化（全角スペース）');
const textWithFullWidthSpaces = '第　一　条　テスト　法';
const normalized2 = normalizeText(textWithFullWidthSpaces);
console.log(`  正規化前: "${textWithFullWidthSpaces}"`);
console.log(`  正規化後: "${normalized2}"`);
console.log(`  期待値: "第一条テスト法"`);
console.log(`  ✅ 結果: ${normalized2 === '第一条テスト法' ? '成功' : '失敗'}\n`);

// テスト9: XMLとHTMLの比較（一致）
console.log('テスト9: XMLとHTMLの比較（一致）');
const compareXML1 = {
  Law: [{
    LawNum: [{ _: '平成二十五年法律第三十六号' }],
    LawTitle: [{ _: 'テスト法' }]
  }]
};
const compareHTML1 = '<div class="lawnum">平成二十五年法律第三十六号</div>\n  <div class="title">テスト法</div>';
const result1 = compareTextContent(compareXML1, compareHTML1);
console.log(`  XML正規化後: "${result1.xmlTextNormalized}"`);
console.log(`  HTML正規化後: "${result1.htmlTextNormalized}"`);
console.log(`  一致: ${result1.match}`);
console.log(`  ✅ 結果: ${result1.match ? '成功' : '失敗'}\n`);

// テスト10: XMLとHTMLの比較（不一致）
console.log('テスト10: XMLとHTMLの比較（不一致）');
const compareXML2 = {
  Law: [{
    LawNum: [{ _: '平成二十五年法律第三十六号' }],
    LawTitle: [{ _: 'テスト法' }]
  }]
};
const compareHTML2 = '<div>平成二十五年法律第三十六号</div>'; // LawTitleが欠落
const result2 = compareTextContent(compareXML2, compareHTML2);
console.log(`  XML正規化後: "${result2.xmlTextNormalized}"`);
console.log(`  HTML正規化後: "${result2.htmlTextNormalized}"`);
console.log(`  一致: ${result2.match}`);
console.log(`  差分情報:\n${result2.diff}`);
console.log(`  ✅ 結果: ${!result2.match ? '成功（不一致を正しく検出）' : '失敗'}\n`);

// テスト11: Rubyタグの処理
console.log('テスト11: Rubyタグの処理');
const sampleHTML4 = '<ruby>字<rt>じ</rt></ruby>';
const htmlText4 = extractTextFromHTML(sampleHTML4);
console.log(`  抽出結果: "${htmlText4}"`);
console.log(`  期待値: "字じ" (ベーステキスト + ルビ)`);
console.log(`  ✅ 結果: ${htmlText4 === '字じ' ? '成功' : '失敗'}\n`);

// テスト結果サマリー
console.log('=== テスト完了 ===');
console.log('全11テストを実行しました。');
console.log('各テストの結果を確認してください。');
