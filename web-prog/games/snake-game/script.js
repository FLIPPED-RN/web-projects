const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const resetBtn = document.getElementById('reset-btn');

const GRID_SIZE = 10;
const SNAKE_SIZE = GRID_SIZE;
const FOOD_SIZE = GRID_SIZE;

let snake, food, dx, dy, blinkCounter;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

let currentScoreElem = document.getElementById('current-score');
let highScoreElem = document.getElementById('high-score');

//starting the game
function initializeGame(){
    //snake
    snake = [
        {x: Math.floor(canvas.width / 2 / GRID_SIZE) * GRID_SIZE, y: Math.floor(canvas.height / 2 / GRID_SIZE) * GRID_SIZE},
        {x: Math.floor(canvas.width / 2 / GRID_SIZE) * GRID_SIZE, y: (Math.floor(canvas.height / 2 / GRID_SIZE) + 1) * GRID_SIZE},
    ];
    //food
    food = {
        ...generateFoodPosition(),
        dx: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
        dy: (Math.random() < 0.5 ? 1 : 1) * GRID_SIZE
    }
    dx = 0;
    dy = -GRID_SIZE;
    blinkCounter = 0;
    score = 0;
    currentScoreElem.textContent = score;
    highScoreElem.textContent = highScore;
}

initializeGame();

//setting up the snake control
document.addEventListener('keydown', function (event){
    switch (event.key){
        case 'ArrowUp':
            if(dy === 0){
                dx = 0;
                dy = -GRID_SIZE;
            }
            break;
        case 'ArrowDown':
            if(dy === 0){
                dx = 0;
                dy = GRID_SIZE;
            }
            break;
        case 'ArrowLeft':
            if (dx === 0){
                dx = -GRID_SIZE;
                dy = 0;
            }
            break;
        case 'ArrowRight':
            if (dx === 0){
                dx = GRID_SIZE;
                dy = 0;
            }
            break;
    }
});

// generating a food position
function generateFoodPosition(){
    while(true){
        let newFoodPosition = {
            x: Math.floor(Math.random() * canvas.width / GRID_SIZE) * GRID_SIZE,
            y: Math.floor(Math.random() * canvas.height / GRID_SIZE) * GRID_SIZE
        };

        let collisionWithSnake = false;
        for(let segment of snake){
            if(segment.x === newFoodPosition.x && segment.y === newFoodPosition.y){
                collisionWithSnake = true;
                break;
            }
        }

        if(!collisionWithSnake){
            return newFoodPosition;
        }
    }
}

function checkCollision(){
    if(snake[0].x < 0 || snake[0].x >= canvas.width || snake[0].y < 0 || snake[0].y >= canvas.height){
        return true;
    }
    for(let i = 1; i < snake.length; i++){
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y){
            return true;
        }
    }
    return false;
}

// updating the game after a pause
function update(){
    if (gamePaused) return;

    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    if (checkCollision()){
        if (score > highScore){
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreElem.textContent = highScore;
        }
        gameOver();
        return;
    }


    if (head.x === food.x && head.y === food.y){
        score++;
        currentScoreElem.textContent = score;
        food = {
            ...generateFoodPosition(),
            dx: (Math.random() < 0.5 ? 1 : -1) * GRID_SIZE,
            dy: (Math.random() < 0.5 ? 1 : 1) * GRID_SIZE
        };

        if (snake.length === (canvas.width / GRID_SIZE) * (canvas.height / GRID_SIZE)){
            gameWin();
            return;
        }
    }else{
        snake.pop(); // the return of the snake's size
    }

    blinkCounter++;
    draw(); // rendering game objects after the update
}

//отрисовка сетки
function drawGrid(){
    context.strokeStyle = '#AAA';
    for(let i = 0; i < canvas.width; i += GRID_SIZE){
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
    }
    for(let j = 0; j < canvas.height; j += GRID_SIZE){
        context.beginPath();
        context.moveTo(0, j);
        context.lineTo(canvas.width, j);
        context.stroke();
    }
}

// drawing snakes and food
function draw(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    for(let segment of snake){
        context.fillStyle = 'black';
        context.fillRect(segment.x, segment.y, SNAKE_SIZE, SNAKE_SIZE);
    }
    context.fillStyle ='black';
    context.fillRect(food.x, food.y, FOOD_SIZE, FOOD_SIZE);
}

// reset the record
function reset() {
    highScore = 0;
    score = 0;
    localStorage.setItem('highScore', highScore);
    highScoreElem.textContent = highScore;
    alert("Вы сбросили свой рекорд до 0");
}

function gameOver(){
    gamePaused = true;
    gameOverScreen.style.display = 'flex';
}

function gameWin(){
    gamePaused = true;
    alert('Вы выиграли!');
    initializeGame();
}

// reset
restartBtn.addEventListener('click', function () {
    gameOverScreen.style.display = 'none';
    gamePaused = false;
    initializeGame();
    update();
});

resetBtn.addEventListener('click', function () {
    gamePaused = false;
    reset();
});

setInterval(update, 50);

// pause game
window.addEventListener('blur', function (){
    gamePaused = true;
});

// unpause game
window.addEventListener('focus', function (){
    gamePaused = false;
    update();
});