# SBI VCトレード 公開規約・関連書面

取得日: 2026年11月21日（日本時間）

出典: [公式「法的情報等」](https://www.sbivc.co.jp/legal-information)

公式ページ掲載の31件のPDFを原本のまま保存したスナップショットです。BITPOINTサービスの別サイト掲載資料は含みません。取得日は施行日・改定日を意味しません。最新の内容は公式サイトを確認してください。

manifest.json に出典URL・ファイルサイズ・SHA-256を記録しています。

## ビューアへの収録

31書面・全510ページを、既存の企業資料と同じ `company` / `tweets` 形式の715項目として収録しています。「事業者の公表資料」から閲覧でき、既存の全文検索・条文別ページ・引用・リストに対応します。

- 約款等は条文単位（枝番を含む）で分割し、別表・制定改定履歴も保持しています。
- その他の方針・説明書は見出し単位で分割しています。
- 銘柄概要説明書・最良執行方針・特定商取引法の表記は、表のある原本を照合しやすいページ単位の抽出テキストです。表の配置・対応関係は原本PDFで確認してください。
- 各項目にローカル原本PDFの該当ページへのリンクがあり、文書の「原文を表示」は公式PDFに移動します。
- この取得時点の内容を収録したもので、過去の改正差分や施行時点別の本文を作成したものではありません。

`import-report.json` に文書ID・書面名・ページ数・項目数・生成モジュール名を記録しています。

## 再生成と検証

このチェックアウトはビルド済みの配信ファイルのみで、元のVueソースやビルド設定は含まれていません。そのため、独立したデータモジュールを生成して配信エントリに組み込んでいます。元ソースから再デプロイする場合は、同じデータを元ソース側の文書レジストリにも反映する必要があります。

Python 3（`scripts/requirements-sbivc.txt` の依存関係）とNode.jsを使用し、リポジトリのルートから実行します。

```sh
python3 scripts/import-sbivc.py
node scripts/integrate-sbivc.mjs
node scripts/build-research.mjs
node scripts/verify-sbivc.mjs
node scripts/verify-research.mjs
```

再生成時に原本のSHA-256と抽出後の全文保持、条番号の連続性・枝番・IDの重複を検証します。組み込み時はブラウザへの同梱データ更新用バージョンと配信ファイル名を更新します。検証スクリプトは実際の配信コードを使い、既存の文書編集・対応記録・独自文書を保持した更新と、検索Workerによる新規資料の検索を確認します。

| 保存したPDF | 公式原本 |
| --- | --- |
| [サービス総合約款](covenants-ex_tt.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/covenants-ex_tt.pdf) |
| [暗号資産取引説明書](manual-ex_tt.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/manual-ex_tt.pdf) |
| [電子決済手段取引説明書](manual-ex_electric-payment-instrument.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/manual-ex_electric-payment-instrument.pdf) |
| [暗号資産等貸借取引約款](lending_covenants_tt.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/lending_covenants_tt.pdf) |
| [暗号資産等貸借取引説明書](lending_manual-ex_tt.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/lending_manual-ex_tt.pdf) |
| [SBI Web3 ウォレットサービス約款](sbiweb3wallet_covenants.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/sbiweb3wallet_covenants.pdf) |
| [情報の電磁的な方法による提供について](e-consent.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/e-consent.pdf) |
| [最良執行方針](bestexecutionpolicy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/bestexecutionpolicy.pdf) |
| [取扱暗号資産及び取扱電子決済手段の概要説明書](handling-cryptocurrency-overview.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/handling-cryptocurrency-overview.pdf) |
| [システムリスク管理方針](handling-system-risc-overview.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/handling-system-risc-overview.pdf) |
| [情報セキュリティポリシー](security-policy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/security-policy.pdf) |
| [サイバーセキュリティ基本方針](cybersecurity_policy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/cybersecurity_policy.pdf) |
| [個人情報保護方針](privacy-policy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/privacy-policy.pdf) |
| [お客様の個人情報のお取扱いについて](privacy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/privacy.pdf) |
| [個人情報の共同利用について](joint_use_of_personal_information.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/joint_use_of_personal_information.pdf) |
| [トラベルルールに関する同意事項](travel_rule.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/travel_rule.pdf) |
| [履歴情報の取得について](obtaining_historical_information.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/obtaining_historical_information.pdf) |
| [ソーシャルメディアの運用方針](policy_operating_social_media.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/policy_operating_social_media.pdf) |
| [顧客中心主義に基づく業務運営方針](fiduciary_duty.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/fiduciary_duty.pdf) |
| [勧誘方針](solicitation_policy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/solicitation_policy.pdf) |
| [苦情処理措置及び紛争解決措置について](handling-complaints.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/handling-complaints.pdf) |
| [債務履行方針（暗号資産）](debtfulfillmentpolicy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/debtfulfillmentpolicy.pdf) |
| [債務履行方針（電子決済手段）](debtfulfillmentpolicy_electric-payment-instrument.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/debtfulfillmentpolicy_electric-payment-instrument.pdf) |
| [倫理コード](ethics.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/ethics.pdf) |
| [利益相反管理方針](advantagecontrary.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/advantagecontrary.pdf) |
| [マネー・ローンダリング等防止に関する基本方針](basic_policy_of_amlfct.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/basic_policy_of_amlfct.pdf) |
| [反社会的勢力に対する基本方針](handling-antisocial.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/handling-antisocial.pdf) |
| [電子決済手段等取引サービスにおける不正利用被害の補償方針](electric-payment-instrument_compensation_policy.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/electric-payment-instrument_compensation_policy.pdf) |
| [カスタマーハラスメントに対する基本方針](customerharassment.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/customerharassment.pdf) |
| [特定商取引法に基づく表記](act_on_specified_commercial_transactions.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/act_on_specified_commercial_transactions.pdf) |
| [SBI Mits利用規約](SBINFT_Mits_terms_of_use.pdf) | [公式](https://www.sbivc.co.jp/assets/docs/SBINFT_Mits_terms_of_use.pdf) |
