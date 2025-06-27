# GitHub OAuth 设置指南

## 1. 在 GitHub 上创建 OAuth 应用

1. 登录到你的 GitHub 账户
2. 进入 Settings > Developer settings > OAuth Apps
3. 点击 "New OAuth App"
4. 填写以下信息：
   - **Application name**: 你的应用名称（例如：MakeMoneyHelper）
   - **Homepage URL**: `http://localhost:3000`（开发环境）或你的生产域名
   - **Authorization callback URL**: `https://lvntelxiqkxfczclyrbu.supabase.co/auth/v1/callback`
5. 点击 "Register application"
6. 记录下 **Client ID** 和 **Client Secret**

## 2. 在 Supabase 中配置 GitHub 提供商

1. 登录到你的 Supabase 控制台
2. 进入你的项目
3. 导航到 Authentication > Providers
4. 找到 GitHub 提供商并启用它
5. 填写以下信息：
   - **Client ID**: 从 GitHub OAuth 应用获取的 Client ID
   - **Client Secret**: 从 GitHub OAuth 应用获取的 Client Secret
6. 保存设置

## 3. 环境变量配置

确保你的 `.env.local` 文件包含以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://lvntelxiqkxfczclyrbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2bnRlbHhpcWt4ZmN6Y2x5cmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjY2MTQsImV4cCI6MjA2NjMwMjYxNH0.vi53SR0UjSWCFwbeqy12zOCtJVsbzAIX4mbdm0lb2a8
```

## 4. 测试 GitHub 登录

1. 启动你的开发服务器：`npm run dev`
2. 访问登录页面
3. 点击 "使用 GitHub 登录" 按钮
4. 应该会重定向到 GitHub 进行授权
5. 授权后应该会重定向回你的应用

## 注意事项

- 确保回调 URL 完全匹配 Supabase 提供的 URL
- 在生产环境中，需要更新 GitHub OAuth 应用的 Homepage URL 和 Authorization callback URL
- 如果遇到问题，检查 Supabase 控制台中的错误日志 