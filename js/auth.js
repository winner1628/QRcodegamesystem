// 身份验证模块
class AuthManager {
    constructor() {
        this.db = new DatabaseManager();
    }

    // 管理员登录
    async adminLogin(username, password) {
        try {
            console.log('管理员登录:', username);
            
            if (!username || !password) {
                return { success: false, message: '請輸入用戶名和密碼' };
            }

            const isValid = await this.db.verifyAdmin(username, password);
            
            if (isValid) {
                sessionStorage.setItem('admin_logged_in', 'true');
                sessionStorage.setItem('user_type', 'admin');
                sessionStorage.setItem('username', username);
                return { success: true, message: '登入成功' };
            } else {
                return { success: false, message: '用戶名或密碼錯誤' };
            }
        } catch (error) {
            console.error('管理员登录失败:', error);
            return { success: false, message: '登入失敗，請稍後重試' };
        }
    }

    // 用户登录
    async userLogin(userId) {
        try {
            console.log('用户登录:', userId);
            
            if (!userId) {
                return { success: false, message: '請輸入用戶ID' };
            }

            // 验证用户ID格式
            if (!window.AppConfig.REGEX.USER_ID.test(userId)) {
                return { success: false, message: '用戶ID格式錯誤，正確格式：U000001' };
            }

            const user = await this.db.verifyUser(userId);
            
            if (user) {
                sessionStorage.setItem('user_logged_in', 'true');
                sessionStorage.setItem('user_type', 'user');
                sessionStorage.setItem('user_id', userId);
                sessionStorage.setItem('user_name', user.name || user.username || '用戶');
                return { success: true, message: '登入成功', user };
            } else {
                return { success: false, message: '用戶不存在' };
            }
        } catch (error) {
            console.error('用户登录失败:', error);
            return { success: false, message: '登入失敗，請稍後重試' };
        }
    }

    // 登出
    logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }

    // 检查管理员是否已登录
    isAdminLoggedIn() {
        return sessionStorage.getItem('admin_logged_in') === 'true' && 
               sessionStorage.getItem('user_type') === 'admin';
    }

    // 检查用户是否已登录
    isUserLoggedIn() {
        return sessionStorage.getItem('user_logged_in') === 'true' && 
               sessionStorage.getItem('user_type') === 'user';
    }

    // 获取当前登录用户信息
    getCurrentUser() {
        if (this.isUserLoggedIn()) {
            return {
                id: sessionStorage.getItem('user_id'),
                name: sessionStorage.getItem('user_name')
            };
        } else if (this.isAdminLoggedIn()) {
            return {
                username: sessionStorage.getItem('username'),
                type: 'admin'
            };
        }
        return null;
    }

    // 检查并强制管理员登录
    enforceAdminLogin() {
        if (!this.isAdminLoggedIn()) {
            window.location.href = 'admin-login.html';
        }
    }

    // 检查并强制用户登录
    enforceUserLogin() {
        if (!this.isUserLoggedIn()) {
            window.location.href = 'user-login.html';
        }
    }

    // 解析QR码数据
    parseQRCodeData(qrData) {
        console.log('解析QR码数据:', qrData);
        
        if (!qrData || typeof qrData !== 'string') {
            return null;
        }

        // 去除首尾空格
        qrData = qrData.trim();
        
        if (qrData.startsWith('user:')) {
            const userId = qrData.substring(5).trim();
            if (window.AppConfig.REGEX.USER_ID.test(userId)) {
                return { type: 'user', id: userId };
            }
        } else if (qrData.startsWith('game:')) {
            const gameId = qrData.substring(5).trim();
            if (window.AppConfig.REGEX.GAME_ID.test(gameId)) {
                return { type: 'game', id: gameId };
            }
        } else if (window.AppConfig.REGEX.USER_ID.test(qrData)) {
            // 直接是用户ID
            return { type: 'user', id: qrData };
        } else if (window.AppConfig.REGEX.GAME_ID.test(qrData)) {
            // 直接是游戏ID
            return { type: 'game', id: qrData };
        }
        
        return null;
    }

    // 验证权限
    hasPermission(action) {
        const permissions = {
            'admin': ['manage_users', 'manage_games', 'view_stats', 'export_data', 'clear_records'],
            'user': ['view_profile', 'record_scores', 'view_records']
        };

        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            return false;
        }

        const userPermissions = permissions[currentUser.type] || [];
        return userPermissions.includes(action);
    }

    // 生成安全的会话ID
    generateSessionId() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    // 验证会话是否有效
    isValidSession() {
        const userType = sessionStorage.getItem('user_type');
        return userType === 'admin' || userType === 'user';
    }
}