// js/qrcode.js - 可配置二维码尺寸，和登录页共用相同凭证
window.qrConfig = {
    // 复制登录页可用的Supabase凭证
    supabaseUrl: "https://vphihqysgdhdnuszybib.supabase.co", 
    supabaseKey: "sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS", 
    // 二维码自定义配置（现在可以自由修改）
    qr: {
        size: 180,          // 二维码整体尺寸（宽高一致）
        cellSize: 8,        // 二维码小方格尺寸（影响密度）
        margin: 10,         // 二维码内边距
        color: "#000000",   // 二维码颜色
        bgColor: "#ffffff", // 二维码背景色
        textSize: 16,       // 二维码下方文字大小
        textColor: "#333333"// 文字颜色
    },
    timeout: 10000
};
