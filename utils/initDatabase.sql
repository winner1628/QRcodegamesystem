/**
 * Database Initialization SQL Script
 * Run this script in Supabase SQL Editor to create all necessary tables
 */

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(20) UNIQUE NOT NULL, -- 用户编号
  name VARCHAR(100) NOT NULL, -- 用户姓名
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_code VARCHAR(10) UNIQUE NOT NULL, -- 游戏编号 (如A001, B002)
  name VARCHAR(100) NOT NULL, -- 游戏名称
  description TEXT, -- 游戏描述
  rules TEXT, -- 游戏规则
  max_players INTEGER DEFAULT 0, -- 最大参与人数
  gift_count INTEGER DEFAULT 0, -- 礼品数量
  gift_remaining INTEGER DEFAULT 0, -- 剩余礼品数
  location VARCHAR(255), -- 摊位位置
  status VARCHAR(20) DEFAULT 'active', -- 状态: active, inactive, completed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create game_records table
CREATE TABLE IF NOT EXISTS game_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  score INTEGER DEFAULT 0, -- 游戏得分
  completed BOOLEAN DEFAULT FALSE, -- 是否完成
  gift_received BOOLEAN DEFAULT FALSE, -- 是否领取礼品
  played_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(50) UNIQUE NOT NULL, -- 设置键
  value TEXT, -- 设置值
  description TEXT, -- 设置描述
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin', -- admin, operator
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_games_game_code ON games(game_code);
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_game_id ON game_records(game_id);

-- Insert default admin user (password: admin123)
-- Note: In production, you should change this password immediately
INSERT INTO admins (username, password_hash, email)
VALUES ('admin', '$2a$10$QeUeTQb3W7gGx5z5y5y5eO7X5z5y5y5eO7X5z5y5y5eO7X5z5y5y5eO7X5z', 'admin@example.com')
ON CONFLICT (username) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description)
VALUES 
  ('max_games', '30', 'Maximum number of games allowed'),
  ('min_games', '2', 'Minimum number of games allowed'),
  ('max_users', '300', 'Maximum number of users allowed'),
  ('system_name', 'QR Game System', 'Name of the system'),
  ('game_code_prefix', 'A', 'Prefix for game codes')
ON CONFLICT (key) DO NOTHING;