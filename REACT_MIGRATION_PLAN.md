# React脱却プロジェクト - タスク管理ドキュメント

## プロジェクト概要

現在、統合法令閲覧システム（Webツール）ではe-gov法令APIからXMLデータを取得し、Reactを使ってHTMLをレンダリングした後、そのHTMLを通常のJavaScriptで処理する構造になっています。このプロジェクトの目的は、**Webツール内でReactを完全に脱却し、純粋なTypeScript関数で同じHTMLを出力できるようにする**ことです。

### 現在のフロー（Webツール）

```
e-gov API (XML)
  → XMLParser (fast-xml-parser)
  → React Components (src/api/components/law/*.tsx)  ← ここをTypeScriptに置き換える
  → HTML生成 (#app.innerHTML)
  → parseLaw() で加工
  → window.showLawViewer() に渡す
  → ビューア表示
```

### 目指すフロー（Webツール）

```
e-gov API (XML)
  → XMLParser (fast-xml-parser)
  → TypeScript変換関数（Reactなし、ブラウザで動作）  ← 新しい実装
  → HTML生成 (#app.innerHTML)
  → parseLaw() で加工
  → window.showLawViewer() に渡す
  → ビューア表示
```

## 最終ゴール

**Webツール（ブラウザ環境）で動作する法令閲覧システムから、React依存を完全に除去する。具体的には、`src/api/components/law/*.tsx`のReactコンポーネントを、`src/node-renderer/typescript-renderer.ts`で実装したTypeScript関数に置き換え、ブラウザ上で同じHTMLを生成できるようにする。**

## 検証のための3ステップ（完了）

ステップ1-3では、Webツールへの実装前に、Node.js環境で両者が同一のHTML出力を生成できることを検証しました。この検証により、TypeScript実装の正確性が保証されました。

---

## 実装の4ステップ

### ステップ1: Node.jsでReactのHTML出力を再現する環境構築 ✅ **完了**（検証ステップ）

**目的**: 現在のReact実装をNode.js環境で動作させ、XMLファイルから「これまでのHTML」を出力できるようにする（検証用の正解データ作成）

**成果物**:
- `tests/test-law-ids.json` - テスト対象法令リスト（5件）
- `src/node-renderer/react-ssr.ts` - React SSRスクリプト
- `src/node-renderer/parse-law.ts` - parseLaw関数（Node.js版）
- `output/react-html/*.html` - 生成された「これまでのHTML」（正解データ）

**実行方法**:
```bash
npm run generate:react-html
```

---

### ステップ2: TypeScriptでHTMLを出力する新実装 ✅ **完了**（検証ステップ）

**目的**: Reactを使わずに、純粋なTypeScriptでXMLからHTMLを生成する（検証用の実装）

**方針変更（重要）**:
- ❌ 当初計画: HTML出力からマッピング仕様を作成
- ✅ 新方針: **Reactコンポーネントのコードを読んで、そのロジックをTypeScriptで再現**
- 理由: HTMLから逆算するよりも、Reactコードを直接移植する方が正確

**タスク**:
1. ✅ 既存のReactコンポーネント（src/api/components/law/*.tsx）のコードを分析
2. ✅ TypeScriptでHTML生成関数を作成（Reactなし）
3. ✅ 基本的な法令要素（Article, Paragraph, Item）の変換関数を実装
4. ✅ Law全体のレンダリング関数を実装（LawNum, LawTitle, MainProvision）
5. ⏳ 複雑な要素の実装（SupplProvision, Chapter, Part, Section, Table等）
6. ⏳ parseLaw関数を適用したHTML生成の確認

**成果物**:
- ✅ `src/node-renderer/typescript-renderer.ts` - TypeScriptでのHTML生成関数
- ✅ `src/node-renderer/generate-typescript-html.ts` - HTML生成実行スクリプト
- ✅ `output/typescript-html/[lawId].html` - TypeScriptで生成されたHTML（5件）
- ✅ `package.json` - `npm run generate:typescript-html` スクリプト追加

**実装済み関数**:
- `renderTextNode()` - テキストノード（Ruby、Line、Sup/Sub等）
- `renderSentence()` - 文のHTML変換
- `renderColumn()` - Column要素のHTML変換
- `renderParagraphSentence()` - 項文のHTML変換
- `renderItemSentence()` - 号文のHTML変換
- `renderItem()` - 号のHTML変換（Subitem1対応済み）
- `renderParagraph()` - 項のHTML変換
- `renderArticle()` - 条のHTML変換
- `renderSection()` - 節のHTML変換
- `renderChapter()` - 章のHTML変換
- `renderPart()` - 編のHTML変換
- `renderMainProvision()` - 本則のHTML変換
- `renderSupplProvision()` - 附則のHTML変換
- `renderArticleRange()` - 条範囲のHTML変換
- `renderTOCArticle()` - 目次条のHTML変換
- `renderTOCSection()` - 目次節のHTML変換
- `renderTOCChapter()` - 目次章のHTML変換
- `renderTOCPart()` - 目次編のHTML変換
- `renderTOCSupplProvision()` - 目次附則のHTML変換
- `renderTOCAppdxTableLabel()` - 目次別表ラベルのHTML変換
- `renderTOC()` - 目次全体のHTML変換
- `renderLawBody()` - 法令本文のHTML変換
- `renderLaw()` - 法令全体のHTML変換
- **`renderSubitem1()` - 号細分（イ、ロ、ハ…）のHTML変換（NEW!）**
- **`renderSubitem2()` - 号細分２のHTML変換（NEW!）**
- **`renderSubitem3()` - 号細分３のHTML変換（NEW!）**
- **`renderSubitem4()` - 号細分４のHTML変換（NEW!）**
- **`renderSubitem5()` - 号細分５のHTML変換（NEW!）**
- **`renderSubitem6()` - 号細分６のHTML変換（NEW!）**
- **`renderSubitem7()` - 号細分７のHTML変換（NEW!）**
- **`renderSubitem8()` - 号細分８のHTML変換（NEW!）**
- **`renderSubitem9()` - 号細分９のHTML変換（NEW!）**
- **`renderSubitem10()` - 号細分１０のHTML変換（NEW!）**
- **`renderSubitem1Sentence()` - 号細分文のHTML変換（NEW!）**
- **`renderSubitem2Sentence()` - 号細分２文のHTML変換（NEW!）**
- **`renderSubitem3Sentence()` - 号細分３文のHTML変換（NEW!）**
- **`renderSubitem4Sentence()` - 号細分４文のHTML変換（NEW!）**
- **`renderSubitem5Sentence()` - 号細分５文のHTML変換（NEW!）**
- **`renderSubitem6Sentence()` - 号細分６文のHTML変換（NEW!）**
- **`renderSubitem7Sentence()` - 号細分７文のHTML変換（NEW!）**
- **`renderSubitem8Sentence()` - 号細分８文のHTML変換（NEW!）**
- **`renderSubitem9Sentence()` - 号細分９文のHTML変換（NEW!）**
- **`renderSubitem10Sentence()` - 号細分１０文のHTML変換（NEW!）**
- **`isParentParagraphPreceding()` - 親要素のParagraph判定ヘルパー（NEW!）**
- **`renderRelatedArticleNum()` - 関係条文番号のHTML変換（NEW!）**
- **`renderRemarks()` - 備考のHTML変換（NEW!）**
- **`renderTableHeaderColumn()` - 表欄名のHTML変換（NEW!）**
- **`renderTableHeaderRow()` - 表欄名項のHTML変換（NEW!）**
- **`renderTableColumn()` - 表欄のHTML変換（NEW!）**
- **`renderTableRow()` - 表項のHTML変換（NEW!）**
- **`renderTable()` - 表全体のHTML変換（NEW!）**
- **`renderAppdxTable()` - 別表のHTML変換（NEW!）**
- **`getBorderStyle()` - テーブルボーダースタイル生成ヘルパー（NEW!）**

**実装完了要素**:
- ✅ ~~SupplProvision（附則）~~ - **実装完了！**
- ✅ ~~Chapter（章）、Part（編）、Section（節）~~ - **実装完了！**
- ✅ ~~TOC（目次）~~ - **実装完了！**
- ✅ ~~Subitem1～10（号細分：イ、ロ、ハ…）~~ - **実装完了！**
- ✅ ~~Table（表）、TableStruct、AppdxTable（別表）~~ - **実装完了！**
- ✅ ~~Remarks（備考）、RelatedArticleNum（関係条文番号）~~ - **実装完了！**

**未実装要素**（テスト法令5件には含まれない）:
- Preamble（前文）、EnactStatement（制定文） - 一部の法令に必要
- AppdxNote（別記）、Appdx（別図）、AppdxStyle（別式）等 - 附則の付属要素
- QuoteStruct（引用）、ArithFormula（算術式）、FigStruct（図）等 - 特殊要素

**進捗状況**:
- 🎉 **Table/AppdxTable実装により全5ファイルで100%一致達成！**
  - 141AC0000000057: 19KB（**100%一致**）✅
  - 323AC0000000075: 110KB（**100%一致**）✅
  - 326AC1000000285: 139KB（**100%一致**）✅
  - 405AC0000000088: 147KB（**100%一致**）✅
  - 334AC0000000121: 1.2MB（**100%一致**）✅
- ✅ **`diff`コマンドでバイト単位の完全一致を確認！**
- ✅ **テスト対象5件すべてでReact版とTypeScript版が完全同一のHTMLを生成**

---

### ステップ3: HTMLの同一性テスト ✅ **完了**（検証ステップ）

**目的**: ステップ1で生成した「これまでのHTML」とステップ2で生成した「新しいHTML」が同一であることを確認する（TypeScript実装の正確性を検証）

**タスク**:
1. ✅ HTML比較ロジックの実装
2. ✅ 複数のlawIdで一括テストを実行
3. ✅ 差分がある場合、詳細なdiffを出力
4. ✅ テストが通るまでステップ2のコードを修正
5. ✅ 全テスト通過を確認（**10,514件すべて**）

**成果物**:
- `tests/test-status.csv` - テスト状態管理CSV（全10,514件）
- `src/node-renderer/test-single-law.ts` - 個別テスト実行スクリプト
- `src/node-renderer/test-next-unpassed.ts` - 未パステスト自動実行
- `src/node-renderer/update-test-status.ts` - テスト統計ツール
- `src/node-renderer/reset-test-status.ts` - テストステータスリセットツール
- `src/node-renderer/run-all-tests.ts` - 全テスト自動実行スクリプト
- テストレポート: **10,514件全テストパス（100%）**

---

### ステップ4: Webツールへの適用 ✅ **完了**（実装ステップ）

**目的**: 実際のWebツール（ブラウザ環境）で、ReactコンポーネントをTypeScript関数に置き換える

**タスク**:
1. ✅ `src/node-renderer/typescript-renderer.ts`をブラウザ環境で動作するように移植
   - `src/api/typescript-renderer.ts`として複製
   - import pathを`./lib/law/law`に修正（ブラウザ環境用）
2. ✅ `src/api/law.tsx`をReact componentから非同期関数に変換
   - Reactコンポーネント`Law`を削除
   - 非同期関数`loadLaw()`を作成
   - TypeScript版`renderLaw()`を使用してHTML生成
   - `#app`要素にHTMLを直接設定
   - `parseLaw()`で加工後、`window.showLawViewer()`に渡す
3. ✅ React関連の依存関係を削除
   - `react`、`react-dom`、`@types/react`、`@types/react-dom`、`react-loading-skeleton`をpackage.jsonから削除
   - `src/api/components/law/*.tsx`ファイルを削除（70ファイル、backup/react-components/にバックアップ）
   - `src/api/apiError.tsx`を削除
4. ✅ `src/api/main.tsx`を更新
   - `createRoot()`と`<App />`コンポーネントを削除
   - `loadLaw()`を直接呼び出すように変更
5. ✅ ビルド確認
   - 本番ビルド成功
   - React関連の警告が消失
   - バンドルサイズ削減を確認

**成果物**:
- `src/api/typescript-renderer.ts` - ブラウザ版のTypeScriptレンダラー
- 更新された`src/api/law.tsx` - TypeScript版を使用（非同期関数化）
- 更新された`src/api/main.tsx` - `loadLaw()`を直接呼び出し
- 更新された`package.json` - React依存を削除
- `backup/react-components/law/*.tsx` - 削除したReactコンポーネントのバックアップ

**達成された効果**:
- ✅ バンドルサイズの削減: 244 KiB → 179 KiB（約27%削減、65 KiB減）
- ✅ ビルド警告の解消: React関連の警告が消失
- ✅ コード量削減: 6,966行削除、59行追加
- ✅ メンテナンス性の向上: Reactを完全に排除、TypeScriptのみで実装

---

### ステップ5: ArithFormula Sub/Sup問題の解決 ⏳ **未着手**（品質改善ステップ）

**目的**: KNOWN_ISSUES.mdに記載されているArithFormula要素のSub/Sup（下付き・上付き文字）削除問題を解決し、正しいHTMLを出力する

**問題の概要**:
現在、化学式などを表すArithFormula要素において、React SSR生成のHTMLではSub（下付き文字）およびSup（上付き文字）タグとその内容が完全に削除されています。TypeScript版も現在はReact版との一致を優先してこの動作を踏襲していますが、本来は適切にタグを出力すべきです。

**タスク**:
1. ⏳ React SSR側のArithFormula処理を調査
   - `src/api/components/law/*.tsx`（バックアップ）でArithFormulaの処理を確認
   - beautify処理がSub/Supタグを削除している原因を特定
2. ⏳ TypeScript版レンダラーを修正
   - `src/node-renderer/typescript-renderer.ts`のrenderTextNode関数を修正
   - `src/api/typescript-renderer.ts`のrenderTextNode関数を修正
   - Sub要素を`<sub class="Sub">{content}</sub>`として出力
   - Sup要素を`<sup class="Sup">{content}</sup>`として出力
3. ⏳ テストデータの更新
   - ArithFormulaを含む法令（143AC0000000054_20250401_507AC0000000016）のReact SSR HTMLを再生成
   - ただし、React側は修正せず、TypeScript版のみ正しい出力にする
4. ⏳ テストの調整
   - 該当法令のテストでは、Sub/Sup部分の差分を許容するようにテストロジックを調整
   - または、正しいHTML（TypeScript版）を正解として扱うように変更
5. ⏳ 動作確認
   - ブラウザで該当法令を表示し、化学式が正しく表示されることを確認
   - Sub/Supのスタイルが適切に適用されることを確認

**成果物**（予定）:
- 修正された`src/node-renderer/typescript-renderer.ts`
- 修正された`src/api/typescript-renderer.ts`
- 更新されたKNOWN_ISSUES.md（問題解決の記録）
- ArithFormulaを含む法令の表示確認

**期待される効果**:
- 化学式や数式の下付き・上付き文字が正しく表示される
- e-gov法令API仕様に準拠した正しいHTML出力
- ユーザーエクスペリエンスの向上（正確な法令表示）

---

## 現在の進捗状況

### ✅ 完了
- ✅ **ステップ1**: Node.jsでReact SSR環境構築（検証フェーズ）
  - React SSRスクリプト作成
  - parseLaw関数のNode.js移植
  - 10,514件のXMLから正解HTML生成完了
- ✅ **ステップ2**: TypeScript版HTML生成実装（検証フェーズ）
  - 全法令要素のレンダリング関数実装完了
  - Article、Paragraph、Item、Table、SupplProvision等すべて対応
  - `src/node-renderer/typescript-renderer.ts` 完成
- ✅ **ステップ3**: HTMLの同一性テスト（検証フェーズ）
  - 10,514件すべてでReact版とTypeScript版が完全一致を確認
  - テスト自動化ツール一式完成（test:all、test:reset等）
  - **検証完了: TypeScript実装の正確性を保証**
- ✅ **ステップ4**: Webツールへの適用（実装フェーズ）
  - TypeScriptレンダラーのブラウザ版移植完了
  - React依存の完全除去（バンドルサイズ27%削減）
  - **実装完了: Reactを排除し、TypeScriptのみでHTML生成**

### 🎯 次のアクション（ステップ5: 品質改善フェーズ）

**ArithFormula Sub/Sup問題の解決**:
1. TypeScriptレンダラーでSub/Supタグを正しく出力するように修正
2. 該当法令で動作確認
3. KNOWN_ISSUES.mdを更新（問題解決を記録）

---

## テスト対象XMLファイル

以下の5件のXMLファイルを選定しました（`tests/test-law-ids.json`に記録）：

| lawId | 名称 | 行数 | 複雑さ | 説明 |
|-------|------|------|--------|------|
| 141AC0000000057 | 短い法令 | 386行 | simple | 最も短い法令。基本構造のテスト |
| 326AC1000000285 | 中程度の法令 | 1,461行 | medium | 中程度の長さ |
| 323AC0000000075 | 中程度の法令 | 1,514行 | medium | 複数の章・節を含む |
| 405AC0000000088 | 行政手続法 | 2,056行 | medium | デフォルト法令。標準的な構造 |
| 334AC0000000121 | 特許法 | 12,100行 | complex | 大規模法令。表・附則等の複雑要素 |

---

## ステップ1の成果物（完了）

### 生成されたHTMLファイル

| lawId | ファイルサイズ | 法令名 |
|-------|--------------|--------|
| 141AC0000000057 | 18KB | 北海道国有未開地処分法 |
| 323AC0000000075 | 101KB | （中程度の法令） |
| 326AC1000000285 | 135KB | （中程度の法令） |
| 405AC0000000088 | 141KB | 行政手続法 |
| 334AC0000000121 | 1.2MB | 特許法 |

### 実装のポイント

1. **jsdomの使用**: ブラウザDOM APIをNode.js環境で再現
2. **SVGモックの作成**: Node.jsではSVGファイルを直接インポートできないため、モックファイルを作成
3. **XML構造の違い**: ローカルXMLファイルは`<Law>`タグから直接始まるため、APIレスポンスとは異なる構造
4. **parseLaw関数の完全移植**:
   - 全角→半角数字変換
   - 漢数字→アラビア数字変換
   - 括弧マッチング処理
   - 条文リンク追加
   - 項・号のスタイル適用
   - 接続詞の装飾

### 検証結果

- ✅ 全5件のXMLファイルからHTMLが正常に生成されました
- ✅ parseLaw関数による加工がすべて適用されています
- ✅ 条文リンク、括弧スタイリング、接続詞装飾などが正しく動作しています

---

## 技術情報

### 既存のXMLパーサー設定

```typescript
const xp = new XMLParser({
  ignoreDeclaration: true,        // XML宣言除去
  ignoreAttributes: false,        // 属性を保持
  alwaysCreateTextNode: false,    // テキストノードが存在する場合のみ作成
  preserveOrder: true,            // タグ順序維持（重要！）
  textNodeName: "_",              // テキストノード名
  attributeNamePrefix: "",        // 属性プレフィックスなし
});
```

### 重要なReactコンポーネント

| コンポーネント | ファイルパス | 役割 |
|--------------|-------------|------|
| Law | src/api/components/law/law.tsx | 法令全体 |
| LawBody | src/api/components/law/law-body.tsx | 法令本文 |
| Article | src/api/components/law/article.tsx | 条 |
| Paragraph | src/api/components/law/paragraph.tsx | 項 |
| Item | src/api/components/law/item.tsx | 号 |
| Table | src/api/components/law/table.tsx | 表 |
| SupplProvision | src/api/components/law/suppl-provision.tsx | 附則 |

### parseLaw関数の主要処理

1. 全角数字 → 半角数字変換（zen2Han関数）
2. 漢数字 → アラビア数字変換（kansuji2arabic）
3. 括弧マッチング処理（parenthesisライブラリ）
4. 条文リンク追加
5. 項・号のスタイル適用
6. 接続詞の装飾（「及び」「又は」「並びに」「若しくは」）
7. 無意味なspan要素削除（clearSpan関数）

### XMLファイルの構造

ローカルXMLファイルは以下のような階層構造を持つ：

```xml
<Law Era="..." Year="..." Num="..." LawType="..." Lang="ja">
  <LawNum>...</LawNum>
  <LawBody>
    <LawTitle>...</LawTitle>
    <MainProvision>
      <Part>...</Part>
      <Chapter>...</Chapter>
      <Article>...</Article>
      ...
    </MainProvision>
    <SupplProvision>...</SupplProvision>
  </LawBody>
</Law>
```

---

## 決定事項（質問への回答）

### ✅ parseLaw関数の処理について

**決定**: parseLaw後のHTMLを正解データとする

- ステップ1でReact SSRで生成したHTMLに対し、parseLaw関数を適用
- parseLaw後のHTMLを「これまでのHTML」（正解データ）として保存
- ステップ2のTypeScript実装も同じparseLaw処理を含める

### ✅ chikujoデータの扱い

**決定**: chikujoデータはHTML生成には影響しない

- chikujoデータは逐条解説用の別データであり、HTML生成ロジックとは独立
- テストでは無視してよい

### ✅ テスト対象のlawId

**決定**: 段階的にテストを拡大

1. **初期段階**: 簡素な法令5件で基本機能を確認（完了）
2. **中期段階**: 複雑な法令（表、附則等を含む）を追加
3. **最終段階**: 全件テスト（100件以上）を実行

---

## 実装方針（ステップ2に向けて）

### 段階的な実装

1. **フェーズ1**: 最も単純な法令（条文のみ）から開始
2. **フェーズ2**: 徐々に複雑な要素（表、附則、別表等）に対応
3. **フェーズ3**: 各段階でテストを実行し、正確性を確認

### 推奨ツール

開発中に以下のツールがあると便利：
- XML → JSON変換ツール（構造を可視化）
- HTML差分ビューア（期待値と実際の出力を並べて表示）
- 要素別のカバレッジレポート（どの要素が実装済みか）

---

## 更新履歴

- 2026-01-01 10:00: 初版作成（プロジェクト概要、3ステップの詳細、不明点・提案をまとめ）
- 2026-01-01 10:15: 質問1-3への回答を反映、ステップ1の実装開始準備
- 2026-01-01 11:00: **ステップ1完了**（React SSRで5件のXMLから正解HTML生成成功）
- 2026-01-01 11:15: ドキュメント整理（重複削除、次のアクション更新）
- 2026-01-02 07:00: **ステップ2開始** - 方針変更（HTML逆算→Reactコード直接移植）
- 2026-01-02 07:20: **ステップ2基本実装完了** - Article, Paragraph, Item, Lawレンダリング関数実装、5件のHTML生成成功（SupplProvision等は未実装）
- 2026-01-02 07:30: **SupplProvision実装完了** - 附則のレンダリング関数追加、最も単純な法令でReact版と完全一致を確認！
- 2026-01-02 07:35: **Chapter/Part/Section実装完了** - 階層構造のレンダリング関数追加、複雑な法令のファイルサイズが大幅改善（92-98%）
- 2026-01-02 07:40: **TOC（目次）実装完了** - 9つのTOC関連レンダリング関数追加、行政手続法が95%一致（134KB/141KB）
- 2026-01-02 11:00: **HTMLフォーマッター実装** - js-beautifyを使用してHTMLを整形、差分比較が容易に
- 2026-01-02 11:05: **Subitem1～10実装完了** - 21個の号細分関連レンダリング函数追加、**4/5ファイルで100%一致達成！**（141AC0000000057、326AC1000000285、405AC0000000088、334AC0000000121）
- 2026-01-02 11:15: **Table/AppdxTable実装完了** - 11個の表関連レンダリング関数追加、**🎉 全5ファイルで100%一致達成！**（TableStruct構造の理解とParagraph内TableStruct処理により完全一致を実現）
- 2026-01-02 12:00: **ステップ3開始** - 全XMLファイル（10,514件）のテスト体制構築
  - テスト状態管理CSV作成（tests/test-status.csv）
  - 全XML一括React HTML生成スクリプト作成（バックグラウンド実行中）
  - 個別テストフロー作成（test-single-law.ts）
  - テスト統計ツール作成（update-test-status.ts）
  - npmスクリプト追加（test:single, test:next, test:stats）
- 2026-01-02 12:30: **初回テスト実行と問題発見** - 105DF0000000337でテスト実行
  - ✅ テーブルボーダースタイル問題修正（getBorderStyle関数をborder=undefinedでも動作するよう修正）
  - ✅ AppdxNote（別記）実装完了
  - ✅ RemarksLabel（備考ラベル）の空div出力問題修正
- 2026-01-06 06:00: **🎉 ステップ3完了 - 全10,514件のテストパス達成！**
  - ✅ テストリセット機能実装（reset-test-status.ts、test:reset）
  - ✅ 自動テスト実行機能実装（run-all-tests.ts、test:all）
    - 既にパスしたテストは自動スキップ
    - 連続失敗の上限設定（10回）
    - 100件ごとの進捗レポート表示
    - リアルタイム統計更新
  - ✅ 全10,514件のテストを完走し、100%パス達成（失敗: 0件、未テスト: 0件）
  - ✅ React SSR版とTypeScript版のHTML生成が完全に同一であることを実証
  - 📊 最終結果: **総テスト数: 10,514件 / パス: 10,514件 / 失敗: 0件 / 未テスト: 0件**
- 2026-01-07 06:00: **ドキュメント更新 - プロジェクトゴールの明確化**
  - プロジェクト概要を更新：Node.js検証→Webツールへの適用という正しいゴールを反映
  - ステップ1-3を「検証フェーズ」として明確化
  - ステップ4「Webツールへの適用」を追加（実装フェーズ）
  - 最終ゴール：ブラウザ環境でReact依存を完全除去
- 2026-01-08 07:00: **🎉 ステップ4完了 - WebツールからReactを完全削除！**
  - ✅ TypeScriptレンダラーをブラウザ環境に移植（src/api/typescript-renderer.ts）
  - ✅ src/api/law.tsxをReact componentから非同期関数loadLaw()に変換
  - ✅ src/api/main.tsxをReact.createRoot()からloadLaw()直接呼び出しに変更
  - ✅ React依存を完全削除（package.json、src/api/components/law/*.tsx（70ファイル））
  - ✅ バンドルサイズ27%削減（244 KiB → 179 KiB、65 KiB減）
  - ✅ コード量削減（6,966行削除、59行追加）
  - 📊 最終結果: **Reactを完全排除、TypeScriptのみでHTML生成を実現**
- 2026-01-08 07:10: **ステップ5追加 - ArithFormula Sub/Sup問題の解決**
  - KNOWN_ISSUES.mdの課題を解決するステップを追加
  - 化学式の下付き・上付き文字を正しく表示する品質改善フェーズ
