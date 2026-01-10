# QR码游戏系统

一个使用二维码记录摊位游戏的Web应用程序，支持管理2-30个摊位游戏和约300名用户。

## 技术栈

- **前端**: HTML, CSS, JavaScript, Tailwind CSS
- **数据库**: Supabase PostgreSQL
- **部署**: GitHub + Vercel

## 系统要求

- Supabase账号和项目
- 现代Web浏览器
- 互联网连接

## 快速开始

### 第一步：设置Supabase数据库

1. **登录Supabase**并创建一个新项目
2. **创建以下数据表**：

#### admins表
```sql
CREATE TABLE admins (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### games表
```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### users表
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  student_id TEXT NOT NULL UNIQUE,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### game_records表
```sql
CREATE TABLE game_records (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  game_id TEXT REFERENCES games(id),
  score INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

3. **获取API密钥**：
   - 在Supabase项目设置中找到API设置
   - 复制`Project URL`和`anon key`

### 第二步：配置系统

1. **修改配置文件**：
   - 打开 `js/config.js`
   - 粘贴您的Supabase URL和API密钥

### 第三步：初始化系统

1. **打开系统首页**：`index.html`
2. **点击"数据库设置"**
3. **点击"开始设置数据库"**
4. **等待设置完成**

### 第四步：登录系统

1. **管理员登录**：
   - 用户名：`admin`
   - 密码：`admin123`

2. **用户登录**：
   - 使用二维码扫描或输入ID/姓名登录

## 系统功能

### 管理员功能

- **数据统计**：查看系统整体数据和图表分析
- **游戏管理**：添加、编辑、删除游戏
- **用户管理**：管理所有用户信息
- **数据库工具**：初始化和维护数据库

### 用户功能

- **二维码登录**：扫描个人二维码快速登录
- **成绩记录**：扫描游戏二维码记录成绩
- **个人中心**：查看个人成绩和排名

## 二维码格式

- **用户二维码**：`user:{userId}`
- **游戏二维码**：`game:{gameId}`

## 故障排除

### 常见问题

1. **数据库连接失败**：
   - 检查API密钥是否正确
   - 确保Supabase项目已启用

2. **无法添加游戏/用户**：
   - 检查数据库表结构是否正确
   - 确保字段名称完全匹配

3. **二维码扫描不工作**：
   - 确保摄像头权限已授予
   - 检查二维码格式是否正确

### 重置系统

如果系统出现严重问题，可以：
1. **清空数据库**：删除所有表中的数据
2. **重新初始化**：再次运行数据库设置工具

## 部署说明

### GitHub + Vercel部署

1. **创建GitHub仓库**
2. **上传项目文件**
3. **连接Vercel**：
   - 登录Vercel
   - 导入GitHub仓库
   - 无需特殊配置，直接部署

## 使用说明

### 添加新游戏

1. 登录管理员账号
2. 点击"游戏管理"
3. 点击"新增游戏"
4. 填写游戏信息并保存

### 添加新用户

1. 登录管理员账号
2. 点击"用户管理"
3. 点击"新增用户"
4. 填写用户信息并保存

### 记录游戏成绩

1. 用户登录系统
2. 扫描游戏二维码
3. 输入或选择分数
4. 确认保存

## 安全注意事项

- 定期更新管理员密码
- 不要分享API密钥
- 监控异常登录活动

## 版本历史

- **v1.0.0**：初始版本发布

## 许可证

MIT License