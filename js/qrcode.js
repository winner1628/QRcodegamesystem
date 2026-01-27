// js/qrcode.js - Supabase Configuration
// Replace these values with your actual Supabase credentials!
window.qrCodeConfig = {
    supabaseUrl: "https://your-project-id.supabase.co", // ← Replace this
    supabaseKey: "your-anon-public-key-here"            // ← Replace this
};

// QR Code Default Settings
window.qrCodeDefaults = {
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H // High error correction
};
