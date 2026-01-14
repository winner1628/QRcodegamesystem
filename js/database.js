class DatabaseManager {
    constructor() { this.client = null; this.init(); }
    async init() {
        this.client = supabase.createClient(QRGameConfig.supabaseUrl, QRGameConfig.supabaseKey);
        console.log("✅ 資料庫連接初始化完成");
    }
    async getUser(username, password) {
        const { data } = await this.client.from('users').select('*').eq('username', username).eq('password', password).single();
        return data;
    }
    async getAllGames() { return (await this.client.from('games').select('*')).data; }
    async saveRecord(userId, gameId, score) {
        await this.client.from('game_records').insert({ user_id: userId, game_id: gameId, score: score });
    }
    async getAllUsers() { return (await this.client.from('users').select('*')).data; }
    async getAllRecords() {
        return (await this.client.from('game_records')
            .select('*, users(username), games(game_name)')
            .order('scanned_at', { ascending: false })).data;
    }
    async addGame(code, name, max) {
        await this.client.from('games').insert({ game_code: code, game_name: name, max_score: max });
    }
}
window.dbManager = new DatabaseManager();
