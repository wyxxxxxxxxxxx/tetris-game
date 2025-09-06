class Tetris {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.BLOCK_SIZE = 30;
        
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropTime = 0;
        this.dropInterval = 1000;
        
        this.initBoard();
        this.initEventListeners();
        this.generateNextPiece();
        this.spawnPiece();
        this.updateDisplay();
    }
    
    // 初始化游戏板
    initBoard() {
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            this.board[y] = [];
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                this.board[y][x] = 0;
            }
        }
    }
    
    // 方块形状定义
    getPieceShapes() {
        return {
            I: {
                shape: [
                    [1, 1, 1, 1]
                ],
                color: '#00f5ff'
            },
            O: {
                shape: [
                    [1, 1],
                    [1, 1]
                ],
                color: '#ffff00'
            },
            T: {
                shape: [
                    [0, 1, 0],
                    [1, 1, 1]
                ],
                color: '#a000f0'
            },
            S: {
                shape: [
                    [0, 1, 1],
                    [1, 1, 0]
                ],
                color: '#00f000'
            },
            Z: {
                shape: [
                    [1, 1, 0],
                    [0, 1, 1]
                ],
                color: '#f00000'
            },
            J: {
                shape: [
                    [1, 0, 0],
                    [1, 1, 1]
                ],
                color: '#0000f0'
            },
            L: {
                shape: [
                    [0, 0, 1],
                    [1, 1, 1]
                ],
                color: '#f0a000'
            }
        };
    }
    
    // 生成随机方块
    generatePiece() {
        const pieces = Object.keys(this.getPieceShapes());
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        const pieceData = this.getPieceShapes()[randomPiece];
        
        return {
            type: randomPiece,
            shape: pieceData.shape,
            color: pieceData.color,
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(pieceData.shape[0].length / 2),
            y: 0
        };
    }
    
    // 生成下一个方块
    generateNextPiece() {
        this.nextPiece = this.generatePiece();
        this.drawNextPiece();
    }
    
    // 生成新方块
    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
            this.generateNextPiece();
        } else {
            this.currentPiece = this.generatePiece();
        }
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
        }
    }
    
    // 检查碰撞
    checkCollision(piece, newX, newY) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // 移动方块
    movePiece(dx, dy) {
        if (!this.currentPiece || !this.gameRunning || this.gamePaused) return false;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (!this.checkCollision(this.currentPiece, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            return true;
        }
        return false;
    }
    
    // 旋转方块
    rotatePiece() {
        if (!this.currentPiece || !this.gameRunning || this.gamePaused) return;
        
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotated;
        
        // 检查旋转后是否有碰撞
        if (this.checkCollision(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            // 尝试向左或向右移动
            if (!this.checkCollision(this.currentPiece, this.currentPiece.x - 1, this.currentPiece.y)) {
                this.currentPiece.x--;
            } else if (!this.checkCollision(this.currentPiece, this.currentPiece.x + 1, this.currentPiece.y)) {
                this.currentPiece.x++;
            } else {
                // 无法旋转，恢复原状
                this.currentPiece.shape = originalShape;
            }
        }
    }
    
    // 旋转矩阵
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let i = 0; i < cols; i++) {
            rotated[i] = [];
            for (let j = 0; j < rows; j++) {
                rotated[i][j] = matrix[rows - 1 - j][i];
            }
        }
        
        return rotated;
    }
    
    // 固定方块到游戏板
    lockPiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }
    
    // 清除完整的行
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // 重新检查这一行
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += this.calculateScore(linesCleared);
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
            this.updateDisplay();
        }
    }
    
    // 计算得分
    calculateScore(linesCleared) {
        const baseScore = [0, 40, 100, 300, 1200];
        return baseScore[linesCleared] * this.level;
    }
    
    // 硬降
    hardDrop() {
        if (!this.currentPiece || !this.gameRunning || this.gamePaused) return;
        
        while (this.movePiece(0, 1)) {
            this.score += 2;
        }
        this.lockPiece();
        this.updateDisplay();
    }
    
    // 绘制方块
    drawBlock(ctx, x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        // 绘制边框
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);
        
        // 绘制高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x * this.BLOCK_SIZE + 2, y * this.BLOCK_SIZE + 2, this.BLOCK_SIZE - 4, 4);
        ctx.fillRect(x * this.BLOCK_SIZE + 2, y * this.BLOCK_SIZE + 2, 4, this.BLOCK_SIZE - 4);
    }
    
    // 绘制游戏板
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.canvas.width, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
        
        // 绘制已固定的方块
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(this.ctx, x, y, this.board[y][x]);
                }
            }
        }
        
        // 绘制当前方块
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const drawX = this.currentPiece.x + x;
                        const drawY = this.currentPiece.y + y;
                        if (drawY >= 0) {
                            this.drawBlock(this.ctx, drawX, drawY, this.currentPiece.color);
                        }
                    }
                }
            }
        }
    }
    
    // 绘制下一个方块
    drawNextPiece() {
        if (!this.nextPiece) return;
        
        // 清空画布
        this.nextCtx.fillStyle = '#1a202c';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * blockSize) / 2;
        
        for (let y = 0; y < this.nextPiece.shape.length; y++) {
            for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                if (this.nextPiece.shape[y][x]) {
                    this.nextCtx.fillStyle = this.nextPiece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                    
                    this.nextCtx.strokeStyle = '#000';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
    
    // 更新显示
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    // 游戏循环
    gameLoop(currentTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        if (currentTime - this.dropTime > this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
            this.dropTime = currentTime;
        }
        
        this.draw();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // 开始游戏
    start() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.dropTime = 0;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    // 暂停游戏
    pause() {
        this.gamePaused = !this.gamePaused;
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        
        if (!this.gamePaused) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }
    
    // 重置游戏
    reset() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        
        this.initBoard();
        this.generateNextPiece();
        this.spawnPiece();
        this.updateDisplay();
        this.draw();
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = '暂停';
        document.getElementById('gameOver').style.display = 'none';
    }
    
    // 游戏结束
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
    
    // 初始化事件监听器
    initEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.movePiece(0, 1)) {
                        this.score += 1;
                        this.updateDisplay();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    if (this.gameRunning) {
                        this.pause();
                    }
                    break;
            }
            this.draw();
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.reset();
        });
    }
}

// 初始化游戏
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Tetris();
});