// 核心改進：使用localStorage保存用戶狀態，跨頁面不丟失
function saveUserToStorage(user) {
    localStorage.setItem('qrGameUser', JSON.stringify(user));
}
function getUserFromStorage() {
    const userStr = localStorage.getItem('qrGameUser');
    return userStr ? JSON.parse(userStr) : null;
}
function clearUserStorage() {
    localStorage.removeItem('qrGameUser');
}

// 全局用戶狀態（優先從localStorage加載）
window.currentUser = getUserFromStorage();

// 一般用戶登入
async function userLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("❌ 請輸入完整的用戶名和密碼！");
        return;
    }

    try {
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗！");
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
            .eq('password', password)
            .single();

        if (error) {
            alert(`❌ 登入失敗：${error.message}\n測試帳號：testuser1 / testpass123`);
            return;
        }
        if (!data) {
            alert("❌ 查無此用戶！");
            return;
        }

        // 保存用戶狀態到localStorage（關鍵！）
        window.currentUser = data;
        saveUserToStorage(data);
        
        alert(`✅ 登入成功！歡迎你，${data.username}！`);
        window.location.href = "index.html";

    } catch (err) {
        alert(`❌ 登入異常：${err.message}`);
        console.error(err);
    }
}

// 管理員登入
async function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
        alert("❌ 請輸入完整的管理員帳號和密碼！");
        return;
    }

    try {
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗！");
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
            .eq('password', password)
            .single();

        if (error) {
            alert(`❌ 登入失敗：${error.message}\n測試管理員帳號：admin / admin123`);
            return;
        }
        if (!data || data.username !== "admin") {
            alert("❌ 非管理員帳號！");
            return;
        }

        // 保存管理員狀態到localStorage
        window.currentUser = data;
        saveUserToStorage(data);
        
        alert("✅ 管理員登入成功！");
        window.location.href = "admin-management.html";

    } catch (err) {
        alert(`❌ 登入異常：${err.message}`);
        console.error(err);
    }
}

// 登出（清除localStorage）
function logout() {
    window.currentUser = null;
    clearUserStorage();
    alert("✅ 已成功登出！");
    window.location.href = "user-login.html";
}

// 驗證登入狀態（兼容localStorage）
function checkLogin() {
    // 優先從localStorage加載用戶狀態
    window.currentUser = getUserFromStorage();
    
    if (!window.currentUser) {
        alert("❌ 請先登入系統！");
        window.location.href = "user-login.html";
        return false;
    }
    return true;
}

// 驗證管理員狀態
function checkAdmin() {
    if (!checkLogin()) return false;
    if (window.currentUser.username !== "admin") {
        alert("❌ 僅管理員可存取此頁面！");
        window.location.href = "index.html";
        return false;
    }
    return true;
}
