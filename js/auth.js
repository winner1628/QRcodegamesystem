async function loginUser() {
    const user = await window.dbManager.getUser(document.getElementById('username').value, document.getElementById('password').value);
    if (user) { window.currentUser = user; location.href = "index.html"; }
    else alert("帳號或密碼錯誤");
}

async function adminLogin() {
    const user = await window.dbManager.getUser(document.getElementById('admin-username').value, document.getElementById('admin-password').value);
    if (user && user.username === "admin") { window.currentUser = user; location.href = "admin-management.html"; }
    else alert("管理員帳號錯誤");
}

function logoutUser() { window.currentUser = null; location.href = "user-login.html"; }
function checkAuth() { if (!window.currentUser) { alert("請先登入"); location.href = "user-login.html"; } }
function checkAdmin() { if (!window.currentUser || window.currentUser.username !== "admin") location.href = "admin-login.html"; }
