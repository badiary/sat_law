# テスト失敗時の対処ワークフロー

このドキュメントは、React版とTypeScript版のHTML出力が一致しない場合の調査・修正手順をまとめたものです。

## 前提

- テストスクリプト: `npm run test:single <lawId>` または `npm run test:next`
- テスト失敗時、差分ファイルが `tests/diffs/<lawId>.diff` に保存される
- React版HTML: `output/react-html-formatted/<lawId>.html`
- TypeScript版HTML: `output/typescript-html-formatted/<lawId>.html`

## ステップ1: diffで両者のHTMLの差分を確認する

### 1-1. 差分ファイルを読む

```bash
cat tests/diffs/<lawId>.diff
```

または、VSCodeでファイルを開いて確認。

### 1-2. 差分の種類を特定する

差分には主に以下のパターンがあります：

#### パターンA: 要素が完全に欠落している

```diff
226,227d225
< <div class="_div_RemarksLabel"></div>
< <div>大小毎年替ルコトナシ </div>
```

- `d` (delete) = React版にはあるが、TypeScript版にはない
- **原因**: TypeScript版でその要素のレンダリング処理が未実装、または条件分岐漏れ

#### パターンB: 要素の内容が異なる

```diff
227c227
< <div>大小毎年替ルコトナシ </div>
---
> <div>大小毎年替ルコトナシ</div>
```

- `c` (change) = 両方にあるが内容が異なる
- **原因**: テキスト処理の違い（スペース、改行、変換ロジック等）

#### パターンC: 属性値が異なる

```diff
< <td style="border-top:black solid 1px;...">
---
> <td style="">
```

- **原因**: 属性値の生成ロジックが異なる、またはデフォルト値の扱いが異なる

#### パターンD: 要素が余分にある

```diff
226a227,228
> <div class="extra">...</div>
```

- `a` (add) = TypeScript版にはあるが、React版にはない
- **原因**: TypeScript版で余分な処理をしている

### 1-3. 差分の行番号から該当箇所を特定

```bash
# React版の該当行周辺を表示
sed -n '220,235p' output/react-html-formatted/<lawId>.html

# TypeScript版の該当行周辺を表示
sed -n '220,235p' output/typescript-html-formatted/<lawId>.html
```

### 1-4. HTML構造から要素名・クラス名を特定

例えば、以下の差分がある場合：

```html
<div class="_div_RemarksLabel"></div>
<div>大小毎年替ルコトナシ </div>
```

- クラス名: `_div_RemarksLabel`
- 親要素のクラス名やタグから、これが`Remarks`要素であることを推測
- 法令XML要素名を推測: `Remarks` → `RemarksLabel` + `Sentence`

## ステップ2: 元となった法令XMLの関連箇所を確認する

### 2-1. キーワードでXMLを検索

差分に含まれるテキストをキーワードとして、XMLファイルから該当箇所を探します。

```bash
grep -A 5 -B 5 "大小毎年替ルコトナシ" all_xml/<lawId>/<lawId>.xml
```

**出力例:**

```xml
</TableColumn>
</TableRow>
</Table>
<Remarks>
  <RemarksLabel/>
  <Sentence>大小毎年替ルコトナシ</Sentence>
</Remarks>
</TableStruct>
```

### 2-2. XML階層構造を確認

上記の例から、以下の構造が分かります：

```
TableStruct
  └─ Table
  └─ Remarks
       └─ RemarksLabel (空)
       └─ Sentence
```

### 2-3. より広い範囲を確認（必要に応じて）

```bash
# 前後10行を表示
grep -A 10 -B 10 "大小毎年替ルコトナシ" all_xml/<lawId>/<lawId>.xml

# 特定タグで囲まれた範囲を表示
sed -n '/<TableStruct>/,/<\/TableStruct>/p' all_xml/<lawId>/<lawId>.xml | head -50
```

### 2-4. 親要素の特定

XMLの階層から、どのコンポーネントがこの要素を処理すべきかを特定します。

例:
- `AppdxTable` > `TableStruct` > `Remarks` の場合
- React側では `LawAppdxTable` → `LawTableStruct` → `LawRemarks` の順で処理

## ステップ3: React版とTypeScript版のソースコードを確認・修正

### 3-1. React版のコンポーネントを特定

XML要素名から対応するReactコンポーネントを特定します：

| XML要素名 | Reactコンポーネント | ファイルパス |
|----------|-------------------|------------|
| AppdxTable | LawAppdxTable | src/api/components/law/appdx-table.tsx |
| TableStruct | LawTableStruct | src/api/components/law/table-struct.tsx |
| Remarks | LawRemarks | src/api/components/law/remarks.tsx |
| Sentence | LawSentence | src/api/components/law/sentence.tsx |
| Article | LawArticle | src/api/components/law/article.tsx |
| Paragraph | LawParagraph | src/api/components/law/paragraph.tsx |
| Item | LawItem | src/api/components/law/item.tsx |

命名規則: `Law{要素名}` （例: `AppdxNote` → `LawAppdxNote`）

### 3-2. React版のソースコードを読む

```bash
# 該当コンポーネントを読む
cat src/api/components/law/table-struct.tsx
```

**重要なポイント:**

1. **要素の処理順序**: `map`や`forEach`でどの順番で子要素を処理しているか
2. **条件分岐**: `if ("Table" in dt2)` のような条件でどの要素を処理しているか
3. **出力内容**: どのHTMLタグを出力しているか（`<div>`, `<section>`, 属性等）
4. **特殊な処理**: スペース追加（`{" "}`）、条件付きレンダリング、親要素判定等

**React版の例（table-struct.tsx）:**

```tsx
{dt.TableStruct.map((dt2, index2) => {
  if ("Table" in dt2) {
    return (
      <LawTable
        key={`${addTreeElement(index, index2).join("_")}`}
        table={dt2}
        treeElement={addTreeElement(index, index2)}
      />
    );
  } else if ("Remarks" in dt2) {
    return (
      <LawRemarks
        key={`${addTreeElement(index, index2).join("_")}`}
        remarksList={[dt2]}
        treeElement={addTreeElement(index, index2)}
      />
    );
  }
})}
```

### 3-3. TypeScript版の該当関数を特定

TypeScript版は `src/node-renderer/typescript-renderer.ts` に全て実装されています。

関数名の命名規則: `render{要素名}` （例: `AppdxTable` → `renderAppdxTable`）

```bash
# 該当関数を検索
grep -n "const renderAppdxTable" src/node-renderer/typescript-renderer.ts

# 関数全体を表示（行番号が分かっている場合）
sed -n '1713,1790p' src/node-renderer/typescript-renderer.ts
```

### 3-4. React版とTypeScript版を比較

#### 比較ポイント1: 子要素の処理漏れ

**React版:**
```tsx
if ("Table" in dt2) {
  return <LawTable ... />;
} else if ("Remarks" in dt2) {
  return <LawRemarks ... />;
}
```

**TypeScript版（誤り）:**
```typescript
if ('Table' in dt2) {
  content += renderTable(dt2, childTreeElement);
}
// Remarksの処理が無い！
```

**修正方法**: React版と同じ条件分岐を追加

```typescript
if ('Table' in dt2) {
  content += renderTable(dt2, childTreeElement);
} else if ('Remarks' in dt2) {
  content += renderRemarks([dt2], childTreeElement);
}
```

#### 比較ポイント2: 別コンポーネントへの委譲

**React版:**
```tsx
else if ("TableStruct" in dt2) {
  return (
    <LawTableStruct
      tableStructList={[dt2]}
      treeElement={addTreeElement(index, index2)}
    />
  );
}
```

これは`LawTableStruct`コンポーネントに処理を委譲しています。

**TypeScript版（誤り）:**
```typescript
else if ('TableStruct' in dt2) {
  const Table = getType<TableType>(dt2.TableStruct, 'Table');
  if (Table.length > 0) {
    content += renderTable(Table[0], childTreeElement);
  }
  // TableStruct内のRemarksが処理されない！
}
```

**修正方法**: 対応する`renderTableStruct`関数を作成して呼び出す

```typescript
else if ('TableStruct' in dt2) {
  content += renderTableStruct([dt2], childTreeElement);
}
```

そして、`renderTableStruct`関数を新規作成：

```typescript
const renderTableStruct = (
  tableStructList: TableStructType[],
  treeElement: string[]
): string => {
  return tableStructList.map((dt, index) => {
    // React版のLawTableStructと同じ処理を実装
    ...
  }).join('');
};
```

#### 比較ポイント3: テキスト処理の違い

**React版（sentence.tsx）:**
```tsx
if (getParentElement(treeElement) == "Remarks") {
  return (
    <div>
      {getTextNode(dt.Sentence, addTreeElement(index))}{" "}
    </div>
  );
}
```

`{" "}` = 末尾にスペースを追加

**TypeScript版（修正前）:**
```typescript
content += tag('div', {}, renderTextNode(sentence.Sentence, addTreeElement));
```

**修正後:**
```typescript
content += tag('div', {}, renderTextNode(sentence.Sentence, addTreeElement) + ' ');
```

#### 比較ポイント4: 属性値の生成

**React版:**
```tsx
style={{
  borderTop: `black ${border?.BorderTop ?? 'solid'} 1px`,
  ...
}}
```

`border?.BorderTop ?? 'solid'` = `border`が`undefined`の場合は`'solid'`を使用

**TypeScript版（修正前）:**
```typescript
const getBorderStyle = (border: TableColumnAttributeType | undefined): string => {
  if (border) {
    // borderがundefinedの場合、何も出力しない
    ...
  }
  return '';
};
```

**修正後:**
```typescript
const getBorderStyle = (border: TableColumnAttributeType | undefined): string => {
  const styles: string[] = [];
  // borderがundefinedでも常に出力（デフォルト値を使用）
  styles.push(`border-top:black ${border?.BorderTop ?? 'solid'} 1px`);
  ...
  return styles.join(';');
};
```

### 3-5. TypeScript版を修正

1. **必要な型をimport**

```typescript
import {
  TableStructType,  // 新しく使う型を追加
  ...
} from '../api/types/law';
```

型は既にimportされているか確認：

```bash
grep "TableStructType" src/node-renderer/typescript-renderer.ts
```

2. **関数を実装**

React版のコンポーネントロジックをTypeScript関数に変換：

- `return <Component />` → `content += renderComponent(...)`
- `{条件 && <div>...</div>}` → `if (条件) { content += tag('div', {}, ...); }`
- `{list.map(...)}` → `list.map(...).join('')`
- `<Fragment>...</Fragment>` → 直接文字列を連結
- JSX属性 → オブジェクト形式（`{ class: '...', style: '...' }`）

3. **関数を呼び出し元に追加**

修正した関数を、親関数から呼び出すように修正。

### 3-6. 修正後の再テスト

```bash
npx tsx src/node-renderer/test-single-law.ts <lawId>
```

- ✅ **PASSED**: 次のテストに進む
- ❌ **FAILED**: 差分が減っているか確認し、ステップ1に戻る

## デバッグのヒント

### ヒント1: 出力の最小単位から確認

複雑な構造の場合、最も内側の要素から順に確認していく。

例: `AppdxTable` > `TableStruct` > `Remarks` > `Sentence`
→ まず`Sentence`が正しく出力されるか確認
→ 次に`Remarks`が正しく出力されるか確認
→ 最後に`TableStruct`の中で`Remarks`が呼ばれているか確認

### ヒント2: React HTMLの該当箇所を確認

```bash
# キーワードで検索して前後10行を表示
grep -A 10 -B 10 "大小毎年替ルコトナシ" output/react-html-formatted/<lawId>.html
```

この出力から、期待されるHTML構造を確認できます。

### ヒント3: `LawAny`コンポーネントの処理

`LawAny`は全ての法令要素を処理する汎用コンポーネントです（`src/api/components/law/any.tsx`）。

あるコンポーネントが`<LawAny lawTypeList={...} parentElement="Note" />`のように`LawAny`を呼んでいる場合、`any.tsx`を確認して、どの要素が処理されるかを確認します。

**重要**: `LawAny`に処理が無い要素は、空のFragmentを返します（何も出力されない）。

### ヒント4: `getParentElement`による条件分岐

一部のコンポーネント（特に`LawSentence`）は、親要素によって出力を変えます。

```tsx
if (getParentElement(treeElement) == "Remarks") {
  // Remarks内の場合の処理
} else {
  // それ以外の場合の処理
}
```

TypeScript版でこれを再現する場合、`treeElement`配列の最後の要素を確認：

```typescript
const parentElement = treeElement[treeElement.length - 1];
if (parentElement.includes('Remarks')) {
  // Remarks内の処理
}
```

### ヒント5: 空要素の扱い

React版では、要素が空でも`<div></div>`を出力する場合があります。

```tsx
{RemarksLabel.length > 0 && (
  <div>{getTextNode(RemarksLabel[0].RemarksLabel, ...)}</div>
)}
```

これは「RemarksLabelがある場合のみdivを出力」。

しかし、以下の場合は常にdivを出力：

```tsx
<div>
  {RemarksLabel.length > 0 && getTextNode(RemarksLabel[0].RemarksLabel, ...)}
</div>
```

TypeScript版でも同じ動作にする：

```typescript
// 条件付きでdivを出力
if (RemarksLabelArray.length > 0) {
  content += tag('div', {}, renderTextNode(RemarksLabelArray[0].RemarksLabel, ...));
}

// 常にdivを出力（中身は条件付き）
const remarksLabelText = RemarksLabelArray.length > 0
  ? renderTextNode(RemarksLabelArray[0].RemarksLabel, ...)
  : '';
content += tag('div', { class: '_div_RemarksLabel' }, remarksLabelText);
```

## よくある問題パターンと解決策

### 問題1: 要素が完全に欠落している

**原因**: TypeScript版でその要素の処理が未実装

**解決策**:
1. React版の該当コンポーネントを読む
2. TypeScript版に対応する`render{要素名}`関数を作成
3. 親関数から呼び出す

### 問題2: 要素の順序が違う

**原因**: React版とTypeScript版で`forEach`/`map`の順序が違う、または一部の要素を先に処理している

**解決策**:
1. React版のコンポーネントで要素が出力される順序を確認
2. TypeScript版も同じ順序で`content +=`を実行

### 問題3: スペースや改行の違い

**原因**: React版で`{" "}`や`{"\n"}`を追加している

**解決策**:
1. React版のコードで`{" "}`や`{"\n"}`を探す
2. TypeScript版でも同じ箇所に` `や`\n`を追加

### 問題4: 属性値が空になっている

**原因**: 属性値生成時に`undefined`をチェックして何も出力していない

**解決策**:
1. React版でデフォルト値を使っているか確認（`??`演算子）
2. TypeScript版でもデフォルト値を使用

### 問題5: クラス名が違う

**原因**: TypeScript版でハードコードされたクラス名が間違っている

**解決策**:
1. React版のJSXで`className="..."`を確認
2. TypeScript版の`class: '...'`を修正

## まとめ

テスト失敗時の基本フロー：

```
1. diff確認 → 何が違うかを特定
    ↓
2. XML確認 → 元データの構造を理解
    ↓
3. React版確認 → 正しい仕様を理解
    ↓
4. TypeScript版修正 → React版に合わせる
    ↓
5. 再テスト → 一致するまで繰り返す
```

**重要な原則**:

- ✅ **React版のコードが仕様書** - 常にReact版を参考にする
- ✅ **一つずつ修正** - 複数の問題がある場合も、一つずつ修正してテスト
- ✅ **コメントを残す** - なぜその処理が必要か、React版のどの部分に対応するかをコメントで記録
- ✅ **100%精度を目指す** - バイト単位で完全一致するまで妥協しない
