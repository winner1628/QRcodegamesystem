// QR码游戏系统 - 身份验证模块
// 版本: 2.0.0
// 日期: 2024-01-14

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
    }

    // 初始化
    async initialize() {
        try {
            // 从localStorage恢复登录状态
            this.restoreSession();
            
            console.log('✓ 身份验证管理器初始化成功');
            console.log('✓ 当前用户:', this.currentUser ? this.currentUser.username : '未登录');
            
        } catch (error) {
            console.error('✗ 身份验证管理器初始化失败:', error);
        }
    }

    // 管理员登录
    async adminLogin(username, password) {
        try {
            console.log(`正在尝试管理员登录: ${username}`);
            
            // 参数验证
            if (!username || !password) {
                throw new Error('用户名和密码不能为空');
            }
            
            // 获取管理员信息
            const admin = await window.dbManager.getAdminByUsername(username);
            
            if (!admin) {
                throw new Error('管理员不存在');
            }
            
            // 验证密码
            const encodedPassword = window.dbManager.encodeBase64(password);
            if (admin.password !== encodedPassword) {
                throw new Error('密码错误');
            }
            
            // 设置登录状态
            this.currentUser = {
                id: admin.id,
                username: admin.username,
                role: 'admin'
            };
            this.isAuthenticated = true;
            this.token = this.generateToken(this.currentUser);
            
            // 保存会话
            this.saveSession();
            
            console.log('✓ 管理员登录成功');
            
            return {
                success: true,
                user: this.currentUser,
                message: window.QRGameConfig.messages.loginSuccess
            };
            
        } catch (error) {
            console.error('✗ 管理员登录失败:', error);
            
            return {
                success: false,
                message: error.message || window.QRGameConfig.messages.loginFailed
            };
        }
    }

    // 用户登录
    async userLogin(username, password) {
        try {
            console.log(`正在尝试用户登录: ${username}`);
            
            // 参数验证
            if (!username || !password) {
                throw new Error('用户名和密码不能为空');
            }
            
            // 获取用户信息
            const user = await window.dbManager.getUserById(username);
            
            if (!user) {
                throw new Error('用户不存在');
            }
            
            // 验证密码
            const encodedPassword = window.dbManager.encodeBase64(password);
            if (user.password !== encodedPassword) {
                throw new Error('密码错误');
            }
            
            // 设置登录状态
            this.currentUser = {
                id: user.id,
                username: user.username,
                role: user.role || 'user',
                totalScore: user.total_score
            };
            this.isAuthenticated = true;
            this.token = this.generateToken(this.currentUser);
            
            // 保存会话
            this.saveSession();
            
            console.log('✓ 用户登录成功');
            
            return {
                success: true,
                user: this.currentUser,
                message: window.QRGameConfig.messages.loginSuccess
            };
            
        } catch (error) {
            console.error('✗ 用户登录失败:', error);
            
            return {
                success: false,
                message: error.message || window.QRGameConfig.messages.loginFailed
            };
        }
    }

    // 登出
    logout() {
        console.log('正在执行登出操作');
        
        // 清除登录状态
        this.currentUser = null;
        this.isAuthenticated = false;
        this.token = null;
        
        // 清除会话
        this.clearSession();
        
        console.log('✓ 登出成功');
        
        return {
            success: true,
            message: '登出成功'
        };
    }

    // 验证权限
    hasPermission(requiredRole) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }
        
        const roleHierarchy = {
            'admin': 3,
            'manager': 2,
            'user': 1
        };
        
        const userRoleLevel = roleHierarchy[this.currentUser.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
        
        return userRoleLevel >= requiredRoleLevel;
    }

    // 生成令牌
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            timestamp: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000) // 24小时过期
        };
        
        return btoa(JSON.stringify(payload));
    }

    // 验证令牌
    validateToken(token) {
        try {
            const payload = JSON.parse(atob(token));
            
            if (!payload || !payload.expires) {
                return false;
            }
            
            if (Date.now() > payload.expires) {
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('✗ 令牌验证失败:', error);
            return false;
        }
    }

    // 保存会话
    saveSession() {
        try {
            const sessionData = {
                user: this.currentUser,
                token: this.token,
                timestamp: Date.now()
            };
            
            localStorage.setItem('qrGameSession', JSON.stringify(sessionData));
            console.log('✓ 会话已保存');
            
        } catch (error) {
            console.error('✗ 保存会话失败:', error);
        }
    }

    // 恢复会话
    restoreSession() {
        try {
            const sessionData = localStorage.getItem('qrGameSession');
            
            if (!sessionData) {
                return;
            }
            
            const session = JSON.parse(sessionData);
            
            if (!session.token || !this.validateToken(session.token)) {
                this.clearSession();
                return;
            }
            
            this.currentUser = session.user;
            this.isAuthenticated = true;
            this.token = session.token;
            
            console.log('✓ 会话已恢复');
            
        } catch (error) {
            console.error('✗ 恢复会话失败:', error);
            this.clearSession();
        }
    }

    // 清除会话
    clearSession() {
        try {
            localStorage.removeItem('qrGameSession');
            console.log('✓ 会话已清除');
            
        } catch (error) {
            console.error('✗ 清除会话失败:', error);
        }
    }

    // 获取当前用户信息
    getCurrentUser() {
        return this.currentUser;
    }

    // 检查是否已登录
    isLoggedIn() {
        return this.isAuthenticated && !!this.currentUser;
    }

    // 检查是否是管理员
    isAdmin() {
        return this.isLoggedIn() && this.currentUser.role === 'admin';
    }

    // 检查是否是用户
    isUser() {
        return this.isLoggedIn() && this.currentUser.role === 'user';
    }
}

// 创建全局身份验证管理器实例
window.authManager = new AuthManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    await window.authManager.initialize();
});