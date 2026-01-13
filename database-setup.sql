-- QR码游戏系统数据库初始化脚本
-- 版本: 1.0.0
-- 日期: 2024-01-13

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 创建游戏表
CREATE TABLE IF NOT EXISTS games (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_score INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- 创建游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(20) NOT NULL,
    game_id VARCHAR(20) NOT NULL,
    score INTEGER NOT NULL,
    qrcode_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- 创建游戏统计表
CREATE TABLE IF NOT EXISTS game_statistics (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(20) NOT NULL,
    total_players INTEGER DEFAULT 0,
    total_games INTEGER DEFAULT 0,
    avg_score DECIMAL(10,2) DEFAULT 0,
    max_score INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- 插入默认管理员账号
-- 密码: admin123 (Base64编码)
INSERT INTO admins (username, password, created_at)
VALUES ('admin', 'YWRtaW4xMjM=', NOW());

-- 插入示例游戏数据
INSERT INTO games (id, name, description, max_score, is_active, created_at) VALUES
('G000001', '投篮挑战', '三分线外投篮，投中得分', 100, true, NOW()),
('G000002', '套圈圈', '用圈圈套中目标物', 100, true, NOW()),
('G000003', '射击游戏', '气枪射击目标', 100, true, NOW()),
('G000004', '闯关挑战', '完成障碍闯关', 100, true, NOW()),
('G000005', '益智谜题', '解开谜题获得分数', 100, true, NOW());

-- 插入示例用户数据
-- 密码: test123 (Base64编码)
INSERT INTO users (id, username, password, role, total_score, created_at)
VALUES ('U000001', 'testuser', 'dGVzdDEyMw==', 'user', 0, NOW());

-- 插入示例游戏统计数据
INSERT INTO game_statistics (game_id, total_players, total_games, avg_score, max_score, updated_at) VALUES
('G000001', 0, 0, 0, 0, NOW()),
('G000002', 0, 0, 0, 0, NOW()),
('G000003', 0, 0, 0, 0, NOW()),
('G000004', 0, 0, 0, 0, NOW()),
('G000005', 0, 0, 0, 0, NOW());

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_records_user_id ON game_records(user_id);
CREATE INDEX IF NOT EXISTS idx_game_records_game_id ON game_records(game_id);
CREATE INDEX IF NOT EXISTS idx_game_records_created_at ON game_records(created_at);
CREATE INDEX IF NOT EXISTS idx_users_total_score ON users(total_score);
CREATE INDEX IF NOT EXISTS idx_games_is_active ON games(is_active);

-- 创建更新游戏统计的触发器函数
CREATE OR REPLACE FUNCTION update_game_statistics()
RETURNS TRIGGER AS $$
BEGIN
    -- 更新游戏统计表
    UPDATE game_statistics 
    SET 
        total_players = (SELECT COUNT(DISTINCT user_id) FROM game_records WHERE game_id = NEW.game_id),
        total_games = (SELECT COUNT(*) FROM game_records WHERE game_id = NEW.game_id),
        avg_score = (SELECT COALESCE(AVG(score), 0) FROM game_records WHERE game_id = NEW.game_id),
        max_score = (SELECT COALESCE(MAX(score), 0) FROM game_records WHERE game_id = NEW.game_id),
        updated_at = NOW()
    WHERE game_id = NEW.game_id;
    
    -- 更新用户总分
    UPDATE users 
    SET 
        total_score = (SELECT COALESCE(SUM(score), 0) FROM game_records WHERE user_id = NEW.user_id),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER after_game_record_insert
AFTER INSERT ON game_records
FOR EACH ROW
EXECUTE FUNCTION update_game_statistics();

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为各表添加更新时间触发器
CREATE TRIGGER update_admins_timestamp
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_games_timestamp
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- 权限设置（可选）
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_username;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_username;

-- 显示创建的表
\dt

-- 显示插入的数据统计
SELECT 'admins' AS table_name, COUNT(*) AS count FROM admins
UNION ALL
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'games' AS table_name, COUNT(*) AS count FROM games
UNION ALL
SELECT 'game_records' AS table_name, COUNT(*) AS count FROM game_records
UNION ALL
SELECT 'game_statistics' AS table_name, COUNT(*) AS count FROM game_statistics;

-- 显示默认账号信息
SELECT '管理员账号' AS type, 'admin' AS username, 'admin123' AS password
UNION ALL
SELECT '测试用户账号' AS type, 'testuser' AS username, 'test123' AS password;

-- 数据库初始化完成
SELECT 'QR码游戏系统数据库初始化完成！' AS message;