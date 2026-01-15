// 第一步：從 Supabase 控制台複製你的 URL 和 Anon Key
const supabaseUrl = "https://vphihqysgdhdnuszybib.supabase.co"; // 例如：https://xxxx.supabase.co
const supabaseKey = "sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS";   // 例如：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


// 全域變數初始化（僅定義，不主動初始化）
window.dbManager = {
    client: null,
    initialized: false,
    init: async function() {
        try {
            // 檢查 Supabase 是否加載
            if (typeof supabase === 'undefined') {
                throw new Error("Supabase 庫未加載，請檢查 CDN 連接");
            }

            // 檢查配置是否填寫
            if (supabaseUrl === "YOUR_SUPABASE_URL" || supabaseKey === "YOUR_SUPABASE_ANON_KEY") {
                throw new Error("請替換 config.js 中的 Supabase URL 和 Anon Key");
            }

            // 初始化 Supabase 客戶端
            this.client = supabase.createClient(supabaseUrl, supabaseKey);
            
            // 測試連接（無需授權）
            await this.client.from('users').select('count', { count: 'exact', head: true });
            
            this.initialized = true;
            console.log("✅ 資料庫初始化成功");
            return true;
        } catch (err) {
            console.error("❌ 資料庫初始化失敗：", err.message);
            this.initialized = false;
            return false; // 只返回結果，不彈窗
        }
    }
};
