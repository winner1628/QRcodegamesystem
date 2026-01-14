// 一般用戶登入（user-login.html調用）
async function userLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert("❌ 請輸入用戶名和密碼");
        return;
    }

    // 呼叫資料庫驗證
    const user = await window.dbManager.login(username, password);
    if (user) {
        window.currentUser = user;
        alert(`✅ 歡迎回來，${user.username}！`);
        window.location.href = "index.html";
    }
}

// 管理員登入（admin-login.html調用）
async function adminLogin() {
    const username = document.getElementById('admin-username').value.trim();
    const password = document.getElementById('admin-password').value.trim();

    if (!username || !password) {
        alert("❌ 請輸入管理員帳號和密碼");
        return;
    }

    // 呼叫資料庫驗證（標記為管理員）
    const user = await window.dbManager.login(username, password, true);
    if (user) {
        window.currentUser = user;
        alert("✅ 管理員登入成功！");
        window.location.href = "admin-management.html";
    }
}

// 登出功能
function logout() {
    window.currentUser = null;
    alert("✅ 已成功登出");
    window.location.href = "user-login.html";
}

// 驗證是否登入（index.html/admin-management.html調用）
function checkLogin() {
    if (!window.currentUser) {
        alert("❌ 請先登入");
        window.location.href = "user-login.html";
    }
}
