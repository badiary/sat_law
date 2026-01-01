# XML → HTML マッピング仕様書

このドキュメントは、法令XMLからHTMLへの変換ルールを定義します。

## 基本構造

### Law（法令全体）

**XML**:
```xml
<Law Lang="ja" Era="Meiji" Year="41" Num="057" LawType="Act">
  <LawNum>明治四十一年法律第五十七号</LawNum>
  <LawBody>...</LawBody>
</Law>
```

**HTML**:
```html
<div class="pb-4">
  <div class="font-bold">明治四十一年法律<span class="refNum">第五十七号</span></div>
  <div class="text-xl font-bold">北海道国有未開地処分法</div>
</div>
<section id="MainProvision" class="active MainProvision">
  ...
</section>
```

**変換ルール**:
1. `LawNum`テキストを解析し、「法律」と「第〇〇号」を分ける
2. 「第〇〇号」部分を`<span class="refNum">`で囲む（parseLaw関数の処理）
3. `LawTitle`を`text-xl font-bold`クラスで表示

---

### MainProvision（本則）

**XML**:
```xml
<MainProvision>
  <Article>...</Article>
  <Article>...</Article>
</MainProvision>
```

**HTML**:
```html
<section id="MainProvision" class="active MainProvision">
  <div>
    <section class="active Article pb-4">...</section>
    <section class="active Article pb-4">...</section>
  </div>
</section>
```

**変換ルール**:
1. `<section id="MainProvision" class="active MainProvision">`で囲む
2. 内部を`<div>`で囲む
3. 各Article要素を変換

---

### Article（条）

**XML**:
```xml
<Article Delete="false" Hide="false" Num="1">
  <ArticleTitle>第一条</ArticleTitle>
  <Paragraph Num="1">
    <ParagraphNum/>
    <ParagraphSentence>
      <Sentence>北海道国有未開地ノ処分ハ本法ニ依リ北海道庁長官之ヲ行フ</Sentence>
    </ParagraphSentence>
  </Paragraph>
</Article>
```

**HTML**:
```html
<section class="active Article pb-4" article_num="1">
  <div class="_div_ArticleTitle pl-4 indent-1">
    <span class="font-bold">
      <span article_num="1">
        <span>
          <a href="#article1" name="article1">第一条</a>
        </span>
      </span>
    </span>　北海道国有未開地ノ処分ハ本法ニ依リ北海道庁長官之ヲ行フ
  </div>
</section>
```

**変換ルール**:
1. `<section class="active Article pb-4">`要素を作成
2. `article_num`属性に条番号を設定（漢数字→アラビア数字に変換）
3. `ArticleTitle`を複数の`<span>`で囲み、リンクを作成
4. 第1項の場合、項番号なしで条タイトルの直後にテキストを配置

---

### Paragraph（項）

**パターン1: 第1項（項番号なし）**

**XML**:
```xml
<Paragraph Num="1">
  <ParagraphNum/>
  <ParagraphSentence>
    <Sentence>テキスト</Sentence>
  </ParagraphSentence>
</Paragraph>
```

**HTML**:
```html
<!-- ArticleTitleの直後にテキストのみ -->
　テキスト
```

**パターン2: 第2項以降（項番号あり）**

**XML**:
```xml
<Paragraph Num="2">
  <ParagraphNum/>
  <ParagraphSentence>
    <Sentence>テキスト</Sentence>
  </ParagraphSentence>
</Paragraph>
```

**HTML**:
```html
<div class="_div_ParagraphSentence indent1">
  <span class="font-bold">②</span>　テキスト
</div>
```

**変換ルール**:
1. 第1項は`<div>`要素を作らず、ArticleTitleに直接続ける
2. 第2項以降は`<div class="_div_ParagraphSentence indent1">`で囲む
3. 項番号を漢数字→算用数字に変換（parseLaw関数の処理）

---

### Item（号）

**XML**:
```xml
<Item Delete="false" Hide="false" Num="1">
  <ItemTitle>一</ItemTitle>
  <ItemSentence>
    <Column Num="1">
      <Sentence>無償貸付</Sentence>
    </Column>
    <Column Num="2">
      <Sentence>十年</Sentence>
    </Column>
  </ItemSentence>
</Item>
```

**HTML**:
```html
<div class="_div_ItemSentence pl-4 indent-1">
  <span class="font-bold">一　</span>無償貸付<br>　十年<br>
</div>
```

**変換ルール**:
1. `<div class="_div_ItemSentence pl-4 indent-1">`で囲む
2. `ItemTitle`を`<span class="font-bold">`で囲み、全角スペースを追加
3. 各`Column`要素の後に`<br>`を追加
4. Column要素が複数ある場合、Column 2以降の前に全角スペースを追加

**パターン2: Column要素なし（単純な号）**

**XML**:
```xml
<Item Delete="false" Hide="false" Num="1">
  <ItemTitle>一</ItemTitle>
  <ItemSentence>
    <Sentence>第四条又ハ第五条ニ依リ...</Sentence>
  </ItemSentence>
</Item>
```

**HTML**:
```html
<div class="_div_ItemSentence pl-4 indent-1">
  <span class="font-bold">一　</span>第四条又ハ第五条ニ依リ...
</div>
```

---

### SupplProvision（附則）

**XML**:
```xml
<SupplProvision>
  <SupplProvisionLabel>附　則　抄</SupplProvisionLabel>
  <Paragraph Num="1">
    <ParagraphNum/>
    <ParagraphSentence>
      <Sentence>本法施行ノ期日ハ勅令ヲ以テ之ヲ定ム</Sentence>
    </ParagraphSentence>
  </Paragraph>
</SupplProvision>
```

**HTML**:
```html
<section class="active SupplProvision pb-4" style="display:none">
  <div class="_div_SupplProvisionLabel SupplProvisionLabel pl-12 font-bold pb-4">附　則　抄</div>
  <section class="active Paragraph">
    <div class="_div_ParagraphSentence indent1">
      <span class="font-bold">①</span>　本法施行ノ期日ハ勅令ヲ以テ之ヲ定ム
    </div>
  </section>
</section>
```

**変換ルール**:
1. `<section class="active SupplProvision pb-4" style="display:none">`で囲む
2. `SupplProvisionLabel`を特定のクラスで表示
3. 附則内の項番号は漢数字の丸数字（①②③）を使用

---

## parseLaw関数による後処理

parseLaw関数は生成されたHTMLに以下の処理を適用します：

### 1. 数字変換

- 全角数字 → 半角数字
- 漢数字 → アラビア数字（例: 「第一条」→ 「第1条」、ただし表示は「第一条」のまま）

### 2. 条文リンク

**元のテキスト**: `第三条第二項`

**変換後**:
```html
<span article_num="3">
  <span>
    <a href="#article3">第三条</a>
    <span>
      <span class="refNum">第二項</span>
    </span>
  </span>
</span>
```

### 3. 項・号のスタイル

**元のテキスト**: `前項`、`第一項`、`第二号`

**変換後**:
```html
<span class="refNum">前項</span>
<span class="refNum">第一項</span>
<span class="refNum">第二号</span>
```

### 4. 接続詞の装飾

**元のテキスト**: `又は`、`及び`、`並びに`、`若しくは`

**変換後**:
```html
<span class="parallel">又は</span>
<span class="parallel">及び</span>
<span class="parallel">並びに</span>
<span class="parallel">若しくは</span>
```

### 5. 括弧マッチング

**元のテキスト**: `（昭和二二年三月三一日法律第二九号）`

**変換後**:
```html
<span class="bracket bracket2-0">
  <span>（昭和二二年三月三一日法律<span class="refNum">第二九号</span>）</span>
</span>
```

---

## 特殊ケース

### ArticleCaption（条の見出し）

**XML**:
```xml
<Article Num="1">
  <ArticleCaption>（施行期日）</ArticleCaption>
  <ArticleTitle>第一条</ArticleTitle>
  ...
</Article>
```

**HTML**:
```html
<div class="_div_ArticleCaption font-bold pl-4">
  <span class="bracket bracket2-0">（施行期日）</span>
</div>
<div class="_div_ArticleTitle pl-4 indent-1">...</div>
```

### 複数項を持つ条

第1項は条タイトルに続け、第2項以降は別の`<div>`要素として表示します。

---

## 実装の優先順位

TypeScript実装では、以下の順序で要素を実装します：

1. **Phase 1（基本要素）**:
   - Law
   - LawBody
   - MainProvision
   - Article
   - Paragraph（第1項、第2項以降）

2. **Phase 2（追加要素）**:
   - Item（号）
   - ItemSentence with Column
   - ArticleCaption

3. **Phase 3（複雑な要素）**:
   - SupplProvision（附則）
   - Table（表）
   - AppdxTable（別表）

4. **Phase 4（parseLaw処理の統合）**:
   - 数字変換
   - 条文リンク
   - 項・号のスタイル
   - 接続詞の装飾
   - 括弧マッチング
