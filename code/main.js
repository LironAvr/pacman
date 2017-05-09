var users = {};
addUser('a','a');
addUser('test2017', 'test2017');
var currentUser;
var userIn = false;


function addUser(userName, password){
	if(userName in users)
		return false;
	else{
		users[userName] = password;
		return true;
	}
}

function userExists(userName, password){
	if(userName in users)
		return true;
	else
		return false;
}

function rightPassword(userName, password){
	if(users[userName] == password)
		return true;
	else
		return false;
}

function letsPlay(){
	$("#setting").hide();
	$("#div_game").show();
	$("#myCanvas").focus();
	startPlaying();
}