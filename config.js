/**
 * 系統配置文件
 * 請在此配置您的Supabase數據庫信息
 */

const config = {
  // Supabase 數據庫配置
  supabase: {
    url: 'https://vphihqysgdhdnuszybib.supabase.co',  // 替換為您的Supabase項目URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaGlocXlzZ2RoZG51c3p5YmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MjExMjEsImV4cCI6MjA4MzQ5NzEyMX0.85JkUoJw4S7gVIPGn23G4CDaCKhgtzqNQOYDiQEKNps'  // 替換為您的Supabase匿名密鑰
  },
  
  // 系統配置
  system: {
    name: 'QR遊戲系統',  // 系統名稱
    maxGames: 30,  // 最大遊戲數量
    minGames: 2,  // 最小遊戲數量
    maxUsers: 300  // 最大用戶數量
  }
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

// 全局變量（用於瀏覽器環境）
if (typeof window !== 'undefined') {
  window.config = config;
}
  window.mockUsers = mockUsers;
  window.mockRecords = mockRecords;
}
