# React脱却プロジェクト - タスク管理ドキュメント

## プロジェクト概要

現在、統合法令閲覧システムではe-gov法令APIからXMLデータを取得し、Reactを使ってHTMLをレンダリングした後、そのHTMLを通常のJavaScriptで処理する構造になっています。このプロジェクトの目的は、**Reactを完全に脱却し、Node.js（TypeScript）で同じHTMLを出力できるようにする**ことです。

### 現在のフロー

```
e-gov API (XML)
  → XMLParser (fast-xml-parser)
  → React Components (src/api/components/law/*.tsx)
  → HTML生成 (#app.innerHTML)
  → parseLaw() で加工
  → window.showLawViewer() に渡す
  → ビューア表示
```

### 目指すフロー

```
ローカルXMLファイル (all_xml/**/*.xml)
  → XMLParser
  → TypeScript変換関数（Reactなし）
  → HTML出力
  → 既存のビューアで表示
```

## 最終ゴール

**Node.js環境（ブラウザなし）でXMLファイルから「これまでのReactが生成していたHTML」と完全に同一のHTMLを出力できるTypeScriptコードを作成する。**

---

## 実装の3ステップ

### ステップ1: Node.jsでReactのHTML出力を再現する環境構築 ✅ **完了**

**目的**: 現在のReact実装をNode.js環境で動作させ、XMLファイルから「これまでのHTML」を出力できるようにする

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

### ステップ2: TypeScriptでHTMLを出力する新実装 🔄 **進行中**

**目的**: Reactを使わずに、純粋なTypeScriptでXMLからHTMLを生成する

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
- `renderItem()` - 号のHTML変換
- `renderParagraph()` - 項のHTML変換
- `renderArticle()` - 条のHTML変換
- `renderSection()` - **節のHTML変換（NEW!）**
- `renderChapter()` - **章のHTML変換（NEW!）**
- `renderPart()` - **編のHTML変換（NEW!）**
- `renderMainProvision()` - 本則のHTML変換
- `renderSupplProvision()` - 附則のHTML変換
- `renderArticleRange()` - **条範囲のHTML変換（NEW!）**
- `renderTOCArticle()` - **目次条のHTML変換（NEW!）**
- `renderTOCSection()` - **目次節のHTML変換（NEW!）**
- `renderTOCChapter()` - **目次章のHTML変換（NEW!）**
- `renderTOCPart()` - **目次編のHTML変換（NEW!）**
- `renderTOCSupplProvision()` - **目次附則のHTML変換（NEW!）**
- `renderTOCAppdxTableLabel()` - **目次別表ラベルのHTML変換（NEW!）**
- `renderTOC()` - **目次全体のHTML変換（NEW!）**
- `renderLawBody()` - 法令本文のHTML変換
- `renderLaw()` - 法令全体のHTML変換

**未実装要素**（現在スキップ中）:
- ✅ ~~SupplProvision（附則）~~ - **実装完了！**
- ✅ ~~Chapter（章）、Part（編）、Section（節）~~ - **実装完了！**
- ✅ ~~TOC（目次）~~ - **実装完了！**
- Preamble（前文）、EnactStatement（制定文） - 一部の法令に必要 ⚠️ 優先度：中
- AppdxTable（別表）、AppdxNote（別記）、Appdx（別図）等 - 附則の付属要素 ⚠️ 優先度：中
- Table（表）、QuoteStruct（引用）、ArithFormula（算術式） - 特定の法令に必要 ⚠️ 優先度：低

**進捗状況**:
- ✅ **最も単純な法令（141AC0000000057）でReact版とTypeScript版が完全一致！**
  - ファイルサイズ: 両方とも18KB
  - `diff`コマンドで確認済み - 差分なし
  - TOC実装後も一致を維持
- ✅ 複雑な法令のファイルサイズが大幅改善
  - 323AC0000000075: React版101KB、TypeScript版79KB（**78%**）
  - 326AC1000000285: React版135KB、TypeScript版133KB（**99%**）
  - 405AC0000000088: React版141KB、TypeScript版134KB（**95%**）
  - 334AC0000000121: React版1.2MB、TypeScript版1.1MB（**92%**）
- ⏳ 約5-20KBの差があり、まだ未実装要素がある

---

### ステップ3: HTMLの同一性テスト ⏳ **未着手**

**目的**: ステップ1で生成した「これまでのHTML」とステップ2で生成した「新しいHTML」が同一であることを確認する

**タスク**:
1. HTML比較ロジックの実装
2. 複数のlawIdで一括テストを実行
3. 差分がある場合、詳細なdiffを出力
4. テストが通るまでステップ2のコードを修正
5. 全テスト通過を確認

**成果物**（予定）:
- `tests/html-comparison.test.ts` - HTML比較テスト
- テストレポート

---

## 現在の進捗状況

### ✅ 完了（ステップ1）
- ✅ プロジェクト概要の理解
- ✅ XMLファイルの存在確認（all_xml/フォルダに100件以上）
- ✅ XMLスキーマファイルの確認（XMLSchemaForJapaneseLaw_v3.xsd）
- ✅ 既存のReactコンポーネント構造の把握（src/api/components/law/*.tsx）
- ✅ 既存のAPI処理の理解（src/api/lib/api/get-law-data.ts）
- ✅ parseLaw関数の理解（src/api/law.tsx: 114-1056行）
- ✅ **ステップ1: Node.jsでReact SSR環境構築**
  - ✅ テスト対象XMLファイル選定完了（5件）
  - ✅ React SSRスクリプト作成完了
  - ✅ parseLaw関数のNode.js移植完了
  - ✅ 5件のXMLから正解HTML生成完了（18KB〜1.2MB）

### 🎯 次のアクション

**ステップ2の開始準備**:
1. 最も単純な法令（141AC0000000057: 386行）からTypeScript実装を開始
2. Reactコンポーネントの構造を分析し、XML→HTMLのマッピング表を作成
3. 基本的な法令要素（Article, Paragraph, Item）の変換関数を実装
4. 段階的に複雑な要素（Table, SupplProvision等）を追加

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
