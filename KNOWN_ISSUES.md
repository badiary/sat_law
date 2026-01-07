# 既知の問題リスト

このファイルは、プロジェクトで認識されている技術的な問題や暫定対応をドキュメント化したものです。

## ArithFormula Sub/Supタグ削除問題 ✅ **解決済み**

### 問題の概要

化学式などを表すArithFormula要素において、React SSR生成のHTMLではSub（下付き文字）およびSup（上付き文字）タグとその内容が完全に削除されていました。TypeScript版も当初はReact版との一致を優先してこの動作を踏襲していましたが、ステップ5で正しいHTML出力に修正しました。

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

### 解決内容（2026-01-08）

**影響範囲:**
- `src/node-renderer/typescript-renderer.ts` の `renderTextNode` 関数（192-212行）
- `src/api/typescript-renderer.ts` の `renderTextNode` 関数（192-212行）

**修正内容:**
- TypeScript版レンダラーでSub/Supタグを適切に出力するように修正
- e-gov法令API仕様に準拠し、`<sub class="Sub">{content}</sub>` および `<sup class="Sup">{content}</sup>` として正しくレンダリング
- React版は修正せず（既にReactは完全削除済み）、TypeScript版のみが正しいHTML出力を行う

**修正後のコード:**
```typescript
} else if ('ArithFormula' in dt) {
  // 算術式 - React側と同じく<div class="pl-4">でラップ
  // Sub/Supタグを正しく<sub>/<sup>として出力（e-gov法令API仕様に準拠）
  const arithContent = dt.ArithFormula.map((item: any) => {
    if ('Sub' in item) {
      // 下付き文字を適切に出力
      const text = getType<TextType>(item.Sub, '_')[0]._;
      return tag('sub', { class: 'Sub' }, text);
    } else if ('Sup' in item) {
      // 上付き文字を適切に出力
      const text = getType<TextType>(item.Sup, '_')[0]._;
      return tag('sup', { class: 'Sup' }, text);
    } else if ('_' in item) {
      return item._;
    }
    return '';
  }).join('');
  return tag('div', { class: 'pl-4' }, arithContent);
}
```

### 結果

- ✅ 化学式や数式の下付き・上付き文字が正しく表示される
- ✅ e-gov法令API仕様に準拠した正しいHTML出力を実現
- ✅ ブラウザ版、Node.js版の両方で修正完了
- ✅ ビルド成功（バンドルサイズ変化なし: 179 KiB）

### 参考情報

- **影響を受ける法令:** ArithFormulaを含む法令（例: `143AC0000000054_20250401_507AC0000000016`）
- **関連ファイル:**
  - `src/node-renderer/typescript-renderer.ts` (192-212行)
  - `src/api/typescript-renderer.ts` (192-212行)
- **e-gov法令API仕様:** ArithFormula要素はSub/Supタグを含むことができる
- **HTMLタグ仕様:** `<sub>` および `<sup>` は標準的なHTMLタグ

### 備考

ステップ4でReactを完全削除した後、ステップ5で本来あるべき正しいHTML出力に修正しました。これにより、ユーザーは化学式や数式を正確に閲覧できるようになりました。

---

## その他の既知の問題

現在、上記以外の既知の問題はありません。新しい問題が発見された場合、このファイルに追記してください。
