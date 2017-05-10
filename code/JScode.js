  /*  var context = myCanvas.getContext("2d");
    var shape=new Object();
    var board;
    var score;
    var pac_color;
    var start_time;
    var time_elapsed;    
    var interval;
    
    Start();

function Start() {
    board = new Array();
    score = 0;
    pac_color="yellow";
    var cnt = 100;
    var food_remain = 50;
    var pacman_remain = 1;
    start_time= new Date();
    for (var i = 0; i < 10; i++) {
        board[i] = new Array();
        //put obstacles in (i=3,j=3) and (i=3,j=4) and (i=3,j=5), (i=6,j=1) and (i=6,j=2)
        for (var j = 0; j < 10; j++) {
         if((i==3 && j==3)||(i==3 && j==4)||(i==3 && j==5)||(i==6 && j==1)||(i==6 && j==2))
         {
          board[i][j] = 4;
      }
      else{
       var randomNum = Math.random();
       if (randomNum <= 1.0 * food_remain / cnt) {
        food_remain--;
        board[i][j] = 1;
    } else if (randomNum < 1.0 * (pacman_remain + food_remain) / cnt) {
     shape.i=i;
     shape.j=j;
     pacman_remain--;
     board[i][j] = 2;
 } else {
    board[i][j] = 0;
}
cnt--;
}
}
}
while(food_remain>0){
   var emptyCell = findRandomEmptyCell(board);
   board[emptyCell[0]][emptyCell[1]] = 1;
   food_remain--;
}/*
keysDown = {};
addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);
addEventListener("keyup", function (e) {
    keysDown[e.keyCode] = false;
}, false);
interval=setInterval(UpdatePosition, 250);
}


function findRandomEmptyCell(board){
  var i = Math.floor((Math.random() * 9) + 1);
  var j = Math.floor((Math.random() * 9) + 1);
  while(board[i][j]!=0){
     i = Math.floor((Math.random() * 9) + 1);
     j = Math.floor((Math.random() * 9) + 1);
 }
 return [i,j];             
}

function GetKeyPressed() {
    if (keysDown[38]) {
        return 1;
    }
    if (keysDown[40]) { 
        return 2;
    }
    if (keysDown[37]) { 
        return 3;
    }
    if (keysDown[39]) { 
        return 4;
    }
}

function Draw() {
    canvas.width=canvas.width; //clean board
    lblScore.value = score;
    lblTime.value = time_elapsed;
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var center = new Object();
            center.x = i * 60 + 30;
            center.y = j * 60 + 30;
            if (board[i][j] == 2) {
                context.beginPath();
                context.arc(center.x, center.y, 30, 0.15 * Math.PI, 1.85 * Math.PI); // half circle
                context.lineTo(center.x, center.y);
                context.fillStyle = pac_color; //color 
                context.fill();
                context.beginPath();
                context.arc(center.x + 5, center.y - 15, 5, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color 
                context.fill();
            } else if (board[i][j] == 1) {
                context.beginPath();
                context.arc(center.x, center.y, 15, 0, 2 * Math.PI); // circle
                context.fillStyle = "black"; //color 
                context.fill();
            }
            else if (board[i][j] == 4) {
                context.beginPath();
                context.rect(center.x-30, center.y-30, 60, 60);
                context.fillStyle = "grey"; //color 
                context.fill();
            }
        }
    }
}

function UpdatePosition() {
   board[shape.i][shape.j]=0;
   var x = GetKeyPressed()
   if(x==1)
   {
       if(shape.j>0 && board[shape.i][shape.j-1]!=4)
       {
          shape.j--;
      }
  }
  if(x==2)
  {
   if(shape.j<9 && board[shape.i][shape.j+1]!=4)
     {
          shape.j++;
     }
    }
    if(x==3)
    {
        if(shape.i>0 && board[shape.i-1][shape.j]!=4)
        {
          shape.i--;
          }
    }
if(x==4)
{
   if(shape.i<9 && board[shape.i+1][shape.j]!=4)
   {
      shape.i++;
  }
}
if(board[shape.i][shape.j]==1)
{
   score++;
}
board[shape.i][shape.j]=2;
var currentTime=new Date();
time_elapsed=(currentTime-start_time)/1000;
    if(score>=20&&time_elapsed<=10)
    {
    pac_color="green";
    }
    if(score==50)
    {
    window.clearInterval(interval);
    window.alert("Game completed");
    }
    else
    {
        Draw();
    }
}*/

function PageLoaded()
{
    ShowSection('welcome');
}
function ShowSection(id)
{
        $("#register").hide();
        $("#login").hide();
        $("#game").hide();
        $("#welcome").hide();
        $("#about").hide();
        
        //show only one section
       var selected = document.getElementById(id);
       $(selected).show();       
}

/* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "160px";
    document.getElementById("main").style.marginLeft = "160px";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
}
    // Get the modal
    var modal = document.getElementById('myModal');

    // Get the button that opens the modal
    //var btn = document.getElementById("myBtn");

    // Get the <span> element that closes the modal
    var span = document.getElementById('closeAbout');

    // When the user clicks the button, open the modal
    function aboutOpen() {
        //ShowSection('about');
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
        if (event.target == instruct) {
            instruct.style.display = "none";
        }
    }

    var instruct = document.getElementById('instructions');
    var spanIns = document.getElementById('closeInstruct');
    function instrucOpen(){
        instruct.style.display = "block";
    }
    spanIns.onclick = function() {
        instruct.style.display = "none";
    }



function showUserConect(){  
  if(userIn){
    document.getElementById('helloLable').style.visibility = 'visible';
    document.getElementById('logoutButton').style.visibility = 'visible';
  }
  else{
    document.getElementById('helloLable').style.visibility = 'hidden';
    document.getElementById('logoutButton').style.visibility = 'hidden';
  }
}

function logOut(){
  userIn = false;
  showUserConect();
  ShowSection('welcome');
}