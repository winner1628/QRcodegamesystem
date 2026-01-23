# QR碼遊戲系統 - 使用說明文件
**版本**：1.0  
**語言**：繁體中文  
**技術棧**：HTML/CSS/JavaScript + Supabase (PostgreSQL)  


client:
https://winner1628.github.io/QRcodegamesystem/user-login.html:
admin
https://winner1628.github.io/QRcodegamesystem/admin-login.html

## 📋 系統概述
本系統是一個基於Web的QR碼遊戲分數記錄系統，用戶可透過手動輸入用戶名或掃描QR碼登入，並掃描遊戲QR碼自動記錄遊戲分數，同時提供遊戲紀錄查詢與分數統計功能。

## 🛠️ 環境準備
### 1. 前置條件
- 具備基礎的Web伺服器環境（如XAMPP、Nginx或GitHub Pages）
- Supabase帳號（免費層級即可滿足需求）
- 支援HTTPS的環境（相機/掃描功能需HTTPS協議）
- 現代瀏覽器（Chrome、Edge、Safari等）

### 2. 檔案結構
```
qr-game-system/
├── index.html          # 首頁（可自行實作）
├── user-login.html     # 用戶登入頁（手動/QR登入）
├── scan.html           # QR掃描與分數記錄頁
├── js/
│   ├── config.js       # Supabase配置文件
│   └── auth.js         # 登入/登出核心邏輯
└── README.md           # 使用說明文件
```

## 🗄️ 資料庫設定 (Supabase)
### 1. 建立Supabase專案
1. 前往 [Supabase官網](https://supabase.com/) 註冊並建立新專案
2. 進入專案後，複製「Project URL」與「anon public key」（稍後用於配置文件）

### 2. 建立資料表
在Supabase的SQL編輯器中執行以下SQL語句，建立所需資料表：

```sql
-- 用戶表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 遊戲表
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_code VARCHAR(20) UNIQUE NOT NULL,  -- 例如：GAME001
  game_name VARCHAR(100) NOT NULL,        -- 遊戲名稱
  max_score INTEGER DEFAULT 1000,         -- 遊戲最高分數
  default_score INTEGER DEFAULT 500,      -- 預設分數
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 遊戲紀錄表
CREATE TABLE game_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,                 -- 獲得分數
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立索引優化查詢
CREATE INDEX idx_game_records_user_id ON game_records(user_id);
CREATE INDEX idx_game_records_scanned_at ON game_records(scanned_at);
```

### 3. 插入範例遊戲數據
```sql
-- 插入範例遊戲
INSERT INTO games (game_code, game_name, max_score, default_score) VALUES
('GAME001', '闖關遊戲1', 1000, 500),
('GAME002', '闖關遊戲2', 800, 400),
('GAME003', '闖關遊戲3', 1200, 600);
```

### 4. 設定Row Level Security (RLS)
為確保資料安全，建議開啟RLS並設定適當權限：
```sql
-- 啟用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_records ENABLE ROW LEVEL SECURITY;

-- 允許所有使用者讀取遊戲資料
CREATE POLICY "Allow read access to games" ON games
  FOR SELECT USING (true);

-- 僅允許使用者讀取自己的紀錄
CREATE POLICY "Allow read own game records" ON game_records
  FOR SELECT USING (auth.uid() = user_id);

-- 允許使用者插入自己的紀錄
CREATE POLICY "Allow insert own game records" ON game_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## ⚙️ 系統配置
### 1. 配置Supabase連接 (js/config.js)
建立 `js/config.js` 文件，填入你的Supabase專案資訊：
```javascript
// Supabase配置
window.dbManager = {
  client: null,
  
  // 初始化資料庫連接
  async init() {
    try {
      // 替換為你的Supabase專案URL和公鑰
      const supabaseUrl = "你的Supabase Project URL";
      const supabaseKey = "你的Supabase anon public key";
      
      this.client = supabase.createClient(supabaseUrl, supabaseKey);
      return true;
    } catch (error) {
      console.error("資料庫初始化失敗：", error);
      return false;
    }
  }
};
```


## 🚀 使用方法
### 1. 用戶登入
#### 方式1：手動輸入用戶名登入
1. 打開 `user-login.html` 頁面
2. 在「用戶名」輸入框填入自定義用戶名
3. 點擊「手動登入」按鈕，系統會自動建立新用戶（若不存在）
4. 登入成功後自動跳轉到掃描頁

#### 方式2：掃描QR碼登入
1. 打開 `user-login.html` 頁面
2. 點擊「開啟QR掃描器」按鈕（需授予相機權限）
3. 掃描僅包含用戶名的QR碼（如：`user001`）
4. 系統自動填入用戶名並完成登入

### 2. 掃描遊戲QR碼
1. 登入後進入 `scan.html` 頁面
2. 點擊「開啟掃描器」按鈕啟動相機（需授予相機權限）
3. 掃描遊戲QR碼，支援兩種格式：
   - 基礎格式：`GAME001`（使用遊戲預設分數）
   - 自定分數：`GAME001:800`（自定義分數800）
4. 掃描成功後自動保存紀錄，並更新遊戲統計
5. 可隨時點擊「關閉掃描器」停止掃描

### 3. 查看遊戲紀錄
1. 在 `scan.html` 頁面右側可查看：
   - 總分數統計
   - 所有遊戲紀錄（包含遊戲名稱、分數、掃描時間）
   - 紀錄按時間倒序排列（最新的在前）

### 4. 登出系統
1. 在 `scan.html` 頁面點擊右上角「登出」按鈕
2. 系統清除本地用戶資訊，並跳轉到登入頁

## 📱 QR碼格式說明
### 1. 登入用QR碼
- 內容：僅包含用戶名（如：`user001`、`player123`）
- 格式要求：僅允許字母、數字、底線（`^[a-zA-Z0-9_]+$`）

### 2. 遊戲用QR碼
| 格式類型 | 範例 | 說明 |
|----------|------|------|
| 基礎格式 | `GAME001` | 使用遊戲預設分數 |
| 自定分數 | `GAME001:800` | 自定義分數800 |

## ❗ 常見問題
### 1. 相機無法開啟
- 確認使用HTTPS協議（本機開發可使用 `localhost`）
- 確認已授予瀏覽器相機權限
- 確認設備有可用的相機設備

### 2. 資料庫連接失敗
- 檢查 `config.js` 中的Supabase URL和公鑰是否正確
- 確認Supabase專案處於啟用狀態
- 檢查網路連接

### 3. QR碼掃描無回應
- 確認QR碼內容符合格式要求
- 確認QR碼清晰，無模糊或反光
- 確認相機對焦正常

### 4. 無法保存遊戲紀錄
- 確認遊戲代碼存在於 `games` 資料表中
- 檢查Supabase RLS政策是否配置正確
- 檢查控制台錯誤資訊

## 📌 注意事項
1. 本系統需在支援WebRTC的瀏覽器中執行（現代瀏覽器均支援）
2. 相機功能需HTTPS協議（本機開發的 `localhost` 除外）
3. 建議在行動裝置上使用（便於掃描QR碼）
4. Supabase免費層級有請求次數限制，大量使用需升級方案
5. 定期備份Supabase資料庫，避免資料遺失

## 🎯 功能擴充建議
1. 新增管理後台，用於新增/編輯遊戲資訊
2. 新增分數排行榜功能
3. 支援多語言切換
4. 新增用戶頭像與個人資料設定
5. 匯出遊戲紀錄為Excel/PDF
6. 新增掃描歷史記錄篩選功能
