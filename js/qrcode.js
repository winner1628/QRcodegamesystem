// js/qrcode.js - Supabase Configuration
// Replace these values with your actual Supabase credentials!
window.qrCodeConfig = {
    supabaseUrl: "https://vphihqysgdhdnuszybib.supabase.co", // ← Replace this
    supabaseKey: "sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS"            // ← Replace this
};

// QR Code Default Settings
window.qrCodeDefaults = {
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H // High error correction
};
