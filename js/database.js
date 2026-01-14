// 数据库操作模块
class DatabaseManager {
    constructor() {
        this.supabase = null;
        this.initializeSupabase();
    }
    
    // 初始化 Supabase 客户端
    initializeSupabase() {
        try {
            console.log('=== 开始初始化数据库管理器 ===');
            
            // 直接使用全局 supabase 实例
            if (typeof window.supabase !== 'undefined' && window.supabase) {
                console.log('✓ 找到全局 supabase 实例');
                console.log('✓ 全局 supabase 类型:', typeof window.supabase);
                
                this.supabase = window.supabase;
                
                if (this.supabase && typeof this.supabase === 'object') {
                    const clientKeys = Object.keys(this.supabase);
                    console.log('✓ 客户端方法/属性数量:', clientKeys.length);
                    console.log('✓ 客户端方法/属性:', clientKeys.join(', '));
                    
                    if (typeof this.supabase.from === 'function') {
                        console.log('✓ from 方法存在且类型正确:', typeof this.supabase.from);
                        console.log('✓ 数据库管理器初始化成功');
                    } else {
                        console.error('✗ from 方法不存在或类型错误:', typeof this.supabase.from);
                        console.error('✗ 数据库管理器初始化失败：客户端不完整');
                    }
                } else {
                    console.error('✗ 全局 supabase 不是有效对象');
                }
            } else {
                console.error('✗ 未找到全局 supabase 实例');
                console.error('✗ window.supabase 存在:', typeof window.supabase !== 'undefined');
                console.error('✗ window.supabase 值:', window.supabase);
            }
            
            console.log('=== 数据库管理器初始化完成 ===');
        } catch (error) {
            console.error('✗ 初始化数据库管理器时发生异常:', error);
            console.error('✗ 异常详情:', error.message);
            console.error('✗ 异常堆栈:', error.stack);
        }
    }

    // 测试数据库连接
    async testConnection() {
        try {
            console.log('=== 开始测试数据库连接 ===');
            
            if (!this.supabase) {
                console.error('✗ 测试连接：Supabase 客户端未初始化');
                return { success: false, error: 'Supabase 客户端未初始化' };
            }
            
            if (typeof this.supabase.from !== 'function') {
                console.error('✗ 测试连接：this.supabase.from 不是函数');
                console.error('✗ from 方法类型:', typeof this.supabase.from);
                return { success: false, error: 'this.supabase.from is not a function' };
            }
            
            console.log('✓ 尝试查询 admins 表...');
            
            try {
                const { data: adminData, error: adminError } = await this.supabase
                    .from('admins')
                    .select('id, username')
                    .limit(1);
                
                if (!adminError && adminData && adminData.length > 0) {
                    console.log('✓ 成功查询 admins 表');
                    console.log('✓ 找到管理员:', adminData[0].username);
                    return { success: true, message: '成功连接到数据库并查询 admins 表' };
                } else if (adminError) {
                    console.log('✗ 查询 admins 表失败:', adminError.message);
                    return { success: false, error: adminError.message };
                } else {
                    console.log('✗ admins 表为空');
                }
            } catch (adminQueryError) {
                console.log('✗ 查询 admins 表异常:', adminQueryError.message);
            }
            
            console.log('✓ 尝试查询 users 表...');
            
            try {
                const { data: userData, error: userError } = await this.supabase
                    .from('users')
                    .select('id, username')
                    .limit(1);
                
                if (!userError && userData && userData.length > 0) {
                    console.log('✓ 成功查询 users 表');
                    console.log('✓ 找到用户:', userData[0].id, userData[0].username);
                    return { success: true, message: '成功连接到数据库并查询 users 表' };
                } else if (userError) {
                    console.log('✗ 查询 users 表失败:', userError.message);
                    return { success: false, error: userError.message };
                } else {
                    console.log('✗ users 表为空');
                }
            } catch (userQueryError) {
                console.log('✗ 查询 users 表异常:', userQueryError.message);
            }
            
            console.log('✗ 所有表查询都失败');
            return { 
                success: false, 
                error: '无法查询数据库表，可能是权限问题或表不存在' 
            };
            
        } catch (error) {
            console.error('✗ 数据库连接测试异常:', error);
            return { success: false, error: error.message };
        }
    }

    // 密码哈希
    hashPassword(password) {
        return btoa(password); // 简单的Base64编码
    }

    // 验证管理员登录
    async verifyAdmin(username, password) {
        try {
            console.log(`=== 开始验证管理员用户: ${username} ===`);
            
            if (!this.supabase) {
                console.error('✗ 验证管理员：Supabase 客户端未初始化');
                return false;
            }
            
            if (typeof this.supabase.from !== 'function') {
                console.error('✗ 验证管理员：this.supabase.from 不是函数');
                return false;
            }
            
            // 尝试从 admins 表查询
            console.log('✓ 尝试从 admins 表查询管理员');
            try {
                const { data: adminData, error: adminError } = await this.supabase
                    .from('admins')
                    .select('*')
                    .eq('username', username)
                    .single();

                if (!adminError && adminData) {
                    console.log('✓ 找到管理员用户:', adminData.username);
                    console.log('✓ 数据库中存储的密码:', adminData.password);
                    
                    const hashedPassword = this.hashPassword(password);
                    console.log('✓ 输入密码的Base64编码:', hashedPassword);
                    
                    // 检查密码（数据库中存储的是Base64编码的密码）
                    if (adminData.password === hashedPassword) {
                        console.log('✓ 管理员密码验证成功（Base64匹配）');
                        return true;
                    } else {
                        console.log('✗ 管理员密码验证失败');
                        console.log('✗ 密码不匹配：数据库密码 vs 输入密码编码');
                    }
                } else {
                    console.log('✗ 在 admins 表中未找到用户:', adminError?.message);
                }
            } catch (adminQueryError) {
                console.log('✗ 查询 admins 表异常:', adminQueryError.message);
            }
            
            console.log('✗ 所有验证方式都失败');
            return false;
        } catch (error) {
            console.error('✗ 验证管理员过程中发生异常:', error);
            return false;
        }
    }

    // 验证用户
    async verifyUser(userId) {
        try {
            console.log(`=== 开始验证用户: ${userId} ===`);
            
            if (!this.supabase) {
                console.error('✗ 验证用户：Supabase 客户端未初始化');
                return null;
            }
            
            if (typeof this.supabase.from !== 'function') {
                console.error('✗ 验证用户：this.supabase.from 不是函数');
                return null;
            }
            
            // 尝试从 users 表查询
            console.log('✓ 尝试从 users 表查询用户');
            try {
                const { data: userData, error: userError } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (!userError && userData) {
                    console.log('✓ 找到用户:', userData.id, userData.username);
                    console.log('✓ 用户数据:', JSON.stringify(userData, null, 2));
                    
                    // 为用户数据添加name字段（如果不存在）
                    if (!userData.name) {
                        userData.name = userData.username || '用户';
                    }
                    
                    return userData;
                } else {
                    console.log('✗ 在 users 表中未找到用户:', userError?.message);
                    if (userError) {
                        console.log('✗ 错误详情:', JSON.stringify(userError, null, 2));
                    }
                }
            } catch (userQueryError) {
                console.log('✗ 查询 users 表异常:', userQueryError.message);
                console.log('✗ 异常详情:', JSON.stringify(userQueryError, null, 2));
            }
            
            // 如果查询失败，尝试列出所有用户来调试
            console.log('✓ 尝试列出所有用户以进行调试');
            try {
                const { data: allUsers, error: listError } = await this.supabase
                    .from('users')
                    .select('*')
                    .limit(10);
                
                if (!listError && allUsers) {
                    console.log('✓ 找到', allUsers.length, '个用户');
                    allUsers.forEach(user => {
                        console.log('✓ 用户ID:', user.id, '用户名:', user.username);
                    });
                } else {
                    console.log('✗ 列出用户失败:', listError?.message);
                }
            } catch (listQueryError) {
                console.log('✗ 列出用户异常:', listQueryError.message);
            }
            
            console.log('✗ 用户验证失败');
            return null;
        } catch (error) {
            console.error('✗ 验证用户过程中发生异常:', error);
            console.log('✗ 异常详情:', JSON.stringify(error, null, 2));
            return null;
        }
    }

    // 生成游戏ID
    async generateGameId() {
        try {
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

        if (!error && records) {
            const totalScore = records.reduce((sum, record) => sum + record.score, 0);
            await this.supabase
                .from('users')
                .update({ total_score: totalScore })
                .eq('id', userId);
        }
    }

    // 获取用户游戏记录
    async getUserGameRecords(userId) {
        const { data, error } = await this.supabase
            .from('game_records')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return error ? [] : data;
    }

    // 获取游戏统计
    async getGameStatistics(gameId) {
        const { data, error } = await this.supabase
            .from('game_statistics')
            .select('*')
            .eq('game_id', gameId)
            .single();
        return error ? null : data;
    }

    // 更新游戏统计
    async updateGameStatistics(gameId) {
        const { data: records, error } = await this.supabase
            .from('game_records')
            .select('*')
            .eq('game_id', gameId);

        if (!error && records) {
            const totalPlayers = new Set(records.map(r => r.user_id)).size;
            const totalGames = records.length;
            const avgScore = records.length > 0 ? records.reduce((sum, r) => sum + r.score, 0) / records.length : 0;
            const maxScore = records.length > 0 ? Math.max(...records.map(r => r.score)) : 0;

            await this.supabase
                .from('game_statistics')
                .update({
                    total_players: totalPlayers,
                    total_games: totalGames,
                    avg_score: avgScore,
                    max_score: maxScore,
                    updated_at: new Date().toISOString()
                })
                .eq('game_id', gameId);
        }
    }

    // 清除所有游戏记录
    async clearAllGameRecords() {
        const { error } = await this.supabase
            .from('game_records')
            .delete();
        
        if (!error) {
            // 重置所有用户总分
            await this.supabase
                .from('users')
                .update({ total_score: 0 });
            
            // 重置所有游戏统计
            await this.supabase
                .from('game_statistics')
                .update({
                    total_players: 0,
                    total_games: 0,
                    avg_score: 0,
                    max_score: 0,
                    updated_at: new Date().toISOString()
                });
        }
        
        return !error;
    }

    // 导出数据
    async exportData() {
        try {
            const users = await this.getAllUsers();
            const games = await this.getAllGames();
            const records = await this.supabase
                .from('game_records')
                .select('*')
                .order('created_at', { ascending: false });
            
            return {
                users: users,
                games: games,
                records: records.data || [],
                export_time: new Date().toISOString()
            };
        } catch (error) {
            console.error('导出数据失败:', error);
            return null;
        }
    }
    
    // 初始化数据库
    async initializeDatabase() {
        try {
            console.log('=== 开始初始化数据库 ===');
            
            if (!this.supabase) {
                console.error('✗ 数据库客户端未初始化');
                throw new Error('数据库客户端未初始化');
            }
            
            // 检查数据库连接状态
            if (typeof this.supabase.from === 'function') {
                console.log('✓ 数据库连接正常');
                console.log('✓ 数据库初始化成功');
                return true;
            } else {
                console.error('✗ 数据库连接异常：from 方法不可用');
                throw new Error('数据库连接异常');
            }
        } catch (error) {
            console.error('✗ 数据库初始化失败:', error);
            throw error;
        }
    }

    // 批量导入用户
    async batchImportUsers(usersData) {
        try {
            console.log(`=== 开始批量导入用户，共 ${usersData.length} 条记录 ===`);
            
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }

            const { data, error } = await this.supabase
                .from('users')
                .insert(usersData);

            if (error) {
                console.error('✗ 批量导入用户失败:', error);
                throw error;
            }

            console.log(`✓ 批量导入用户成功，导入 ${data.length} 条记录`);
            return data;
        } catch (error) {
            console.error('✗ 批量导入用户时发生异常:', error);
            throw error;
        }
    }

    // 批量导入游戏
    async batchImportGames(gamesData) {
        try {
            console.log(`=== 开始批量导入游戏，共 ${gamesData.length} 条记录 ===`);
            
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }

            const { data, error } = await this.supabase
                .from('games')
                .insert(gamesData);

            if (error) {
                console.error('✗ 批量导入游戏失败:', error);
                throw error;
            }

            console.log(`✓ 批量导入游戏成功，导入 ${data.length} 条记录`);
            return data;
        } catch (error) {
            console.error('✗ 批量导入游戏时发生异常:', error);
            throw error;
        }
    }

    // 修改用户
    async updateUser(userId, updateData) {
        try {
            console.log(`=== 开始修改用户: ${userId} ===`);
            
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }

            const { data, error } = await this.supabase
                .from('users')
                .update(updateData)
                .eq('id', userId)
                .single();

            if (error) {
                console.error('✗ 修改用户失败:', error);
                throw error;
            }

            console.log(`✓ 修改用户成功: ${userId}`);
            return data;
        } catch (error) {
            console.error('✗ 修改用户时发生异常:', error);
            throw error;
        }
    }

    // 删除用户
    async deleteUser(userId) {
        try {
            console.log(`=== 开始删除用户: ${userId} ===`);
            
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }

            // 先删除相关的游戏记录
            await this.supabase
                .from('game_records')
                .delete()
                .eq('user_id', userId);

            const { data, error } = await this.supabase
                .from('users')
                .delete()
                .eq('id', userId)
                .single();

            if (error) {
                console.error('✗ 删除用户失败:', error);
                throw error;
            }

            console.log(`✓ 删除用户成功: ${userId}`);
            return data;
        } catch (error) {
            console.error('✗ 删除用户时发生异常:', error);
            throw error;
        }
    }

    // 修改游戏
    async updateGame(gameId, updateData) {
        try {
            console.log(`=== 开始修改游戏: ${gameId} ===`);
            
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }

            const { data, error } = await this.supabase
                .from('games')
                .update(updateData)
                .eq('id', gameId)
                .single();

            if (error) {
                console.error('✗ 修改游戏失败:', error);
                throw error;
            }

            console.log(`✓ 修改游戏成功: ${gameId}`);
            return data;
        } catch (error) {
            console.error('✗ 修改游戏时发生异常:', error);
            throw error;
        }
    }

    // 删除游戏
    async deleteGame(gameId) {
        try {
            console.log(`=== 开始删除游戏: ${gameId} ===`);
            
            if (!this.supabase) {
                throw new Error('数据库客户端未初始化');
            }

            // 先删除相关的游戏记录
            await this.supabase
                .from('game_records')
                .delete()
                .eq('game_id', gameId);

            // 删除游戏统计
            await this.supabase
                .from('game_statistics')
                .delete()
                .eq('game_id', gameId);

            const { data, error } = await this.supabase
                .from('games')
                .delete()
                .eq('id', gameId)
                .single();

            if (error) {
                console.error('✗ 删除游戏失败:', error);
                throw error;
            }

            console.log(`✓ 删除游戏成功: ${gameId}`);
            return data;
        } catch (error) {
            console.error('✗ 删除游戏时发生异常:', error);
            throw error;
        }
    }
}