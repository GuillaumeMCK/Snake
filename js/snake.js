"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const BANNER = `      ___           ___           ___           ___           ___      \n     /  /\\         /__/\\         /  /\\         /__/|         /  /\\     \n    /  /:/_        \\  \\:\\       /  /::\\       |  |:|        /  /:/_    \n   /  /:/ /\\        \\  \\:\\     /  /:/\\:\\      |  |:|       /  /:/ /\\   \n  /  /:/ /::\\   _____\\__\\:\\   /  /:/~/::\\   __|  |:|      /  /:/ /:/_  \n /__/:/ /:/\\:\\ /__/::::::::\\ /__/:/ /:/\\:\\ /__/\\_|:|____ /__/:/ /:/ /\\ \n \\  \\:\\/:/~/:/ \\  \\:\\~~\\~~\\/ \\  \\:\\/:/__\\/ \\  \\:\\/:::::/ \\  \\:\\/:/ /:/ \n  \\  \\::/ /:/   \\  \\:\\  ~~~   \\  \\::/       \\  \\::/~~~~   \\  \\::/ /:/  \n   \\__\\/ /:/     \\  \\:\\        \\  \\:\\        \\  \\:\\        \\  \\:\\/:/   \n     /__/:/       \\  \\:\\        \\  \\:\\        \\  \\:\\        \\  \\::/    \n     \\__\\/         \\__\\/         \\__\\/         \\__\\/         \\__\\/     \n     `;
const DEBUG = false;
// =========================== ON LOAD =========================== //
window.onload = function () {
    initMenu();
    document.getElementById('start-button').addEventListener('click', handleStartBtn);
    window.addEventListener('resize', handleScreenResize);
    window.addEventListener('keydown', (event) => handleInput(event));
    document.getElementById('highscore-button').addEventListener('click', showHighscore);
    SCORE = document.getElementById('score');
    TIME = document.getElementById('time');
};
// =========================== GAME FUNCTIONS =========================== //
let TIME;
let SCORE;
let _TIME = 0;
let _SCORE = 0;
let CASE_SIZE = 20;
let NB_WIDHT_CASES;
let NB_HEIGHT_CASES;
let MARGIN_WIDTH;
let MARGIN_HEIGHT;
let VELOCITY = {
    x: 0,
    y: 0
};
let SNAKE;
let FOOD;
let SPEED = 100; // ms
let GAME_RUNNING = false;
function initGame() {
    // Define variables
    VELOCITY = { x: 0, y: 0 };
    SNAKE = [{ x: 5, y: 5 }];
    // Init score and time
    _SCORE = 0;
    _TIME = 0;
    updateScoreAndTime();
    // find game-panel element
    const gamePanel = document.getElementById('game-panel');
    // create canvas element
    const canvas = document.createElement('canvas');
    // set canvas id 
    canvas.id = 'game-canvas';
    // set canvas width and height with game-panel width and height
    canvas.width = gamePanel.clientWidth;
    canvas.height = gamePanel.clientHeight;
    // add canvas to game-panel
    gamePanel.appendChild(canvas);
    // get canvas context
    const ctx = canvas.getContext('2d');
    // calculate number of cases
    NB_WIDHT_CASES = Math.floor(canvas.width / CASE_SIZE);
    NB_HEIGHT_CASES = Math.floor(canvas.height / CASE_SIZE);
    // def margin with extra space to center the game-canvas in game-panel
    MARGIN_WIDTH = (canvas.width - NB_WIDHT_CASES * CASE_SIZE) / 2;
    MARGIN_HEIGHT = (canvas.height - NB_HEIGHT_CASES * CASE_SIZE) / 2;
    // draw debug grid
    if (DEBUG) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        for (let i = 0; i < NB_WIDHT_CASES; i++) {
            for (let j = 0; j < NB_HEIGHT_CASES; j++) {
                ctx.strokeRect(MARGIN_WIDTH + i * CASE_SIZE, MARGIN_HEIGHT + j * CASE_SIZE, CASE_SIZE, CASE_SIZE);
            }
        }
    }
    return ctx;
}
function drawCase(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(MARGIN_WIDTH + x * CASE_SIZE, MARGIN_HEIGHT + y * CASE_SIZE, CASE_SIZE, CASE_SIZE);
    // draw debug grid
    if (DEBUG) {
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        ctx.strokeRect(MARGIN_WIDTH + x * CASE_SIZE, MARGIN_HEIGHT + y * CASE_SIZE, CASE_SIZE, CASE_SIZE);
    }
}
function resetCase(ctx, x, y) {
    // reset case with + 1 pixel to avoid border bug
    ctx.clearRect(MARGIN_WIDTH + x * CASE_SIZE - 1, MARGIN_HEIGHT + y * CASE_SIZE - 1, CASE_SIZE + 2, CASE_SIZE + 2);
}
function ramdomCoord() {
    return {
        x: Math.floor(Math.random() * NB_WIDHT_CASES),
        y: Math.floor(Math.random() * NB_HEIGHT_CASES)
    };
}
function drawFoodCase(ctx, color) {
    let coord = ramdomCoord();
    // check if food is not on snake
    while (SNAKE.some((snakeCase) => snakeCase.x === coord.x && snakeCase.y === coord.y)) {
        coord = ramdomCoord();
    }
    drawCase(ctx, coord.x, coord.y, color);
    FOOD = coord;
}
function drawSnake(ctx) {
    SNAKE.forEach((snakeCase) => {
        drawCase(ctx, snakeCase.x, snakeCase.y, '#00FF00');
    });
}
function startGame() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('start game');
        GAME_RUNNING = true;
        // Get canvas context
        const ctx = initGame();
        console.log('init game');
        // Create snake and food
        drawSnake(ctx);
        drawFoodCase(ctx, '#007F00');
        // Start time counter if player is playing
        while (VELOCITY.x === 0 && VELOCITY.y === 0) {
            yield new Promise(r => setTimeout(r, 100));
            console.log('wait for player');
        }
        // Start timer
        console.log('start timer');
        startTimer();
        console.log('start game loop');
        gameLoop(ctx);
    });
}
function saveScore() {
    // try to get time and score from local storage
    const time = localStorage.getItem('time');
    const score = localStorage.getItem('score');
    // if time and score are not null and time and score are better than local storage time and score
    console.log(time, score);
    if (time !== null && score !== null) {
        if (_SCORE > parseInt(score)) {
            // update local storage
            localStorage.setItem('time', _TIME.toString());
            localStorage.setItem('score', _SCORE.toString());
            makeSound(600);
            blinkScore();
            return;
        }
    }
    else {
        // update local storage
        localStorage.setItem('time', _TIME.toString());
        localStorage.setItem('score', _SCORE.toString());
    }
    makeSound();
}
function gameOver() {
    // stop timer
    GAME_RUNNING = false;
    // check if new record
    saveScore();
    // close game
    closeGame();
}
function moveSnake(ctx) {
    // Permet de déplacer le serpent en fonction de sa direction
    let newHead = { x: SNAKE[0].x + VELOCITY.x, y: SNAKE[0].y + VELOCITY.y };
    // Check if snake is out of the game-canvas
    if (newHead.x < 0 || newHead.x >= NB_WIDHT_CASES || newHead.y < 0 || newHead.y >= NB_HEIGHT_CASES) {
        gameOver();
        return;
    }
    // Check if snake is eating itself
    if (SNAKE.some((snakeCase) => snakeCase.x === newHead.x && snakeCase.y === newHead.y)) {
        gameOver();
        return;
    }
    // Check if snake is eating food
    if (newHead.x === FOOD.x && newHead.y === FOOD.y) {
        // Add new head to snake
        SNAKE.unshift(newHead);
        // Update score
        _SCORE++;
        // Draw new food
        drawFoodCase(ctx, '#007F00');
        // Make sound
        makeSound(500);
    }
    else {
        // Remove last snake case
        let lastSnakeCase = SNAKE.pop();
        if (lastSnakeCase) {
            resetCase(ctx, lastSnakeCase.x, lastSnakeCase.y);
        }
        // Add new head to snake
        SNAKE.unshift(newHead);
    }
    // Draw snake
    drawSnake(ctx);
    updateScoreAndTime();
}
function makeSound(frequency = 250, duration = 100) {
    return __awaiter(this, void 0, void 0, function* () {
        // Play sound with low frequency
        let audioCtx = new (window.AudioContext)();
        let oscillator = audioCtx.createOscillator();
        // Set volume to 50%
        let gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.5;
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'square';
        // Set frequency to 250Hz
        oscillator.frequency.value = frequency;
        // Start sound
        oscillator.start();
        yield new Promise(r => setTimeout(r, duration));
        // Stop sound
        oscillator.stop();
    });
}
function gameLoop(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        while (GAME_RUNNING) {
            moveSnake(ctx);
            yield new Promise(r => setTimeout(r, SPEED));
        }
    });
}
function handleInput(event) {
    switch (event.key) {
        case 'ArrowUp':
            if (VELOCITY.y !== 1) {
                VELOCITY.x = 0;
                VELOCITY.y = -1;
            }
            break;
        case 'ArrowDown':
            if (VELOCITY.y !== -1) {
                VELOCITY.x = 0;
                VELOCITY.y = 1;
            }
            break;
        case 'ArrowLeft':
            if (VELOCITY.x !== 1) {
                VELOCITY.x = -1;
                VELOCITY.y = 0;
            }
            break;
        case 'ArrowRight':
            if (VELOCITY.x !== -1) {
                VELOCITY.x = 1;
                VELOCITY.y = 0;
            }
            break;
    }
}
function saveTimeScore() {
    // Save time and score in local storage
    localStorage.setItem('time', TIME.toString());
    localStorage.setItem('score', _SCORE.toString());
}
function startTimer() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if time counter is running
        while (GAME_RUNNING) {
            yield new Promise(r => setTimeout(r, 1000));
            _TIME = _TIME + 1;
            updateScoreAndTime();
        }
    });
}
function closeGame() {
    // try to find game-canvas element
    const canvas = document.getElementById('game-canvas');
    // if game-canvas element is found
    canvas.remove();
    // display menu
    document.getElementById('start-panel').style.display = 'block';
}
// =========================== UI FUNCTIONS =========================== //
function blinkScore(repeat = 3) {
    return __awaiter(this, void 0, void 0, function* () {
        // Blink score
        for (let i = 0; i < repeat; i++) {
            document.getElementById('scorebar').style.color = '#007F00';
            yield new Promise(r => setTimeout(r, 200));
            document.getElementById('scorebar').style.color = '#00ff00';
            yield new Promise(r => setTimeout(r, 200));
        }
    });
}
// when SCORE OR TIME change, update score and time in game-panel
function showHighscore() {
    return __awaiter(this, void 0, void 0, function* () {
        // try to get time and score from local storage
        const time = localStorage.getItem('time');
        const score = localStorage.getItem('score');
        // if time and score are not null
        if (time !== null && score !== null) {
            updateScoreAndTime(parseInt(time), parseInt(score));
        }
    });
}
function updateScoreAndTime(time = _TIME, score = _SCORE) {
    return __awaiter(this, void 0, void 0, function* () {
        SCORE.innerHTML = score.toString();
        TIME.innerHTML = time.toString();
    });
}
function initMenu() {
    return __awaiter(this, void 0, void 0, function* () {
        // find start-panel-banner element
        const startPanelBanner = document.getElementById('start-panel-banner');
        // add text to start-panel-banner pre element
        startPanelBanner.innerHTML = BANNER;
    });
}
function handleStartBtn() {
    return __awaiter(this, void 0, void 0, function* () {
        // Hide start panel
        document.getElementById('start-panel').style.display = 'none';
        // Start game
        startGame();
    });
}
function handleScreenResize() {
    return __awaiter(this, void 0, void 0, function* () {
        // if game is running
        if (GAME_RUNNING) {
            location.reload();
        }
    });
}
