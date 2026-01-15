class DatabaseManager {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    async init() {
        try {
            if (typeof supabase === 'undefined') {
                throw new Error("Supabase SDK加載失敗，請檢查網路");
            }
            if (!window.QRGameConfig) {
                throw new Error("找不到config.js配置文件");
            }
            if (!window.QRGameConfig.supabaseUrl || window.QRGameConfig.supabaseUrl.includes("你的項目ID")) {
                throw new Error("請填寫正確的Supabase URL");
            }
            if (!window.QRGameConfig.supabaseKey || window.QRGameConfig.supabaseKey.includes("你的anon公鑰")) {
                throw new Error("請填寫正確的Supabase Key");
            }

            this.client = supabase.createClient(
                window.QRGameConfig.supabaseUrl,
                window.QRGameConfig.supabaseKey
            );

            // 測試連接（同時檢查users和admins表）
            const [userTest, adminTest] = await Promise.all([
                this.client.from('users').select('*').limit(1),
                this.client.from('admins').select('*').limit(1)
            ]);
            if (userTest.error || adminTest.error) {
                throw new Error(`資料庫連接失敗：${userTest.error?.message || adminTest.error?.message}\n請檢查：1.URL/Key 2.是否建立users/admins表 3.Supabase網路權限`);
            }

            this.initialized = true;
            console.log("✅ 資料庫初始化成功！");
            return true;

        } catch (err) {
            alert(`❌ 資料庫初始化失敗：${err.message}`);
            console.error(err);
            return false;
        }
    }

    // 管理員後台專用：獲取所有普通用戶
    async getAllUsers() {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client.from('users').select('*').order('created_at', { ascending: false });
        if (error) {
            alert(`❌ 加載用戶數據失敗：${error.message}`);
            return [];
        }
        return data || [];
    }

    // 管理員後台專用：獲取所有管理員
    async getAllAdmins() {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client.from('admins').select('username, created_at').order('created_at', { ascending: false });
        if (error) {
            alert(`❌ 加載管理員數據失敗：${error.message}`);
            return [];
        }
        return data || [];
    }

    // 管理員後台專用：獲取所有遊戲
    async getAllGames() {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client.from('games').select('*');
        if (error) {
            alert(`❌ 加載遊戲數據失敗：${error.message}`);
            return [];
        }
        return data || [];
    }

    // 管理員後台專用：獲取所有遊戲紀錄（聯表查詢）
    async getAllGameRecords() {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client
            .from('game_records')
            .select(`
                *,
                users(username),
                games(game_name, game_code)
            `)
            .order('scanned_at', { ascending: false });
        
        if (error) {
            alert(`❌ 加載遊戲紀錄失敗：${error.message}`);
            return [];
        }
        return data || [];
    }

    // 管理員後台專用：新增遊戲
    async addGame(gameCode, gameName, maxScore = 1000) {
        if (!this.initialized) await this.init();
        const { error } = await this.client
            .from('games')
            .insert([{ game_code: gameCode, game_name: gameName, max_score: maxScore }]);
        
        if (error) {
            alert(`❌ 新增遊戲失敗：${error.message}`);
            return false;
        }
        alert("✅ 遊戲新增成功！");
        return true;
    }
}

window.dbManager = new DatabaseManager();
// 頁面加載時預初始化資料庫
window.dbManager.init().catch(err => console.error(err));
