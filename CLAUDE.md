# 統合法令閲覧システム - 開発ドキュメント

このドキュメントは、統合法令閲覧システムの全体構造とレンダリングフローを記録したものです。

## プロジェクト概要

e-gov法令APIから法令データを取得し、Reactで加工したHTML表示と、独自のビューア機能（マーカー、コメント等）を提供するWebアプリケーション。

## アーキテクチャ

```
┌─────────────────────────────────────────┐
│ index.html (メインHTML)                  │
│ - ビューアUIの骨格定義                   │
│ - window.showLawViewer関数定義          │
│ - イベントハンドラ定義                   │
└─────────────────────────────────────────┘
         │
         ├── defer読み込み
         │
    ┌────┴────┬─────────┬──────────────┐
    ▼         ▼         ▼              ▼
dist/api.js  dist/     js/breadcrumb-  インライン
(React)      viewer.js navigation.js   スクリプト
```

## ページロード～レンダリングの完全フロー

### 1. 初期ロード段階

```
1. index.html読み込み
   ├── HTMLパース
   │   ├── #app div（API用）
   │   ├── #viewer-toolbar div（ツールバー、初期非表示）
   │   │   └── #breadcrumb-navigation nav（パンくず）
   │   └── #viewer-content div（コンテンツ領域、初期非表示）
   │       └── #content div（法令本文が挿入される）
   │
   └── <script defer>タグで順次読み込み
       ├── dist/api.js
       ├── dist/viewer.js
       └── js/breadcrumb-navigation.js
```

### 2. スクリプト実行段階

#### 2-1. dist/api.js（Reactアプリケーション）

**エントリーポイント**: `src/api/main.tsx`

```typescript
// URLパラメータからlawIdを取得（デフォルト: 405AC0000000088 = 行政手続法）
let lawId = '405AC0000000088';
if (location.href.match(/lawid=(.*)/)) {
    lawId = location.href.match(/lawid=(.*)/)![1];
}

// Reactアプリを#appにマウント
const container = document.getElementById('app')!;
const root = createRoot(container);
root.render(<App />);
```

#### 2-2. Lawコンポーネント実行（src/api/law.tsx）

**主要な処理フロー**:

```typescript
// ステップ1: API呼び出し
const { response } = getLawData(lawId);

// ステップ2: useEffectでレスポンス取得後の処理
useEffect(() => {
    if (response && response.result && response.result.isSuccess) {
        // Reactが#appに生成したHTMLを取得
        const inputHTML = document.getElementById("app")?.innerHTML!;

        // parseLaw関数で加工
        const data = parseLaw(inputHTML, response.chikujo);

        // window.showLawViewer関数を呼び出し
        if (window.showLawViewer) {
            window.showLawViewer(data);
        }
    }
}, [response]);
```

#### 2-3. API呼び出し詳細（src/api/lib/api/get-law-data.ts）

```typescript
export const getLawData = async (lawId: string) => {
    // e-gov APIエンドポイント
    const url = `https://laws.e-gov.go.jp/api/1/lawdata/${lawId}`;

    // XML取得
    const result = await fetch(url);
    const xml = await result.text();

    // XMLパーサー設定
    const xp = new XMLParser({
        ignoreDeclaration: true,
        ignoreAttributes: false,
        preserveOrder: true,
        textNodeName: "_",
        attributeNamePrefix: "",
    });

    // XMLをオブジェクトに変換
    const convertLaw = xp.parse(xml);
    const lawFullText = convertLaw[0].DataRoot[1].ApplData[2].LawFullText[0];

    return {
        isSuccess: true,
        value: { lawFullText }
    };
};
```

#### 2-4. parseLaw関数（src/api/law.tsx: 114-1056行）

**入力**: Reactが生成したHTML（`#app.innerHTML`）
**出力**: `{lawTitle: string, content: string}`

**処理内容**:
- 全角数字→半角数字変換（zen2Han関数）
- 漢数字→アラビア数字変換（kansuji2arabic拡張）
- 括弧マッチング処理（parenthesisライブラリ）
- 無意味なspan要素削除（clearSpan関数）

### 3. ビューア表示段階

#### 3-1. window.showLawViewer関数（index.html: 651-680行）

```javascript
window.showLawViewer = function(data) {
    // 1. ビューアUIを表示
    document.getElementById('viewer-toolbar').style.display = 'block';
    document.getElementById('viewer-content').style.display = 'block';

    // 2. API部分を非表示
    document.getElementById('app').style.display = 'none';

    // 3. コンテンツを挿入
    document.getElementById('content').innerHTML = data.content;
    document.getElementById('doc_title').value = data.lawTitle;
    document.title = data.lawTitle;

    // 4. ビューア初期化（SAT機能）
    if (window.initialize) {
        window.initialize();
    }

    // 5. HTMLイベントハンドラ初期化
    initializeViewerEvents();

    // 6. パンくずナビゲーション初期化
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (window.initializeBreadcrumbNavigation) {
                window.initializeBreadcrumbNavigation();
            }
        });
    });
};
```

#### 3-2. window.initialize関数（src/viewer/main.ts: 24-95行）

```typescript
const initialize = async () => {
    // 1. コンテンツルート決定
    const content_root = document.getElementById("content")!;
    const content_window = window;

    // 2. SATオブジェクト初期化
    sat = new sat_modules.Sat(
        tool_type,
        content_root,
        content_window,
        cv, // canvas
        selected_color,
        // ... その他の設定
    );

    // 3. HTMLイベント初期化
    initializeHTML();

    // 4. キーボード操作設定
    setKeyboardPreference();

    // 5. 初期描画実行
    sat.word.setOption(getWordOption());
    sat.word.invert(sat.content_root);
    setColoredQuery();
};

// グローバルに公開
window.initialize = initialize;
```

### 4. パンくずナビゲーション初期化

#### 4-1. initializeBreadcrumbNavigation関数（js/breadcrumb-navigation.js: 580-599行）

```javascript
function initializeBreadcrumbNavigation() {
    // 1. パンくず要素の存在確認
    const breadcrumbElement = document.getElementById('breadcrumb-navigation');
    if (!breadcrumbElement) {
        console.warn('パンくずナビゲーション要素がまだ存在しません。');
        return;
    }

    // 2. 条文要素の存在確認（重要！）
    const content = document.getElementById('content');
    if (!content || content.querySelectorAll('._div_ArticleTitle').length === 0) {
        console.warn('条文要素がまだ存在しません。');
        return;
    }

    // 3. 既存インスタンスを破棄
    if (breadcrumbNavigation) {
        breadcrumbNavigation.destroy();
    }

    // 4. 新規インスタンス作成
    breadcrumbNavigation = new BreadcrumbNavigation();
}
```

#### 4-2. BreadcrumbNavigationクラス処理

```javascript
class BreadcrumbNavigation {
    constructor() {
        this.init();
    }

    init() {
        this.createBreadcrumbUI();           // パンくず要素取得
        this.parseDocumentStructure();       // 法令構造解析
        this.setupIntersectionObserver();    // スクロール監視
        this.attachEventListeners();         // イベント設定
    }

    parseDocumentStructure() {
        // #content内の階層要素を解析
        // - ._div_PartTitle（編）
        // - ._div_ChapterTitle（章）
        // - ._div_SectionTitle（節）
        // - ._div_SubsectionTitle（款）
        // - ._div_DivisionTitle（目）
        // - ._div_ArticleTitle（条）

        // 各条文の階層情報をマッピング
        this.hierarchyMap.set(articleId, hierarchyInfo);
    }

    setupIntersectionObserver() {
        // 全条文要素を監視
        document.querySelectorAll('._div_ArticleTitle').forEach(article => {
            this.observer.observe(article);
        });
    }
}
```

## 完全な実行フロー図

```
┌─────────────────────────────────────────────────────────────┐
│                     index.html 読み込み                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │ HTMLパース完了   │
                  └────────┬─────────┘
                           │
        ┌──────────────────┼──────────────────┬──────────────┐
        │                  │                  │              │
   ┌────▼─────┐    ┌──────▼──────┐  ┌───────▼───┐  ┌──────▼──┐
   │ api.js   │    │ viewer.js    │  │ breadcrumb│  │ inline  │
   │ (defer)  │    │ (defer)      │  │ .js(defer)│  │ script  │
   └────┬─────┘    └──────┬──────┘  └───────┬───┘  └──────┬──┘
        │                  │                 │             │
        │         ┌────────▼──────────┐      │      ┌──────▼──────┐
        │         │ window.initialize │      │      │ showLawViewer
        │         │ 定義              │      │      │ 関数定義
        │         └───────────────────┘      │      └─────────────┘
        │                                     │
   ┌────▼─────────────────────────────────┐  │
   │ src/api/main.tsx 実行               │  │
   │ - URLからlawIdを抽出                 │  │
   │ - Lawコンポーネントレンダリング     │  │
   └────┬─────────────────────────────────┘  │
        │                                     │
        ▼                                     │
   ┌─────────────────────────────────────┐   │
   │ getLawData() 実行                   │   │
   │ - e-gov API呼び出し                 │   │
   │ - XMLパース                         │   │
   └────┬────────────────────────────────┘   │
        │                                     │
        ▼                                     │
   ┌─────────────────────────────────────┐   │
   │ LawComponent レンダリング           │   │
   │ (#app に HTML 生成)                 │   │
   └────┬────────────────────────────────┘   │
        │                                     │
        ▼                                     │
   ┌─────────────────────────────────────┐   │
   │ parseLaw(#app.innerHTML)            │   │
   │ - 数字変換、括弧処理               │   │
   │ - {lawTitle, content} 返却         │   │
   └────┬────────────────────────────────┘   │
        │                                     │
        ▼                                     │
   ┌─────────────────────────────────────┐   │
   │ window.showLawViewer(data)          │◄──┘
   │ 呼び出し                            │
   └────┬────────────────────────────────┘
        │
        ├─► DOM更新
        │   - #content.innerHTML = data.content
        │   - #toolbar, #viewer 表示
        │   - #app 非表示
        │
        ├─► window.initialize()
        │   - SATオブジェクト初期化
        │   - イベントハンドラ設定
        │   - 初期描画
        │
        ├─► initializeViewerEvents()
        │   - 括弧イベント
        │   - ツールチップ
        │   - 条文ジャンプ
        │
        └─► initializeBreadcrumbNavigation()
            (requestAnimationFrame × 2)
            - 条文要素存在チェック
            - 法令構造解析
            - IntersectionObserver設定
            - パンくず表示
```

## 重要なファイルとその役割

| ファイルパス | 役割 | 主要な関数/クラス |
|-------------|------|------------------|
| `index.html` | HTMLベース、関数定義 | `window.showLawViewer`<br>`initializeViewerEvents` |
| `src/api/main.tsx` | Reactエントリー | `main()` |
| `src/api/law.tsx` | API呼び出し、HTML加工 | `Law`コンポーネント<br>`parseLaw()` |
| `src/api/lib/api/get-law-data.ts` | e-gov API呼び出し | `getLawData()`<br>`getLawComponentData()` |
| `src/viewer/main.ts` | ビューア機能初期化 | `initialize()`<br>`Sat`クラス |
| `js/breadcrumb-navigation.js` | パンくずナビゲーション | `BreadcrumbNavigation`クラス<br>`initializeBreadcrumbNavigation()` |

## データフロー

```
lawId (URL param)
    ↓
getLawData() → e-gov API
    ↓
XML response → XMLParser
    ↓
lawFullText (オブジェクト)
    ↓
LawComponent (React) → HTML生成
    ↓
#app.innerHTML (React生成HTML)
    ↓
parseLaw() → 加工処理
    ↓
{lawTitle, content}
    ↓
showLawViewer() → DOM更新
    ↓
#content.innerHTML = content
    ↓
initialize() → ビューア初期化
    ↓
initializeBreadcrumbNavigation() → パンくず初期化
    ↓
完全な法令閲覧ページ表示
```

## 重要な設計上の注意点

### 1. パンくずナビゲーション初期化のタイミング

**問題**: DOMContentLoaded時には`#content`が空なので、条文要素が存在しない

**解決策**:
- `window.showLawViewer()`内で`#content.innerHTML`設定後に初期化
- `requestAnimationFrame`を2回ネストしてDOM更新完了を待つ
- 条文要素（`._div_ArticleTitle`）の存在を確認してから初期化

```javascript
// 正しい初期化タイミング
requestAnimationFrame(() => {
    requestAnimationFrame(() => {
        if (window.initializeBreadcrumbNavigation) {
            window.initializeBreadcrumbNavigation();
        }
    });
});
```

### 2. 法令構造の階層

日本の法令は以下の階層構造を持つ：

```
法令
├── 編（Part）
│   └── 章（Chapter）
│       └── 節（Section）
│           └── 款（Subsection）
│               └── 目（Division）
│                   └── 条（Article）
```

対応するCSSクラス：
- `._div_PartTitle` - 編
- `._div_ChapterTitle` - 章
- `._div_SectionTitle` - 節
- `._div_SubsectionTitle` - 款
- `._div_DivisionTitle` - 目
- `._div_ArticleTitle` - 条（パンくず監視対象）
- `._div_ArticleCaption` - 条の番号（例: "第一条"）
- `._div_ArticleTitle` - 条のタイトル

### 3. XMLパーサーの設定

e-gov APIから返されるXMLは特殊な構造を持つため、以下の設定が必須：

```typescript
{
    ignoreDeclaration: true,        // XML宣言除去
    ignoreAttributes: false,        // 属性を保持
    preserveOrder: true,            // タグ順序維持（重要！）
    textNodeName: "_",              // テキストノード名
    attributeNamePrefix: "",        // 属性プレフィックスなし
}
```

### 4. ビューア機能（SAT）

SATモジュールは以下の機能を提供：
- ワード反転表示
- マーカー機能
- コメント機能
- 太字・下線
- PDF図面表示
- コンテンツ編集（ロック機能付き）

## トラブルシューティング

### パンくずが表示されない場合

1. **コンソールエラーを確認**
   - "パンくずナビゲーション要素がまだ存在しません" → HTML構造を確認
   - "条文要素がまだ存在しません" → showLawViewer呼び出しタイミングを確認

2. **DOM構造を確認**
   ```javascript
   // デバッグ用コード
   console.log('breadcrumb-navigation:', document.getElementById('breadcrumb-navigation'));
   console.log('content:', document.getElementById('content'));
   console.log('articles:', document.querySelectorAll('._div_ArticleTitle').length);
   ```

3. **初期化タイミングを確認**
   - `window.showLawViewer`が呼ばれているか
   - `requestAnimationFrame`後に初期化されているか

### API呼び出しが失敗する場合

1. **lawIdの確認**
   - URLパラメータ: `?lawid=405AC0000000088`
   - 有効な法令IDか確認

2. **CORS設定**
   - e-gov APIはCORS対応済み
   - プロキシ不要

3. **XMLパース失敗**
   - XMLフォーマットが正しいか確認
   - fast-xml-parserのバージョン確認

## 開発時の推奨手順

1. **新機能追加時**
   - まず`CLAUDE.md`（このファイル）でフロー確認
   - 適切な挿入ポイントを特定
   - 既存の初期化タイミングに合わせる

2. **デバッグ時**
   - ブラウザDevToolsのネットワークタブでAPI呼び出し確認
   - Consoleでエラーログ確認
   - Elementsタブで実際のDOM構造確認

3. **パフォーマンス最適化**
   - 大量の条文がある法令では、IntersectionObserverの設定を調整
   - パンくずレンダリングを最適化（仮想スクロール等）

## 参考リンク

- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)
- [Intersection Observer API](https://developer.mozilla.org/ja/docs/Web/API/Intersection_Observer_API)
