// QR码游戏系统 - 用户功能模块
// 版本: 2.0.0
// 日期: 2024-01-14

class UserManager {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        this.lastScanTime = 0;
        this.scanHistory = [];
    }

    // 初始化
    async initialize() {
        try {
            console.log('✓ 用户管理器初始化成功');
        } catch (error) {
            console.error('✗ 用户管理器初始化失败:', error);
        }
    }

    // 初始化QR码扫描器
    async initializeScanner(videoElement, canvasElement) {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('浏览器不支持摄像头访问');
            }

            this.video = videoElement;
            this.canvas = canvasElement;
            this.ctx = canvasElement.getContext('2d');

            console.log('✓ QR码扫描器初始化成功');
            return true;

        } catch (error) {
            console.error('✗ QR码扫描器初始化失败:', error);
            throw error;
        }
    }

    // 开始扫描
    async startScan() {
        try {
            if (!this.video || !this.canvas) {
                throw new Error('扫描器未初始化');
            }

            if (this.isScanning) {
                console.log('扫描器已在运行中');
                return;
            }

            console.log('开始启动摄像头...');

            // 请求摄像头权限
            const stream = await navigator.mediaDevices.getUserMedia(
                window.QRGameConfig.scanner.constraints
            );

            this.video.srcObject = stream;
            this.isScanning = true;

            // 开始扫描循环
            this.startScanLoop();

            console.log('✓ 扫描器启动成功');

            return {
                success: true,
                message: '扫描器启动成功'
            };

        } catch (error) {
            console.error('✗ 启动扫描器失败:', error);
            
            return {
                success: false,
                message: error.message || '无法访问摄像头'
            };
        }
    }

    // 停止扫描
    stopScan() {
        try {
            if (!this.isScanning) {
                return;
            }

            if (this.video && this.video.srcObject) {
                this.video.srcObject.getTracks().forEach(track => track.stop());
                this.video.srcObject = null;
            }

            this.isScanning = false;
            
            // 清除画布
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }

            console.log('✓ 扫描器已停止');

        } catch (error) {
            console.error('✗ 停止扫描器失败:', error);
        }
    }

    // 扫描循环
    startScanLoop() {
        if (!this.isScanning) return;

        try {
            // 绘制视频帧到画布
            this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

            // 获取图像数据
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            
            // 使用ZXing库解码QR码
            if (typeof ZXing !== 'undefined') {
                this.decodeQRCode(imageData);
            }

            // 继续循环
            requestAnimationFrame(() => this.startScanLoop());

        } catch (error) {
            console.error('✗ 扫描循环错误:', error);
            // 继续循环
            if (this.isScanning) {
                requestAnimationFrame(() => this.startScanLoop());
            }
        }
    }

    // 解码QR码
    async decodeQRCode(imageData) {
        try {
            const codeReader = new ZXing.BrowserMultiFormatReader();
            const result = await codeReader.decodeFromVideoDevice(null, this.video);

            if (result && result.text) {
                await this.handleScanResult(result.text);
            }

        } catch (error) {
            // 解码失败是正常的，不打印错误
        }
    }

    // 处理扫描结果
    async handleScanResult(qrCodeText) {
        try {
            // 防止重复扫描
            const now = Date.now();
            if (now - this.lastScanTime < 2000) {
                return;
            }
            this.lastScanTime = now;

            console.log(`扫描到QR码: ${qrCodeText}`);

            // 解析QR码格式
            const match = qrCodeText.match(window.QRGameConfig.regex.qrCode);
            if (!match) {
                throw new Error('QR码格式错误');
            }

            const [, gameId, score] = match;

            // 验证游戏存在
            const game = await window.dbManager.getGameById(gameId);
            if (!game) {
                throw new Error('游戏不存在');
            }

            if (!game.is_active) {
                throw new Error('游戏已停用');
            }

            // 验证分数
            const scoreNum = parseInt(score);
            if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > game.max_score) {
                throw new Error(`分数必须在0-${game.max_score}之间`);
            }

            // 保存游戏记录
            const recordId = window.dbManager.generateId('R');
            const currentUser = window.authManager.getCurrentUser();

            const record = await window.dbManager.addGameRecord({
                id: recordId,
                user_id: currentUser.id,
                game_id: gameId,
                score: scoreNum,
                recorded_by: currentUser.username
            });

            // 更新用户总分
            const user = await window.dbManager.getUserById(currentUser.id);
            const newTotalScore = (user.total_score || 0) + scoreNum;
            await window.dbManager.updateUserTotalScore(currentUser.id, newTotalScore);

            // 更新游戏统计
            await this.updateGameStatistics(gameId, scoreNum);

            // 添加到扫描历史
            this.scanHistory.unshift({
                gameId,
                gameName: game.name,
                score: scoreNum,
                timestamp: new Date().toISOString()
            });

            // 限制历史记录数量
            if (this.scanHistory.length > 50) {
                this.scanHistory = this.scanHistory.slice(0, 50);
            }

            console.log('✓ QR码处理成功');

            // 触发成功事件
            this.triggerEvent('scanSuccess', {
                game,
                score: scoreNum,
                record,
                totalScore: newTotalScore
            });

        } catch (error) {
            console.error('✗ 处理QR码失败:', error);
            
            // 触发错误事件
            this.triggerEvent('scanError', {
                message: error.message
            });
        }
    }

    // 更新游戏统计
    async updateGameStatistics(gameId, score) {
        try {
            const stats = await window.dbManager.getGameStatistics(gameId);
            
            const newStats = {
                total_players: stats ? stats.total_players + 1 : 1,
                total_games: stats ? stats.total_games + 1 : 1,
                avg_score: stats ? ((stats.avg_score * stats.total_games) + score) / (stats.total_games + 1) : score,
                max_score: stats ? Math.max(stats.max_score, score) : score
            };

            await window.dbManager.updateGameStatistics(gameId, newStats);

        } catch (error) {
            console.error('✗ 更新游戏统计失败:', error);
        }
    }

    // 获取用户信息
    async getUserInfo(userId) {
        try {
            const user = await window.dbManager.getUserById(userId);
            if (!user) {
                throw new Error('用户不存在');
            }

            const gameRecords = await window.dbManager.getUserGameRecords(userId, 10);

            return {
                user,
                recentGames: gameRecords
            };

        } catch (error) {
            console.error('✗ 获取用户信息失败:', error);
            throw error;
        }
    }

    // 获取排行榜
    async getLeaderboard(limit = 10) {
        try {
            const users = await window.dbManager.getUsers('', limit, 0);
            
            return users.map((user, index) => ({
                rank: index + 1,
                userId: user.id,
                username: user.username,
                totalScore: user.total_score
            }));

        } catch (error) {
            console.error('✗ 获取排行榜失败:', error);
            throw error;
        }
    }

    // 事件系统
    on(eventName, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }

    off(eventName, callback) {
        if (!this.eventListeners || !this.eventListeners[eventName]) {
            return;
        }
        this.eventListeners[eventName] = this.eventListeners[eventName].filter(cb => cb !== callback);
    }

    triggerEvent(eventName, data) {
        if (!this.eventListeners || !this.eventListeners[eventName]) {
            return;
        }
        this.eventListeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`✗ 事件处理器错误 (${eventName}):`, error);
            }
        });
    }

    // 获取扫描状态
    getScanStatus() {
        return {
            isScanning: this.isScanning,
            scanHistory: this.scanHistory
        };
    }

    // 手动输入分数（备用方案）
    async manualScoreEntry(gameId, score) {
        try {
            // 验证游戏存在
            const game = await window.dbManager.getGameById(gameId);
            if (!game) {
                throw new Error('游戏不存在');
            }

            if (!game.is_active) {
                throw new Error('游戏已停用');
            }

            // 验证分数
            const scoreNum = parseInt(score);
            if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > game.max_score) {
                throw new Error(`分数必须在0-${game.max_score}之间`);
            }

            // 模拟QR码文本
            const qrCodeText = `GAME:${gameId}:${scoreNum}`;
            
            // 使用相同的处理逻辑
            await this.handleScanResult(qrCodeText);

            return {
                success: true,
                message: '手动输入分数成功'
            };

        } catch (error) {
            console.error('✗ 手动输入分数失败:', error);
            
            return {
                success: false,
                message: error.message
            };
        }
    }
}

// 创建全局用户管理器实例
window.userManager = new UserManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', async function() {
    await window.userManager.initialize();
});