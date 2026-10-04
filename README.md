# Care Words 840

介護のことば840語を、英語・日本語の両方向から学ぶ静的Webアプリです。
出題 → 答え・元の解説カード → 自己評価、の順で学びます。

**公開手順は [START-HERE.txt](START-HERE.txt) を最初に読んでください。**

- GitHub DesktopでZIPの中身をリポジトリの最上位へコピーしてCommit / Push。
- GitHub Pages：**Deploy from a branch → main → / (root)**。
- ZIP内の `index.html` がリポジトリの最上位にある配置にします。
- ビルド・npm install・APIキーの設定は不要です。

## 収録内容

解説カード840枚、一覧用画像840枚、分野アート6種（各2サイズ）、フォントを同梱。
検索、分野別学習、苦手復習、お気に入り、5/10/20語のセット、学習記録、発音機能に対応。
学習記録はブラウザ内に保存。URLが別のオリジンになると以前の記録は自動移行しません。
発音は端末に英語・日本語の音声がある場合に利用できます。

## 変更しないファイル名

`index.html` / `studio.css` / `app.js` / `study.js` / `journey.js` / `cards.json`

`cards/0001.webp` ～ `cards/0840.webp` と `thumbs/` の同じ番号を維持してください。
`assets/` の階層と `.nojekyll` を維持し、公開URL用の絶対パスを追加しないでください。
ファイル名は固定し、更新履歴はGitで管理します。

## 開発者向け確認

Python 3がある場合、`python -m http.server 8000 --bind 127.0.0.1` でローカル確認できます。
ブラウザで `http://127.0.0.1:8000/` を開いてください。file://での直接起動には対応しません。

Node.js 22以上がある場合、`npm test` で配布ファイルのSHA-256と機能を再検査できます。
`npm run test:app` は学習機能のみを検査します。どちらも依存パッケージのインストールは不要です。
配布後に内容を編集すれば元のSHA-256とは異なるため、整合性検査は失敗します。

詳細は [QA-REPORT.txt](QA-REPORT.txt) を参照。
同梱フォントのライセンスは [assets/fonts/LICENSE.txt](assets/fonts/LICENSE.txt) にあります。
