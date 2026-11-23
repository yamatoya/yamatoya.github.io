# 事業者の過去の改定告知・新旧対照表

調査日：2026-11-23。SBI VCトレードとメルコインの公表資料を第三者の参考資料として収録しています。

| 事業者 | 告知数 | 収録した告知日の範囲 |
| --- | ---: | --- |
| SBI VCトレード | 50 | 2021-04-09〜2026-11-18 |
| メルコイン | 16 | 2023-09-14〜2026-11-04 |

公式一覧 [SBI VCトレード](https://www.sbivc.co.jp/news) と [メルコイン](https://jp-news.mercari.com/info/category/announcements)（13ページ）から、規約・約款・説明書・方針の改定告知を調査しました。SBI一覧の755件から50件、メルコインから16件を収録しています。告知日には各詳細ページの公開日を使い、ページ更新日・施行日と区別します。

## 収録範囲

- 新旧の変更箇所を抽出：46告知、375箇所（PDFではページ単位）。
- 画像の対照表を保存：8告知。画像を表示し、OCRによる本文復元は行っていません。
- 告知のみ：12告知。公開された新旧本文を取得できていません。
- 告知HTML66件、関連するPDF・画像88点を保存。原本HTMLはスクリプトを実行しない `.html.txt` として配信します。
- PDF対照表の2ページは表を抽出できず、画面と `import-report.json` で明示しています。

これは発見できた公開資料のアーカイブです。全改定を網羅した連続した全文履歴ではありません。新旧対照表の「略」・抜粋・空欄をそのまま扱い、過去の全文や欠落している期間の本文は生成していません。現行文書の取得日も別に表示します。旧VCTRADEの2021年告知は現行文書と自動で対応づけません。

施行日は告知本文の明示された施行日・「年月日付で」等から抽出し、確認できないものは未確認です。複数の予定日がある告知は、予定日を別表示します。例：[メルコイン2024年2月改定](https://jp-news.mercari.com/info/35126) は公開2024-01-23、施行2024-02-14で、2026年のページ更新日を改定日としていません。[SBI2026年11月改定](https://www.sbivc.co.jp/newsview/j3rl-is_pu) はメンテナンス時間の新旧対照表を保存しています。

## ファイルと再生成

- `discovery.json`：発見した公式告知と添付リンクの一覧。
- `manifest.json`：取得元URL・保存ファイル・SHA-256・サイズ。
- `sources/`：公式告知と添付原本。
- `import-report.json`：対象文書・施行日・抽出結果・未解決ページ。
- `features/provider-history-data.json`：画面用の抽出データ。

既存アーカイブからオフラインで再抽出できます。必要なPython依存関係は `scripts/requirements-history.txt` に記載しています。

```sh
python3 scripts/import-provider-history.py
node scripts/build-research.mjs
node scripts/verify-history.mjs
node scripts/verify-sbivc.mjs
```

添付原本を再取得する場合は先に `python3 scripts/fetch-provider-history.py` を実行します。新しい告知を追加する際は、公式一覧・詳細ページを確認して `discovery.json` と告知原本を追加し、manifestを更新してください。自動巡回のスケジュールは設定していません。
