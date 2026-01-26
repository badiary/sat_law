/**
 * テスト進捗ダッシュボード生成スクリプト
 * test-progress.csvとtest-judgment-log.mdから統計情報を集計し、
 * test-dashboard.mdを自動生成する
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const PROGRESS_CSV = './test-progress.csv';
const JUDGMENT_LOG = './test-judgment-log.md';
const DASHBOARD_MD = './test-dashboard.md';

interface TestProgress {
  xmlPath: string;
  status: 'pending' | 'pass' | 'fail_unprocessed' | 'fail_text_mismatch' | 'fail_error';
  unprocessedFieldsCount: number;
  textMatch: boolean;
  xmlLength: number;
  htmlLength: number;
  diffPosition: number;
  lastTested: string;
  errorMessage: string;
}

interface PatternStats {
  [patternType: string]: {
    count: number;
    recommendation: string;
  };
}

function loadProgress(): TestProgress[] {
  if (!existsSync(PROGRESS_CSV)) {
    return [];
  }

  const csvContent = readFileSync(PROGRESS_CSV, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  const [header, ...dataLines] = lines;

  return dataLines.map(line => {
    const [
      xmlPath,
      status,
      unprocessedFieldsCount,
      textMatch,
      xmlLength,
      htmlLength,
      diffPosition,
      lastTested,
      errorMessage
    ] = line.split(',');

    return {
      xmlPath,
      status: status as TestProgress['status'],
      unprocessedFieldsCount: parseInt(unprocessedFieldsCount) || 0,
      textMatch: textMatch === 'true',
      xmlLength: parseInt(xmlLength) || 0,
      htmlLength: parseInt(htmlLength) || 0,
      diffPosition: parseInt(diffPosition) || -1,
      lastTested,
      errorMessage: errorMessage || ''
    };
  });
}

function extractPatternStats(): PatternStats {
  if (!existsSync(JUDGMENT_LOG)) {
    return {};
  }

  const logContent = readFileSync(JUDGMENT_LOG, 'utf-8');

  // パターンタイプを抽出（正規表現で判断ログから検出）
  const patternMatches = logContent.matchAll(/\*\*パターンタイプ\*\*: (.+)/g);
  const recommendationMatches = logContent.matchAll(/\*\*推奨アクション\*\*: (.+)/g);

  const patterns = Array.from(patternMatches).map(m => m[1].trim());
  const recommendations = Array.from(recommendationMatches).map(m => m[1].trim());

  // パターンごとに推奨アクションの頻度を集計
  const patternRecommendations: { [pattern: string]: { [rec: string]: number } } = {};

  patterns.forEach((pattern, i) => {
    if (!patternRecommendations[pattern]) {
      patternRecommendations[pattern] = {};
    }
    const rec = recommendations[i] || '不明';
    patternRecommendations[pattern][rec] = (patternRecommendations[pattern][rec] || 0) + 1;
  });

  // 最も頻度の高い推奨アクションを選択
  const stats: PatternStats = {};
  Object.entries(patternRecommendations).forEach(([pattern, recCounts]) => {
    const totalCount = Object.values(recCounts).reduce((sum, count) => sum + count, 0);

    // 推奨アクションを頻度順にソート
    const sortedRecs = Object.entries(recCounts).sort((a, b) => b[1] - a[1]);
    const mostFrequentRec = sortedRecs[0][0];

    stats[pattern] = {
      count: totalCount,
      recommendation: mostFrequentRec
    };
  });

  return stats;
}

function generateDashboard(): void {
  const progress = loadProgress();
  const patternStats = extractPatternStats();

  const total = progress.length;
  const tested = progress.filter(p => p.status !== 'pending').length;
  const pass = progress.filter(p => p.status === 'pass').length;
  const failUnprocessed = progress.filter(p => p.status === 'fail_unprocessed').length;
  const failTextMismatch = progress.filter(p => p.status === 'fail_text_mismatch').length;
  const failError = progress.filter(p => p.status === 'fail_error').length;
  const pending = progress.filter(p => p.status === 'pending').length;

  const passRate = tested > 0 ? (pass / tested * 100).toFixed(2) : '0.00';

  const dashboard = `# XMLレンダリングテスト 進捗ダッシュボード

**最終更新**: ${new Date().toISOString()}

---

## 📊 全体サマリー

| 項目 | 件数 | 割合 |
|------|------|------|
| 総ファイル数 | ${total} | 100.00% |
| テスト完了 | ${tested} | ${(tested / total * 100).toFixed(2)}% |
| ✅ 成功 | ${pass} | ${passRate}% |
| ⚠️ 未処理フィールド | ${failUnprocessed} | ${(failUnprocessed / total * 100).toFixed(2)}% |
| ⚠️ テキスト不一致 | ${failTextMismatch} | ${(failTextMismatch / total * 100).toFixed(2)}% |
| ❌ エラー | ${failError} | ${(failError / total * 100).toFixed(2)}% |
| ⏳ 未テスト | ${pending} | ${(pending / total * 100).toFixed(2)}% |

---

## 📋 パターン別内訳

${Object.keys(patternStats).length > 0 ? `
| パターン | 件数 | 推奨アクション |
|---------|------|--------------|
${Object.entries(patternStats)
  .sort((a, b) => b[1].count - a[1].count)
  .map(([pattern, stat]) => `| ${pattern} | ${stat.count} | ${stat.recommendation} |`)
  .join('\n')}
` : '_パターンデータがまだありません。テスト実行後に表示されます。_'}

---

## 🎯 修正優先度

### 高優先度（修正必須）

${failUnprocessed > 0 || failTextMismatch > 0 ? `
1. **未処理フィールド検出**: ${failUnprocessed}件
   - フィールド追跡機構で検出された未レンダリング要素
   - 各ファイルの詳細は \`test-reports/\` を参照

2. **テキスト不一致**: ${failTextMismatch}件
   - XMLとHTMLのテキスト内容が一致しない
   - パターン分類は \`test-judgment-log.md\` を参照
` : '_現在、高優先度の修正項目はありません。_'}

### 中優先度（要確認）

${failError > 0 ? `
3. **エラー発生**: ${failError}件
   - レンダリング中にエラーが発生したファイル
   - 詳細は \`test-reports/\` を参照
` : '_現在、中優先度の修正項目はありません。_'}

---

## 📈 進捗グラフ

\`\`\`
完了: ${'█'.repeat(Math.floor(tested / total * 50))}${'░'.repeat(50 - Math.floor(tested / total * 50))} ${(tested / total * 100).toFixed(1)}%
成功: ${'█'.repeat(Math.floor(pass / total * 50))}${'░'.repeat(50 - Math.floor(pass / total * 50))} ${(pass / total * 100).toFixed(1)}%
\`\`\`

---

## 🔍 次のアクション

${pending > 0 ? `
1. **段階的テストの継続**: 残り${pending}ファイルをテスト
   \`\`\`bash
   npm run test:incremental
   \`\`\`
` : ''}

${failTextMismatch > 0 ? `
2. **判断ログの確認**: テキスト不一致パターンを確認
   - ファイル: \`test-judgment-log.md\`
   - 自動分類された推奨アクションを確認
` : ''}

${failUnprocessed > 0 ? `
3. **未処理フィールドの修正**: レンダリング関数を修正
   - 詳細レポートで具体的な未処理フィールドを確認
` : ''}

${pending === 0 && failTextMismatch === 0 && failUnprocessed === 0 && failError === 0 ? `
🎉 **全てのテストが完了しました！**

- 成功率: ${passRate}%
- 全${total}ファイルのレンダリングが正常に完了しました
` : ''}

---

## 📝 最近の更新

- ${new Date().toISOString()}: ダッシュボード自動生成
${tested > 0 ? `- 最新テスト: ${tested}ファイル完了` : ''}

---

## 📚 関連ファイル

- **進捗CSV**: \`test-progress.csv\` - 全ファイルのテスト状況
- **判断ログ**: \`test-judgment-log.md\` - パターン分類と判断記録
- **詳細レポート**: \`test-reports/\` - 各失敗ケースの詳細
- **このダッシュボード**: \`test-dashboard.md\` - 自動生成される現在の進捗

---

**ダッシュボード生成コマンド**:
\`\`\`bash
npm run test:dashboard
\`\`\`
`;

  writeFileSync(DASHBOARD_MD, dashboard, 'utf-8');
  console.log(`✅ ダッシュボードを生成しました: ${DASHBOARD_MD}`);
}

generateDashboard();
