/**
 * 用户管理 API
 * 用于处理用户的导入、查询、更新和删除操作
 */

const supabase = require('../utils/supabaseClient');

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
        // 获取用户列表或单个用户详情
        if (req.query.id) {
          // 获取单个用户详情
          await getUserById(req, res);
        } else if (req.query.user_id) {
          // 通过用户编号获取用户
          await getUserByUserId(req, res);
        } else {
          // 获取用户列表
          await getUsers(req, res);
        }
        break;
        
      case 'POST':
        // 创建新用户或导入用户
        if (req.query.action === 'import') {
          // 导入用户
          await importUsers(req, res);
        } else {
          // 创建单个用户
          await createUser(req, res);
        }
        break;
        
      case 'PUT':
        // 更新用户信息
        await updateUser(req, res);
        break;
        
      case 'DELETE':
        // 删除用户
        await deleteUser(req, res);
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
 * 获取用户列表
 */
async function getUsers(req, res) {
  try {
    // 从查询参数获取过滤条件
    const { limit, offset } = req.query;
    
    // 构建查询
    let query = supabase.from('users').select('*');
    
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
    res.status(200).json({ users: data });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
}

/**
 * 获取单个用户详情
 */
async function getUserById(req, res) {
  try {
    const { id } = req.query;
    
    // 执行查询
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // 返回结果
    res.status(200).json({ user: data });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

/**
 * 通过用户编号获取用户
 */
async function getUserByUserId(req, res) {
  try {
    const { user_id } = req.query;
    
    // 执行查询
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', user_id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ user: data });
  } catch (error) {
    console.error('Error getting user by user_id:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

/**
 * 创建新用户
 */
async function createUser(req, res) {
  try {
    // 解析请求体
    const userData = req.body;
    
    // 验证必填字段
    if (!userData.user_id || !userData.name) {
      return res.status(400).json({ error: 'User ID and name are required' });
    }
    
    // 检查用户编号是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('user_id', userData.user_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'User ID already exists' });
    }
    
    // 设置默认值
    const newUser = {
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // 执行插入
    const { data, error } = await supabase
      .from('users')
      .insert(newUser)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(201).json({ user: data });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

/**
 * 导入用户
 */
async function importUsers(req, res) {
  try {
    // 解析请求体
    const { users } = req.body;
    
    // 验证用户列表
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Users list is required and must be non-empty' });
    }
    
    // 验证每个用户的必填字段
    for (const user of users) {
      if (!user.user_id || !user.name) {
        return res.status(400).json({ error: 'Each user must have user_id and name' });
      }
    }
    
    // 开始事务
    const { data, error } = await supabase
      .from('users')
      .insert(users.map(user => ({
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(201).json({ 
      message: `Successfully imported ${data.length} users`,
      users: data
    });
  } catch (error) {
    console.error('Error importing users:', error);
    res.status(500).json({ error: 'Failed to import users' });
  }
}

/**
 * 更新用户信息
 */
async function updateUser(req, res) {
  try {
    const { id } = req.query;
    const userData = req.body;
    
    // 验证ID
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw checkError;
    }
    
    // 更新用户信息
    const updatedUser = {
      ...userData,
      updated_at: new Date().toISOString()
    };
    
    // 执行更新
    const { data, error } = await supabase
      .from('users')
      .update(updatedUser)
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ user: data });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}

/**
 * 删除用户
 */
async function deleteUser(req, res) {
  try {
    const { id } = req.query;
    
    // 验证ID
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // 检查用户是否存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();
    
    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw checkError;
    }
    
    // 执行删除
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    // 返回结果
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}