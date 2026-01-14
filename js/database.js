// QR码游戏系统 - 数据库操作模块
// 版本: 3.0.0 - 修复版
// 日期: 2024-01-14

class DatabaseManager {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.initializePromise = null;
        this.retryCount = 0;
        this.maxRetries = window.QRGameConfig?.db?.retryAttempts || 3;
        this.retryDelay = window.QRGameConfig?.db?.retryDelay || 2000;
        this.timeout = window.QRGameConfig?.db?.timeout || 10000;
    }

    // 初始化数据库连接 - 修复版
    async initialize() {
        // 如果已经有初始化中的Promise，直接返回
        if (this.initializePromise) {
            return this.initializePromise;
        }
        
        // 创建新的初始化Promise
        this.initializePromise = this._initializeWithRetry();
        return this.initializePromise;
    }
    
    // 带重试机制的初始化
    async _initializeWithRetry() {
        try {
            // 如果已经初始化成功，直接返回
            if (this.isInitialized && this.client) {
                console.log('✅ DatabaseManager: 已经初始化完成');
                return true;
            }
            
            console.log(`🔄 DatabaseManager: 开始初始化 (尝试 ${this.retryCount + 1}/${this.maxRetries})...`);
            
            // 优先使用全局客户端
            if (window.supabaseClient) {
                console.log('✅ DatabaseManager: 使用全局Supabase客户端');
                this.client = window.supabaseClient;
            } else {
                // 如果全局客户端不存在，尝试重新初始化
                console.log('⚠️ DatabaseManager: 全局客户端不存在，尝试重新初始化...');
                
                // 检查配置
                if (!window.QRGameConfig || !window.QRGameConfig.supabase) {
                    throw new Error('配置文件未加载或配置不完整');
                }
                
                // 检查createClient函数
                if (typeof createClient === 'undefined') {
                    throw new Error('Supabase SDK未加载，请检查CDN链接');
                }
                
                // 创建新的客户端实例
                this.client = createClient(
                    window.QRGameConfig.supabase.url,
                    window.QRGameConfig.supabase.key
                );
                
                // 设置全局客户端
                window.supabaseClient = this.client;
            }
            
            // 验证客户端实例
            if (!this.client || typeof this.client.from !== 'function') {
                throw new Error('Supabase客户端实例无效');
            }
            
            // 测试数据库连接
            await this._testConnection();
            
            // 初始化成功
            this.isInitialized = true;
            this.retryCount = 0;
            
            console.log('✅ DatabaseManager: 数据库管理器初始化成功');
            console.log('📊 DatabaseManager: 客户端状态正常');
            
            return true;
            
        } catch (error) {
            console.error(`❌ DatabaseManager: 初始化失败 (尝试 ${this.retryCount + 1}/${this.maxRetries}):`, error.message);
            
            // 重置状态
            this.isInitialized = false;
            this.client = null;
            
            // 重试逻辑
            if (this.retryCount < this.maxRetries - 1) {
                this.retryCount++;
                console.log(`⏳ DatabaseManager: ${this.retryDelay}ms后进行第${this.retryCount + 1}次重试...`);
                
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this._initializeWithRetry();
            } else {
                console.error('❌ DatabaseManager: 达到最大重试次数，初始化失败');
                console.error('❌ DatabaseManager: 请检查网络连接和Supabase配置');
                return false;
            }
        } finally {
            // 清除初始化Promise
            this.initializePromise = null;
        }
    }
    
    // 测试数据库连接
    async _testConnection() {
        try {
            console.log('🔍 DatabaseManager: 测试数据库连接...');
            
            // 设置超时
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('数据库连接超时')), this.timeout)
            );
            
            // 测试查询
            const { data, error } = await Promise.race([
                this.client.from('admins').select('*').limit(1),
                timeoutPromise
            ]);
            
            if (error) {
                console.error('❌ DatabaseManager: 连接测试失败:', error.message);
                
                // 分析错误类型
                if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                    throw new Error('API Key无效或权限不足');
                } else if (error.message.includes('404') || error.message.includes('Not Found')) {
                    throw new Error('数据库表不存在，请检查Supabase项目配置');
                } else if (error.message.includes('Network') || error.message.includes('network')) {
                    throw new Error('网络连接错误，请检查网络设置');
                } else {
                    throw error;
                }
            }
            
            console.log('✅ DatabaseManager: 连接测试成功，获取到', data?.length || 0, '条记录');
            return true;
            
        } catch (error) {
            console.error('❌ DatabaseManager: 连接测试失败:', error.message);
            throw error;
        }
    }

    // 检查连接状态
    async checkConnection() {
        if (!this.client) {
            throw new Error('数据库连接未初始化');
        }
    }

    // ========== 管理员相关操作 ==========
    
    // 获取所有管理员
    async getAdmins() {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('admins')
                .select('*')
                .order('id', { ascending: true });
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('✗ 获取管理员列表失败:', error);
            throw error;
        }
    }

    // 根据用户名获取管理员
    async getAdminByUsername(username) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('admins')
                .select('*')
                .eq('username', username)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') { // 未找到记录
                    return null;
                }
                throw error;
            }
            
            return data;
            
        } catch (error) {
            console.error('✗ 根据用户名获取管理员失败:', error);
            throw error;
        }
    }

    // 添加管理员
    async addAdmin(adminData) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('admins')
                .insert({
                    username: adminData.username,
                    password: adminData.password,
                    created_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('✗ 添加管理员失败:', error);
            throw error;
        }
    }

    // ========== 用户相关操作 ==========
    
    // 获取所有用户
    async getUsers(searchTerm = '', limit = 50, offset = 0) {
        try {
            await this.checkConnection();
            
            let query = this.client.from('users').select('*');
            
            // 添加搜索条件
            if (searchTerm) {
                query = query.or(
                    `username.ilike.%${searchTerm}%,` +
                    `id.ilike.%${searchTerm}%`
                );
            }
            
            // 添加分页和排序
            const { data, error } = await query
                .order('total_score', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('✗ 获取用户列表失败:', error);
            throw error;
        }
    }

    // 根据ID获取用户
    async getUserById(userId) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }
            
            return data;
            
        } catch (error) {
            console.error('✗ 根据ID获取用户失败:', error);
            throw error;
        }
    }

    // 添加用户
    async addUser(userData) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('users')
                .insert({
                    id: userData.id,
                    username: userData.username,
                    password: userData.password,
                    role: userData.role || 'user',
                    total_score: userData.total_score || 0,
                    created_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('✗ 添加用户失败:', error);
            throw error;
        }
    }

    // 更新用户总分
    async updateUserTotalScore(userId, newTotalScore) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('users')
                .update({ total_score: newTotalScore })
                .eq('id', userId)
                .select();
            
            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('✗ 更新用户总分失败:', error);
            throw error;
        }
    }

    // ========== 游戏相关操作 ==========
    
    // 获取所有游戏
    async getGames(isActive = null) {
        try {
            await this.checkConnection();
            
            let query = this.client.from('games').select('*');
            
            // 添加状态过滤
            if (isActive !== null) {
                query = query.eq('is_active', isActive);
            }
            
            const { data, error } = await query
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('✗ 获取游戏列表失败:', error);
            throw error;
        }
    }

    // 根据ID获取游戏
    async getGameById(gameId) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }
            
            return data;
            
        } catch (error) {
            console.error('✗ 根据ID获取游戏失败:', error);
            throw error;
        }
    }

    // 添加游戏
    async addGame(gameData) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('games')
                .insert({
                    id: gameData.id,
                    name: gameData.name,
                    description: gameData.description,
                    max_score: gameData.max_score,
                    is_active: gameData.is_active !== false,
                    created_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('✗ 添加游戏失败:', error);
            throw error;
        }
    }

    // 更新游戏状态
    async updateGameStatus(gameId, isActive) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('games')
                .update({ is_active: isActive })
                .eq('id', gameId)
                .select();
            
            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('✗ 更新游戏状态失败:', error);
            throw error;
        }
    }

    // ========== 游戏记录相关操作 ==========
    
    // 添加游戏记录
    async addGameRecord(recordData) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('game_records')
                .insert({
                    id: recordData.id,
                    user_id: recordData.user_id,
                    game_id: recordData.game_id,
                    score: recordData.score,
                    recorded_by: recordData.recorded_by,
                    created_at: new Date().toISOString()
                })
                .select();
            
            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('✗ 添加游戏记录失败:', error);
            throw error;
        }
    }

    // 获取用户游戏记录
    async getUserGameRecords(userId, limit = 10) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('game_records')
                .select('*, games(name)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('✗ 获取用户游戏记录失败:', error);
            throw error;
        }
    }

    // 获取游戏统计
    async getGameStatistics(gameId) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('game_statistics')
                .select('*')
                .eq('game_id', gameId)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw error;
            }
            
            return data;
            
        } catch (error) {
            console.error('✗ 获取游戏统计失败:', error);
            throw error;
        }
    }

    // 更新游戏统计
    async updateGameStatistics(gameId, statistics) {
        try {
            await this.checkConnection();
            
            const existingStats = await this.getGameStatistics(gameId);
            
            if (existingStats) {
                // 更新现有统计
                const { data, error } = await this.client
                    .from('game_statistics')
                    .update({
                        total_players: statistics.total_players,
                        total_games: statistics.total_games,
                        avg_score: statistics.avg_score,
                        max_score: statistics.max_score,
                        updated_at: new Date().toISOString()
                    })
                    .eq('game_id', gameId)
                    .select();
                
                if (error) throw error;
                return data[0];
            } else {
                // 创建新统计
                const { data, error } = await this.client
                    .from('game_statistics')
                    .insert({
                        game_id: gameId,
                        total_players: statistics.total_players,
                        total_games: statistics.total_games,
                        avg_score: statistics.avg_score,
                        max_score: statistics.max_score,
                        updated_at: new Date().toISOString()
                    })
                    .select();
                
                if (error) throw error;
                return data[0];
            }
            
        } catch (error) {
            console.error('✗ 更新游戏统计失败:', error);
            throw error;
        }
    }

    // ========== 批量操作 ==========
    
    // 批量导入用户
    async batchImportUsers(usersData) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('users')
                .insert(usersData.map(user => ({
                    ...user,
                    created_at: new Date().toISOString()
                })))
                .select();
            
            if (error) throw error;
            return data;
            
        } catch (error) {
            console.error('✗ 批量导入用户失败:', error);
            throw error;
        }
    }

    // 批量删除用户
    async batchDeleteUsers(userIds) {
        try {
            await this.checkConnection();
            
            const { data, error } = await this.client
                .from('users')
                .delete()
                .in('id', userIds)
                .select();
            
            if (error) throw error;
            return data;
            
        } catch (error) {
            console.error('✗ 批量删除用户失败:', error);
            throw error;
        }
    }

    // ========== 工具方法 ==========
    
    // 生成唯一ID
    generateId(prefix) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}${timestamp}${random}`;
    }

    // Base64编码
    encodeBase64(str) {
        return btoa(unescape(encodeURIComponent(str)));
    }

    // Base64解码
    decodeBase64(str) {
        return decodeURIComponent(escape(atob(str)));
    }
}

// 创建全局数据库管理器实例
window.dbManager = new DatabaseManager();