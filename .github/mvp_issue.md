## 目的

* 顧客が概算料金から比較・選択し、複数社へ同時問い合わせできる体験を提供
* 業者は月額10万円サブスク（300社限定）を契約し、掲載とInstagram連携による集客を獲得
* Instagram閲覧で企業イメージの把握を容易にし、以降の商談は顧客と業者の直接やり取りに委ねる

## スコープ

* 顧客向けUI/UX、業者向け管理、管理者向け運用ツール
* 問い合わせ同時送信メール配信基盤（法令準拠）
* Instagram連携（閲覧の確実化＋将来の自動投稿拡張）
* 決済・サブスクリプション（月額10万円/社、300社枠運用）

## ユーザー定義

* 顧客: 建設/リフォーム検討者（地域・カテゴリ・予算で比較）
* 業者: 建設・リフォーム会社（Instagram運用、対応地域・施工カテゴリ情報）
* 管理者: 掲載審査、300社枠運用、価格テンプレート/法令/送信ドメイン管理

## 機能要件（MVP）

* 顧客
  * カテゴリ/施工タイプ一覧、概算料金レンジとオプション選択
  * 複数社選択→問い合わせカート→同時送信
  * Instagramフィード/リール閲覧、地域/価格/カテゴリフィルタ
  * 問い合わせ履歴、同意管理（オプトイン/配信停止導線の明示）
* 業者
  * 会社プロフィール、対応地域・カテゴリ、概算料金テンプレート設定
  * Instagram連携（OAuth）、フィード表示許可
  * 問い合わせ受信設定、開封/クリック計測、掲載ON/OFF
  * 月額10万円のサブスクリプション登録（請求・自動更新・解約/休止）
* 管理者
  * 300社枠管理（審査/承認/待機）、掲載ランク/露出ルール
  * 概算料金テンプレート/カテゴリ管理
  * メール配信キュー、失敗検知・再送、SPF/DKIM/DMARC認証
  * 規約/プライバシー/同意文面編集、監査ログ

## 主要ワークフロー

* 問い合わせ同時送信
  * 施工カテゴリ＋オプション選択→複数社選択→個人情報入力→同意→送信
  * 業者別に固有リンク/トークン付与、開封・クリック計測
  * 顧客連絡先を含め、以降の商談は当事者間で直接進行
* 業者サブスク
  * 申込→審査→決済（月額10万円）→掲載開始→Instagram連携→概算料金登録
* Instagram連携
  * 業者のビジネス/クリエイターアカウント接続
  * フィード取得・キャッシュ・表示（APIレート制御）
  * 将来は自動投稿/スケジューリング導入（API仕様の範囲内）

## Instagram技術要点

* Instagram Graph APIのコンテンツ発行はビジネスアカウント対象、API経由投稿は24時間25件/アカウント制限
* 2024–2025更新でビュー指標統合やエンドポイント整理が進展。Reels/StoriesのAPI対応は最新仕様に追随
* 参考:
  * https://www.adweek.com/media/instagram-adds-content-publishing-api-enabling-business-accounts-to-schedule-posts/
  * https://medium.com/geekculture/how-to-publish-content-with-the-instagram-graph-api-806ec9c56588
  * https://web.swipeinsight.app/posts/easier-integrations-with-instagram-and-marketing-api-for-developers-14165

## 法令対応（日本）

* 特定電子メール法の遵守（オプトイン、表示義務、オプトアウト導線、送信者偽装禁止）。顧客の同時問い合わせは本人意思の通知。必要表示はメール本文に含める
* 参考:
  * https://www.caa.go.jp/policies/policy/consumer_transaction/specifed_email/
  * https://www.dekyo.or.jp/soudan/contents/taisaku/1-2.html
* メール送信基盤: 認証済み独自ドメイン（SPF/DKIM/DMARC）、キュー/レート制御、バウンス/苦情処理
* APPI遵守: 取得・利用目的の明示、同意・拒否記録、保存期間/削除、第三者提供管理

## 決済/課金

* 業者向け月額10万円サブスクをStripe Billingで実装（JPY、請求書、自動更新、休止/解約）
* 参考:
  * https://stripe.com/billing/features
  * https://www.docswell.com/s/hidetaka-stripe/KP9L7Q-jpstripes-tokyo-202309

## アーキテクチャ

* フロント: Next.js/TypeScript（SSR/SEO）、UI: Tailwind/Headless UI
* バックエンド: NestJS/TypeScript、メールキュー: BullMQ/Redis
* DB: PostgreSQL（Prisma）、静的配信: S3+CloudFront
* インフラ: AWS（ALB/ECS Fargate/RDS/ElastiCache/S3/SES）、Secrets: AWS Secrets Manager
* 監視/品質: CloudWatch + Sentry（エラー）+ APM/ログ

## データモデル（要点）

* Company / ServiceTemplate / Inquiry / Subscription / InstagramAccount / EmailDelivery / AdminAuditLog

## セキュリティ/コンプライアンス

* OIDC認証（Auth0/Cognito）、RBAC（顧客/業者/管理者）

* 暗号化（転送時/保存時）、監査ログ保全、権限最小化

## 運用

* 掲載審査、300社枠運用、Instagram毎日投稿プランのカレンダー・承認・自動投稿

## 分析

* 顧客行動、獲得数、Instagram指標、メール到達率/開封率/クリック率/苦情率

## 上位概念（学習統合実行ループ）

* Learn / Integrate / Execute / Allocate / Generate / Understand の継続運用

## マイルストーン（目安）

* フェーズ0: 詳細要件/法務/情報設計
* フェーズ1: MVP（検索・同送・Instagram閲覧）
* フェーズ2: Stripe/枠運用/送信ドメイン認証/監視
* フェーズ3: Instagram自動投稿・分析ダッシュボード

## 次のアクション

* 価格テンプレ初期案
* 掲載審査基準/約款/プライバシー草案
* 業者オンボ資料（Instagram接続・Stripe登録）
* Stripe Billingプラン設定（10万円/月、休止/解約）