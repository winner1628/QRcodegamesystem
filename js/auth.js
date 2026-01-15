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
// 1. User Login (Username Only - No Password)
// --------------------------
async function userLoginByUsername() {
    const username = document.getElementById('username').value.trim();

    if (!username) {
        alert("❌ 請輸入用戶名！");
        return;
    }

    try {
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗，請檢查js/database.js是否正確");
            return;
        }

        if (!window.dbManager.initialized) {
            const initOk = await window.dbManager.init();
            if (!initOk) return;
        }

        const { data, error } = await window.dbManager.client
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error) {
            alert(`❌ 登入失敗：${error.message}\n請確認用戶名是否正確（測試用戶：testuser1）`);
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
        window.location.href = "scan.html";

    } catch (err) {
        alert(`❌ 登入異常：${err.message}`);
        console.error("User Login Error：", err);
    }
}

// --------------------------
// 2. Admin Login (Username + Password)
// --------------------------
async function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
        alert("❌ 請輸入完整的管理員帳號和密碼！");
        return;
    }

    try {
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗，請檢查js/database.js是否正確");
            return;
        }

        if (!window.dbManager.initialized) {
            const initOk = await window.dbManager.init();
            if (!initOk) return;
        }

        const { data, error } = await window.dbManager.client
            .from('admins')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        if (error) {
            alert(`❌ 管理員登入失敗：${error.message}\n測試管理員帳號：admin / admin123`);
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
// 4. Login Validation (Fix "Please Login" Popup)
// --------------------------
function checkLogin() {
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
// 6. New: Get User Game Records (For scan.html stats)
// --------------------------
async function getUserGameRecords() {
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
// 7. New: Calculate Total Score (For scan.html stats)
// --------------------------
function calculateTotalScore(records) {
    return records.reduce((total, record) => total + record.score, 0);
}
