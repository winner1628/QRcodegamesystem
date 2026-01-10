// 数据库操作模块
class DatabaseManager {
    constructor() {
        this.supabase = window.AppConfig.supabase;
    }

    // 初始化数据库表
    async initializeDatabase() {
        try {
            // 检查并创建管理员表
            const { error: adminError } = await this.supabase.from('admins').select('id').limit(1);
            if (adminError) {
                console.log('管理员表不存在，创建默认管理员...');
                // 表不存在，创建默认管理员
                const { error: insertError } = await this.supabase.from('admins').insert({
                    username: window.AppConfig.DEFAULT_ADMIN.username,
                    password: this.hashPassword(window.AppConfig.DEFAULT_ADMIN.password),
                    created_at: new Date().toISOString()
                });
                
                if (insertError) {
                    console.error('创建默认管理员失败:', insertError);
                    // 如果是表不存在的错误，可能需要先创建表
                    console.log('尝试创建表结构...');
                    // 这里可以添加创建表的逻辑，如果Supabase需要的话
                } else {
                    console.log('默认管理员创建成功');
                }
            } else {
                console.log('管理员表已存在');
            }

            // 确保游戏表存在
            const { error: gamesError } = await this.supabase.from('games').select('id').limit(1);
            if (gamesError) {
                console.log('游戏表不存在');
            }
            
            // 确保用户表存在
            const { error: usersError } = await this.supabase.from('users').select('id').limit(1);
            if (usersError) {
                console.log('用户表不存在');
            }
            
            // 确保记录表存在
            const { error: recordsError } = await this.supabase.from('game_records').select('id').limit(1);
            if (recordsError) {
                console.log('记录表不存在');
            }

            return true;
        } catch (error) {
            console.error('数据库初始化失败:', error);
            return false;
        }
    }

    // 密码哈希
    hashPassword(password) {
        return btoa(password); // 简单的Base64编码，生产环境应使用更安全的哈希算法
    }

    // 验证管理员登录
    async verifyAdmin(username, password) {
        try {
            console.log('验证管理员登录:', username);
            const { data, error } = await this.supabase
                .from('admins')
                .select('*')
                .eq('username', username)
                .single();

            console.log('查询结果:', { data, error });

            if (error) {
                console.error('查询管理员失败:', error);
                // 如果是找不到数据的错误，返回false
                if (error.code === 'PGRST116') { // Supabase的"找不到数据"错误码
                    return false;
                }
                // 其他错误，尝试初始化数据库
                await this.initializeDatabase();
                return false;
            }

            if (!data) {
                console.log('未找到管理员数据');
                return false;
            }

            const hashedPassword = this.hashPassword(password);
            console.log('密码验证:', { 
                storedPassword: data.password ? data.password.substring(0, 10) + '...' : 'undefined',
                storedPasswordHash: data.password_hash ? data.password_hash.substring(0, 10) + '...' : 'undefined',
                input: hashedPassword.substring(0, 10) + '...'
            });
            
            // 检查两个可能的密码字段
            const isValid = data.password === hashedPassword || data.password_hash === hashedPassword;
            console.log('登录验证结果:', isValid);
            
            return isValid;
        } catch (error) {
            console.error('验证管理员登录时发生异常:', error);
            return false;
        }
    }

    // 更新管理员密码
    async updateAdminPassword(newPassword) {
        const hashedPassword = this.hashPassword(newPassword);
        
        // 检查数据库中存在哪个密码字段
        const { data } = await this.supabase.from('admins').select('*').eq('username', 'admin').single();
        
        let error;
        if (data && data.password !== undefined) {
            // 使用 password 字段
            const result = await this.supabase
                .from('admins')
                .update({ password: hashedPassword })
                .eq('username', 'admin');
            error = result.error;
        } else {
            // 使用 password_hash 字段
            const result = await this.supabase
                .from('admins')
                .update({ password_hash: hashedPassword })
                .eq('username', 'admin');
            error = result.error;
        }

        return !error;
    }

    // 获取所有游戏
    async getAllGames() {
        const { data, error } = await this.supabase
            .from('games')
            .select('*')
            .order('created_at', { ascending: false });

        return error ? [] : data;
    }

    // 添加游戏
    async addGame(gameData) {
        const { error } = await this.supabase
            .from('games')
            .insert({
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
        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        return error ? [] : data;
    }

    // 添加用户
    async addUser(userData) {
        const { error } = await this.supabase
            .from('users')
            .insert({
                ...userData,
                created_at: new Date().toISOString(),
                total_score: 0
            });

        return !error;
    }

    // 批量添加用户
    async bulkAddUsers(users) {
        const { error } = await this.supabase
            .from('users')
            .insert(users.map(user => ({
                ...user,
                created_at: new Date().toISOString(),
                total_score: 0
            })));

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
            // 更新用户总分
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
            .select('*')
            .eq('user_id', userId)
            .order('recorded_at', { ascending: false });

        return error ? [] : data;
    }

    // 获取游戏统计数据
    async getGameStatistics() {
        try {
            console.log('获取游戏统计数据...');
            
            // 获取游戏数据
            const gamesResult = await this.supabase.from('games').select('*');
            const games = gamesResult.data || [];
            console.log('游戏数据:', games);
            
            // 获取用户数据
            const usersResult = await this.supabase.from('users').select('*');
            const users = usersResult.data || [];
            console.log('用户数据:', users);
            
            // 获取记录数据
            const recordsResult = await this.supabase.from('game_records').select('*');
            const records = recordsResult.data || [];
            console.log('记录数据:', records);
            
            // 计算总分
            const totalScore = records.reduce((sum, record) => {
                const score = parseInt(record.score) || 0;
                return sum + score;
            }, 0);
            
            return {
                totalGames: games.length,
                totalUsers: users.length,
                totalRecords: records.length,
                totalScore: totalScore
            };
        } catch (error) {
            console.error('获取游戏统计数据失败:', error);
            // 返回默认值
            return {
                totalGames: 0,
                totalUsers: 0,
                totalRecords: 0,
                totalScore: 0
            };
        }
    }

    // 清空所有数据
    async clearAllData() {
        try {
            await this.supabase.from('game_records').delete();
            await this.supabase.from('users').delete();
            await this.supabase.from('games').delete();
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    }

    // 导出数据为CSV
    async exportToCSV(tableName) {
        let data;
        let headers;

        switch (tableName) {
            case 'games':
                data = await this.getAllGames();
                headers = ['ID', '游戏名称', '游戏描述', '最大分数', '创建时间'];
                break;
            case 'users':
                data = await this.getAllUsers();
                headers = ['ID', '用户姓名', '总分', '创建时间'];
                break;
            case 'records':
                data = await this.supabase.from('game_records').select('*');
                headers = ['记录ID', '用户ID', '游戏ID', '分数', '记录时间'];
                break;
            default:
                return null;
        }

        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header.toLowerCase().replace(/\s+/g, '_')] || '';
                    return `\"${value}\"`;
                }).join(',')
            )
        ].join('\n');

        return csvContent;
    }
}

// 导出数据库管理器
window.DatabaseManager = DatabaseManager;