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
        if (event.target == modal_endGame) {
            modal_endGame.style.display = "none";
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

    var modal_endGame = document.getElementById('div_endgame');
    var spanEndGame = document.getElementById('closeEndGame');
    function endGameOpen(){
        modal_endGame.style.display = "block";
    }
    spanEndGame.onclick = function() {
        modal_endGame.style.display = "none";
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