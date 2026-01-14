// 全局變數：儲存當前登入用戶
window.currentUser = null;

// 一般用戶登入函數（user-login.html專用）
async function userLogin() {
    // 1. 獲取輸入的帳號密碼
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // 2. 驗證輸入不為空
    if (!username || !password) {
        alert("❌ 請輸入完整的用戶名和密碼！");
        return;
    }

    try {
        // 3. 初始化資料庫（如果還沒初始化）
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗，請檢查js/database.js是否正確");
            return;
        }
        if (!window.dbManager.initialized) {
            const initOk = await window.dbManager.init();
            if (!initOk) return;
        }

        // 4. 查詢用戶
        const { data, error } = await window.dbManager.client
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        // 5. 處理結果
        if (error) {
            alert(`❌ 登入失敗：${error.message}\n請檢查帳號密碼是否正確，或資料庫是否有測試數據`);
            return;
        }
        if (!data) {
            alert("❌ 查無此用戶！測試帳號：testuser1 / testpass123");
            return;
        }

        // 6. 登入成功
        window.currentUser = data;
        alert(`✅ 登入成功！歡迎你，${data.username}！`);
        window.location.href = "index.html";

    } catch (err) {
        // 捕捉所有未知錯誤，確保彈窗提示
        alert(`❌ 登入異常：${err.message}`);
        console.error("用戶登入錯誤：", err);
    }
}

// 管理員登入函數（admin-login.html專用）
async function adminLogin() {
    // 1. 獲取輸入的管理員帳號密碼
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    // 2. 驗證輸入不為空
    if (!username || !password) {
        alert("❌ 請輸入完整的管理員帳號和密碼！");
        return;
    }

    try {
        // 3. 初始化資料庫
        if (!window.dbManager) {
            alert("❌ 資料庫模組加載失敗，請檢查js/database.js是否正確");
            return;
        }
        if (!window.dbManager.initialized) {
            const initOk = await window.dbManager.init();
            if (!initOk) return;
        }

        // 4. 查詢管理員（必須是admin帳號）
        const { data, error } = await window.dbManager.client
            .from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();

        // 5. 處理結果
        if (error) {
            alert(`❌ 管理員登入失敗：${error.message}\n測試管理員帳號：admin / admin123`);
            return;
        }
        if (!data || data.username !== "admin") {
            alert("❌ 非管理員帳號，無法登入後台！");
            return;
        }

        // 6. 登入成功
        window.currentUser = data;
        alert("✅ 管理員登入成功！");
        window.location.href = "admin-management.html";

    } catch (err) {
        alert(`❌ 管理員登入異常：${err.message}`);
        console.error("管理員登入錯誤：", err);
    }
}

// 登出函數
function logout() {
    window.currentUser = null;
    alert("✅ 已成功登出！");
    window.location.href = "user-login.html";
}

// 驗證是否登入（index.html/admin-management.html加載時執行）
function checkLogin() {
    if (!window.currentUser) {
        alert("❌ 請先登入系統！");
        window.location.href = "user-login.html";
    }
}
