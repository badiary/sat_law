# 統合法令閲覧システム

このプロジェクトは、horeiAPIとsatフォルダを統合した法令閲覧システムです。

## プロジェクト構造

```
sat_law/
├── package.json          # 統合された依存関係
├── tsconfig.json         # 共通TypeScript設定
├── webpack.config.js     # マルチエントリー設定
├── src/
│   ├── api/             # 法令API関連（旧horeiAPI/src）
│   │   ├── main.tsx     # APIエントリーポイント
│   │   ├── law.tsx      # 法令表示コンポーネント
│   │   └── ...
│   └── viewer/          # ビューワ関連（旧sat/src）
│       ├── main.ts      # ビューワエントリーポイント
│       ├── sat.ts       # SAT機能
│       └── ...
├── html/                # HTMLビューワ
│   ├── viewer.html      # 通常ビューワ
│   └── viewer_chikujo.html # 逐条ビューワ
└── dist/
    ├── api.js          # API部分の出力
    └── viewer.js       # ビューワ部分の出力
```

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発ビルド
npm run build:dev

# プロダクションビルド
npm run build

# ウォッチモード
npm run watch
```

## 機能

### API部分（src/api/）
- e-gov法令APIからのデータ取得
- React + TypeScript
- Tailwind CSS
- XMLパース & HTMLレンダリング

### ビューワ部分（src/viewer/）
- 文書閲覧機能
- PDF.js、Tesseract.js統合
- テキスト検索・ハイライト
- 純粋TypeScript

## 統合による改善点

1. **依存関係管理の一元化**: 単一のpackage.jsonで管理
2. **ビルドプロセスの統一**: マルチエントリーWebpack設定
3. **開発環境の簡素化**: 単一プロジェクトでの開発
4. **バージョン競合の解消**: TypeScript 5.1.6で統一

## 既知の問題

- rangy2ライブラリのlog4javascript依存関係エラー（動作には影響なし）
- 一部の未使用変数警告（TypeScript strict mode）

これらのエラーはビルド出力には影響せず、アプリケーションは正常に動作します。