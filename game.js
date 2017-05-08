/**
 * Created by lirona on 06/05/2017.
 */
// global variables
var moves = {}; // dictionary for moves, dictionary of functions
var sounds = {"gameSound" : "./sounds/game.mp3"}
var gameMusic;

var ghosts = [];
var corners = [{x : 30, y : 30} , { x : 370, y : 30 }, { x : 370, y : 450 }, { x: 30 , y : 430}];
var ghostsPictures =["./images/game/ghost1.png", "./images/game/ghost2.png", "./images/game/ghost3.png"];
var pacman;
var numOfGhost;
var angel;
var coinsArray;
var intervalId;
var canvas;
var ctx;
var numOfCoins;
var gamePoints;
var intervalSize = 45;
var counterToOneSecond;
var timeLeft;
var lives;
var isGameStaring = true; // flag to tell if to run init function
var isJustLostLife = false;

var bonuses = [];

var timeAddition;
var extraLife;

//NEW
var oppositeCurse;


//

var speedAddition;
var speedmode;
var speedSecondsCounter;

var eatGhostBonus;
var eattingGhostMode;
var eattingModeCounter;

var topScore = -1;

function init(){ // initialization function
    $("#game").css("display" , "block");

    pacman = {x : 50, y : 30, radius : 10, speed : 4, currentDirection : 37, previousDirection : 37, nextDirection: 0, startingX : 50, startingY : 30};
    startPositionPacman(); // we override the pacman x and y

    numOfGhost = $("#slct_numOfGhosts").val();
    createGhosts();

    angel = {x : 390, y : 30, radius : 10 , imagePath: './images/game/cherry.png', direction: 39, speed: 4, cost : 50};
    numOfCoins = $("#slct_numCoins").val();
    timeLeft = $("#inp_duration").val();
    gamePoints = 0;
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    window.addEventListener("keydown", function(){
        if (event.keyCode >= 37 && event.keyCode <= 40) // check if this only direction key
        {
            pacman.nextDirection = event.keyCode;
        }
    });
    setCoins();
    setTimeAddition();
    setExtraLife();
    setSpeedAddition();
    setOppositeCurse()
    counterToOneSecond = 0; // helper for game timer
    lives = 3;
    isGameStaring = false;
    speedmode = false;
    eattingGhostMode = false;
    startEatTime = -1;
    setEatGhost();
    playSound(sounds["gameSound"]);
}

function createGhosts()
{
    for (var i = 0; i < numOfGhost; i++)
    {
        if (ghosts[i] == null)
        {
            var ghost = {x : corners[i+1].x, y : corners[i+1].y, radius : 10 , color: 'white', direction : 37, speed : 4, startingX : corners[i+1].x, startingY : corners[i+1].y};

            ghost.imagePath = ghostsPictures[i];
            ghost.grid = copyArr(grid);
            ghost.isAlive = true;

            var position = {x : -1, y : -1};
            ghost.oldStart = position; // for a star alghorithm
            var position = {x : -1, y : -1};
            ghost.oldGoal = position; // for a star alghorithm

            ghosts.push(ghost)
        } else { // reset the position after the ghost been eatten
            if (ghosts[i].isAlive == false)
            {
                ghosts[i].x = corners[i+1].x;
                ghosts[i].y = corners[i+1].y;
                ghosts[i].isAlive = true;
            }
        }
    }
    console.log(ghosts);
}

function getRandomEmptyTile()
{
    var row;
    var col; // (0,0) is wall for sure
    do {
        row = Math.floor((Math.random() * 23));
        col = Math.floor((Math.random() * 22));
    }
    while (board[col][row] != 0);
    return [row, col];
}

// sets tile for bonus. places the bonus number in the board. returns generated bonus
function initBonusWithPlace(bonusNumber)
{
    var place;
    do{
        place = getRandomEmptyTile();
    } while (board[place[0]][place[1]] == 0 || board[place[0]][place[1]] > 2) // 2 is wall and not good for bouns and also place with coins and other bounses
    board[place[1]][place[0]] == bonusNumber;
    return {x : place[0]*20, y : place[1]*20, radius : 10, visible : true};
}

function setCoins()
{
    coinsArray = [];
    var _25points = Math.ceil( numOfCoins*0.1 );
    var _15points = Math.floor( numOfCoins*0.3 );
    var _5points = numOfCoins-_15points-_25points;

    while (_5points > 0)
    {
        coinsArray.push(createCoin(5, "yellow"));
        _5points -= 1;
    }
    while (_15points > 0)
    {
        coinsArray.push(createCoin(15, "silver"));
        _15points -= 1;
    }
    while (_25points > 0)
    {
        coinsArray.push(createCoin(25, "orange"));
        _25points -= 1;
    }
}

function setTimeAddition()
{
    timeAddition = initBonusWithPlace(3);
    timeAddition.imagePath = "./images/game/clock3.png";
    timeAddition.doMagic = function() {
        timeLeft += 20;
    };
    bonuses.push(timeAddition);
}

function checkBonusesCollion()
{
    for (var i =0; i < bonuses.length; i++)
    {
        var bonus = bonuses[i];
        if (bonus != null)
        {
            if (checkCollision(pacman, bonus))
            {
                bonus.doMagic();
                bonus = null;
                bonuses[i] = null;
            }
        }
    }
}

function setExtraLife(){
    extraLife = initBonusWithPlace(4, extraLife);
    extraLife.imagePath = "./images/game/1up2.png";
    extraLife.doMagic = function() {
        lives += 1;
        extraLife = null;
    }
    bonuses.push(extraLife);
}

function setOppositeCurse(){
    curse = initBonusWithPlace(4, curse);
    curse.imagePath = "opposite curse picture";
    curse.doMagic = function() {
        oppositeCurse += 150;
        curse = null;
    }
    bonuses.push(curse);
}

function setSpeedAddition()
{
    speedAddition = initBonusWithPlace(5);
    speedAddition.imagePath = "./images/game/fast.png"
    speedAddition.doMagic = function() {
        speedmode = true;
        pacman.speed = 10;
        startSpeedTime = timeLeft;
    }
    speedSecondsCounter = 0;
    bonuses.push(speedAddition);
}

function printBonuses(){
    for (var i = 0; i < bonuses.length; i++)
    {
        var bonus = bonuses[i];
        if (bonus != null && bonus.visible == true)
        {
            printPicture(bonus);
        }
    }
}

function setEatGhost()
{
    eatGhostBonus = initBonusWithPlace(6);
    eatGhostBonus.imagePath = "./images/game/superpower.jpg";
    eattingModeCounter = 0;
    eatGhostBonus.doMagic = function() {
        if (eattingGhostMode == false)
        {
            eattingGhostMode = true;
            startEatTime = timeLeft;
        }
    }
    bonuses.push(eatGhostBonus);
}

function maintainEattingGhost()
{
    if (eattingModeCounter * intervalSize < 6000)
    {
        eattingModeCounter++;
        for (var i = 0; i < ghosts.length; i++)
        {
            if (checkCollision(pacman, ghosts[i]) == true)
            {
                ghosts[i].isAlive = false;
            }
        }
    } else { // 6 seconds pass, delete the bonus
        eatGhostBonus = null;
        eattingGhostMode = false;
        createGhosts();
    }
}

function maintainSpeedAdd()
{
    if (speedSecondsCounter * intervalSize < 6000)
    {
        pacman.speed = 10;
        speedSecondsCounter++;
    } else { // 6 seconds pass, delete the bonus
        pacman.speed = 4;
        while (pacman.x % 20 != 10) { pacman.x -= 1;}
        while (pacman.y % 20 != 10) { pacman.y -= 1;}
        speedAddition = null;
        speedmode = false;
    }
}

// function get cost color and return coin
function createCoin(_cost, _color){
    var place = getRandomEmptyTile();
    board[place[1]][place[0]] = 2;
    var coin = {x : place[0]*20+10 , y : place[1]*20+10, radius : 6, color : _color, cost: _cost};
    return coin;
}

function printBoard() {
    for (var row = 0; row < board.length; row = row + 1)
    {
        for (var col=0; col < board[row].length; col = col + 1)
        {
            if(board[row][col]==1)
            {
                ctx.fillStyle="black";
                ctx.fillRect(col*20,row*20,20,20);
            } else {
                ctx.fillStyle="green";
                ctx.fillRect(col*20,row*20,20,20);
            }
        }
    }
}

function startPositionPacman()
{
    var place = getRandomEmptyTile();

    // we want to place pacman on the left top side of the screen
    // where there are no ghosts on start of the game
    while (place[0] > 12 || place[1] > 12)
    {
        place = getRandomEmptyTile();
    }
    pacman.x = place[0]*20 + pacman.radius;
    pacman.y = place[1]*20 + pacman.radius;
}

function doMovePacman()
{
    // if that checks if we need to change direction to the next direction that saved in memory for pacman
    if (checkPosibleStep(pacman.currentDirection, pacman) == false || checkPosibleStep(pacman.nextDirection, pacman))
    {
        if (pacman.currentDirection != 0) // we dont want to assign 0 to previousDirection
        {
            pacman.previousDirection = pacman.currentDirection;
        }
        pacman.currentDirection = pacman.nextDirection;
        pacman.nextDirection = 0;
    }

    if (checkPosibleStep(pacman.currentDirection, pacman))
    {
        moves[pacman.currentDirection](pacman);
    }
}

moves = {
    37 : function(figure) { figure.x -= figure.speed; }, //left
    38 : function(figure) { figure.y -= figure.speed; }, //up
    39 : function(figure) { figure.x += figure.speed; }, //right
    40 : function(figure) { figure.y += figure.speed; }  // down
}

// return true if it possible to make step to the given figure in the given direction
function checkPosibleStep(direction, figure)
{
    var fixX;
    var fixY;

    if (direction== 0)
    {
        return false;
    }

    if (direction == 39) // right
    {
        fixX =(figure.x+figure.radius) / 20;
        fixX = Math.floor(fixX);

        if (figure.x + figure.radius > canvas.width - 1) { // exit the board from the left
            figure.x = 10;
            return;
        }

        fixY = (figure.y - figure.radius) / 20;
        fixY = Math.floor(fixY);
        if (board[fixY][fixX] == 1)  return false;

        fixY = (figure.y - figure.radius) / 20;
        fixY = Math.ceil(fixY);
        if (board[fixY][fixX] == 1)  return false;
    }

    if (direction == 37) // left
    {
        fixX =(figure.x-figure.radius-figure.speed) / 20;
        fixX = Math.floor(fixX);

        if (figure.x - figure.radius < 1) { // exit the board from the left
            figure.x = canvas.width - 14;
            return;
        }

        fixY = (figure.y - figure.radius) / 20;
        fixY = Math.floor(fixY);
        if (board[fixY][fixX] == 1)  return false;

        fixY = (figure.y - figure.radius) / 20;
        fixY = Math.ceil(fixY);
        if (board[fixY][fixX] == 1)  return false;
    }

    if (direction == 38) //up
    {
        fixY =(figure.y - figure.radius - figure.speed) / 20;
        fixY = Math.floor(fixY);

        fixX = (figure.x - figure.radius) / 20;
        fixX = Math.floor(fixX);
        if (board[fixY][fixX] == 1)  return false;

        fixX = (figure.x - figure.radius) / 20;
        fixX = Math.ceil(fixX);
        if (board[fixY][fixX] == 1)  return false;
    }

    if (direction == 40) //down
    {
        fixY =(figure.y+figure.radius) / 20;
        fixY = Math.floor(fixY);

        fixX = (figure.x - figure.radius) / 20;
        fixX = Math.floor(fixX);
        if (board[fixY][fixX] == 1)  return false;

        fixX = (figure.x + figure.radius-1) / 20;
        fixX = Math.floor(fixX);
        if (board[fixY][fixX] == 1)  return false;
    }

    if (board[fixY][fixX] == 0 || board[fixY][fixX] > 1) // in case of free tile of bouns things - return true
    { return true; }
    else
    { return false; }
}

function printPacman(){ // need to change currenctDirection to pacman.currentDirection
    if (pacman.currentDirection == 39 || (pacman.currentDirection == 0 && pacman.previousDirection == 39))
    {
        printPacmanRightLeft("right");
        return;
    }

    if (pacman.currentDirection == 37 || (pacman.currentDirection == 0 && pacman.previousDirection == 37))
    {
        printPacmanRightLeft("left");
        return;
    }

    if (pacman.currentDirection == 38 || (pacman.currentDirection == 0 && pacman.previousDirection == 38))
    {
        printPacmanUpDown("up");
        return;
    }

    if (pacman.currentDirection == 40 || (pacman.currentDirection == 0 && pacman.previousDirection == 40))
    {
        printPacmanUpDown("down");
        return;
    }
}

function printPacmanRightLeft(leftRight)
{
    var notClockWise = leftRight == "left"; // if the direction is left we print in not clockwise
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, 0.25 * Math.PI, 1.25 * Math.PI, notClockWise);
    ctx.fillStyle = "rgb(255, 255, 0)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, 0.75 * Math.PI, 1.75 * Math.PI, notClockWise);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y-6, pacman.radius/5, 0, 2 * Math.PI, false);
    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fill();
}

function printPacmanUpDown(upDown)
{
    var notClockWise = upDown == "up"; // if the direction is up we print in not clockwise
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, 1.25 * Math.PI, 0.25 * Math.PI, notClockWise);
    ctx.fillStyle = "rgb(255, 255, 0)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.radius, 0.75 * Math.PI, 1.75 * Math.PI, notClockWise);
    ctx.fill();
    ctx.beginPath();
    if (upDown == "up") // draw the eye custom to up or down
    {
        ctx.arc(pacman.x-6, pacman.y-1, pacman.radius/5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgb(0, 0, 0)";
    } else {
        ctx.arc(pacman.x-6, pacman.y, pacman.radius/5, 0, 2 * Math.PI);
        ctx.fillStyle = "rgb(0, 0, 0)";
    }

    ctx.fill();
}

function printCoin(){
    for (var i= 0; i < coinsArray.length; i++)
    {
        var coinToPrint = coinsArray[i];
        ctx.beginPath();
        ctx.arc(coinToPrint.x, coinToPrint.y, coinToPrint.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = coinToPrint.color;
        ctx.fill();

        ctx.font = "8px Arial";
        ctx.fillStyle="black"
        if (coinToPrint.cost == 5){ // center the text according to the number of digits '5' or '15 '25
            ctx.fillText(coinToPrint.cost.toString() ,coinToPrint.x-coinToPrint.radius*0.4, coinToPrint.y+coinToPrint.radius*0.5);
        } else{
            ctx.fillText(coinToPrint.cost.toString() ,coinToPrint.x-coinToPrint.radius*0.75, coinToPrint.y+coinToPrint.radius*0.5);
        }
    }
}

function printGhosts(){
    for(var i = 0; i < numOfGhost; i++)
    {
        var ghost = ghosts[i];
        if (ghost.isAlive == true) // check if pacman is not eatten by pacman
        {
            if (eattingGhostMode == false ) { // regular mode, no eat ghost mode
                var imageObj = new Image();
                imageObj.width = "20px";
                imageObj.height = "20px";
                imageObj.src = ghost.imagePath;
                ctx.drawImage(imageObj, ghost.x - ghost.radius, ghost.y -ghost.radius , 20, 20);
            } else { // eat ghost mode is on, apply special picture for the ghost
                var imageObj = new Image();
                imageObj.width = "20px";
                imageObj.height = "20px";
                imageObj.src = "./images/game/eatGhost.png";
                ctx.drawImage(imageObj, ghost.x - ghost.radius, ghost.y -ghost.radius , 20, 20);
            }

        }
    }
}

function checkGhostsCollision()
{
    for (var i = 0; i < ghosts.length; i++)
    {
        var ghost = ghosts[i];
        if (ghost.isAlive == true) // check if the ghost is not eatten by pacman
        {
            if (checkCollision(pacman,ghost))
            {
                clearInterval(intervalId);
                lives--;
                isJustLostLife = true;
                ctx.font = "30px Arial";
                ctx.fillStyle="white"
                ctx.fillText("lost 1 live" ,100, 100);
                setTimeout(function() {
                    if (lives != 0)
                    {
                        startPlaying();
                    } else {
                        Game();
                    }
                }, 1500);
            }
        }
    }
}

function checkCollision(figureA, figureB)
{
    if ((figureA.x <= (figureB.x + figureB.radius)
        && figureB.x <= (figureA.x + figureA.radius)
        && figureA.y <= (figureB.y + figureB.radius)
        && figureB.y <= (figureA.y + figureA.radius)))
    {
        return true;
    } else {
        return false;
    }
}


function checkCoinsColision(){
    document.getElementById("points").innerHTML = gamePoints;
    if (coinsArray.length != 0)
    {
        for (var i=0; i < coinsArray.length; i++) // tun on all coins and check for collision
        {
            var coin = coinsArray[i];
            if (checkCollision(pacman, coin))
            {
                gamePoints += coin.cost;
                coinsArray.splice(i,1);
                numOfCoins--;
            }
        }
    }
}

function moveGhosts()
{
    for (var i = 0; i < ghosts.length; i++)
    {
        var ghost = ghosts[i];
        if (ghost.isAlive == true) // check if pacman didnt eat the ghost
        {
            var posibleMoves = getPosibleMoves(ghost).length;

            if (posibleMoves >= 3) // check if this is a greater than 3 roads crossroad
            {
                var ghostFixX = Math.floor(ghost.x / 20);
                var ghostFixY = Math.floor(ghost.y / 20);
                var pacmanFixX = Math.floor(pacman.x / 20);
                var pacmanFixY = Math.floor(pacman.y / 20);

                // delete the old start and goal
                if (ghost.oldStart.x != -1)
                {
                    ghost.grid[ghost.oldStart.y][ghost.oldStart.x] = 'Empty';
                    ghost.grid[ghost.oldGoal.y][ghost.oldGoal.x] = 'Empty';
                }

                ghost.oldStart.x = ghostFixX;
                ghost.oldStart.y = ghostFixY;
                ghost.oldGoal.x = pacmanFixX;
                ghost.oldGoal.y = pacmanFixY;

                ghost.grid[ghostFixY][ghostFixX] = "start";
                ghost.grid[pacmanFixY][pacmanFixX] = "Goal";

                var directions = findShortestPath([ghostFixY,ghostFixX],ghost.grid); // using A* algorithm for finding shortest path
                var directionForGhost = directions[0];
                console.log(directions);

                if (directionForGhost == 'East') // right
                {
                    ghost.direction = 39;
                }

                if (directionForGhost == 'West') // left
                {
                    ghost.direction = 37;
                }

                if (directionForGhost == 'North') // left
                {
                    ghost.direction = 38;
                }

                if (directionForGhost == 'South') // left
                {
                    ghost.direction = 40;
                }
            } else if (posibleMoves == 2) {
                ghost.direction = getNewDirection(ghost);
            }
            moves[ghost.direction](ghost);
        }
    } // if ghost.isAlive
}

/*
function moveAngel()
{
    if (angel.x < 0) { // exit the board from the left
        angel.x = canvas.width - 10;
        return;
    }

    if (angel.x > canvas.width - 1) { // exit the board from the left
        angel.x = 10;
        return;
    }

    if (checkPosibleStep(angel.direction, angel)) {
        moves[angel.direction](angel);
    }

    var posibleMoves = getPosibleMoves(angel);
    if (posibleMoves.length >= 3) {
        var randDirection = Math.floor((Math.random() * posibleMoves.length));
        angel.direction = posibleMoves[randDirection];
    } else if (posibleMoves.length == 2) {
        angel.direction = getNewDirection(angel);
    }
}

function printAngel()
{
    var imageObj = new Image();
    imageObj.width = "20px";
    imageObj.height = "20px";
    imageObj.src = angel.imagePath;
    ctx.drawImage(imageObj, angel.x - angel.radius, angel.y -angel.radius , 20, 20);
}*/

//return array with all the possible moves to the given figure. max = 4 directions
function getPosibleMoves(figure){
    var res = [];
    if (checkPosibleStep(37,figure)==true) { res.push(37); } // left

    if (checkPosibleStep(38,figure)==true) { res.push(38); } // up

    if (checkPosibleStep(39,figure)==true) { res.push(39); } // right

    if (checkPosibleStep(40,figure)==true) { res.push(40); } // down

    return res;
}

// in given ghost in 2 road crossroad, the function finds the new direction to move
function getNewDirection(ghostFigure)
{
    if (ghostFigure.direction == 37) //left
    {
        if (checkPosibleStep(38,ghostFigure) == true) return 38;
        if (checkPosibleStep(40,ghostFigure) == true) return 40;
        if (checkPosibleStep(37,ghostFigure) == true) return 37;
    }

    if (ghostFigure.direction == 38) //up
    {
        if (checkPosibleStep(37,ghostFigure) == true) return 37;
        if (checkPosibleStep(39,ghostFigure) == true) return 39;
        if (checkPosibleStep(38,ghostFigure) == true) return 38;
    }

    if (ghostFigure.direction == 40) // down
    {
        if (checkPosibleStep(37,ghostFigure) == true) return 37;
        if (checkPosibleStep(39,ghostFigure) == true) return 39;
        if (checkPosibleStep(40,ghostFigure) == true) return 40;
    }

    if (ghostFigure.direction == 39) // right
    {
        if (checkPosibleStep(38,ghostFigure) == true) return 38;
        if (checkPosibleStep(40,ghostFigure) == true) return 40;
        if (checkPosibleStep(39,ghostFigure) == true) return 39;
    }
}

function Game() // main game loop
{
    doMovePacman();
    checkCoinsColision();
    moveGhosts();
    draw();
    checkGameWin();
    if (angel != null)
    {
        moveAngel();
        checkAngelCollision();
    }
    if (lives == 0)
    {
        clearInterval(intervalId);
        endGame();
        return;
    }
    if (speedmode)
    {
        maintainSpeedAdd();
    }
    if (eattingGhostMode)
    {
        maintainEattingGhost();
    }
    checkBonusesCollion();
    checkGhostsCollision();
    handelTimer();
}

function drawLives()
{
    $("#lives").html("");
    for(var i = 0; i < lives; i++)
    {
        $("#lives").prepend('<img src="./images/game/heart.png" style="width:10px; height:10px; margin-left:2px;" />');
    }
}

function draw()
{
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
    printBoard(); // print the board
    printPacman(); // print the figure
    printCoin();
    printGhosts();
    if (angel != null)
    {
        printAngel();
    }
    printBonuses();
    drawLives();
}

function checkAngelCollision()
{
    if (checkCollision(pacman, angel))
    {
        gamePoints += angel.cost;
        angel = null;
    }
}

function checkGameWin(){
    if(numOfCoins == 0)
    {
        endGame();
    }
}

function handelTimer(){
    ++counterToOneSecond;
    if (intervalSize * counterToOneSecond > 1000)
    {
        timeLeft--;
        counterToOneSecond = 0;
    }
    document.getElementById("timer").innerHTML = "time left: " + timeLeft;
    if (timeLeft ==0)
    {
        endGame();
    }
}

function startPlaying()
{
    $("#div_endgame").hide(); // hide the end game div in case this is a "play again"
    $("#instructions").show();
    if (isGameStaring == true)
    {
        init();
        $("#btn_reset").css("z-index","-1");
    }
    if (isJustLostLife == true) // reset the locations of pacman and the ghosts
    {
        pacman.x = pacman.startingX;
        pacman.y = pacman.startingY;
        pacman.currentDirection = 37;
        for (var i = 0; i < ghosts.length; i++) // reset the ghosts to starting points
        {
            ghosts[i].x = ghosts[i].startingX;
            ghosts[i].y = ghosts[i].startingY;
            ghosts[i].direction = 37;
        }
        isJustLostLife = false;
        oppositeCurse = 0;
    }
    draw();
    ctx.font = "30px Arial";
    ctx.fillStyle="white"
    ctx.fillText("Get Ready" ,100, 100);
    setTimeout(function() {
        intervalId =setInterval(Game,intervalSize);
    }, 1500);
}

function endGame()
{
    clearInterval(intervalId);
    stopSound(gameMusic);
    updateTopScore();
    $("#div_endgame").show();
    $("#div_topScore span").text(topScore);
    $("#div_endGameScore span").text(gamePoints);
    if (gamePoints >= 150)
    {
        $("#p_endGameStatus").text("We Have a Winner!!!");
    } else {
        $("#p_endGameStatus").html("You Lost <br/><br/> You Can do better ;)");
    }
    $("#btn_reset").css("z-index","3");
    isGameStaring = true;
}

function updateTopScore()
{
    if (gamePoints > topScore) {
        topScore = gamePoints;
    }
}

function playAgain()
{
    $("#div_endgame").hide();
    $("#div_game").hide();
    $("#gameSettings").show();
    isGameStaring = true;
}

// function get figure and prints the picture of it
// stored in imagePath
function printPicture(figure)
{
    var imageObj = new Image();
    imageObj.width = "20px";
    imageObj.height = "20px";
    imageObj.src = figure.imagePath;
    ctx.drawImage(imageObj, figure.x, figure.y, 20, 20);
}

function playSound(path)
{
    gameMusic = new Audio(path); // buffers automatically when created
    gameMusic.play();
}

function stopSound(soundToStop)
{
    soundToStop.pause();
    soundToStop.currentTime = 0;
}

function copyArr(array) // helper method
{
    var copy = new Array(array.length);
    for (var i = 0; i < array.length; i++)
    {
        copy[i] = new Array(array[i].length);
    }

    for (var i = 0; i < array.length; i++)
    {
        for (var j = 0; j < array.length; j++)
        {
            copy[i][j] = array[i][j];
        }
    }
    return copy;
}