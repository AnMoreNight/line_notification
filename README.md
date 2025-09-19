# 薬剤師認定管理システム - LINE通知サービス

薬剤師の研修認定期限を管理し、LINEで自動通知するシステムです。個人・法人向けに対応しています。

## 機能概要

### 個人向けサービス
- LINEログインによる簡単認証
- 研修認定期限の登録・管理
- 期限の6ヶ月前、3ヶ月前、1週間前の自動LINE通知
- 認定画像のアップロード・管理
- 期限更新の管理

### 法人向けサービス
- 企業・組織の従業員一括管理
- 専用登録URLの発行
- 従業員の認定情報管理
- 契約期限の管理
- 管理者ダッシュボード

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes, Prisma ORM
- **データベース**: PostgreSQL
- **認証**: NextAuth.js with LINE Login
- **通知**: LINE Bot SDK
- **UI**: Lucide React Icons, Custom Components

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`env.example`を参考に`.env.local`ファイルを作成し、以下の環境変数を設定してください：

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

### 3. LINE Developer Console の設定

1. [LINE Developers Console](https://developers.line.biz/)にアクセス
2. 新しいプロバイダーを作成
3. LINE Login チャンネルを作成
4. LINE Bot チャンネルを作成
5. 各チャンネルの認証情報を環境変数に設定

### 4. データベースのセットアップ

```bash
# Prisma マイグレーションの実行
npx prisma migrate dev

# データベースのシード（オプション）
npx prisma db seed
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは [http://localhost:3000](http://localhost:3000) で起動します。

## LINE Bot の設定

### Webhook URL の設定

LINE Bot チャンネルの Webhook URL を以下のように設定してください：

```
https://your-domain.com/api/webhook/line
```

### 通知システムの設定

通知システムを動作させるために、以下のいずれかの方法でスケジュールタスクを設定してください：

#### 1. Vercel Cron Jobs (推奨)

`vercel.json`ファイルを作成：

```json
{
  "crons": [
    {
      "path": "/api/notifications/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### 2. 外部Cronサービス

外部のCronサービス（例：cron-job.org）を使用して、毎日午前9時に以下のURLにPOSTリクエストを送信：

```
https://your-domain.com/api/notifications/send
```

## デプロイ

### Vercel へのデプロイ

1. Vercel アカウントを作成
2. GitHub リポジトリを接続
3. 環境変数を設定
4. デプロイを実行

```bash
npm install -g vercel
vercel
```

### その他のプラットフォーム

- **Railway**: PostgreSQL データベースと Next.js アプリケーションを同時にデプロイ
- **Heroku**: PostgreSQL アドオンと Next.js アプリケーションをデプロイ
- **AWS**: RDS (PostgreSQL) + ECS/EC2 でデプロイ

## API エンドポイント

### 認証
- `POST /api/auth/[...nextauth]` - NextAuth.js 認証

### ユーザー管理
- `POST /api/users/register` - ユーザー登録
- `GET /api/users/profile` - ユーザープロフィール取得

### 認定管理
- `GET /api/certifications` - 認定情報一覧
- `POST /api/certifications` - 認定情報登録
- `PUT /api/certifications/[id]` - 認定情報更新
- `DELETE /api/certifications/[id]` - 認定情報削除

### 通知
- `POST /api/notifications/send` - 通知送信（Cron用）
- `GET /api/notifications/send` - テスト通知送信

### LINE Bot
- `POST /api/webhook/line` - LINE Bot Webhook

### 企業管理
- `GET /api/companies/[id]` - 企業情報取得
- `GET /api/companies/[id]/employees` - 従業員一覧

## データベーススキーマ

### 主要テーブル

- **users**: ユーザー情報（個人・法人）
- **companies**: 企業情報
- **certifications**: 認定情報
- **notifications**: 通知履歴
- **notification_schedules**: 通知スケジュール

詳細は `prisma/schema.prisma` を参照してください。

## セキュリティ

- LINE Login による認証
- 環境変数による機密情報の管理
- Prisma による SQL インジェクション対策
- 入力データのバリデーション（Zod）
- HTTPS 通信の強制

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## サポート

技術的な質問や問題がある場合は、GitHub Issues でお知らせください。

## 開発者向け情報

### プロジェクト構造

```
line_notification/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 認証ページ
│   ├── dashboard/         # ダッシュボード
│   └── register/          # 登録ページ
├── components/            # React コンポーネント
│   ├── ui/               # UI コンポーネント
│   └── providers/        # プロバイダー
├── lib/                  # ユーティリティ・設定
├── prisma/               # データベーススキーマ
└── public/               # 静的ファイル
```

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# データベースマイグレーション
npx prisma migrate dev

# Prisma Studio 起動
npx prisma studio
```
