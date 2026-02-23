// js/qrcode.js - 极简配置，仅存凭证和基础配置，移除复杂初始化逻辑
window.qrConfig = {
    // 【必须替换】你的Supabase URL和Key
    supabaseUrl: "https://vphihqysgdhdnuszybib.supabase.co",
    supabaseKey: "sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS",
    // QR码基础配置
    qr: {
        width: 150,
        height: 150,
        colorDark: "#000",
        colorLight: "#fff",
        correctLevel: 3 // 直接用数字代替QRCode.CorrectLevel.H，避免库加载前报错
    },
    timeout: 10000
};
