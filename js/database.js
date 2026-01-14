// 資料庫管理類
class DatabaseManager {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    // 初始化資料庫連接
    async init() {
        try {
            // 檢查Supabase SDK是否加載
            if (typeof supabase === 'undefined') {
                throw new Error("Supabase SDK加載失敗，請檢查網路或CDN鏈接");
            }

            // 檢查配置是否填寫
            if (!window.QRGameConfig) {
                throw new Error("找不到配置文件，請檢查js/config.js是否存在");
            }
            if (!window.QRGameConfig.supabaseUrl || window.QRGameConfig.supabaseUrl.includes("你的項目ID")) {
                throw new Error("請在js/config.js中填寫正確的Supabase URL");
            }
            if (!window.QRGameConfig.supabaseKey || window.QRGameConfig.supabaseKey.includes("你的anon公鑰")) {
                throw new Error("請在js/config.js中填寫正確的Supabase Key");
            }

            // 建立客戶端
            this.client = supabase.createClient(
                window.QRGameConfig.supabaseUrl,
                window.QRGameConfig.supabaseKey
            );

            // 測試連接（查詢users表）
            const { error } = await this.client.from('users').select('*').limit(1);
            if (error) {
                throw new Error(`資料庫連接失敗：${error.message}\n請檢查：1.URL/Key是否正確 2.是否執行SQL建立users表 3.Supabase是否開啟網路存取`);
            }

            this.initialized = true;
            console.log("✅ 資料庫初始化成功！");
            return true;

        } catch (err) {
            alert(`❌ 資料庫初始化失敗：${err.message}`);
            console.error("資料庫錯誤：", err);
            return false;
        }
    }
}

// 建立全域的資料庫實例（確保其他JS能訪問）
window.dbManager = new DatabaseManager();
