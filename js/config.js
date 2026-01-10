// 系统配置文件
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const SUPABASE_URL = 'https://vphihqysgdhdnuszybib.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaGlocXlzZ2RoZG51c3p5YmliaiIsInR5cGUiOiJhbm9uX2FwaSIsImlhdCI6MTcyNjQ5ODQwOSwiZXhwIjoyMDQyMDc0NDA5fQ.2w5qXcR4FbD7Wc-4hOYVcK4QdJ4wYjXm6N6m4Z7g8h9i';

// 初始化Supabase客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 默认管理员账号（仅用于首次设置）
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin123'
};

// 导出配置
window.AppConfig = {
    supabase,
    DEFAULT_ADMIN
};