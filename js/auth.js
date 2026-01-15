// --------------------------
// Core: User State Management (LocalStorage)
// --------------------------
function saveUserToStorage(user) {
    user.table = user.table || (user.username === "admin" ? "admins" : "users");
    localStorage.setItem('qrGameUser', JSON.stringify(user));
}

function getUserFromStorage() {
    const userStr = localStorage.getItem('qrGameUser');
    return userStr ? JSON.parse(userStr) : null;
}

function clearUserStorage() {
    localStorage.removeItem('qrGameUser');
}

window.currentUser = getUserFromStorage();

// --------------------------
// 1. User Login (Username Only - Redirect to scan.html + Config Checks)
// --------------------------
async function userLoginByUsername() {
    const username = document.getElementById('username').value.trim();

    if (!username) {
        alert("❌ 請輸入用戶名！");
        return;
    }

    // Critical: Check config first
    if (!window.dbManager) {
        alert("❌ 找不到資料庫配置！\n請確認：\n1. js/config.js文件已創建\n2. 文件路徑正確\n3. Supabase配置已填寫");
        return;
    }

    // Force database initialization (with error handling)
    const initOk = await window.dbManager.init();
    if (!initOk) {
        alert("❌ 資料庫初始化失敗！\n請檢查：\n1. config.js中的Supabase URL是否正確\n2. config.js中的Anon Key是否正確\n3. 網路連接是否正常");
        return;
    }

    try {
        const { data, error } = await window.dbManager.client
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            let errorMsg = `❌ 登入失敗：${error.message}`;
            if (error.code === 'PGRST116') {
                errorMsg += "\n提示：該用戶名不存在！測試用戶名：testuser1";
            }
            alert(errorMsg);
            return;
        }
        
        if (!data) {
            alert("❌ 查無此用戶！測試用戶名：testuser1");
            return;
        }

        data.table = "users";
        window.currentUser = data;
        saveUserToStorage(data);
        
        alert(`✅ 登入成功！歡迎你，${data.username}！`);
        window.location.href = "scan.html"; // Redirect to scan page

    } catch (err) {
        alert(`❌ 登入異常：${err.message}`);
        console.error("User Login Error：", err);
    }
}

// --------------------------
// 2. Admin Login (Username + Password + Config Checks)
// --------------------------
async function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
        alert("❌ 請輸入完整的管理員帳號和密碼！");
        return;
    }

    // Critical: Check config first
    if (!window.dbManager) {
        alert("❌ 找不到資料庫配置！\n請確認：\n1. js/config.js文件已創建\n2. 文件路徑正確\n3. Supabase配置已填寫");
        return;
    }

    // Force database initialization
    const initOk = await window.dbManager.init();
    if (!initOk) {
        alert("❌ 資料庫初始化失敗！\n請檢查：\n1. config.js中的Supabase URL是否正確\n2. config.js中的Anon Key是否正確\n3. 網路連接是否正常");
        return;
    }

    try {
        const { data, error } = await window.dbManager.client
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error) {
            let errorMsg = `❌ 管理員登入失敗：${error.message}`;
            if (error.code === 'PGRST116') {
                errorMsg += "\n提示：帳號或密碼錯誤！測試帳號：admin / 密碼：admin123";
            }
            alert(errorMsg);
            return;
        }
        
        if (!data || data.username !== "admin") {
            alert("❌ 非管理員帳號，無法登入後台！");
            return;
        }

        data.table = "admins";
        window.currentUser = data;
        saveUserToStorage(data);
        
        alert("✅ 管理員登入成功！");
        window.location.href = "admin-management.html";

    } catch (err) {
        alert(`❌ 管理員登入異常：${err.message}`);
        console.error("Admin Login Error：", err);
    }
}

// --------------------------
// 3. Logout Function
// --------------------------
function logout() {
    window.currentUser = null;
    clearUserStorage();
    alert("✅ 已成功登出！");
    window.location.href = "user-login.html";
}

// --------------------------
// 4. Login Validation (Fix "Please Login" Popup + Config Checks)
// --------------------------
function checkLogin() {
    // Pre-check config
    if (!window.dbManager) {
        alert("❌ 找不到資料庫配置！請檢查js/config.js");
        window.location.href = "user-login.html";
        return false;
    }

    window.currentUser = getUserFromStorage();
    
    if (!window.currentUser) {
        setTimeout(() => {
            window.currentUser = getUserFromStorage();
            if (!window.currentUser) {
                alert("❌ 請先登入系統！");
                window.location.href = "user-login.html";
            }
        }, 300);
        return false;
    }
    return true;
}

// --------------------------
// 5. Admin Permission Validation
// --------------------------
function checkAdmin() {
    if (!checkLogin()) return false;
    
    if (window.currentUser.table !== "admins") {
        alert("❌ 僅管理員可存取此頁面！");
        window.location.href = "index.html";
        return false;
    }
    return true;
}

// --------------------------
// 6. Get User Game Records (For scan.html stats)
// --------------------------
async function getUserGameRecords() {
    // Pre-check config
    if (!window.dbManager) {
        console.error("❌ 找不到資料庫配置！");
        return [];
    }

    try {
        if (!window.dbManager.initialized) {
            await window.dbManager.init();
        }

        const { data, error } = await window.dbManager.client
            .from('game_records')
            .select(`
                *,
                games(game_name, game_code)
            `)
            .eq('user_id', window.currentUser.id)
            .order('scanned_at', { ascending: false });

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    } catch (err) {
        console.error("Get User Records Error:", err);
        return [];
    }
}

// --------------------------
// 7. Calculate Total Score (For scan.html stats)
// --------------------------
function calculateTotalScore(records) {
    return records.reduce((total, record) => total + record.score, 0);
}
