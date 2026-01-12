// 系统配置文件
window.AppConfig = {
    // Supabase 配置
    supabase: {
        url: 'https://vphihqysgdhdnuszybib.supabase.co',
        key: 'sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS'
    },
    
    // 默认管理员账号
    DEFAULT_ADMIN: {
        username: 'admin',
        password: 'admin123'
    },
    
    // 系统信息
    SYSTEM: {
        name: 'QR碼遊戲系統',
        version: '1.0.0',
        description: '基於QR碼的攤位遊戲記分系統'
    },
    
    // 正则表达式
    REGEX: {
        GAME_ID: /^G\d{6}$/,
        USER_ID: /^U\d{6}$/,
        STUDENT_ID: /^\d{8}$/
    },
    
    // 消息提示
    MESSAGES: {
        SUCCESS: '操作成功',
        ERROR: '操作失敗',
        LOGIN_SUCCESS: '登入成功',
        LOGIN_FAILED: '登入失敗',
        INVALID_INPUT: '輸入格式錯誤',
        NETWORK_ERROR: '網絡連接錯誤',
        PERMISSION_DENIED: '權限不足'
    }
};

// 初始化 Supabase 客户端
if (!window.supabase && typeof createClient !== 'undefined') {
    window.supabase = createClient(
        window.AppConfig.supabase.url,
        window.AppConfig.supabase.key
    );
    console.log('Supabase 客户端初始化成功');
} else if (!window.supabase) {
    console.error('Supabase createClient 函数未找到');
}