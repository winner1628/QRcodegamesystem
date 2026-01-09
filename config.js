/**
 * 系統配置文件
 * 請在此配置您的Supabase數據庫信息
 */

const config = {
  // Supabase 數據庫配置
  supabase: {
    url: 'https://vphihqysgdhdnuszybib.supabase.co',  // 替換為您的Supabase項目URL
    anonKey: 'sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS'  // 替換為您的Supabase匿名密鑰
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