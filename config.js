/**
 * 系统配置文件
 * 请在此配置您的Supabase数据库信息
 */

const config = {
  // Supabase 数据库配置
  supabase: {
    url: 'https://your-project-url.supabase.co',  // 替换为您的Supabase项目URL
    anonKey: 'your-anon-key'  // 替换为您的Supabase匿名密钥
    // 注意：serviceRoleKey已移除，前端不需要使用此密钥
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