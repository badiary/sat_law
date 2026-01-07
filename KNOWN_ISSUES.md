# 既知の問題リスト

このファイルは、プロジェクトで認識されている技術的な問題や暫定対応をドキュメント化したものです。

## ArithFormula Sub/Supタグ削除問題

### 問題の概要

化学式などを表すArithFormula要素において、React SSR生成のHTMLではSub（下付き文字）およびSup（上付き文字）タグとその内容が完全に削除されています。

### 詳細

**XML構造（e-gov API）:**
```xml
<ArithFormula>分子式：Ｃ<Sub>ｘ</Sub>Ｈ<Sub>（２ｘ－ｙ＋２）</Sub>Ｃｌ<Sub>ｙ</Sub>（ｘ＝１０～１３、ｙ＝１～１３のものに限る。）</ArithFormula>
```

**本来あるべきHTML:**
```html
<div class="pl-4">分子式：Ｃ<sub class="Sub">ｘ</sub>Ｈ<sub class="Sub">（２ｘ－ｙ＋２）</sub>Ｃｌ<sub class="Sub">ｙ</sub>（ｘ＝１０～１３、ｙ＝１～１３のものに限る。）</div>
```

**実際のReact SSR出力:**
```html
<div class="pl-4">分子式：ＣＨＣｌ（ｘ＝１０～１３、ｙ＝１～１３のものに限る。）</div>
```

Sub/Supタグとその内容（"ｘ", "（２ｘ－ｙ＋２）", "ｙ"）が完全に削除されています。

### 原因

React SSR生成プロセス（特にbeautify処理）において、Sub/Supタグが不明なタグとして削除され、その際に内容も一緒に削除されている可能性があります。

具体的には、以下のプロセスが疑われます：
1. React側でArithFormula要素をレンダリング
2. 生成されたHTMLに対してjs-beautify（v1.15.4）を実行
3. beautifyプロセスでSub/Supタグが不正なタグとして削除される
4. タグの内容も一緒に削除される

### 現在の暫定対応

**影響範囲:**
- `src/node-renderer/typescript-renderer.ts` の `renderTextNode` 関数（180-201行）

**対応内容:**
- TypeScript版のレンダラーでも、Sub/Supタグの内容を完全に削除してReact HTMLと一致させる
- 本来はXML仕様に従い、`<sub class="Sub">` および `<sup class="Sup">` として適切にレンダリングすべき

**コード:**
```typescript
} else if ('ArithFormula' in dt) {
  const arithContent = dt.ArithFormula.map((item: any) => {
    if ('Sub' in item) {
      // 【暫定】Subタグとその内容を完全削除
      return '';
    } else if ('Sup' in item) {
      // 【暫定】Supタグとその内容を完全削除
      return '';
    } else if ('_' in item) {
      return item._;
    }
    return '';
  }).join('');
  return tag('div', { class: 'pl-4' }, arithContent);
}
```

### 将来の対応方針

1. **React SSR側の修正:**
   - React側のArithFormulaレンダリングを確認
   - beautifyの設定を調整して、Sub/Supタグを保持するようにする
   - または、beautify前にSub/Supタグを適切な形式に変換する

2. **TypeScript側の修正:**
   - React SSR側が修正されたら、TypeScript側も適切にSub/Supタグをレンダリングする
   - `<sub class="Sub">{content}</sub>` および `<sup class="Sup">{content}</sup>` として出力する

3. **テストの更新:**
   - React SSR側の修正後、テストケースを更新して正しいHTML出力を検証する

### 参考情報

- **影響を受けるテストケース:** `143AC0000000054_20250401_507AC0000000016`
- **関連ファイル:**
  - `src/node-renderer/typescript-renderer.ts` (180-201行)
  - `src/node-renderer/test-single-law.ts` (89-109行：ArithFormula内の括弧処理保護)
- **e-gov法令API仕様:** ArithFormula要素はSub/Supタグを含むことができる
- **HTMLタグ仕様:** `<sub>` および `<sup>` は標準的なHTMLタグであり、本来保持されるべき

### 備考

この問題は、現在のプロジェクト目的である「React SSR出力との完全一致」のために暫定的に対応していますが、将来的には正しいHTML出力（Sub/Supタグの保持）に戻すべきです。

---

## その他の既知の問題

現在、上記以外の既知の問題はありません。新しい問題が発見された場合、このファイルに追記してください。
