# ステップ3: 全テストケース実行ワークフロー

このドキュメントは、React版とTypeScript版のHTML出力が完全一致することを確認するための作業手順書です。**コンテキストを失っても、このファイルのみを見て作業を継続できる**ように設計されています。

---

## プロジェクトの目的

**Node.js環境で、XMLファイルから「React SSRが生成するHTML」と完全に同一のHTMLを、TypeScriptコード（Reactなし）で出力する。**

- React版のHTML出力を「正解データ」とする
- TypeScript版で同じHTMLを生成できるようにする
- 全10,514件の法令XMLファイルでテストを通過させる

---

## 現在の進捗状況（2026-01-03時点）

### ✅ 完了項目

- **ステップ1**: React SSR環境構築完了
  - 全10,514件のXMLファイルからReact HTML生成済み（`output/react-html-formatted/`）

- **ステップ2**: TypeScript版HTML生成関数実装完了（基本部分）
  - 主要な法令要素（Article, Paragraph, Item, Table, SupplProvision等）の実装完了
  - テスト対象5件で100%一致達成

### 🔄 進行中

- **ステップ3**: 全テストケース実行
  - 39件連続パス後、作業中断（コンテキスト保全のため）
  - 残り約10,475件

---

## テスト実行の基本フロー

### 1. 次のテストを実行

```bash
npm run test:next
```

このコマンドは：
1. `tests/test-status.csv` から次の未テスト法令を取得
2. TypeScript版HTMLを生成
3. React版HTMLと比較
4. 結果を表示

### 2. テスト結果の判定

#### ケースA: テスト成功 ✅

```
✅ PASSED - Files are identical!
✅ Test passed (N consecutive)
```

→ **何もせず、次のテストに進む**（`npm run test:next` を再実行）

#### ケースB: テスト失敗 ❌

```
❌ FAILED - Files differ
📋 First 50 lines of diff: ...
💾 Full diff saved to: tests/diffs/<lawId>.diff
```

→ **以下の「テスト失敗時の対処手順」に従う**

---

## テスト失敗時の対処手順

### ステップA: 差分を確認

```bash
# diffファイルを読む
cat tests/diffs/<lawId>.diff

# または、VSCodeで開く
code tests/diffs/<lawId>.diff
```

**差分の読み方**:

```diff
226d225
< <div class="_div_RemarksLabel"></div>
```
- `d` (delete) = React版にあるが、TypeScript版にない（**要素が欠落**）

```diff
227c227
< <div>text with space </div>
---
> <div>text without space</div>
```
- `c` (change) = 内容が異なる（**テキスト処理の違い**）

```diff
226a227
> <div class="extra">...</div>
```
- `a` (add) = TypeScript版にあるが、React版にない（**余分な要素**）

### ステップB: 欠落している要素を特定

差分からキーワードを抽出して、XMLを検索：

```bash
grep -A5 -B5 "キーワード" all_xml/<lawId>/<lawId>.xml
```

**例**:
```bash
grep -A5 -B5 "大小毎年替ルコトナシ" all_xml/105DF0000000337/105DF0000000337.xml
```

**出力例**:
```xml
<Remarks>
  <RemarksLabel/>
  <Sentence>大小毎年替ルコトナシ</Sentence>
</Remarks>
```

→ `Remarks` 要素（`RemarksLabel` + `Sentence`）が欠落していることが分かる

### ステップC: React版の実装を確認

XML要素名から、対応するReactコンポーネントを特定：

| XML要素名 | Reactコンポーネント | ファイルパス |
|----------|-------------------|------------|
| Remarks | LawRemarks | `src/api/components/law/remarks.tsx` |
| AppdxNote | LawAppdxNote | `src/api/components/law/appdx-note.tsx` |
| List | LawList | `src/api/components/law/list.tsx` |
| ArithFormula | （LawAny内で処理） | `src/api/components/law/any.tsx` |

命名規則: `Law{要素名}`

```bash
# Reactコンポーネントを読む
cat src/api/components/law/remarks.tsx
```

**確認ポイント**:
1. どのHTMLタグを出力しているか（`<div>`, `<section>`, `class`, `style`等）
2. 子要素をどの順番で処理しているか（`map`, `forEach`）
3. 条件分岐はあるか（`if`, `getParentElement`）
4. 特殊な処理（スペース追加 `{" "}`、条件付きレンダリング等）

### ステップD: TypeScript版の実装を確認・修正

#### D-1. TypeScript版の該当関数を探す

関数名の命名規則: `render{要素名}`（例: `Remarks` → `renderRemarks`）

```bash
# 該当関数を検索
grep -n "const renderRemarks" src/node-renderer/typescript-renderer.ts
```

見つからない場合 → **未実装**（新規作成が必要）

#### D-2. 関数を新規作成する場合

```typescript
/**
 * RemarksType配列をHTMLに変換
 * src/api/components/law/remarks.tsx の LawRemarks コンポーネントを再現
 */
const renderRemarks = (
  remarksList: RemarksType[],
  treeElement: string[]
): string => {
  return remarksList.map((dt, index) => {
    const addTreeElement = [...treeElement, `Remarks_${index}`];
    const RemarksLabel = getType<RemarksLabelType>(dt.Remarks, 'RemarksLabel');
    const Sentence = getType<SentenceType>(dt.Remarks, 'Sentence');

    let content = '';

    // RemarksLabelの処理（空divでも出力する）
    const remarksLabelText = RemarksLabel.length > 0
      ? renderTextNode(RemarksLabel[0].RemarksLabel, addTreeElement)
      : '';
    content += tag('div', { class: '_div_RemarksLabel' }, remarksLabelText);

    // Sentenceの処理
    content += renderSentence(Sentence, addTreeElement, false);

    return content;
  }).join('');
};
```

**React → TypeScript 変換ルール**:

| React | TypeScript |
|-------|-----------|
| `return <Component />` | `content += renderComponent(...)` |
| `{条件 && <div>...</div>}` | `if (条件) { content += tag('div', {}, ...); }` |
| `{list.map((dt) => <div>{dt}</div>)}` | `list.map((dt) => tag('div', {}, dt)).join('')` |
| `<Fragment>...</Fragment>` | 直接文字列を連結 |
| `className="foo"` | `{ class: 'foo' }` |
| `style={{ borderTop: '1px' }}` | `{ style: 'border-top:1px' }` |
| `{" "}` | `' '` |

#### D-3. 親関数から新しい関数を呼び出す

例: `renderTableStruct` 内で `Remarks` を処理する場合：

```typescript
// 修正前
if ('Table' in dt2) {
  content += renderTable(dt2, childTreeElement);
}

// 修正後
if ('Table' in dt2) {
  content += renderTable(dt2, childTreeElement);
} else if ('Remarks' in dt2) {
  content += renderRemarks([dt2], childTreeElement);
}
```

#### D-4. 必要な型をimport

```typescript
// ファイル冒頭のimport文に追加
import {
  // ...既存の型
  RemarksType,        // 新しく追加
  RemarksLabelType,   // 新しく追加
} from '../api/types/law';
```

型が既にimportされているか確認：
```bash
grep "RemarksType" src/node-renderer/typescript-renderer.ts
```

### ステップE: React側のバグを発見した場合の対応

**重要な原則: React版の出力が常に正解**

作業中に「これはReact側のバグではないか？」と思われる挙動を発見した場合でも、**必ずReact版の出力に100%合わせる**ことを最優先してください。

#### E-1. React側のバグと判断できるケース

以下のような場合、React側のバグの可能性があります：

1. **XML仕様と明らかに矛盾する出力**
   - 例: Sub/Supタグが削除される（ArithFormula問題）
   - 例: 必須要素が出力されない
   - **XML仕様の確認先**: `XMLSchemaForJapaneseLaw_v3.xsd`（プロジェクトルートに配置）

2. **論理的に不自然な処理**
   - 例: 属性値が常に空文字列になる
   - 例: 要素の順序が逆転している

3. **他の類似要素と一貫性がない**
   - 例: TableStructではRemarksが出力されるのに、FigStructでは出力されない

#### E-2. React側のバグ発見時の対応手順

**ステップ1**: まず、TypeScript側でReact版の出力を100%再現する

```typescript
// 例: React側がSub/Supタグを削除している場合
} else if ('ArithFormula' in dt) {
  // TODO: 【暫定対応】React側のバグを再現（KNOWN_ISSUES.md参照）
  // 本来は <sub class="Sub">{text}</sub> として出力すべき
  const arithContent = dt.ArithFormula.map((item: any) => {
    if ('Sub' in item) {
      return '';  // 【暫定】React側のバグを再現
    }
    // ...
  });
  return tag('div', { class: 'pl-4' }, arithContent);
}
```

**ステップ2**: KNOWN_ISSUES.mdに詳細を記録する

```bash
# KNOWN_ISSUES.mdを編集
code KNOWN_ISSUES.md
```

記録すべき内容：

```markdown
## [要素名] [問題の簡潔な説明]

### 問題の概要

（何が起きているか、1-2文で説明）

### 詳細

**XML構造（e-gov API）:**
```xml
（該当するXML構造）
```

**本来あるべきHTML:**
```html
（正しいと思われるHTML出力）
```

**実際のReact SSR出力:**
```html
（実際にReact版が出力しているHTML）
```

（問題点の説明）

### 原因

（推測される原因。例: beautify処理、条件分岐の漏れ等）

### 現在の暫定対応

**影響範囲:**
- `src/node-renderer/typescript-renderer.ts` の `renderXxx` 関数（XXX-YYY行）

**対応内容:**
- TypeScript版でもReact版のバグを再現して100%一致させている
- 本来はXML仕様に従い、正しく出力すべき

**コード:**
```typescript
（該当するTypeScriptコード）
```

### 将来の対応方針

1. **React SSR側の修正:**
   （React側でどう修正すべきか）

2. **TypeScript側の修正:**
   （React修正後、TypeScript側でどう対応するか）

3. **テストの更新:**
   （テストケースの更新内容）

### 参考情報

- **影響を受けるテストケース:** `<lawId>`
- **関連ファイル:**
  - （関連するファイルのリスト）
- **XML仕様書:** `XMLSchemaForJapaneseLaw_v3.xsd`（プロジェクトルートに配置）

### 備考

この問題は、現在のプロジェクト目的である「React SSR出力との完全一致」のために暫定的に対応していますが、将来的には正しいHTML出力に戻すべきです。
```

**ステップ3**: テストを実行して100%一致を確認

```bash
npm run test:single <lawId>
```

**ステップ4**: 次のテストに進む

バグを記録したら、そのまま作業を継続します。React側のバグ修正は**別タスク**として扱います。

#### E-3. 重要な注意事項

- ❌ **やってはいけないこと**: React側のバグだと判断して、TypeScript側で「正しい」実装をする
- ✅ **やるべきこと**: React側のバグでも100%再現し、KNOWN_ISSUES.mdに記録する

**理由**:
1. React版が「正解データ」として定義されている
2. 将来的にReact版を修正する際、KNOWN_ISSUES.mdが仕様書になる
3. TypeScript版が勝手に「正しい」実装をすると、差分が生まれてテストが通らない

### ステップF: 修正後の再テスト

```bash
npm run test:single <lawId>
```

- ✅ **PASSED**: 成功！ → `npm run test:next` で次のテストに進む
- ❌ **FAILED**: diffが減っているか確認 → ステップAに戻る

---

## よくある実装パターン

### パターン1: 要素が完全に欠落している

**症状**: `<div class="_div_Foo">...</div>` が TypeScript版に存在しない

**原因**: `renderFoo` 関数が未実装、または親関数から呼ばれていない

**解決策**:
1. React版のコンポーネントを確認（`src/api/components/law/foo.tsx`）
2. `renderFoo` 関数を作成
3. 親関数に `else if ('Foo' in dt2) { content += renderFoo(...); }` を追加

### パターン2: スペースや改行の違い

**症状**: `<div>text </div>` vs `<div>text</div>`

**原因**: React版で `{" "}` を追加している

**解決策**:
```typescript
// React版
return <div>{text}{" "}</div>;

// TypeScript版
return tag('div', {}, text + ' ');
```

### パターン3: 属性値が空になっている

**症状**: `<td style="">` vs `<td style="border-top:solid 1px">`

**原因**: `undefined` チェックでデフォルト値を使っていない

**解決策**:
```typescript
// 修正前
const borderTop = border?.BorderTop || '';

// 修正後
const borderTop = border?.BorderTop ?? 'solid';  // デフォルト値を使用
```

### パターン4: dt.Item配列のループ漏れ

**症状**: Item内のList, TableStruct等が出力されない

**原因**: `dt.Item.forEach((dt2) => ...)` でループしていない

**解決策**:
```typescript
// React版
{dt.Item.map((dt2) => {
  if ("List" in dt2) {
    return <LawList ... />;
  }
})}

// TypeScript版
dt.Item.forEach((dt2) => {
  if ('List' in dt2) {
    content += renderList([dt2], ...);
  }
});
```

### パターン5: 親要素による条件分岐

**症状**: 同じ要素でも親によって出力が異なる

**原因**: `getParentElement(treeElement)` による条件分岐

**解決策**:
```typescript
const parentElement = getParentElement(treeElement);

if (parentElement === 'Remarks') {
  // Remarks内の場合の処理
  return tag('div', {}, text + ' ');  // 末尾にスペース
} else {
  // それ以外
  return tag('div', {}, text);
}
```

---

## 既知の問題と暫定対応

### ArithFormula Sub/Supタグ削除問題

**問題**: React SSR生成のHTMLでは、ArithFormula内のSub/Supタグとその内容が削除される

**暫定対応**: TypeScript版でも同様に削除する（`src/node-renderer/typescript-renderer.ts` 180-201行）

```typescript
} else if ('ArithFormula' in dt) {
  // TODO: 【暫定対応】React SSR（beautify処理）がSub/Supタグとその内容を削除している
  // 将来的には <sub class="Sub">{text}</sub> として出力すべき
  const arithContent = dt.ArithFormula.map((item: any) => {
    if ('Sub' in item) {
      return '';  // 【暫定】内容を削除
    } else if ('Sup' in item) {
      return '';  // 【暫定】内容を削除
    } else if ('_' in item) {
      return item._;
    }
    return '';
  }).join('');
  return tag('div', { class: 'pl-4' }, arithContent);
}
```

**参考**: `KNOWN_ISSUES.md` に詳細を記載

---

## 便利なコマンド

### テスト関連

```bash
# 次の未テスト法令をテスト
npm run test:next

# 特定の法令IDをテスト
npm run test:single <lawId>

# テスト統計を表示
npm run test:stats
```

### デバッグ用

```bash
# React版HTMLの該当箇所を表示
grep -A10 -B10 "キーワード" output/react-html-formatted/<lawId>.html

# TypeScript版HTMLの該当箇所を表示
grep -A10 -B10 "キーワード" output/typescript-html-formatted/<lawId>.html

# XMLから要素を検索
grep -A5 -B5 "キーワード" all_xml/<lawId>/<lawId>.xml

# XML仕様書で要素定義を確認
grep -A10 "name=\"<ElementName>\"" XMLSchemaForJapaneseLaw_v3.xsd

# Reactコンポーネントを確認
cat src/api/components/law/<component>.tsx

# TypeScript版の関数を検索
grep -n "const render<Element>" src/node-renderer/typescript-renderer.ts
```

### ファイル構造確認

```bash
# React版HTMLのサイズ確認
ls -lh output/react-html-formatted/<lawId>.html

# diffファイル一覧
ls tests/diffs/

# テスト状態CSV確認
cat tests/test-status.csv | grep "passed\|failed"
```

---

## 主要なファイル構成

### 入力データ
- `all_xml/**/*.xml` - 全10,514件の法令XMLファイル

### 正解データ（React版）
- `output/react-html-formatted/*.html` - React SSRで生成したHTML（正解）

### テスト対象（TypeScript版）
- `src/node-renderer/typescript-renderer.ts` - TypeScript版HTML生成関数（**修正対象**）
- `output/typescript-html-formatted/*.html` - TypeScript版で生成したHTML

### テストツール
- `src/node-renderer/test-single-law.ts` - 個別テスト実行スクリプト
- `tests/test-status.csv` - テスト状態管理ファイル
- `tests/diffs/*.diff` - 差分ファイル（テスト失敗時）

### 参考資料
- `src/api/components/law/*.tsx` - React版コンポーネント（**仕様書**）
- `XMLSchemaForJapaneseLaw_v3.xsd` - XML仕様書（プロジェクトルート）
- `REACT_MIGRATION_PLAN.md` - プロジェクト全体計画
- `TEST_FAILURE_WORKFLOW.md` - 詳細なデバッグ手順
- `KNOWN_ISSUES.md` - 既知の問題リスト

---

## 実装済み関数リスト（2026-01-03時点）

以下の関数は既に実装済みです：

### 基本要素
- `renderTextNode()` - テキストノード（Ruby、Line、Sup/Sub等）
- `renderSentence()` - 文
- `renderColumn()` - Column要素
- `tag()` - HTMLタグ生成ヘルパー

### 項・号・細分
- `renderParagraph()`, `renderParagraphSentence()` - 項
- `renderItem()`, `renderItemSentence()` - 号
- `renderSubitem1()` ～ `renderSubitem10()` - 号細分1～10
- `renderSubitem1Sentence()` ～ `renderSubitem10Sentence()` - 号細分文1～10

### 条・章・節・編
- `renderArticle()` - 条
- `renderSection()` - 節
- `renderChapter()` - 章
- `renderPart()` - 編

### 本則・附則
- `renderMainProvision()` - 本則
- `renderSupplProvision()` - 附則

### 表
- `renderTable()` - 表全体
- `renderTableRow()`, `renderTableColumn()` - 表項・表欄
- `renderTableHeaderRow()`, `renderTableHeaderColumn()` - 表欄名
- `renderTableStruct()` - 表構造
- `renderAppdxTable()` - 別表
- `renderSupplProvisionAppdxTable()` - 附則別表
- `getBorderStyle()` - テーブルボーダースタイル生成

### 目次
- `renderTOC()` - 目次全体
- `renderTOCPart()`, `renderTOCChapter()`, `renderTOCSection()` - 目次編・章・節
- `renderTOCArticle()`, `renderTOCSupplProvision()` - 目次条・附則

### 別記・書式・様式
- `renderAppdxNote()` - 別記
- `renderNoteStruct()` - 別記構造
- `renderAppdxFormat()` - 別記書式
- `renderFormatStruct()` - 書式構造
- `renderAppdxStyle()` - 別記様式
- `renderStyleStruct()` - 様式構造

### 図・備考
- `renderFig()` - 図（画像、PDF）
- `renderFigStruct()` - 図構造
- `renderRemarks()` - 備考
- `renderRelatedArticleNum()` - 関係条文番号

### List
- `renderList()` - 列記
- `renderListSentence()` - 列記文

### その他
- `renderLaw()` - 法令全体
- `renderLawBody()` - 法令本文
- `getParentElement()` - 親要素取得ヘルパー
- `getType()` - 要素フィルタヘルパー

---

## 作業の心構え

### ✅ 原則

1. **React版が仕様書** - 常にReact版のコードを参考にする
2. **React版の出力が常に正解** - React側にバグがあっても100%再現する
3. **一つずつ修正** - 複数の問題があっても、一つずつ修正してテスト
4. **100%精度を目指す** - バイト単位で完全一致するまで妥協しない
5. **コメントを残す** - なぜその処理が必要か、React版のどの部分に対応するかを記録
6. **バグを記録する** - React側のバグを発見したら、KNOWN_ISSUES.mdに記録する

### ✅ 効率的な進め方

1. **連続実行**: テスト成功が続く限り `npm run test:next` を繰り返す
2. **失敗時は集中**: 一つの失敗を完全に解決してから次に進む
3. **パターンを学習**: 同じ種類のエラーが出たら、前回の修正を参考にする
4. **定期的な休憩**: 長時間作業する場合は、定期的に統計を確認（`npm run test:stats`）

### ✅ トラブルシューティング

- **要素が見つからない**: `grep` でReactコンポーネントを探す
- **属性値が違う**: React版のJSXで `className`, `style` を確認
- **順序が違う**: React版で `map` の順番を確認
- **条件分岐**: `getParentElement` や `if` 文を確認

---

## 進捗の記録方法

修正を加えたら、このドキュメントの「現在の進捗状況」セクションを更新してください：

```markdown
### 🔄 進行中

- **ステップ3**: 全テストケース実行
  - N件連続パス（最終テスト: <lawId>）
  - 最近実装した要素: Foo, Bar（<lawId>で必要だった）
  - 残り約X件
```

---

## 最後に

このワークフローに従えば、**コンテキストを失っても作業を再開できます**。

1. このファイルを開く
2. 「テスト実行の基本フロー」に従って `npm run test:next` を実行
3. 失敗したら「テスト失敗時の対処手順」に従う
4. 成功したら次のテストに進む

**目標: 全10,514件のテストケースを通過させる！**
