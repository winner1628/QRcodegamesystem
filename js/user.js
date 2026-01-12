// 用户功能模块
class UserManager {
    constructor() {
        this.db = new DatabaseManager();
        this.auth = new AuthManager();
    }

    // 初始化用户界面
    async initializeUserInterface() {
        try {
            // 显示用户信息
            await this.displayUserInfo();
            
            // 加载游戏列表
            await this.loadGames();
            
            // 加载用户记录
            await this.loadUserRecords();
            
            // 绑定事件
            this.bindEvents();
            
        } catch (error) {
            console.error('初始化用户界面失败:', error);
            this.showMessage('初始化失敗，請刷新頁面重試', 'error');
        }
    }

    // 显示用户信息
    async displayUserInfo() {
        const userInfo = this.auth.getCurrentUser();
        if (userInfo) {
            const user = await this.db.verifyUser(userInfo.id);
            if (user) {
                document.getElementById('userName').textContent = user.name;
                document.getElementById('userId').textContent = user.id;
                document.getElementById('userStudentId').textContent = user.student_id || 'N/A';
                document.getElementById('userTotalScore').textContent = user.total_score;
            }
        }
    }

    // 加载游戏列表
    async loadGames() {
        try {
            const games = await this.db.getAllGames();
            const gameSelect = document.getElementById('gameSelect');
            const gameSelect2 = document.getElementById('gameSelect2');
            
            if (gameSelect) {
                gameSelect.innerHTML = '<option value="">請選擇遊戲</option>';
                games.forEach(game => {
                    gameSelect.innerHTML += `<option value="${game.id}">${game.name} (最高分: ${game.max_score})</option>`;
                });
            }
            
            if (gameSelect2) {
                gameSelect2.innerHTML = '<option value="">請選擇遊戲</option>';
                games.forEach(game => {
                    gameSelect2.innerHTML += `<option value="${game.id}">${game.name}</option>`;
                });
            }
        } catch (error) {
            console.error('加载游戏列表失败:', error);
            this.showMessage('加載遊戲列表失敗', 'error');
        }
    }

    // 加载用户记录
    async loadUserRecords() {
        try {
            const userInfo = this.auth.getCurrentUser();
            if (!userInfo) return;
            
            const records = await this.db.getUserGameRecords(userInfo.id);
            this.displayUserRecords(records);
        } catch (error) {
            console.error('加载用户记录失败:', error);
            this.showMessage('加載記錄失敗', 'error');
        }
    }

    // 显示用户记录
    displayUserRecords(records) {
        const recordsTable = document.getElementById('recordsTable');
        if (!recordsTable) return;
        
        if (records.length === 0) {
            recordsTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-4 text-gray-500">
                        <i class="fa fa-info-circle mr-2"></i>暫無遊戲記錄
                    </td>
                </tr>
            `;
            return;
        }
        
        recordsTable.innerHTML = records.map(record => `
            <tr class="hover:bg-gray-50">
                <td class="py-3 px-4 border-b">${record.games?.name || '未知遊戲'}</td>
                <td class="py-3 px-4 border-b text-center">${record.score}</td>
                <td class="py-3 px-4 border-b text-center">${record.recorded_at ? new Date(record.recorded_at).toLocaleString('zh-TW') : '未知時間'}</td>
                <td class="py-3 px-4 border-b text-center">
                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        已完成
                    </span>
                </td>
            </tr>
        `).join('');
    }

    // 记录游戏成绩
    async recordScore(gameId, score) {
        try {
            const userInfo = this.auth.getCurrentUser();
            if (!userInfo) {
                return { success: false, message: '用戶未登入' };
            }

            // 验证输入
            if (!gameId || !score) {
                return { success: false, message: '請選擇遊戲並輸入分數' };
            }

            const scoreNum = parseInt(score);
            if (isNaN(scoreNum) || scoreNum < 0) {
                return { success: false, message: '分數必須為正整數' };
            }

            // 获取游戏信息验证最高分
            const games = await this.db.getAllGames();
            const game = games.find(g => g.id === gameId);
            if (game && scoreNum > game.max_score) {
                return { success: false, message: `分數不能超過最高分 ${game.max_score}` };
            }

            // 记录成绩
            const success = await this.db.recordGameScore(userInfo.id, gameId, scoreNum);
            
            if (success) {
                // 刷新界面
                await this.displayUserInfo();
                await this.loadUserRecords();
                return { success: true, message: '成績記錄成功' };
            } else {
                return { success: false, message: '成績記錄失敗' };
            }
        } catch (error) {
            console.error('记录成绩失败:', error);
            return { success: false, message: '記錄失敗，請稍後重試' };
        }
    }

    // 通过QR码记录成绩
    async recordScoreByQRCode(qrData) {
        try {
            const parsed = this.auth.parseQRCodeData(qrData);
            
            if (!parsed || parsed.type !== 'game') {
                return { success: false, message: '無效的遊戲QR碼' };
            }

            const gameId = parsed.id;
            
            // 显示输入分数的对话框
            const score = prompt('請輸入遊戲分數:');
            if (score === null) {
                return { success: false, message: '取消輸入' };
            }

            return await this.recordScore(gameId, score);
        } catch (error) {
            console.error('通过QR码记录成绩失败:', error);
            return { success: false, message: '處理QR碼失敗' };
        }
    }

    // 搜索游戏记录
    async searchRecords(gameId) {
        try {
            const userInfo = this.auth.getCurrentUser();
            if (!userInfo) return;
            
            let records = await this.db.getUserGameRecords(userInfo.id);
            
            if (gameId) {
                records = records.filter(record => record.game_id === gameId);
            }
            
            this.displayUserRecords(records);
        } catch (error) {
            console.error('搜索记录失败:', error);
            this.showMessage('搜索失敗', 'error');
        }
    }

    // 绑定事件
    bindEvents() {
        // 记录成绩表单提交
        const scoreForm = document.getElementById('scoreForm');
        if (scoreForm) {
            scoreForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const gameId = document.getElementById('gameSelect').value;
                const score = document.getElementById('score').value;
                
                const result = await this.recordScore(gameId, score);
                this.showMessage(result.message, result.success ? 'success' : 'error');
                
                if (result.success) {
                    scoreForm.reset();
                }
            });
        }

        // 搜索表单提交
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const gameId = document.getElementById('gameSelect2').value;
                await this.searchRecords(gameId);
            });
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                await this.loadUserRecords();
                this.showMessage('記錄已刷新', 'success');
            });
        }

        // 登出按钮
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.auth.logout();
            });
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

        // 2秒后自动移除
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

    // 初始化QR码扫描器
    initializeQRScanner() {
        if (typeof Html5Qrcode === 'undefined') {
            console.error('QR码扫描器库未加载');
            return;
        }

        const reader = new Html5Qrcode('qr-reader');
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        reader.start(
            { facingMode: 'environment' },
            config,
            async (qrCodeMessage) => {
                console.log('扫描到QR码:', qrCodeMessage);
                
                // 停止扫描
                reader.stop().catch(err => {
                    console.error('停止扫描失败:', err);
                });

                // 处理QR码
                const parsed = this.auth.parseQRCodeData(qrCodeMessage);
                
                if (parsed) {
                    if (parsed.type === 'user') {
                        // 用户登录
                        const result = await this.auth.userLogin(parsed.id);
                        this.showMessage(result.message, result.success ? 'success' : 'error');
                        if (result.success) {
                            window.location.href = 'user-dashboard.html';
                        }
                    } else if (parsed.type === 'game') {
                        // 记录成绩
                        const result = await this.recordScoreByQRCode(qrCodeMessage);
                        this.showMessage(result.message, result.success ? 'success' : 'error');
                        
                        // 重新开始扫描
                        setTimeout(() => {
                            this.initializeQRScanner();
                        }, 1000);
                    }
                } else {
                    this.showMessage('無效的QR碼', 'error');
                    
                    // 重新开始扫描
                    setTimeout(() => {
                        this.initializeQRScanner();
                    }, 1000);
                }
            },
            (errorMessage) => {
                // 扫描错误，继续扫描
                console.log('扫描错误:', errorMessage);
            }
        ).catch(err => {
            console.error('启动扫描器失败:', err);
            document.getElementById('qr-reader').innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fa fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>啟動攝像頭失敗</p>
                    <p class="text-sm mt-2">請檢查瀏覽器權限設置</p>
                </div>
            `;
        });
    }
}