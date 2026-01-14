class DatabaseManager {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    // 初始化資料庫連接（帶詳細錯誤提示）
    async init() {
        try {
            // 檢查Supabase SDK是否加載
            if (typeof supabase === 'undefined') {
                throw new Error("❌ Supabase SDK加載失敗，請檢查網路");
            }

            // 檢查配置是否填寫
            if (!window.QRGameConfig.supabaseUrl || window.QRGameConfig.supabaseUrl.includes("你的項目ID")) {
                throw new Error("❌ 請先在js/config.js填寫正確的Supabase URL");
            }
            if (!window.QRGameConfig.supabaseKey || window.QRGameConfig.supabaseKey.includes("你的anon公鑰")) {
                throw new Error("❌ 請先在js/config.js填寫正確的Supabase Key");
            }

            // 建立Supabase客戶端
            this.client = supabase.createClient(
                window.QRGameConfig.supabaseUrl,
                window.QRGameConfig.supabaseKey
            );

            // 測試連接
            const { error } = await this.client.from('users').select('*').limit(1);
            if (error) {
                throw new Error(`❌ 資料庫連接失敗：${error.message}\n請檢查：1.URL/Key是否正確 2.是否開啟網路存取 3.是否建立users表`);
            }

            this.initialized = true;
            console.log("✅ 資料庫連接成功！");
            return true;
        } catch (err) {
            alert(err.message); // 彈窗提示具體錯誤
            console.error("資料庫初始化錯誤：", err);
            return false;
        }
    }

    // 驗證用戶登入（核心函數）
    async login(username, password, isAdmin = false) {
        // 先確保資料庫已連接
        if (!this.initialized) {
            const initSuccess = await this.init();
            if (!initSuccess) return null;
        }

        try {
            // 查詢用戶
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();

            if (error) {
                throw new Error(`❌ 查詢用戶失敗：${error.message}`);
            }

            // 管理員驗證
            if (isAdmin && data.username !== "admin") {
                throw new Error("❌ 非管理員帳號，無法登入後台");
            }

            return data; // 登入成功，返回用戶資訊
        } catch (err) {
            alert(err.message);
            console.error("登入錯誤：", err);
            return null;
        }
    }

    // 其他函數（不影響登入，保留即可）
    async getAllGames() {
        if (!this.initialized) await this.init();
        const { data } = await this.client.from('games').select('*');
        return data || [];
    }
    async saveRecord(userId, gameId, score) {
        if (!this.initialized) await this.init();
        await this.client.from('game_records').insert({ user_id: userId, game_id: gameId, score: score });
    }
}

// 全域實例
window.dbManager = new DatabaseManager();
