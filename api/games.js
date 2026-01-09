/**
 * 游戏管理 API
 * 用于处理游戏的创建、查询、更新和删除操作
 */

const supabase = require('../utils/supabaseClient');
const config = require('../config');

module.exports = async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
        // 获取游戏列表或单个游戏详情
        if (req.query.id) {
          // 获取单个游戏详情
          await getGameById(req, res);
        } else {
          // 获取游戏列表
          await getGames(req, res);
        }
        break;
        
      case 'POST':
        // 创建新游戏
        await createGame(req, res);
        break;
        
      case 'PUT':
        // 更新游戏信息
        await updateGame(req, res);
        break;
        
      case 'DELETE':
        // 删除游戏
        await deleteGame(req, res);
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
 * 获取游戏列表
 */
async function getGames(req, res) {
  try {
    // 从查询参数获取过滤条件
    const { status, limit, offset } = req.query;
    
    // 构建查询
    let query = supabase.from('games').select('*');
    
    // 应用过滤条件
    if (status) {
      query = query.eq('status', status);
    }
    
    // 应用分页
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (offset) {
      query = query.offset(parseInt(offset));
    }
    
    // 执行查询
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ games: data });
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
}

/**
 * 获取单个游戏详情
 */
async function getGameById(req, res) {
  try {
    const { id } = req.query;
    
    // 执行查询
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // 返回结果
    res.status(200).json({ game: data });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: 'Failed to get game' });
  }
}

/**
 * 创建新游戏
 */
async function createGame(req, res) {
  try {
    // 解析请求体
    const gameData = req.body;
    
    // 验证必填字段
    if (!gameData.name || !gameData.game_code) {
      return res.status(400).json({ error: 'Name and game code are required' });
    }
    
    // 检查游戏编号是否已存在
    const { data: existingGame, error: checkError } = await supabase
      .from('games')
      .select('id')
      .eq('game_code', gameData.game_code)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingGame) {
      return res.status(400).json({ error: 'Game code already exists' });
    }
    
    // 设置默认值
    const newGame = {
      ...gameData,
      status: gameData.status || 'active',
      gift_remaining: gameData.gift_count || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 执行插入
    const { data, error } = await supabase
      .from('games')
      .insert(newGame)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(201).json({ game: data });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
}

/**
 * 更新游戏信息
 */
async function updateGame(req, res) {
  try {
    const { id } = req.query;
    const gameData = req.body;
    
    // 验证ID
    if (!id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }
    
    // 检查游戏是否存在
    const { data: existingGame, error: checkError } = await supabase
      .from('games')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Game not found' });
      }
      throw checkError;
    }
    
    // 更新游戏信息
    const updatedGame = {
      ...gameData,
      updated_at: new Date().toISOString()
    };
    
    // 执行更新
    const { data, error } = await supabase
      .from('games')
      .update(updatedGame)
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ game: data });
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
}

/**
 * 删除游戏
 */
async function deleteGame(req, res) {
  try {
    const { id } = req.query;
    
    // 验证ID
    if (!id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }
    
    // 检查游戏是否存在
    const { data: existingGame, error: checkError } = await supabase
      .from('games')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Game not found' });
      }
      throw checkError;
    }
    
    // 执行删除
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
}