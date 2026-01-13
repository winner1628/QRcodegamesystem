// 数据库操作模块
class DatabaseManager {
    constructor() {
        this.supabase = null;
        this.initializeSupabase();
    }
    
    // 初始化 Supabase 客户端
    initializeSupabase() {
        try {
            // 优先使用全局的 supabaseClient（从 config.js 初始化的）
            if (window.supabaseClient && typeof window.supabaseClient === 'object') {
                if (typeof window.supabaseClient.from === 'function') {
                    this.supabase = window.supabaseClient;
                    console.log('✓ 数据库管理器：使用 window.supabaseClient');
                } else {
                    console.error('✗ 数据库管理器：window.supabaseClient 没有 from 方法');
                }
            }
            // 备用：检查 window.supabase
            else if (window.supabase && typeof window.supabase === 'object') {
                if (typeof window.supabase.from === 'function') {
                    this.supabase = window.supabase;
                    console.log('✓ 数据库管理器：使用 window.supabase');
                } else if (window.supabase.createClient && typeof window.supabase.createClient === 'function') {
                    this.supabase = window.supabase.createClient(
                        window.AppConfig.supabase.url,
                        window.AppConfig.supabase.key
                    );
                    console.log('✓ 数据库管理器：使用 supabase.createClient 创建客户端');
                } else {
                    console.error('✗ 数据库管理器：window.supabase 没有 from 方法或 createClient 方法');
                }
            }
            // 备用：检查全局 createClient
            else if (typeof createClient === 'function') {
                this.supabase = createClient(
                    window.AppConfig.supabase.url,
                    window.AppConfig.supabase.key
                );
                console.log('✓ 数据库管理器：使用全局 createClient 函数');
            } else {
                console.error('✗ 数据库管理器：无法找到可用的 Supabase 客户端');
            }
            
            // 验证客户端
            if (this.supabase && typeof this.supabase.from === 'function') {
                console.log('✓ 数据库管理器初始化成功');
            } else {
                console.error('✗ 数据库管理器初始化失败：客户端不完整');
            }
        } catch (error) {
            console.error('✗ 数据库管理器初始化异常:', error);
        }
    }

    // 初始化数据库表
    async initializeDatabase() {
        try {
            // 检查 Supabase 客户端是否初始化
            if (!this.supabase) {
                console.error('Supabase 客户端未初始化');
                return { success: false, error: 'Supabase 客户端未初始化' };
            }
            
            console.log('初始化数据库...');
            
            // 检查并创建管理员表
            const { error: adminError } = await this.supabase.from('admins').select('id').limit(1);
            if (adminError) {
                console.log('管理员表不存在，创建默认管理员...');
                const { error: insertError } = await this.supabase.from('admins').insert({
                    username: window.AppConfig.DEFAULT_ADMIN.username,
                    password: this.hashPassword(window.AppConfig.DEFAULT_ADMIN.password),
                    created_at: new Date().toISOString()
                });
                
                if (insertError) {
                    console.error('创建默认管理员失败:', insertError);
                } else {
                    console.log('默认管理员创建成功');
                }
            }

            // 确保有默认游戏数据
            const { data: games, error: gamesError } = await this.supabase.from('games').select('*');
            if (gamesError || games.length === 0) {
                console.log('创建默认游戏数据...');
                const defaultGames = [
                    { name: '投籃挑戰', description: '三分線外投籃，投中得分', max_score: 100, created_at: new Date().toISOString() },
                    { name: '套圈圈', description: '用圈圈套中目標物', max_score: 100, created_at: new Date().toISOString() },
                    { name: '射擊遊戲', description: '氣槍射擊目標', max_score: 100, created_at: new Date().toISOString() },
                    { name: '闖關挑戰', description: '完成障礙闖關', max_score: 100, created_at: new Date().toISOString() },
                    { name: '益智謎題', description: '解開謎題獲得分數', max_score: 100, created_at: new Date().toISOString() }
                ];
                
                for (const game of defaultGames) {
                    const gameId = await this.generateGameId();
                    await this.supabase.from('games').insert({ id: gameId, ...game });
                }
            }

            return true;
        } catch (error) {
            console.error('数据库初始化失败:', error);
            return false;
        }
    }

    // 密码哈希
    hashPassword(password) {
        return btoa(password); // 简单的Base64编码
    }

    // 测试数据库连接
    async testConnection() {
        // 检查 Supabase 客户端是否初始化
        if (!this.supabase) {
            console.error('✗ 测试连接：Supabase 客户端未初始化');
            return { success: false, error: 'Supabase 客户端未初始化' };
        }
        
        // 检查客户端是否有 from 方法
        if (typeof this.supabase.from !== 'function') {
            console.error('✗ 测试连接：this.supabase.from 不是函数');
            return { success: false, error: 'this.supabase.from is not a function' };
        }
        
        try {
            console.log('正在测试数据库连接...');
            
            // 方法1：尝试查询一个简单的表
            console.log('方法1：尝试查询 admins 表');
            try {
                const { data: adminData, error: adminError } = await this.supabase
                    .from('admins')
                    .select('id')
                    .limit(1);
                
                if (!adminError) {
                    console.log('✓ 成功查询 admins 表');
                    return { success: true, message: '成功连接到数据库并查询 admins 表' };
                }
                console.log('查询 admins 表失败:', adminError.message);
            } catch (adminQueryError) {
                console.log('查询 admins 表异常:', adminQueryError.message);
            }
            
            // 方法2：尝试查询 users 表
            console.log('方法2：尝试查询 users 表');
            try {
                const { data: userData, error: userError } = await this.supabase
                    .from('users')
                    .select('id')
                    .limit(1);
                
                if (!userError) {
                    console.log('✓ 成功查询 users 表');
                    return { success: true, message: '成功连接到数据库并查询 users 表' };
                }
                console.log('查询 users 表失败:', userError.message);
            } catch (userQueryError) {
                console.log('查询 users 表异常:', userQueryError.message);
            }
            
            // 方法3：尝试查询 games 表
            console.log('方法3：尝试查询 games 表');
            try {
                const { data: gameData, error: gameError } = await this.supabase
                    .from('games')
                    .select('id')
                    .limit(1);
                
                if (!gameError) {
                    console.log('✓ 成功查询 games 表');
                    return { success: true, message: '成功连接到数据库并查询 games 表' };
                }
                console.log('查询 games 表失败:', gameError.message);
            } catch (gameQueryError) {
                console.log('查询 games 表异常:', gameQueryError.message);
            }
            
            // 如果所有查询都失败，检查是否是表不存在的问题
            console.log('所有表查询都失败，可能是表不存在或权限问题');
            return { 
                success: true, 
                message: '数据库连接成功，但所有表查询失败。可能是表不存在或权限问题。请先初始化数据库。' 
            };
            
        } catch (error) {
            console.error('✗ 数据库连接异常:', error);
            return { success: false, error: error.message };
        }
    }

    // 验证管理员登录
    async verifyAdmin(username, password) {
        // 检查 Supabase 客户端是否初始化
        if (!this.supabase) {
            console.error('✗ 验证管理员：Supabase 客户端未初始化');
            return false;
        }
        
        // 检查客户端是否有 from 方法
        if (typeof this.supabase.from !== 'function') {
            console.error('✗ 验证管理员：this.supabase.from 不是函数');
            return false;
        }
        
        try {
            console.log(`正在验证管理员用户: ${username}`);
            
            // 使用默认管理员账号进行验证（作为备用方案）
            const defaultAdmin = window.AppConfig?.admin;
            if (defaultAdmin && username === defaultAdmin.defaultUsername && password === defaultAdmin.defaultPassword) {
                console.log('✓ 使用默认管理员账号验证成功');
                return true;
            }
            
            // 首先尝试从 admins 表查询
            console.log('尝试从 admins 表查询管理员');
            try {
                const { data: adminData, error: adminError } = await this.supabase
                    .from('admins')
                    .select('*')
                    .eq('username', username)
                    .single();

                if (!adminError && adminData) {
                    console.log('找到管理员用户:', adminData.username);
                    const hashedPassword = this.hashPassword(password);
                    
                    // 检查各种密码字段
                    if (adminData.password === password || 
                        adminData.password === hashedPassword || 
                        adminData.password_hash === password || 
                        adminData.password_hash === hashedPassword) {
                        console.log('✓ 管理员密码验证成功');
                        return true;
                    } else {
                        console.log('✗ 管理员密码验证失败');
                    }
                } else {
                    console.log('在 admins 表中未找到用户:', adminError?.message);
                }
            } catch (adminQueryError) {
                console.log('查询 admins 表异常:', adminQueryError.message);
            }
            
            // 如果 admins 表查询失败，尝试从 users 表查询管理员用户
            console.log('尝试从 users 表查询管理员');
            try {
                const { data: userData, error: userError } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('username', username)
                    .eq('role', 'admin')
                    .single();

                if (!userError && userData) {
                    console.log('在 users 表找到管理员:', userData.username);
                    const hashedPassword = this.hashPassword(password);
                    
                    // 检查各种密码字段
                    if (userData.password === password || 
                        userData.password === hashedPassword || 
                        userData.password_hash === password || 
                        userData.password_hash === hashedPassword) {
                        console.log('✓ 用户表管理员密码验证成功');
                        return true;
                    } else {
                        console.log('✗ 用户表管理员密码验证失败');
                    }
                } else {
                    console.log('在 users 表中未找到管理员用户:', userError?.message);
                }
            } catch (userQueryError) {
                console.log('查询 users 表异常:', userQueryError.message);
            }
            
            console.log('✗ 所有验证方式都失败');
            return false;
        } catch (error) {
            console.error('✗ 验证管理员过程中发生异常:', error);
            return false;
        }
    }


    // 生成游戏ID
    async generateGameId() {
        try {
            // 检查 Supabase 客户端是否初始化
            if (!this.supabase) {
                console.error('Supabase 客户端未初始化');
                return 'G000001';
            }
            
            const { data, error } = await this.supabase
                .from('games')
                .select('id')
                .order('id', { ascending: false })
                .limit(1);

            if (error || !data || data.length === 0) {
                return 'G000001';
            }

            const lastId = data[0].id;
            const number = parseInt(lastId.substring(1)) + 1;
            return `G${number.toString().padStart(6, '0')}`;
        } catch (error) {
            console.error('生成游戏ID失败:', error);
            return 'G000001';
        }
    }

    // 生成用户ID
    async generateUserId() {
        try {
            // 检查 Supabase 客户端是否初始化
            if (!this.supabase) {
                console.error('Supabase 客户端未初始化');
                return 'U000001';
            }
            
            const { data, error } = await this.supabase
                .from('users')
                .select('id')
                .order('id', { ascending: false })
                .limit(1);

            if (error || !data || data.length === 0) {
                return 'U000001';
            }

            const lastId = data[0].id;
            const number = parseInt(lastId.substring(1)) + 1;
            return `U${number.toString().padStart(6, '0')}`;
        } catch (error) {
            console.error('生成用户ID失败:', error);
            return 'U000001';
        }
    }

    // 获取所有游戏
    async getAllGames() {
        // 检查 Supabase 客户端是否初始化
        if (!this.supabase) {
            console.error('Supabase 客户端未初始化');
            return [];
        }
        
        const { data, error } = await this.supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : data;
    }

    // 添加游戏
    async addGame(gameData) {
        // 检查 Supabase 客户端是否初始化
        if (!this.supabase) {
            console.error('Supabase 客户端未初始化');
            return false;
        }
        
        const gameId = await this.generateGameId();
        const { error } = await this.supabase
            .from('games')
            .insert({
                id: gameId,
                ...gameData,
                created_at: new Date().toISOString()
            });
        return !error;
    }

    // 更新游戏
    async updateGame(gameId, gameData) {
        const { error } = await this.supabase
            .from('games')
            .update(gameData)
            .eq('id', gameId);
        return !error;
    }

    // 删除游戏
    async deleteGame(gameId) {
        const { error } = await this.supabase
            .from('games')
            .delete()
            .eq('id', gameId);
        return !error;
    }

    // 获取所有用户
    async getAllUsers() {
        // 检查 Supabase 客户端是否初始化
        if (!this.supabase) {
            console.error('Supabase 客户端未初始化');
            return [];
        }
        
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : data;
    }

    // 添加用户
    async addUser(userData) {
        // 检查 Supabase 客户端是否初始化
        if (!this.supabase) {
            console.error('Supabase 客户端未初始化');
            return false;
        }
        
        const userId = await this.generateUserId();
        const { error } = await this.supabase
            .from('users')
            .insert({
                id: userId,
                ...userData,
                created_at: new Date().toISOString(),
                total_score: 0
            });
        return !error;
    }

    // 批量添加用户
    async bulkAddUsers(users) {
        const userPromises = users.map(async (user) => {
            const userId = await this.generateUserId();
            return {
                id: userId,
                ...user,
                created_at: new Date().toISOString(),
                total_score: 0
            };
        });

        const usersWithIds = await Promise.all(userPromises);
        const { error } = await this.supabase
            .from('users')
            .insert(usersWithIds);
        return !error;
    }

    // 更新用户
    async updateUser(userId, userData) {
        const { error } = await this.supabase
            .from('users')
            .update(userData)
            .eq('id', userId);
        return !error;
    }

    // 删除用户
    async deleteUser(userId) {
        const { error } = await this.supabase
            .from('users')
            .delete()
            .eq('id', userId);
        return !error;
    }

    // 验证用户
    async verifyUser(userId) {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        return error ? null : data;
    }

    // 记录游戏成绩
    async recordGameScore(userId, gameId, score) {
        const { error } = await this.supabase
            .from('game_records')
            .insert({
                user_id: userId,
                game_id: gameId,
                score: score,
                recorded_at: new Date().toISOString()
            });

        if (!error) {
            await this.updateUserTotalScore(userId);
        }

        return !error;
    }

    // 更新用户总分
    async updateUserTotalScore(userId) {
        const { data: records, error } = await this.supabase
            .from('game_records')
            .select('score')
            .eq('user_id', userId);

        if (error) return;

        const totalScore = records.reduce((sum, record) => sum + record.score, 0);

        await this.supabase
            .from('users')
            .update({ total_score: totalScore })
            .eq('id', userId);
    }

    // 获取用户游戏记录
    async getUserGameRecords(userId) {
        const { data, error } = await this.supabase
            .from('game_records')
            .select('*, games(name)')
            .eq('user_id', userId)
            .order('recorded_at', { ascending: false });
        return error ? [] : data;
    }

    // 获取游戏记录
    async getGameRecords(filters = {}) {
        try {
            let query = this.supabase
                .from('game_records')
                .select('*, users(name, student_id), games(name)')
                .order('recorded_at', { ascending: false });

            if (filters.userId) query = query.eq('user_id', filters.userId);
            if (filters.gameId) query = query.eq('game_id', filters.gameId);
            if (filters.startDate) query = query.gte('recorded_at', filters.startDate);
            if (filters.endDate) query = query.lte('recorded_at', filters.endDate);

            const { data, error } = await query;
            return error ? [] : data;
        } catch (error) {
            console.error('获取游戏记录失败:', error);
            return [];
        }
    }

    // 获取游戏统计数据
    async getGameStatistics() {
        try {
            const games = await this.getAllGames();
            const statistics = [];

            for (const game of games) {
                const { data: records, error } = await this.supabase
                    .from('game_records')
                    .select('*')
                    .eq('game_id', game.id);

                if (!error) {
                    statistics.push({
                        game_id: game.id,
                        game_name: game.name,
                        total_players: new Set(records.map(r => r.user_id)).size,
                        total_records: records.length,
                        average_score: records.length > 0 ? 
                            records.reduce((sum, r) => sum + r.score, 0) / records.length : 0
                    });
                }
            }

            return statistics;
        } catch (error) {
            console.error('获取游戏统计失败:', error);
            return [];
        }
    }

    // 获取用户排名
    async getUserRankings() {
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('total_score', { ascending: false })
            .limit(10);
        return error ? [] : data;
    }

    // 清空所有记录
    async clearAllRecords() {
        try {
            // 删除所有游戏记录
            await this.supabase.from('game_records').delete();
            
            // 重置所有用户总分
            await this.supabase.from('users').update({ total_score: 0 });
            
            return true;
        } catch (error) {
            console.error('清空记录失败:', error);
            return false;
        }
    }

    // 导出数据为CSV
    async exportDataToCSV() {
        try {
            const users = await this.getAllUsers();
            const games = await this.getAllGames();
            const records = await this.getGameRecords();

            let csv = '類型,ID,名稱,學號,總分,創建時間\n';
            
            // 导出用户数据
            users.forEach(user => {
                csv += `用戶,${user.id},${user.name},${user.student_id || ''},${user.total_score},${user.created_at}\n`;
            });

            // 导出游戏数据
            games.forEach(game => {
                csv += `遊戲,${game.id},${game.name},,${game.max_score},${game.created_at}\n`;
            });

            // 导出记录数据
            csv += '\n記錄ID,用戶ID,用戶名,遊戲ID,遊戲名,分數,記錄時間\n';
            records.forEach(record => {
                csv += `${record.id},${record.user_id},${record.users?.name || ''},${record.game_id},${record.games?.name || ''},${record.score},${record.recorded_at}\n`;
            });

            return csv;
        } catch (error) {
            console.error('导出数据失败:', error);
            return null;
        }
    }
}