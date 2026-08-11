# Syntax — ビジネス英文法トレーニング (PWA)

TOEIC 800 → 900 と、実務の会話・ライティングのための英文法アプリ。
23ユニット / 240問。オフライン動作。学習データは端末内に保存されます。

## ファイル構成

```
.
├── index.html      アプリ本体（HTML/CSS/JS と教材データをすべて内包）
├── manifest.json   ホーム画面追加・アプリ名・アイコン・ショートカット
├── sw.js           Service Worker（オフラインキャッシュ）
├── .nojekyll       GitHub Pages の Jekyll 処理を無効化
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-maskable-512.png   Android の丸型アイコン用（余白広め）
    ├── apple-touch-icon.png    iOS ホーム画面用 180px
    └── favicon-32.png
```

すべて相対パス (`./`) 参照なので、`https://ユーザー名.github.io/リポジトリ名/`
のようなサブディレクトリ配信でもそのまま動きます。

## GitHub Pages への公開手順

1. GitHub で新しいリポジトリを作成する（例: `syntax-grammar`）
2. このフォルダの中身を **リポジトリ直下** にアップロードする
   （`index.html` がリポジトリのルートに来るように。`pwa/index.html` のような入れ子にしない）
3. リポジトリの **Settings → Pages** を開く
4. **Source** を `Deploy from a branch`、Branch を `main` / `/ (root)` にして Save
5. 1〜2分待つと `https://ユーザー名.github.io/リポジトリ名/` で公開される

コマンドで行う場合:

```bash
git init
git add .
git commit -m "Syntax grammar app"
git branch -M main
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push -u origin main
```

## スマホへのインストール

- **Android (Chrome)**: サイトを開く → メニュー →「アプリをインストール」
- **iOS (Safari)**: サイトを開く → 共有ボタン →「ホーム画面に追加」

インストール後は起動時にアドレスバーが消え、機内モードでも動作します。
Android では長押しで「瞬間英作文」「模試」「復習」のショートカットが出ます。

## アプリを更新したとき

`index.html` を書き換えたら、**必ず `sw.js` の `VERSION` を上げてください。**

```js
const VERSION = 'v1.0.1';   // ← ここを変える
```

これを忘れると、Service Worker が古いキャッシュを返し続けて更新が反映されません。
バージョンを上げてアップロードすると、次にアプリを開いたときに
「新しいバージョンがあります」と表示され、開き直すと反映されます。

## 学習データについて

- 進捗・正答率・復習リストはブラウザの localStorage に保存されます
- 端末とブラウザごとに独立しています（機種変更では引き継がれません）
- 「記録」タブの一番下から全消去できます
- サーバーには何も送信されません

## 日本語フォント

日本語は Noto Sans JP を Google Fonts から読み込みます。
オフライン時や読み込み失敗時は、端末標準の日本語ゴシック
(Hiragino Kaku Gothic ProN / Yu Gothic / Meiryo) にフォールバックします。
中華フォントが混ざらないよう、フォールバック指定と `lang="ja"` を明示しています。

完全にオフラインでも Noto Sans JP を使いたい場合は、フォントファイルを
`fonts/` に置いて `index.html` の Google Fonts の `<link>` を
`@font-face` の自前定義に差し替え、`sw.js` の `CORE_ASSETS` にパスを追加してください。
