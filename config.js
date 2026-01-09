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


// 模擬數據（用於開發和測試）
const mockGames = [
  { id: 'game1', name: '闖關挑戰', description: '考驗你的反應能力', points: 10 },
  { id: 'game2', name: '謎題解謎', description: '運用你的智慧解開謎團', points: 15 },
  { id: 'game3', name: '幸運抽獎', description: '測試你的幸運指數', points: 5 }
];

const mockUsers = [
  { id: 'user1', name: '玩家一', email: 'player1@test.com', points: 0 },
  { id: 'user2', name: '玩家二', email: 'player2@test.com', points: 0 },
  { id: 'user3', name: '玩家三', email: 'player3@test.com', points: 0 }
];

const mockRecords = [
  { id: 'record1', userId: 'user1', gameId: 'game1', points: 10, timestamp: new Date().toISOString() },
  { id: 'record2', userId: 'user2', gameId: 'game2', points: 15, timestamp: new Date().toISOString() }
];

// 導出配置和模擬數據
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { config, mockGames, mockUsers, mockRecords };
}

// 全局變量（用於瀏覽器環境）
if (typeof window !== 'undefined') {
  window.config = config;
  window.mockGames = mockGames;
  window.mockUsers = mockUsers;
  window.mockRecords = mockRecords;
}
