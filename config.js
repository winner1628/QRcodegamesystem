/**
 * 系統配置文件
 * 請在此配置您的Supabase數據庫信息
 */

// 正確的配置信息
const config = {
  // Supabase 數據庫配置
  supabase: {
    url: 'https://vphihqysgdhdnuszybib.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaGlocXlzZ2RoZG51c3p5YmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MjExMjEsImV4cCI6MjA4MzQ5NzEyMX0.85JkUoJw4S7gVIPGn23G4CDaCKhgtzqNQOYDiQEKNps'
  },
  
  // 系統配置
  system: {
    name: 'QR遊戲系統',
    maxGames: 30,
    minGames: 2,
    maxUsers: 300
  }
};

// 確保在瀏覽器環境中設置全局變量
if (typeof window !== 'undefined') {
  window.config = config;
  console.log('配置文件加載成功:', config);
}

// 支持模塊導出（用於Node.js環境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}