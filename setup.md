# セットアップガイド

## 1. 前提条件

- Node.js 18以上
- PostgreSQL データベース
- LINE Developer アカウント

## 2. プロジェクトのセットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/line_notification_db"

# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN="your_line_channel_access_token"
LINE_CHANNEL_SECRET="your_line_channel_secret"
LINE_LOGIN_CHANNEL_ID="your_line_login_channel_id"
LINE_LOGIN_CHANNEL_SECRET="your_line_login_channel_secret"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID="your_line_login_channel_id"
```

## 3. LINE Developer Console の設定

### 3.1 LINE Login チャンネルの作成

1. [LINE Developers Console](https://developers.line.biz/) にアクセス
2. 新しいプロバイダーを作成
3. LINE Login チャンネルを作成
4. チャンネル基本設定で以下を設定：
   - チャンネル名: 薬剤師認定管理システム
   - チャンネル説明: 薬剤師の研修認定期限管理サービス
   - アプリタイプ: Web app
   - コールバックURL: `http://localhost:3000/api/auth/callback/line`
   - スコープ: `profile`, `openid`, `email`

### 3.2 LINE Bot チャンネルの作成

1. Messaging API チャンネルを作成
2. チャンネル基本設定で以下を設定：
   - チャンネル名: 薬剤師認定管理Bot
   - チャンネル説明: 薬剤師認定期限通知Bot
   - カテゴリー: その他
3. Messaging API 設定で以下を設定：
   - Webhook URL: `https://your-domain.com/api/webhook/line`
   - Webhook の利用: オン
   - 応答メッセージ: オフ
   - 友だち追加時のあいさつメッセージ: オフ

## 4. データベースのセットアップ

### 4.1 データベースの作成

PostgreSQL でデータベースを作成：

```sql
CREATE DATABASE line_notification_db;
```

### 4.2 Prisma マイグレーション

```bash
npx prisma migrate dev --name init
```

### 4.3 サンプルデータの投入（オプション）

```bash
npm run db:seed
```

## 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## 6. 本番環境へのデプロイ

### 6.1 Vercel へのデプロイ

1. Vercel アカウントを作成
2. GitHub リポジトリを接続
3. 環境変数を設定
4. デプロイを実行

```bash
npm install -g vercel
vercel
```

### 6.2 環境変数の設定

本番環境では以下の環境変数を設定してください：

- `DATABASE_URL`: 本番データベースの接続文字列
- `LINE_CHANNEL_ACCESS_TOKEN`: LINE Bot チャンネルのアクセストークン
- `LINE_CHANNEL_SECRET`: LINE Bot チャンネルのシークレット
- `LINE_LOGIN_CHANNEL_ID`: LINE Login チャンネルのチャンネルID
- `LINE_LOGIN_CHANNEL_SECRET`: LINE Login チャンネルのシークレット
- `NEXTAUTH_URL`: 本番環境のURL
- `NEXTAUTH_SECRET`: ランダムな文字列
- `NEXT_PUBLIC_APP_URL`: 本番環境のURL
- `NEXT_PUBLIC_LINE_LOGIN_CHANNEL_ID`: LINE Login チャンネルのチャンネルID

### 6.3 LINE Bot Webhook URL の更新

本番環境のURLに合わせて、LINE Bot チャンネルの Webhook URL を更新してください：

```
https://your-domain.com/api/webhook/line
```

## 7. 通知システムの設定

### 7.1 Vercel Cron Jobs

Vercel を使用している場合、`vercel.json` ファイルで自動的に設定されます。

### 7.2 外部Cronサービス

他のホスティングサービスを使用している場合、外部のCronサービス（例：cron-job.org）を設定して、毎日午前9時に以下のURLにPOSTリクエストを送信してください：

```
https://your-domain.com/api/notifications/send
```

## 8. テスト

### 8.1 基本機能のテスト

1. 個人ユーザーとして登録
2. 認定情報を登録
3. LINE Bot との連携をテスト
4. 通知機能をテスト

### 8.2 法人機能のテスト

1. 法人ユーザーとして登録
2. 従業員登録URLを生成
3. 従業員として登録
4. 管理者ダッシュボードをテスト

## 9. トラブルシューティング

### 9.1 よくある問題

**LINE Login が動作しない**
- コールバックURLが正しく設定されているか確認
- チャンネルIDとシークレットが正しいか確認

**LINE Bot が応答しない**
- Webhook URLが正しく設定されているか確認
- チャンネルアクセストークンが正しいか確認

**データベース接続エラー**
- DATABASE_URLが正しく設定されているか確認
- データベースが起動しているか確認

### 9.2 ログの確認

```bash
# 開発環境
npm run dev

# 本番環境（Vercel）
vercel logs
```

## 10. セキュリティチェックリスト

- [ ] 環境変数が適切に設定されている
- [ ] HTTPS が有効になっている
- [ ] データベースのアクセス制限が設定されている
- [ ] LINE Bot の Webhook 検証が有効になっている
- [ ] ファイルアップロードの制限が設定されている

## 11. パフォーマンス最適化

- [ ] データベースインデックスの設定
- [ ] 画像の最適化
- [ ] CDN の設定
- [ ] キャッシュの設定

## 12. 監視とメンテナンス

- [ ] エラーログの監視
- [ ] データベースのバックアップ
- [ ] 定期的なセキュリティアップデート
- [ ] パフォーマンスの監視
