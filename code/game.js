/**
 * Created by lirona on 06/05/2017.
 */

var moves = {};
var sounds = {"gameSound" : "sounds/music.mp3"}
var gameMusic;

var ghosts = [];
var corners = [{x : 30, y : 30} , { x : 410, y : 30 }, { x : 410, y : 390 }, { x: 30 , y : 390}];
var ghostPicture = "images/ghost.png";
var poisonPicture = "images/poison.png";
var confusePicture = "images/directions.png";
var bonusPicture = "images/bonus.png";
var speedPicture = "images/speed.png";

var pacman;
var numOfGhost;
var creditBonus;
var coinsArray;
var intervalId;
var canvas;
var ctx;
var numOfCoins;
var curse;
var gamePoints;
var intervalSize = 45;
var counterToOneSecond;
var timeLeft;
var lives;
var isGameStaring = true;
var isJustLostLife = false;

var bonuses = [];
var oppositeCurse;
var poison;
var speedAddition;
var speedmode;
var speedSecondsCounter;
var topScore = 0;

function init(){ // initialization function
    $("#game").css("display" , "block");

    pacman = {x : 50, y : 30, radius : 10, speed : 4, currentDirection : 37, previousDirection : 37, nextDirection: 0, startingX : 50, startingY : 30};
    startPositionPacman();

    numOfGhost = $("#ghostsNum").val();
    createGhosts();

    creditBonus = {x : 390, y : 30, radius : 10 , imagePath: bonusPicture, direction: 39, speed: 4, cost : 50};
    numOfCoins = $("#coinsNum").val();
    timeLeft = $("#timeToPlay").val();
    gamePoints = 0;
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    window.addEventListener("keydown", function(){
        if (event.keyCode >= 37 & event.keyCode <= 40) // check if this only direction key
        {
            pacman.nextDirection = event.keyCode;
        }
    });
    setCoins();
    setSpeedAddition();
    setOppositeCurse();
    setPoison();
    counterToOneSecond = 0; // helper for game timer
    lives = 3;
    isGameStaring = false;
    speedmode = false;
    playSound(sounds["gameSound"]);
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

function createGhosts()
{
    for (var i = 0; i < numOfGhost; i++)
    {
        if (ghosts[i] == null) {
            var ghost = {
                x: corners[i + 1].x,
                y: corners[i + 1].y,
                radius: 10,
                color: 'white',
                direction: 37,
                speed: 4,
                startingX: corners[i + 1].x,
                startingY: corners[i + 1].y,
                imagePath: ghostPicture
            };
            ghost.oldStart = {x : -1, y : -1};
            ghost.oldGoal = {x : -1, y : -1};
            ghost.ghostsBoard = copyArr(ghostsBoard);
        }
            ghosts.push(ghost)
    }
    console.log(ghosts);
}

function getRandomEmptyTile()
{
    var row;
    var col;
    do {
        row = Math.floor((Math.random() * 22));
        col = Math.floor((Math.random() * 20));
        while (null == board[col]);
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
    var gold = Math.ceil( numOfCoins * 0.1 );
    var silver = Math.floor( numOfCoins * 0.3 );
    var bronze = numOfCoins - silver - gold;

    while (bronze > 0)
    {
        coinsArray.push(createCoin(5, "orange"));
        bronze -= 1;
    }
    while (silver > 0)
    {
        coinsArray.push(createCoin(15, "silver"));
        silver -= 1;
    }
    while (gold > 0)
    {
        coinsArray.push(createCoin(25, "yellow"));
        gold -= 1;
    }
}

function checkBonusesCollision()
{
    for (var i = 0; i < bonuses.length; i++)
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

function setPoison(){
    poison = initBonusWithPlace(4, poison);
    poison.imagePath = poisonPicture;
    poison.doMagic = function() { diePacmanDie(1); }
    bonuses.push(poison);
}

function setOppositeCurse(){
    curse = initBonusWithPlace(4, curse);
    curse.imagePath = confusePicture;
    curse.doMagic = function() {
        oppositeCurse = 200;
        curse = null;
    }
    bonuses.push(curse);
}

function setSpeedAddition()
{
    speedAddition = initBonusWithPlace(5);
    speedAddition.imagePath = speedPicture;
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

function createCoin(bonus, color){
    var place = getRandomEmptyTile();
    board[place[1]][place[0]] = 2;
    var coin = {x : place[0] * 20 + 10 , y : place[1] * 20 + 10, radius : 6, color : color, cost: bonus};
    return coin;
}

function printBoard() {
    for (var row = 0; row < board.length; row = row + 1)
    {
        for (var col=0; col < board[row].length; col = col + 1)
        {
            if(board[row][col]==1)
            {
                ctx.fillStyle="blue";
                ctx.fillRect(col * 20, row * 20, 20, 20);
            } else {
                ctx.fillStyle="black";
                ctx.fillRect(col * 20, row * 20, 20, 20);
            }
        }
    }
}

//Placing the Pacman in the Left Top area of the board - far away from all them ghosts
function startPositionPacman()
{
    var place = getRandomEmptyTile();
    while (place[0] > 12 || place[1] > 12)
    {
        place = getRandomEmptyTile();
    }
    pacman.x = place[0]*20 + pacman.radius;
    pacman.y = place[1]*20 + pacman.radius;
}

function doMovePacman()
{
    if (oppositeCurse > 0){
        oppositeCurse--;
        oppositeDirection();
    }
    // if that checks if we need to change direction to the next direction that saved in memory for pacman
    if (possibleStep(pacman.currentDirection, pacman) == false || possibleStep(pacman.nextDirection, pacman))
    {
        if (pacman.currentDirection != 0)
        {
            pacman.previousDirection = pacman.currentDirection;
        }
        pacman.currentDirection = pacman.nextDirection;
        pacman.nextDirection = 0;
    }

    if (possibleStep(pacman.currentDirection, pacman))
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

function oppositeDirection(){
    if      (37 == pacman.nextDirection) {
        if (possibleStep(39, pacman)) pacman.nextDirection = 39;
        else pacman.nextDirection = getNewDirection(39);
    }
    else if (38 == pacman.nextDirection) {
        if (possibleStep(40, pacman)) pacman.nextDirection = 40;
        else pacman.nextDirection = getNewDirection(40);
    }
    else if (39 == pacman.nextDirection) {
        if (possibleStep(37, pacman)) pacman.nextDirection = 37;
        else pacman.nextDirection = getNewDirection(37);
    }
    else if (40 == pacman.nextDirection) {
        if (possibleStep(38, pacman)) pacman.nextDirection = 38;
        else pacman.nextDirection = getNewDirection(38);
    }
}

// return true if it possible to make step to the given figure in the given direction
function possibleStep(direction, figure)
{
    var fixX;
    var fixY;

    if (direction == 0)
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
        fixX =(figure.x - figure.radius - figure.speed) / 20;
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
        var imageObj = new Image();
        imageObj.width = "20px";
        imageObj.height = "20px";
        imageObj.src = ghost.imagePath;
        ctx.drawImage(imageObj, ghost.x - ghost.radius, ghost.y - ghost.radius , 20, 20);
    }
}

function checkGhostsCollision()
{
    for (var i = 0; i < ghosts.length; i++)
    {
        if (checkCollision(pacman,ghosts[i]))
        {
            diePacmanDie(2);
        }
    }
}

function diePacmanDie(type){
    clearInterval(intervalId);
    lives--;
    var msg = "Run Pacman, Run!";
    isJustLostLife = true;
    ctx.font = "30px Arial";
    ctx.fillStyle="white"
    if (1 == type) msg = "Wrong thing to eat!";
    ctx.fillText(msg ,100, 100);
    setTimeout(function() {
        if (lives != 0)
        {
            startPlaying();
        } else {
            Game();
        }
    }, 1500);
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


function checkCoinsCollision(){
    document.getElementById("userPoints").innerHTML = "Points : " + gamePoints;
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
        //var possibleMoves = getPossibleMoves(ghost).length;

        /*if (possibleMoves >= 3) // check if this is a greater than 3 roads crossroad
        {*/
            var ghostFixX = Math.floor(ghost.x / 20);
            var ghostFixY = Math.floor(ghost.y / 20);
            var pacmanFixX = Math.floor(pacman.x / 20);
            var pacmanFixY = Math.floor(pacman.y / 20);
            //remove ghost from previous location
            if (ghost.oldStart.x != -1)
            {
                ghost.ghostsBoard[ghost.oldStart.y][ghost.oldStart.x] = 0;
                ghost.ghostsBoard[ghost.oldGoal.y][ghost.oldGoal.x] = 0;
            }
            ghost.oldStart.x = ghostFixX;
            ghost.oldStart.y = ghostFixY;
            ghost.oldGoal.x = pacmanFixX;
            ghost.oldGoal.y = pacmanFixY;

            //ghost.ghostsBoard[ghostFixY][ghostFixX] = 8;   //Start
            //ghost.ghostsBoard[pacmanFixY][pacmanFixX] = 9; //Destination

            //find the new location for the ghost
            ghost.direction = getBestMoveForGhost(ghost);
            //var directionForGhost = nextDirection;
            //console.log(nextDirection);
            moves[ghost.direction](ghost);
    }
}

    function moveCreditBonus() {
        if (creditBonus.x < 0) { // exit the board from the left
            creditBonus.x = canvas.width - 10;
            return;
        }

        if (creditBonus.x > canvas.width - 1) { // exit the board from the left
            creditBonus.x = 10;
            return;
        }

        if (possibleStep(creditBonus.direction, creditBonus)) {
            moves[creditBonus.direction](creditBonus);
        }

        var possibleMoves = getPossibleMoves(creditBonus);
        if (possibleMoves.length >= 3) {
            var randDirection = Math.floor((Math.random() * possibleMoves.length));
            creditBonus.direction = possibleMoves[randDirection];
        } else if (possibleMoves.length == 2) {
            creditBonus.direction = getNewDirection(creditBonus);
        }
    }

    function printCreditBonus() {
        var imageObj = new Image();
        imageObj.width = "20px";
        imageObj.height = "20px";
        imageObj.src = creditBonus.imagePath;
        ctx.drawImage(imageObj, creditBonus.x - creditBonus.radius, creditBonus.y - creditBonus.radius, 20, 20);
    }

//return array with all the possible moves to the given figure. max = 4 directions
    function getPossibleMoves(figure) {
        var res = [];
        if (possibleStep(37, figure) == true) {
            res.push(37);
        } // left

        if (possibleStep(38, figure) == true) {
            res.push(38);
        } // up

        if (possibleStep(39, figure) == true) {
            res.push(39);
        } // right

        if (possibleStep(40, figure) == true) {
            res.push(40);
        } // down

        return res;
    }

// in given ghost in 2 road crossroad, the function finds the new direction to move
    function getNewDirection(ghostFigure) {
        if (ghostFigure.direction == 37) //left
        {
            if (possibleStep(38, ghostFigure) == true) return 38;
            if (possibleStep(40, ghostFigure) == true) return 40;
            if (possibleStep(37, ghostFigure) == true) return 37;
        }

        if (ghostFigure.direction == 38) //up
        {
            if (possibleStep(37, ghostFigure) == true) return 37;
            if (possibleStep(39, ghostFigure) == true) return 39;
            if (possibleStep(38, ghostFigure) == true) return 38;
        }

        if (ghostFigure.direction == 40) // down
        {
            if (possibleStep(37, ghostFigure) == true) return 37;
            if (possibleStep(39, ghostFigure) == true) return 39;
            if (possibleStep(40, ghostFigure) == true) return 40;
        }

        if (ghostFigure.direction == 39) // right
        {
            if (possibleStep(38, ghostFigure) == true) return 38;
            if (possibleStep(40, ghostFigure) == true) return 40;
            if (possibleStep(39, ghostFigure) == true) return 39;
        }
    }

    function Game() // main game loop
    {
        doMovePacman();
        checkCoinsCollision();
        moveGhosts();
        draw();
        checkGameWin();
        if (creditBonus != null) {
            moveCreditBonus();
            checkCreditBonusCollision();
        }
        if (lives == 0) {
            clearInterval(intervalId);
            endGame();
            return;
        }
        if (speedmode) {
            maintainSpeedAdd();
        }

        checkBonusesCollision();
        checkGhostsCollision();
        handelTimer();
    }

    function drawLives() {
        $("#lives").html("");
        for (var i = 0; i < lives; i++) {
            $("#lives").prepend('<img src="./images/heart.png" style="width:10px; height:10px; margin-left:2px;" />');
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas
        printBoard(); // print the board
        printPacman(); // print the figure
        printCoin();
        printGhosts();
        if (creditBonus != null) {
            printCreditBonus();
        }
        printBonuses();
        drawLives();
    }

    function checkCreditBonusCollision() {
        if (checkCollision(pacman, creditBonus)) {
            gamePoints += creditBonus.cost;
            creditBonus = null;
        }
    }

    function checkGameWin() {
        if (numOfCoins == 0) {
            endGame();
        }
    }

    function handelTimer() {
        ++counterToOneSecond;
        if (intervalSize * counterToOneSecond > 1000) {
            timeLeft--;
            counterToOneSecond = 0;
        }
        document.getElementById("timeLeft").innerHTML = "Time left: " + timeLeft;
        if (timeLeft == 0) {
            endGame();
        }
    }

    function startPlaying() {
        $("#div_endgame").hide(); // hide the end game div in case this is a "play again"
        //$("#instructions").show();
        if (isGameStaring == true) {
            init();
            $("#btn_reset").css("z-index", "-1");
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
        ctx.fillStyle = "white"
        ctx.fillText("Get Ready", 100, 100);
        setTimeout(function () {
            intervalId = setInterval(Game, intervalSize);
        }, 1500);
    }

    function endGame() {
        clearInterval(intervalId);
        stopSound(gameMusic);
        updateTopScore();
        endGameOpen();
        $("#div_topScore span").text(topScore);
        $("#div_endGameScore span").text(gamePoints);

        if (0 === lives)        $("#p_endGameStatus").text("You Lost!");
        if (gamePoints >= 150)  $("#p_endGameStatus").text("We Have a Winner!!!");
        else                    $("#p_endGameStatus").text("You Can do better");

        $("#btn_reset").css("z-index", "3");
        isGameStaring = true;
    }

    function updateTopScore() {
        if (gamePoints > topScore) {
            topScore = gamePoints;
        }
    }

    function playAgain() {
        $("#div_endgame").hide();
        $("#div_game").hide();
        $("#gameSettings").show();
        isGameStaring = true;
    }

// function get figure and prints the picture of it
// stored in imagePath
function printPicture(figure) {
    var imageObj = new Image();
    imageObj.width = "20px";
    imageObj.height = "20px";
    imageObj.src = figure.imagePath;
    ctx.drawImage(imageObj, figure.x, figure.y, 20, 20);
}

function playSound(path) {
    gameMusic = new Audio(path);
    gameMusic.play().loop;
}

function stopSound(soundToStop) {
    soundToStop.pause();
    soundToStop.currentTime = 0;
}

function getBestMoveForGhost(ghost) {
    var locations = getPossibleMoves(ghost);
    var lastMax = board.length * board[0].length;
    var result;
    if (locations.length == 1) return locations[0];
    for (var i = 0; i < locations.length; i++) {
        if (locations[i] != null) {

            var location;
            switch (locations[i]){
                case 37:{ //left
                    location = {x: ghost.x - 1, y: ghost.y};
                    break;
                }
                case 38:{ //up
                    location = {x: ghost.x, y: ghost.y - 1};
                    break;
                }
                case 39:{ //right
                    location = {x: ghost.x + 1, y: ghost.y};
                    break;
                }
                case 40:{ //down
                    location = {x: ghost.x, y: ghost.y + 1};
                    break;
                }
            }
            var manhattan = Math.sqrt(Math.pow(location.x - pacman.x, 2) + Math.pow(location.y - pacman.y, 2));
            if (manhattan < lastMax) {
                lastMax = manhattan;
                result = locations[i];
            }
            else if (manhattan === lastMax) return getNewDirection(ghost);
        }
    }
    return result;
}