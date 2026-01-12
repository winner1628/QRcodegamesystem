// 管理员功能模块
class AdminManager {
    constructor() {
        this.db = new DatabaseManager();
        this.auth = new AuthManager();
    }

    // 初始化管理员界面
    async initializeAdminInterface() {
        try {
            // 检查登录状态
            this.auth.enforceAdminLogin();
            
            // 显示管理员信息
            this.displayAdminInfo();
            
            // 绑定通用事件
            this.bindCommonEvents();
            
        } catch (error) {
            console.error('初始化管理员界面失败:', error);
            this.showMessage('初始化失敗，請重新登入', 'error');
        }
    }

    // 显示管理员信息
    displayAdminInfo() {
        const adminInfo = this.auth.getCurrentUser();
        if (adminInfo) {
            const adminNameElement = document.getElementById('adminName');
            if (adminNameElement) {
                adminNameElement.textContent = adminInfo.username;
            }
        }
    }

    // 绑定通用事件
    bindCommonEvents() {
        // 登出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.auth.logout();
            });
        }

        // 导航菜单
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                if (target) {
                    window.location.href = target;
                }
            });
        });
    }

    // 初始化游戏管理
    async initializeGameManagement() {
        try {
            await this.loadGames();
            this.bindGameEvents();
        } catch (error) {
            console.error('初始化游戏管理失败:', error);
            this.showMessage('初始化遊戲管理失敗', 'error');
        }
    }

    // 初始化用户管理
    async initializeUserManagement() {
        try {
            await this.loadUsers();
            this.bindUserEvents();
        } catch (error) {
            console.error('初始化用户管理失败:', error);
            this.showMessage('初始化用戶管理失敗', 'error');
        }
    }

    // 初始化数据统计
    async initializeStatistics() {
        try {
            await this.loadStatistics();
            this.bindStatisticsEvents();
        } catch (error) {
            console.error('初始化数据统计失败:', error);
            this.showMessage('初始化數據統計失敗', 'error');
        }
    }

    // 加载游戏列表
    async loadGames() {
        try {
            const games = await this.db.getAllGames();
            this.displayGames(games);
        } catch (error) {
            console.error('加载游戏列表失败:', error);
            this.showMessage('加載遊戲列表失敗', 'error');
        }
    }

    // 显示游戏列表
    displayGames(games) {
        const gamesTable = document.getElementById('gamesTable');
        if (!gamesTable) return;
        
        if (games.length === 0) {
            gamesTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-gray-500">
                        <i class="fa fa-info-circle mr-2"></i>暫無遊戲數據
                    </td>
                </tr>
            `;
            return;
        }
        
        gamesTable.innerHTML = games.map(game => `
            <tr class="hover:bg-gray-50">
                <td class="py-3 px-4 border-b">${game.id}</td>
                <td class="py-3 px-4 border-b">${game.name}</td>
                <td class="py-3 px-4 border-b">${game.description}</td>
                <td class="py-3 px-4 border-b text-center">${game.max_score}</td>
                <td class="py-3 px-4 border-b text-center">${new Date(game.created_at).toLocaleDateString('zh-TW')}</td>
                <td class="py-3 px-4 border-b text-center">
                    <button class="btn-edit mr-2" data-id="${game.id}" onclick="adminManager.editGame('${game.id}')">
                        <i class="fa fa-edit"></i> 編輯
                    </button>
                    <button class="btn-danger" data-id="${game.id}" onclick="adminManager.deleteGame('${game.id}')">
                        <i class="fa fa-trash"></i> 刪除
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 加载用户列表
    async loadUsers() {
        try {
            const users = await this.db.getAllUsers();
            this.displayUsers(users);
        } catch (error) {
            console.error('加载用户列表失败:', error);
            this.showMessage('加載用戶列表失敗', 'error');
        }
    }

    // 显示用户列表
    displayUsers(users) {
        const usersTable = document.getElementById('usersTable');
        if (!usersTable) return;
        
        if (users.length === 0) {
            usersTable.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-gray-500">
                        <i class="fa fa-info-circle mr-2"></i>暫無用戶數據
                    </td>
                </tr>
            `;
            return;
        }
        
        usersTable.innerHTML = users.map(user => `
            <tr class="hover:bg-gray-50">
                <td class="py-3 px-4 border-b">${user.id}</td>
                <td class="py-3 px-4 border-b">${user.name}</td>
                <td class="py-3 px-4 border-b">${user.student_id || 'N/A'}</td>
                <td class="py-3 px-4 border-b text-center">${user.total_score}</td>
                <td class="py-3 px-4 border-b text-center">${new Date(user.created_at).toLocaleDateString('zh-TW')}</td>
                <td class="py-3 px-4 border-b text-center">
                    <button class="btn-edit mr-2" data-id="${user.id}" onclick="adminManager.editUser('${user.id}')">
                        <i class="fa fa-edit"></i> 編輯
                    </button>
                    <button class="btn-danger" data-id="${user.id}" onclick="adminManager.deleteUser('${user.id}')">
                        <i class="fa fa-trash"></i> 刪除
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 加载统计数据
    async loadStatistics() {
        try {
            const statistics = await this.db.getGameStatistics();
            const rankings = await this.db.getUserRankings();
            
            this.displayStatistics(statistics);
            this.displayRankings(rankings);
            this.updateDashboardStats(statistics, rankings);
        } catch (error) {
            console.error('加载统计数据失败:', error);
            this.showMessage('加載統計數據失敗', 'error');
        }
    }

    // 显示统计数据
    displayStatistics(statistics) {
        const statsTable = document.getElementById('statsTable');
        if (!statsTable) return;
        
        if (statistics.length === 0) {
            statsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-gray-500">
                        <i class="fa fa-info-circle mr-2"></i>暫無統計數據
                    </td>
                </tr>
            `;
            return;
        }
        
        statsTable.innerHTML = statistics.map(stat => `
            <tr class="hover:bg-gray-50">
                <td class="py-3 px-4 border-b">${stat.game_name}</td>
                <td class="py-3 px-4 border-b text-center">${stat.total_players}</td>
                <td class="py-3 px-4 border-b text-center">${stat.total_records}</td>
                <td class="py-3 px-4 border-b text-center">${stat.average_score.toFixed(2)}</td>
                <td class="py-3 px-4 border-b text-center">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(stat.total_records / 10, 100)}%"></div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // 显示排行榜
    displayRankings(rankings) {
        const rankingsList = document.getElementById('rankingsList');
        if (!rankingsList) return;
        
        if (rankings.length === 0) {
            rankingsList.innerHTML = `
                <div class="text-center py-4 text-gray-500">
                    <i class="fa fa-info-circle mr-2"></i>暫無排行數據
                </div>
            `;
            return;
        }
        
        rankingsList.innerHTML = rankings.map((user, index) => `
            <div class="flex items-center justify-between p-3 ${index < 3 ? 'bg-yellow-50' : 'bg-white'} rounded-lg mb-2 border">
                <div class="flex items-center">
                    <div class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                        ${index + 1}
                    </div>
                    <div>
                        <div class="font-bold">${user.name}</div>
                        <div class="text-sm text-gray-500">${user.id}</div>
                    </div>
                </div>
                <div class="text-2xl font-bold text-blue-600">${user.total_score}</div>
            </div>
        `).join('');
    }

    // 更新仪表盘统计
    updateDashboardStats(statistics, rankings) {
        const totalGames = statistics.length;
        const totalUsers = rankings.length;
        const totalRecords = statistics.reduce((sum, stat) => sum + stat.total_records, 0);
        const totalPlayers = new Set(statistics.map(stat => stat.total_players)).size;
        
        const statsElements = {
            totalGames: document.getElementById('totalGames'),
            totalUsers: document.getElementById('totalUsers'),
            totalRecords: document.getElementById('totalRecords'),
            totalPlayers: document.getElementById('totalPlayers')
        };
        
        Object.entries(statsElements).forEach(([key, element]) => {
            if (element) {
                element.textContent = eval(key);
            }
        });
    }

    // 绑定游戏管理事件
    bindGameEvents() {
        // 添加游戏表单
        const addGameForm = document.getElementById('addGameForm');
        if (addGameForm) {
            addGameForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addGame();
            });
        }
    }

    // 绑定用户管理事件
    bindUserEvents() {
        // 添加用户表单
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.addUser();
            });
        }

        // 批量添加用户
        const bulkAddBtn = document.getElementById('bulkAddBtn');
        if (bulkAddBtn) {
            bulkAddBtn.addEventListener('click', async () => {
                await this.bulkAddUsers();
            });
        }
    }

    // 绑定统计事件
    bindStatisticsEvents() {
        // 导出数据
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                await this.exportData();
            });
        }

        // 清空记录
        const clearRecordsBtn = document.getElementById('clearRecordsBtn');
        if (clearRecordsBtn) {
            clearRecordsBtn.addEventListener('click', async () => {
                await this.clearRecords();
            });
        }

        // 刷新统计
        const refreshStatsBtn = document.getElementById('refreshStatsBtn');
        if (refreshStatsBtn) {
            refreshStatsBtn.addEventListener('click', async () => {
                await this.loadStatistics();
                this.showMessage('統計數據已刷新', 'success');
            });
        }
    }

    // 添加游戏
    async addGame() {
        try {
            const name = document.getElementById('gameName').value;
            const description = document.getElementById('gameDescription').value;
            const maxScore = document.getElementById('gameMaxScore').value;

            if (!name || !maxScore) {
                this.showMessage('請填寫完整的遊戲信息', 'error');
                return;
            }

            const success = await this.db.addGame({
                name,
                description,
                max_score: parseInt(maxScore)
            });

            if (success) {
                this.showMessage('遊戲添加成功', 'success');
                document.getElementById('addGameForm').reset();
                await this.loadGames();
            } else {
                this.showMessage('遊戲添加失敗', 'error');
            }
        } catch (error) {
            console.error('添加游戏失败:', error);
            this.showMessage('添加失敗，請稍後重試', 'error');
        }
    }

    // 编辑游戏
    async editGame(gameId) {
        try {
            const games = await this.db.getAllGames();
            const game = games.find(g => g.id === gameId);
            
            if (!game) {
                this.showMessage('遊戲不存在', 'error');
                return;
            }

            const newName = prompt('請輸入新的遊戲名稱:', game.name);
            const newDescription = prompt('請輸入新的遊戲描述:', game.description);
            const newMaxScore = prompt('請輸入新的最高分:', game.max_score);

            if (newName && newMaxScore) {
                const success = await this.db.updateGame(gameId, {
                    name: newName,
                    description: newDescription || game.description,
                    max_score: parseInt(newMaxScore)
                });

                if (success) {
                    this.showMessage('遊戲更新成功', 'success');
                    await this.loadGames();
                } else {
                    this.showMessage('遊戲更新失敗', 'error');
                }
            }
        } catch (error) {
            console.error('编辑游戏失败:', error);
            this.showMessage('編輯失敗，請稍後重試', 'error');
        }
    }

    // 删除游戏
    async deleteGame(gameId) {
        try {
            if (confirm('確定要刪除這個遊戲嗎？此操作不可撤銷。')) {
                const success = await this.db.deleteGame(gameId);
                
                if (success) {
                    this.showMessage('遊戲刪除成功', 'success');
                    await this.loadGames();
                } else {
                    this.showMessage('遊戲刪除失敗', 'error');
                }
            }
        } catch (error) {
            console.error('删除游戏失败:', error);
            this.showMessage('刪除失敗，請稍後重試', 'error');
        }
    }

    // 添加用户
    async addUser() {
        try {
            const name = document.getElementById('userName').value;
            const studentId = document.getElementById('userStudentId').value;

            if (!name) {
                this.showMessage('請輸入用戶姓名', 'error');
                return;
            }

            if (studentId && !window.AppConfig.REGEX.STUDENT_ID.test(studentId)) {
                this.showMessage('學號格式錯誤，應為8位數字', 'error');
                return;
            }

            const success = await this.db.addUser({ name, student_id: studentId });

            if (success) {
                this.showMessage('用戶添加成功', 'success');
                document.getElementById('addUserForm').reset();
                await this.loadUsers();
            } else {
                this.showMessage('用戶添加失敗', 'error');
            }
        } catch (error) {
            console.error('添加用户失败:', error);
            this.showMessage('添加失敗，請稍後重試', 'error');
        }
    }

    // 批量添加用户
    async bulkAddUsers() {
        try {
            const text = prompt('請輸入用戶數據（每行一個用戶，格式：姓名,學號）:');
            if (!text) return;

            const lines = text.trim().split('\n');
            const users = [];

            for (const line of lines) {
                const [name, studentId] = line.split(',').map(s => s.trim());
                if (name) {
                    users.push({ name, student_id: studentId || null });
                }
            }

            if (users.length === 0) {
                this.showMessage('未找到有效的用戶數據', 'error');
                return;
            }

            const success = await this.db.bulkAddUsers(users);

            if (success) {
                this.showMessage(`成功添加 ${users.length} 個用戶`, 'success');
                await this.loadUsers();
            } else {
                this.showMessage('批量添加失敗', 'error');
            }
        } catch (error) {
            console.error('批量添加用户失败:', error);
            this.showMessage('批量添加失敗，請稍後重試', 'error');
        }
    }

    // 编辑用户
    async editUser(userId) {
        try {
            const users = await this.db.getAllUsers();
            const user = users.find(u => u.id === userId);
            
            if (!user) {
                this.showMessage('用戶不存在', 'error');
                return;
            }

            const newName = prompt('請輸入新的用戶姓名:', user.name);
            const newStudentId = prompt('請輸入新的學號:', user.student_id || '');

            if (newName) {
                const success = await this.db.updateUser(userId, {
                    name: newName,
                    student_id: newStudentId || null
                });

                if (success) {
                    this.showMessage('用戶更新成功', 'success');
                    await this.loadUsers();
                } else {
                    this.showMessage('用戶更新失敗', 'error');
                }
            }
        } catch (error) {
            console.error('编辑用户失败:', error);
            this.showMessage('編輯失敗，請稍後重試', 'error');
        }
    }

    // 删除用户
    async deleteUser(userId) {
        try {
            if (confirm('確定要刪除這個用戶嗎？此操作不可撤銷。')) {
                const success = await this.db.deleteUser(userId);
                
                if (success) {
                    this.showMessage('用戶刪除成功', 'success');
                    await this.loadUsers();
                } else {
                    this.showMessage('用戶刪除失敗', 'error');
                }
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            this.showMessage('刪除失敗，請稍後重試', 'error');
        }
    }

    // 导出数据
    async exportData() {
        try {
            const csv = await this.db.exportDataToCSV();
            
            if (!csv) {
                this.showMessage('導出數據為空', 'error');
                return;
            }

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `qr_game_data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showMessage('數據導出成功', 'success');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showMessage('導出失敗，請稍後重試', 'error');
        }
    }

    // 清空记录
    async clearRecords() {
        try {
            if (confirm('確定要清空所有遊戲記錄嗎？此操作不可撤銷！')) {
                const success = await this.db.clearAllRecords();
                
                if (success) {
                    this.showMessage('記錄清空成功', 'success');
                    await this.loadStatistics();
                } else {
                    this.showMessage('清空失敗', 'error');
                }
            }
        } catch (error) {
            console.error('清空记录失败:', error);
            this.showMessage('清空失敗，請稍後重試', 'error');
        }
    }

    // 显示消息
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        messageDiv.innerHTML = `
            <div class="flex items-center">
                <i class="fa fa-${
                    type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    'info-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }
}