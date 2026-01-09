/**
 * 系统配置文件
 * 请在此配置您的Supabase数据库信息
 */

const config = {
  // Supabase 数据库配置
  supabase: {
    url: 'https://vphihqysgdhdnuszybib.supabase.co',  // 替换为您的Supabase项目URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaGlocXlzZ2RoZG51c3p5YmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MjExMjEsImV4cCI6MjA4MzQ5NzEyMX0.85JkUoJw4S7gVIPGn23G4CDaCKhgtzqNQOYDiQEKNps',  // 替换为您的Supabase匿名密钥
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaGlocXlzZ2RoZG51c3p5YmliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzkyMTEyMSwiZXhwIjoyMDgzNDk3MTIxfQ.7PF3LfgT5kplfstnt2fNez5YWyWc808OQo0m16irEr4'  // 替换为您的Supabase服务角色密钥
  },
  
  // 系统配置
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