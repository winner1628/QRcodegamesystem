// 身份验证模块
class AuthManager {
    constructor() {
        this.db = new DatabaseManager();
    }

    // 管理员登录
    async adminLogin(username, password) {
        try {
            const isValid = await this.db.verifyAdmin(username, password);
            if (isValid) {
                sessionStorage.setItem('admin_logged_in', 'true');
                sessionStorage.setItem('user_type', 'admin');
                return { success: true };
            } else {
                return { success: false, message: '用户名或密码错误' };
            }
        } catch (error) {
            console.error('登录失败:', error);
            return { success: false, message: '登录失败，请稍后重试' };
        }
    }

    // 用户登录
    async userLogin(userId) {
        try {
            const user = await this.db.verifyUser(userId);
            if (user) {
                sessionStorage.setItem('user_logged_in', 'true');
                sessionStorage.setItem('user_type', 'user');
                sessionStorage.setItem('user_id', userId);
                sessionStorage.setItem('user_name', user.name);
                return { success: true, user };
            } else {
                return { success: false, message: '用户不存在' };
            }
        } catch (error) {
            console.error('用户登录失败:', error);
            return { success: false, message: '登录失败，请稍后重试' };
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
        }
        return null;
    }

    // 检查并强制登录
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
        if (qrData.startsWith('user:')) {
            return {
                type: 'user',
                id: qrData.substring(5)
            };
        } else if (qrData.startsWith('game:')) {
            return {
                type: 'game',
                id: qrData.substring(5)
            };
        } else {
            // 假设直接输入的是用户ID
            return {
                type: 'user',
                id: qrData
            };
        }
    }
}

// 导出身份验证管理器
window.AuthManager = AuthManager;