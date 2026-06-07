# todo-app

Next.js（App Router）で作った ToDo アプリです。データは Supabase の `todos` テーブルに保存します。

## セットアップ

```bash
npm install
```

`.env.local` に以下を設定してください。

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## 開発サーバー

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いて確認します。
