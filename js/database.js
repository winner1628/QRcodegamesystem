// 数据库操作模块
class DatabaseManager {
    constructor() {
        // 检查是否使用模拟数据
        this.useMockData = localStorage.getItem('use_mock_data') === 'true';
        this.supabase = window.supabase;
        
        if (this.useMockData) {
            console.log('使用模拟数据模式');
        } else if (!this.supabase) {
            console.error('Supabase 客户端未初始化');
        }
    }

    // 初始化数据库表
    async initializeDatabase() {
        try {
            // 检查是否使用模拟数据
            if (this.useMockData) {
                console.log('模拟数据模式：数据库初始化成功');
                return { success: true, message: '模拟数据模式：数据库初始化成功' };
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
        // 检查是否使用模拟数据
        if (this.useMockData) {
            return { success: true, message: '使用模拟数据模式' };
        }
        
        try {
            const { data, error } = await this.supabase.from('admins').select('id').limit(1);
            if (error) {
                console.error('数据库连接失败:', error);
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (error) {
            console.error('数据库连接异常:', error);
            return { success: false, error: error.message };
        }
    }

    // 验证管理员登录
    async verifyAdmin(username, password) {
        // 检查是否使用模拟数据
        if (this.useMockData) {
            try {
                const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
                const adminUser = mockUsers.find(user => user.username === username && user.role === 'admin');
                
                if (!adminUser) {
                    return false;
                }
                
                // 直接比较密码（模拟数据中密码是明文存储的）
                return adminUser.password === password;
            } catch (error) {
                console.error('验证模拟管理员失败:', error);
                return false;
            }
        }
        
        try {
            const { data, error } = await this.supabase
                .from('admins')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !data) {
                return false;
            }

            const hashedPassword = this.hashPassword(password);
            return data.password === hashedPassword || data.password_hash === hashedPassword;
        } catch (error) {
            console.error('验证管理员失败:', error);
            return false;
        }
    }

    // 生成游戏ID
    async generateGameId() {
        try {
            // 检查是否使用模拟数据
            if (this.useMockData) {
                const mockGames = JSON.parse(localStorage.getItem('mock_games') || '[]');
                if (!mockGames || mockGames.length === 0) {
                    return 'G000001';
                }
                
                // 找到最大的ID
                const maxId = mockGames.reduce((max, game) => {
                    const num = parseInt(game.game_id?.substring(1) || '0');
                    return num > max ? num : max;
                }, 0);
                
                return `G${(maxId + 1).toString().padStart(6, '0')}`;
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
            // 检查是否使用模拟数据
            if (this.useMockData) {
                const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
                if (!mockUsers || mockUsers.length === 0) {
                    return 'U000001';
                }
                
                // 找到最大的ID
                const maxId = mockUsers.reduce((max, user) => {
                    const num = parseInt(user.user_id?.substring(1) || '0');
                    return num > max ? num : max;
                }, 0);
                
                return `U${(maxId + 1).toString().padStart(6, '0')}`;
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
        // 检查是否使用模拟数据
        if (this.useMockData) {
            try {
                const mockGames = JSON.parse(localStorage.getItem('mock_games') || '[]');
                return mockGames || [];
            } catch (error) {
                console.error('获取模拟游戏数据失败:', error);
                return [];
            }
        }
        
        const { data, error } = await this.supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : data;
    }

    // 添加游戏
    async addGame(gameData) {
        // 检查是否使用模拟数据
        if (this.useMockData) {
            try {
                const gameId = await this.generateGameId();
                const mockGames = JSON.parse(localStorage.getItem('mock_games') || '[]');
                const newGame = {
                    id: mockGames.length + 1,
                    game_id: gameId,
                    ...gameData,
                    is_active: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                mockGames.push(newGame);
                localStorage.setItem('mock_games', JSON.stringify(mockGames));
                return true;
            } catch (error) {
                console.error('添加模拟游戏失败:', error);
                return false;
            }
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
        // 检查是否使用模拟数据
        if (this.useMockData) {
            try {
                const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
                return mockUsers || [];
            } catch (error) {
                console.error('获取模拟用户数据失败:', error);
                return [];
            }
        }
        
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        return error ? [] : data;
    }

    // 添加用户
    async addUser(userData) {
        // 检查是否使用模拟数据
        if (this.useMockData) {
            try {
                const userId = await this.generateUserId();
                const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
                const newUser = {
                    id: mockUsers.length + 1,
                    user_id: userId,
                    ...userData,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    total_score: 0
                };
                
                mockUsers.push(newUser);
                localStorage.setItem('mock_users', JSON.stringify(mockUsers));
                return true;
            } catch (error) {
                console.error('添加模拟用户失败:', error);
                return false;
            }
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