

// 第一步：從 Supabase 控制台複製你的 URL 和 Anon Key
const supabaseUrl = "https://vphihqysgdhdnuszybib.supabase.co"; // 例如：https://xxxx.supabase.co
const supabaseKey = "sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS";   // 例如：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// 初始化 Supabase 客戶端
if (typeof supabase !== 'undefined') {
    // 全局 Supabase 實例
    window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    
    // 資料庫管理器（供其他JS文件調用）
    window.dbManager = {
        client: window.supabaseClient,
        initialized: false, // 標記是否已初始化
        // 初始化函數（確保連接成功）
        init: async function() {
            try {
                // 測試連接（獲取當前使用者，無需授權）
                const { data, error } = await this.client.auth.getUser();
                if (error) {
                    console.warn("Supabase 連接測試警告：", error.message);
                }
                this.initialized = true;
                console.log("✅ 資料庫初始化成功");
                return true;
            } catch (err) {
                console.error("❌ 資料庫初始化失敗：", err.message);
                alert(`資料庫初始化失敗：${err.message}\n請檢查config.js中的Supabase配置`);
                this.initialized = false;
                return false;
            }
        }
    };
} else {
    alert("❌ 找不到Supabase庫！請確認已加載supabase-js CDN");
    window.dbManager = { initialized: false, init: async () => false };
}
