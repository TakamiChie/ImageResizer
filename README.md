# Image Resizer

ブラウザ上で手軽に画像のサイズ調整とアスペクト比の変更ができるWebツールです。

## 主な機能

- **アスペクト比の変更**: 1:1, 1.91:1 (note), 4:3, 16:9 などのプリセットに対応。
- **柔軟な背景設定**:
  - 単色塗りつぶし（白・黒）
  - 画像の左上隅のピクセル色を自動抽出
  - 元画像をぼかして背景に配置する「ぼかし背景」
- **多様な入力方法**:
  - ファイル選択
  - ドラッグ＆ドロップ
  - クリップボードからの貼り付け（Ctrl+V / Cmd+V）
- **複数の出力フォーマット**: PNG, JPEG, WebP, AVIF 形式での書き出しが可能。
- **PWA 対応**: Service Worker により、オフライン環境でも動作します。
- **設定の保存**: 選択したアスペクト比や背景設定などはブラウザの `localStorage` に保存され、次回起動時に復元されます。

## 使い方

1. 画像をアップロードします（クリック、ドラッグ＆ドロップ、または貼り付け）。
2. 設定パネルから、目的のアスペクト比、背景モード、長辺の解像度、出力フォーマットを選択します。
3. プレビューを確認し、「ダウンロード」ボタンをクリックして保存します。

## ファイル構成

- `index.html`: UI構造
- `main.js`: 画像処理、キャンバス描画、設定保存のロジック
- `sw.js`: オフライン動作のためのサービスワーカー
- `manifest.json`: PWA 設定ファイル

## 開発者向け

このツールは外部ライブラリに依存せず、ブラウザ標準の Canvas API と JavaScript で構築されています。

### ローカルでの実行

Service Worker の動作を確認するには、`npx serve` などのローカルサーバーを介して実行することをお勧めします。

## Buy Me a Coffee

よければどうぞ。

<a href="https://www.buymeacoffee.com/TakamiChie" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" style="height: 60px !important;width: 217px !important;" ></a>
