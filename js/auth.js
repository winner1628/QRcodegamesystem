// --------------------------
// Core: User State Management
// --------------------------
function saveUserToStorage(user) {
    user.table = user.table || (user.username === "admin" ? "admins" : "users");
    localStorage.setItem('qrGameUser', JSON.stringify(user));
}

function getUserFromStorage() {
    const userStr = localStorage.getItem('qrGameUser');
    return userStr ? JSON.parse(userStr) : null;
}

window.currentUser = getUserFromStorage();

// --------------------------
// 1. User Login (Username Only)
// --------------------------
async function userLoginByUsername() {
    const username = document.getElementById('username').value.trim();

    if (!username) {
        alert("❌ 請輸入用戶名！");
        return;
    }

    // Initialize database
    const initOk = await window.dbManager.init();
    if (!initOk) {
        alert("❌ 無法連接資料庫，請稍後再試！");
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
            if (error.code === 'PGRST116') errorMsg += "\n提示：該用戶名不存在！測試用戶名：testuser1";
            alert(errorMsg);
            return;
        }
        
        if (!data) {
            alert("❌ 查無此用戶！測試用戶名：testuser1");
            return;
        }

        saveUserToStorage(data);
        window.currentUser = data;
        
        alert(`✅ 登入成功！歡迎你，${data.username}！`);
        window.location.href = "scan.html";

    } catch (err) {
        alert(`❌ 登入異常：${err.message}`);
        console.error("User Login Error：", err);
    }
}

// --------------------------
// 2. Admin Login (Dedicated Function with Parameters)
// --------------------------
window.adminLoginProcess = async function(username, password) {
    try {
        // Direct database query (no DOM dependency)
        const { data, error } = await window.dbManager.client
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        // Handle database errors
        if (error) {
            if (error.code === 'PGRST116') {
                throw new Error("帳號或密碼錯誤！測試帳號：admin / 密碼：admin123");
            }
            throw new Error(`資料庫錯誤：${error.message}`);
        }
        
        // Validate admin user
        if (!data) {
            throw new Error("查無此管理員帳號！");
        }
        
        if (data.username !== "admin") {
            throw new Error("非管理員帳號，無法登入後台！");
        }

        // Save user to local storage
        saveUserToStorage(data);
        window.currentUser = data;
        
        return true; // Return success

    } catch (err) {
        console.error("Admin Login Process Error：", err);
        throw err; // Re-throw error to handler
    }
};

// --------------------------
// 3. Logout Function
// --------------------------
function logout() {
    localStorage.removeItem('qrGameUser');
    window.currentUser = null;
    alert("✅ 已成功登出！");
    window.location.href = "user-login.html";
}

// --------------------------
// 4. Login Validation
// --------------------------
function checkLogin() {
    window.currentUser = getUserFromStorage();
    
    if (!window.currentUser) {
        setTimeout(() => {
            window.location.href = "user-login.html";
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
// 6. Get User Game Records
// --------------------------
async function getUserGameRecords() {
    try {
        const initOk = await window.dbManager.init();
        if (!initOk) return [];

        const { data, error } = await window.dbManager.client
            .from('game_records')
            .select(`
                *,
                games(game_name, game_code)
            `)
            .eq('user_id', window.currentUser.id)
            .order('scanned_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    } catch (err) {
        console.error("Get User Records Error:", err);
        return [];
    }
}

// --------------------------
// 7. Calculate Total Score
// --------------------------
function calculateTotalScore(records) {
    return records.reduce((total, record) => total + record.score, 0);
}
