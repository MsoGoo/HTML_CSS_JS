const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')


class SnakeBody{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

/* 
    nodeNum : how much node in each row & column, since the canvas is a square, row size == column size
    nodeSize : how much pix for each node
    tailSize : ?px smaller than node size. because we won't want to fully filled the tail in one node. so make it smaller
    headX : snake head x position
    heady : sname head y position
    dirX : move direction on x-axis, 1 : right, -1 : left
    dirY : move direction on Y-axis, 1 : down, -1 : up
    snakeBody : store the snake's body
    bodyLength : how many bodies we have yet
*/
var nodeNum = 35;
var nodeSize = canvas.width/ nodeNum;
var tileSize = canvas.width / nodeNum - 1;
var headX = 10;
var headY = 10;
var dirX = 0;
var dirY = 0;
var snakeBody = [];
let bodyLength = 0;

//food's position
var foodX = 5;
var foodY = 5;

//store the score
var score = 0;

//eat sound
const eatSound = new Audio("../soundMaterial/EatApple.mp3");

//evcery "speed" ms refresh once
var speed = 80;

function draw() {
    //updateSnakePosition & checkFoodCollision have to put before.
    //updateSnakePosition checks the game end condition, checkFoodCollision expand the snake's body. then in the drawsnake function will mark the newest body's position. 
    updateSnakePosition();
    let result = gameOver();
    if(result){
        return;
    }

    ctx.fillStyle = "rgb(0, 0, 0, 0.99)";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    checkFoodCollision();
    drawFood();
    drawSnake();
    drawScore();
    setTimeout(draw, speed);
}

function drawSnake() {
    //draw the snake body
    ctx.fillStyle = "green"; 
    for (let i = 0; i < snakeBody.length; ++i) {
        let body = snakeBody[i];
        ctx.fillRect(body.x * nodeSize, body.y * nodeSize, tileSize, tileSize);
    }

    //!!!!!!!!!
    //every drawSnake loop will push a snakebody into the array, eventhough the snake length doesn't change
    //By using this way, we don't need to update each body's position everytime, we just add a new body at the prev headx and heady position, and remove the last node.
    snakeBody.push(new SnakeBody(headX, headY));
    if(snakeBody.length > bodyLength) {
        snakeBody.shift();
    }

    ctx.fillStyle = "orange";
    ctx.fillRect(headX * nodeSize, headY * nodeSize, tileSize, tileSize);
}

function updateSnakePosition() {
    headX += dirX;
    headY += dirY;
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(foodX * nodeSize, foodY * nodeSize, tileSize, tileSize);
}

function checkFoodCollision() {
    //after collision, change the food's position
    if (headX == foodX && headY == foodY) {
        foodX = Math.floor(Math.random() * nodeNum);
        foodY = Math.floor(Math.random() * nodeNum);
        bodyLength++;
        score++;
        eatSound.play();
    }
}

//can use html tags to draw, to directly draw by using ctx. 
function drawScore() {
    ctx.fillStyle = "white"
    ctx.font = "20px Verdana";
    ctx.fillText("Score: " + score, 0,20);
}

function gameOver() {
    let flag = false;
    //hit the boundary, end the game
    if (headX < 0 || headY < 0 || headX >= nodeNum || headY >= nodeNum) {
        flag = true;
    }

    for(var i = 0; i < snakeBody.length; ++i) {
        if (headX == snakeBody[i].x && headY == snakeBody[i].y) {
            flag = true;
            break; 
        }
    }

    if (flag) {
        ctx.fillStyle = "white";
        ctx.font = "50px Verdana";
  
        var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", " magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");
        // Fill with gradient
        ctx.fillStyle = gradient;
        
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    }

    return flag;
}

window.addEventListener("keydown", keyDown);

function keyDown(event) {
    console.log(dirX);
    if(event.key == "w" || event.key == "W" ) {
        //cannot go up when going down
        if (dirY == 1) {
            return;
        }
        dirY = -1;
        dirX = 0;
    } else if (event.key == "s" || event.key == "S") {
        if (dirY == -1) {
            return;
        }
        dirY = 1;
        dirX = 0;
    } else if (event.key == "a" || event.key == "A") {
        if (dirX == 1) {
            return;
        }
        dirY = 0;
        dirX = -1;
    } else if (event.key == "d" || event.key == "D") {
        if (dirX == -1) {
            return;
        }
        dirY = 0;
        dirX = 1;
    }
}

draw();
