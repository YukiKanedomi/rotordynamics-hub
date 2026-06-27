# Rotordynamics Hub

回転機械全般の **ローターダイナミクス技術ロードマップ** をインタラクティブに俯瞰する web アプリ。
`experts/rotordynamics` の知識ベースを土台に、社会動向と調査結果をひも付けて構成する。

公開URL: https://yukikanedomi.github.io/rotordynamics-hub/

## 構成（4段ロジック）
社会動向 → 回転機械への需要シフト → ローターダイナミクス課題 → 要素技術・手法・規格の整備時期

- **5ドライバ**: 電動化・産業脱炭素 / エネルギー転換 / データセンター・AI / 航空・モビリティ / デジタル化・規格
- **二層タイムライン**: 〜2035（実線・実装寄り）/ 2035〜（点線・長期シナリオ）
- **共通ベクトル5本**: 油フリー / 超高速・高出力密度 / モータ一体 / 作動流体極端化 / デジタル化
- **横断RD課題マップ**: 既存ナレッジトピックに接地（離調・前後ホワール・Thomas/Alford・dry whip・規格）

## 開発
```bash
npm install
npm run dev      # 開発サーバ
npm run build    # 型チェック + 本番ビルド
```

## デプロイ
`main` への push で GitHub Actions（`.github/workflows/deploy.yml`）が build → Pages 公開。
Vite の `base` は `/rotordynamics-hub/` 固定（プロジェクトページのサブパス配信対策）。

## データ
ロードマップの中身は `src/data/roadmap.ts` が source of truth。元データは
`experts/rotordynamics/knowledge/topics/roadmap-rotating-machinery.md`。
確度ラベル `確立 / 推定 / 仮説` と一次/二次出典区分を保持する。
