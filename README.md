# QR遊戲系統 - 攤位遊戲二維碼記錄系統

## 系統介紹

QR遊戲系統是一個專為活動組織者設計的攤位遊戲管理平台，通過二維碼技術簡化遊戲記錄流程，提高活動效率。

### 主要功能

- **二維碼掃描**：用戶可使用手機攝像頭掃描攤位二維碼參與遊戲
- **遊戲管理**：支持2-30個攤位遊戲的設置和管理
- **用戶管理**：可導入約300名用戶信息，支持用戶登入和參與記錄
- **記錄查詢**：即時記錄遊戲成績和禮品發放情況
- **數據統計**：提供直觀的數據統計和分析功能
- **數據導出**：支持將參與記錄、用戶數據等導出為CSV格式

## 技術架構

- **前端**：HTML5, CSS3, JavaScript, Tailwind CSS v3
- **後端**：Node.js (Vercel Serverless Functions)
- **數據庫**：Supabase PostgreSQL
- **部署平台**：Vercel
- **版本控制**：GitHub

## 快速開始

### 前置要求

- GitHub 帳號
- Vercel 帳號
- Supabase 帳號
- 現代化的Web瀏覽器

### 安裝步驟

1. **克隆代碼庫**

```bash
git clone https://github.com/your-username/qr-game-system.git
cd qr-game-system
```

2. **配置Supabase數據庫**

- 登錄Supabase創建新項目
- 創建以下表結構：

```sql
-- 用戶表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_name TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 遊戲表
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    booth_number TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 參與記錄表
CREATE TABLE records (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    game_id INTEGER REFERENCES games(id),
    score TEXT,
    gift TEXT,
    operator TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 禮品表
CREATE TABLE gifts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    game_id INTEGER REFERENCES games(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. **配置環境變量**

在 `config.js` 文件中配置您的Supabase信息：

```javascript
const config = {
  supabase: {
    url: 'https://your-project-url.supabase.co',
    anonKey: 'your-anon-key'
  }
};
```

4. **部署到Vercel**

- 登錄Vercel
- 連接您的GitHub代碼庫
- 按照提示完成部署配置
- 部署完成後，您將獲得一個公開的URL

### 本地開發

1. **安裝依賴**

```bash
npm install
```

2. **啟動開發服務器**

```bash
npm run dev
```

3. **打開瀏覽器**

訪問 `http://localhost:3000`

## 使用指南

### 管理員操作

1. **管理員登入**
   - 訪問 `/admin.html`
   - 使用默認帳號：`admin`，密碼：`admin123`（生產環境請修改）

2. **管理功能**
   - **數據概覽**：查看系統整體數據統計
   - **遊戲管理**：添加、編輯、刪除遊戲
   - **用戶管理**：導入、管理用戶信息
   - **記錄查詢**：查詢和管理參與記錄
   - **數據導出**：導出各種數據報表
   - **系統設置**：配置系統參數

### 用戶操作

1. **用戶登入**
   - 訪問 `/user.html`
   - 輸入用戶ID和姓名

2. **參與遊戲**
   - 點擊"開始掃描"按鈕
   - 將攝像頭對準攤位二維碼
   - 系統自動識別並記錄參與信息
   - 完成參與後可獲得相應獎品

## 系統特色

- **響應式設計**：支持桌面端和移動端
- **即時反饋**：操作結果實時反饋
- **數據安全**：使用Supabase安全存儲數據
- **易於部署**：支持Vercel一鍵部署
- **開源免費**：完全開源，可自由定制

## 故障排除

### 常見問題

1. **攝像頭無法啟用**
   - 檢查瀏覽器是否有攝像頭訪問權限
   - 確保設備攝像頭正常工作
   - 檢查網絡連接是否穩定

2. **二維碼無法識別**
   - 確保二維碼清晰可見
   - 調整攝像頭與二維碼的距離
   - 檢查二維碼格式是否正確

3. **數據無法保存**
   - 檢查Supabase配置是否正確
   - 確認網絡連接正常
   - 查看瀏覽器控制台是否有錯誤信息

### 支持

如果您遇到任何問題，請提交Issue到GitHub代碼庫，我們將盡快回應。

## 貢獻指南

歡迎提交Pull Request來改進這個項目。在提交之前，請確保：

1. 代碼風格一致
2. 添加了必要的測試
3. 更新了相關文檔
4. 描述了您的更改內容

## 許可證

本項目採用MIT許可證。詳細信息請參閱LICENSE文件。

## 更新日誌

### v1.0.0 (2025-01-15)

- 初始版本發布
- 實現基本的二維碼掃描功能
- 支持遊戲管理和用戶管理
- 提供數據統計和導出功能

## 致謝

感謝所有為此項目做出貢獻的開發者和用戶！

---

**注意**：本系統僅供學習和非商業用途使用。在生產環境中使用時，請確保遵守相關法律法規。