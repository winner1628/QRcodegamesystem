// 系统配置文件
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

const SUPABASE_URL = 'https://vphihqysgdhdnuszybib.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yQ8Br7S-Zk2YdmhtD2dAyg_8Gho4wDS';

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