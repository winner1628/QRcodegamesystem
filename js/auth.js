// --------------------------
// Core: User State Management (LocalStorage)
// --------------------------
// Save user to localStorage (persist across page reloads)
function saveUserToStorage(user) {
    // Add table identifier to distinguish admin/user
    user.table = user.table || (user.username === "admin" ? "admins" : "users");
    localStorage.setItem('qrGameUser', JSON.stringify(user));
}

// Get user from localStorage
function getUserFromStorage() {
    const userStr = localStorage.getItem('qrGameUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Clear user from localStorage (logout)
function clearUserStorage() {
    localStorage.removeItem('qrGameUser');
}

// Global user state (load from localStorage first)
window.currentUser = getUserFromStorage();

// --------------------------
// 1. User Login (Username Only - No Password)
// --------------------------
async function userLoginByUsername() {
    const username = document.getElementById('username').value.trim();

    // Validate input
    if (!username) {
        alert("❌ 請輸入用戶名！");
        return;
    }

    try {
        // Check if database module is loaded
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗，請檢查js/database.js是否正確");
            return;
        }

        // Initialize database if not already done
        if (!window.dbManager.initialized) {
            const initOk = await window.dbManager.init();
            if (!initOk) return;
        }

        // Query USER table (only username, no password)
        const { data, error } = await window.dbManager.client
            .from('users') // Use separate "users" table for regular users
            .select('*')
            .eq('username', username)
            .single();

        // Handle errors
        if (error) {
            alert(`❌ 登入失敗：${error.message}\n請確認用戶名是否正確（測試用戶：testuser1）`);
            return;
        }
        if (!data) {
            alert("❌ 查無此用戶！測試用戶名：testuser1");
            return;
        }

        // Mark user type (for admin validation later)
        data.table = "users";

        // Save user state (critical for persistence)
        window.currentUser = data;
        saveUserToStorage(data);
        
        alert(`✅ 登入成功！歡迎你，${data.username}！`);
        window.location.href = "index.html";

    } catch (err) {
        // Catch all unexpected errors
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

    // Validate input
    if (!username || !password) {
        alert("❌ 請輸入完整的管理員帳號和密碼！");
        return;
    }

    try {
        // Check if database module is loaded
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗，請檢查js/database.js是否正確");
            return;
        }

        // Initialize database if not already done
        if (!window.dbManager.initialized) {
            const initOk = await window.dbManager.init();
            if (!initOk) return;
        }

        // Query ADMIN table (separate from regular users)
        const { data, error } = await window.dbManager.client
            .from('admins') // Use separate "admins" table for admins
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        // Handle errors
        if (error) {
            alert(`❌ 管理員登入失敗：${error.message}\n測試管理員帳號：admin / admin123`);
            return;
        }
        if (!data || data.username !== "admin") {
            alert("❌ 非管理員帳號，無法登入後台！");
            return;
        }

        // Mark admin type
        data.table = "admins";

        // Save admin state
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
    // Clear global state and localStorage
    window.currentUser = null;
    clearUserStorage();
    alert("✅ 已成功登出！");
    window.location.href = "user-login.html";
}

// --------------------------
// 4. Login Validation (Fix "Please Login" Popup on index.html)
// --------------------------
function checkLogin() {
    // Reload user state from localStorage (critical fix)
    window.currentUser = getUserFromStorage();
    
    // Add 300ms delay to ensure state loads before validation
    if (!window.currentUser) {
        setTimeout(() => {
            window.currentUser = getUserFromStorage();
            if (!window.currentUser) {
                alert("❌ 請先登入系統！");
                window.location.href = "user-login.html";
            }
        }, 300); // Delay fixes the premature "please login" popup
        return false;
    }
    return true;
}

// --------------------------
// 5. Admin Permission Validation
// --------------------------
function checkAdmin() {
    // First check if user is logged in
    if (!checkLogin()) return false;
    
    // Check if user is from the "admins" table (separate table validation)
    if (window.currentUser.table !== "admins") {
        alert("❌ 僅管理員可存取此頁面！");
        window.location.href = "index.html";
        return false;
    }
    return true;
}
