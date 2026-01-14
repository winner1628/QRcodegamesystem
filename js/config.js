// QR码游戏系统 - 配置文件
// 版本: 3.0.0 - 修复版
// 日期: 2024-01-14

// 全局配置对象
window.QRGameConfig = {
    // Supabase 数据库配置
    supabase: {
        url: 'https://vhpihqysgdhdnuszybib.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZocGlocXlzZ2RoZG51c3p5YmlibiIsInR5cGUiOiJhcHAgcmVhZCIsImlhdCI6MTcyMzY1MTM4MCwiZXhwIjoyMDM5MjI3MzgwfQ.jOJj1qf4J8K4j5X5Z6L7M8N9O0P1Q2R3S4T5U6V7W8'
    },
    
    // 系统信息
    system: {
        name: 'QR碼遊戲系統',
        version: '3.0.0',
        description: '基於QR碼的攤位遊戲記分系統'
    },
    
    // 默认账号
    defaultAccounts: {
        admin: {
            username: 'admin',
            password: 'admin123'
        },
        user: {
            username: 'U000001',
            password: 'testuser'
        }
    },
    
    // 正则表达式
    regex: {
        gameId: /^G\d{6}$/,
        userId: /^U\d{6}$/,
        studentId: /^\d{8}$/,
        qrCode: /^GAME:(\w+):(\d+)$/
    },
    
    // 消息提示
    messages: {
        success: '操作成功',
        error: '操作失敗',
        loginSuccess: '登入成功',
        loginFailed: '登入失敗',
        invalidInput: '輸入格式錯誤',
        networkError: '網絡連接錯誤',
        permissionDenied: '權限不足',
        qrCodeInvalid: 'QR碼格式錯誤',
        qrCodeExpired: 'QR碼已過期',
        scanSuccess: '掃描成功',
        scoreSaved: '分數保存成功',
        gameNotFound: '遊戲不存在',
        userNotFound: '用戶不存在'
    },
    
    // 扫描配置
    scanner: {
        continuous: true,
        timeout: 30000,
        constraints: {
            video: {
                facingMode: 'environment' // 使用后置摄像头
            }
        }
    },
    
    // UI配置
    ui: {
        theme: 'light',
        primaryColor: '#000000',
        backgroundColor: '#ffffff',
        fontFamily: 'Microsoft JhengHei, PingFang TC, sans-serif'
    }
};

// 初始化Supabase客户端
async function initializeSupabase() {
    try {
        console.log('正在初始化Supabase客户端...');
        
        // 检查createClient函数是否存在
        if (typeof createClient === 'undefined') {
            throw new Error('Supabase SDK未加载，请检查CDN链接');
        }
        
        // 创建客户端实例
        window.supabaseClient = createClient(
            window.QRGameConfig.supabase.url,
            window.QRGameConfig.supabase.key
        );
        
        console.log('✓ Supabase客户端初始化成功');
        console.log('✓ 数据库URL:', window.QRGameConfig.supabase.url);
        console.log('✓ API Key:', '***' + window.QRGameConfig.supabase.key.slice(-10));
        
        return true;
    } catch (error) {
        console.error('✗ Supabase客户端初始化失败:', error.message);
        console.error('✗ 请检查网络连接和配置信息');
        return false;
    }
}

// 验证数据库连接
async function verifyDatabaseConnection() {
    try {
        if (!window.supabaseClient) {
            throw new Error('Supabase客户端未初始化');
        }
        
        console.log('正在验证数据库连接...');
        
        // 测试简单查询
        const { data, error } = await window.supabaseClient
            .from('admins')
            .select('*')
            .limit(1);
        
        if (error) {
            throw error;
        }
        
        console.log('✓ 数据库连接验证成功');
        console.log('✓ 成功连接到Supabase数据库');
        
        return true;
    } catch (error) {
        console.error('✗ 数据库连接验证失败:', error.message);
        console.error('✗ 故障排除建议:');
        console.error('  1. 检查Supabase URL是否正确');
        console.error('  2. 检查API Key是否有效');
        console.error('  3. 确保数据库表已创建');
        console.error('  4. 检查网络连接');
        return false;
    }
}

// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('全局错误:', event.error);
});

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', async function() {
    console.log('页面加载完成，正在初始化系统...');
    
    // 初始化Supabase
    const initialized = await initializeSupabase();
    if (initialized) {
        // 验证数据库连接
        await verifyDatabaseConnection();
    }
});