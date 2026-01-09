# QR游戏系统 - 摊位游戏二维码记录系统

这是一个专为活动组织者设计的摊位游戏管理系统，通过二维码技术简化游戏记录流程，提高活动效率。系统支持管理多个摊位游戏，可导入用户信息，实时记录游戏成绩和礼品发放，并提供数据导出功能。

## 功能特点

### 管理员功能
- **游戏管理**：创建、编辑、删除摊位游戏，设置游戏规则、礼品数量等
- **用户管理**：批量导入用户信息，查看用户参与情况
- **数据统计**：实时查看游戏参与情况、成绩分布等统计数据
- **数据导出**：导出游戏记录、用户数据等用于活动后分析

### 用户功能
- **扫码登录**：通过扫描二维码快速登录系统
- **游戏参与**：扫描游戏二维码参与游戏并记录成绩
- **成绩查询**：查看个人游戏记录、总得分和排行榜
- **礼品领取**：记录礼品领取状态

## 技术栈

- **前端**：HTML5, CSS3, JavaScript, Tailwind CSS, Font Awesome
- **后端**：Vercel Serverless Functions
- **数据库**：Supabase PostgreSQL
- **部署平台**：GitHub + Vercel

## 快速开始

### 前置要求

- GitHub账号
- Vercel账号
- Supabase账号

### 部署步骤

1. **克隆仓库**

```bash
git clone https://github.com/yourusername/qr-game-system.git
cd qr-game-system
```

2. **设置Supabase项目**

- 登录Supabase控制台，创建新项目
- 在SQL编辑器中执行`utils/initDatabase.sql`脚本创建数据库表
- 获取项目的API URL和密钥（Project Settings > API）

3. **部署到Vercel**

- 登录Vercel控制台
- 点击"New Project"，导入GitHub仓库
- 在环境变量设置中添加以下变量：
  - `SUPABASE_URL`: 你的Supabase项目URL
  - `SUPABASE_ANON_KEY`: 你的Supabase匿名密钥
  - `SUPABASE_SERVICE_ROLE_KEY`: 你的Supabase服务角色密钥
- 点击"Deploy"部署项目

4. **配置域名（可选）**

- 在Vercel项目设置中配置自定义域名
- 更新Supabase项目的认证设置，添加域名到允许列表

### 本地开发

1. **安装依赖**

```bash
npm install
```

2. **设置环境变量**

创建`.env.local`文件，添加以下内容：

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

3. **启动开发服务器**

```bash
npm run dev
```

## 数据库设计

系统包含以下主要数据表：

- **users**: 存储用户信息
- **games**: 存储游戏信息
- **game_records**: 存储游戏记录
- **settings**: 存储系统设置
- **admins**: 存储管理员账号

详细的数据库结构请参考`utils/initDatabase.sql`文件。

## 使用指南

### 管理员指南

1. **登录系统**：访问`/admin/login.html`，使用管理员账号登录
2. **设置游戏**：在游戏管理页面创建摊位游戏，设置游戏名称、规则、礼品数量等
3. **导入用户**：在用户管理页面上传CSV文件导入用户信息
4. **生成二维码**：系统会为每个游戏自动生成唯一二维码，打印并放置在对应摊位

### 用户指南

1. **登录系统**：访问`/user/login.html`，扫描二维码或输入用户ID登录
2. **参与游戏**：在每个摊位扫描游戏二维码
3. **记录成绩**：完成游戏后，系统会记录成绩并显示是否获得礼品
4. **查看记录**：在个人中心查看游戏记录和排行榜

## 许可证

MIT License