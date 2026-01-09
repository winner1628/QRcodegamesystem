/**
 * 游戏记录 API
 * 用于处理游戏记录的创建、查询和统计操作
 */

const supabase = require('../utils/supabaseClient');
const config = require('../config');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    // 获取请求方法
    const method = req.method;
    
    // 根据不同的请求方法处理不同的操作
    switch (method) {
      case 'GET':
        // 获取游戏记录
        if (req.query.user_id) {
          // 获取用户的游戏记录
          await getUserRecords(req, res);
        } else if (req.query.game_id) {
          // 获取游戏的所有记录
          await getGameRecords(req, res);
        } else if (req.query.stats) {
          // 获取统计数据
          await getStats(req, res);
        } else {
          // 获取所有记录
          await getAllRecords(req, res);
        }
        break;
        
      case 'POST':
        // 创建新游戏记录
        await createRecord(req, res);
        break;
        
      case 'PUT':
        // 更新游戏记录
        await updateRecord(req, res);
        break;
        
      default:
        // 不支持的请求方法
        res.status(405).json({ error: 'Method Not Allowed' });
        break;
    }
  } catch (error) {
    // 处理错误
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * 获取所有游戏记录
 */
async function getAllRecords(req, res) {
  try {
    // 从查询参数获取过滤条件
    const { limit, offset } = req.query;
    
    // 构建查询
    let query = supabase
      .from('game_records')
      .select('*, users(name, user_id), games(name, game_code)');
    
    // 应用分页
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    // 按时间倒序排序
    query = query.order('played_at', { ascending: false });
    
    // 执行查询
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ records: data });
  } catch (error) {
    console.error('Error getting records:', error);
    res.status(500).json({ error: 'Failed to get records' });
  }
}

/**
 * 获取用户的游戏记录
 */
async function getUserRecords(req, res) {
  try {
    const { user_id } = req.query;
    
    // 验证用户ID
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // 构建查询
    let query = supabase
      .from('game_records')
      .select('*, games(name, game_code)')
      .eq('user_id', user_id);
    
    // 按时间倒序排序
    query = query.order('played_at', { ascending: false });
    
    // 执行查询
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ records: data });
  } catch (error) {
    console.error('Error getting user records:', error);
    res.status(500).json({ error: 'Failed to get user records' });
  }
}

/**
 * 获取游戏的所有记录
 */
async function getGameRecords(req, res) {
  try {
    const { game_id } = req.query;
    
    // 验证游戏ID
    if (!game_id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }
    
    // 构建查询
    let query = supabase
      .from('game_records')
      .select('*, users(name, user_id)')
      .eq('game_id', game_id);
    
    // 按时间倒序排序
    query = query.order('played_at', { ascending: false });
    
    // 执行查询
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ records: data });
  } catch (error) {
    console.error('Error getting game records:', error);
    res.status(500).json({ error: 'Failed to get game records' });
  }
}

/**
 * 获取统计数据
 */
async function getStats(req, res) {
  try {
    // 获取总游戏数
    const { data: gamesCount, error: gamesError } = await supabase
      .from('games')
      .select('count(*)');
    
    if (gamesError) {
      throw gamesError;
    }
    
    // 获取总用户数
    const { data: usersCount, error: usersError } = await supabase
      .from('users')
      .select('count(*)');
    
    if (usersError) {
      throw usersError;
    }
    
    // 获取总记录数
    const { data: recordsCount, error: recordsError } = await supabase
      .from('game_records')
      .select('count(*)');
    
    if (recordsError) {
      throw recordsError;
    }
    
    // 获取今日记录数
    const today = new Date().toISOString().split('T')[0];
    const { data: todayRecords, error: todayError } = await supabase
      .from('game_records')
      .select('count(*)')
      .gte('played_at', `${today}T00:00:00Z`);
    
    if (todayError) {
      throw todayError;
    }
    
    // 获取剩余礼品数
    const { data: giftsData, error: giftsError } = await supabase
      .from('games')
      .select('gift_remaining');
    
    if (giftsError) {
      throw giftsError;
    }
    
    const totalGiftsRemaining = giftsData.reduce((sum, game) => sum + (game.gift_remaining || 0), 0);
    
    // 返回结果
    res.status(200).json({
      stats: {
        totalGames: gamesCount[0]['count'],
        totalUsers: usersCount[0]['count'],
        totalRecords: recordsCount[0]['count'],
        todayRecords: todayRecords[0]['count'],
        totalGiftsRemaining
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
}

/**
 * 创建新游戏记录
 */
async function createRecord(req, res) {
  try {
    // 解析请求体
    const recordData = req.body;
    
    // 验证必填字段
    if (!recordData.user_id || !recordData.game_id || recordData.score === undefined) {
      return res.status(400).json({ error: 'User ID, Game ID and Score are required' });
    }
    
    // 检查用户是否存在
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', recordData.user_id)
      .single();
    
    if (userError) {
      if (userError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw userError;
    }
    
    // 检查游戏是否存在
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, gift_remaining, status')
      .eq('id', recordData.game_id)
      .single();
    
    if (gameError) {
      if (gameError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Game not found' });
      }
      throw gameError;
    }
    
    // 检查游戏状态
    if (game.status !== 'active') {
      return res.status(400).json({ error: 'Game is not active' });
    }
    
    // 检查用户是否已经玩过这个游戏
    const { data: existingRecord, error: recordError } = await supabase
      .from('game_records')
      .select('id')
      .eq('user_id', recordData.user_id)
      .eq('game_id', recordData.game_id)
      .single();
    
    if (recordError && recordError.code !== 'PGRST116') {
      throw recordError;
    }
    
    if (existingRecord) {
      return res.status(400).json({ error: 'User has already played this game' });
    }
    
    // 设置默认值
    const newRecord = {
      ...recordData,
      completed: recordData.completed || false,
      gift_received: recordData.gift_received || false,
      played_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    
    // 开始事务
    const { data, error } = await supabase
      .from('game_records')
      .insert(newRecord)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 如果用户得分达到标准且有礼品剩余，更新礼品数量
    if (recordData.score >= 60 && game.gift_remaining > 0) {
      await supabase
        .from('games')
        .update({
          gift_remaining: game.gift_remaining - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', recordData.game_id);
    }
    
    // 返回结果
    res.status(201).json({ record: data });
  } catch (error) {
    console.error('Error creating record:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
}

/**
 * 更新游戏记录
 */
async function updateRecord(req, res) {
  try {
    const { id } = req.query;
    const recordData = req.body;
    
    // 验证ID
    if (!id) {
      return res.status(400).json({ error: 'Record ID is required' });
    }
    
    // 检查记录是否存在
    const { data: existingRecord, error: checkError } = await supabase
      .from('game_records')
      .select('id, game_id, gift_received')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Record not found' });
      }
      throw checkError;
    }
    
    // 如果标记为已领取礼品且之前未领取
    if (recordData.gift_received && !existingRecord.gift_received) {
      // 获取游戏信息
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('gift_remaining')
        .eq('id', existingRecord.game_id)
        .single();
      
      if (gameError) {
        throw gameError;
      }
      
      // 检查礼品是否足够
      if (game.gift_remaining <= 0) {
        return res.status(400).json({ error: 'No gifts remaining' });
      }
    }
    
    // 更新记录
    const updatedRecord = {
      ...recordData,
      updated_at: new Date().toISOString()
    };
    
    // 执行更新
    const { data, error } = await supabase
      .from('game_records')
      .update(updatedRecord)
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ record: data });
  } catch (error) {
    console.error('Error updating record:', error);
    res.status(500).json({ error: 'Failed to update record' });
  }
}