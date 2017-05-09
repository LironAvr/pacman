$(document).ready(function() {
    showUserConect();
    //populate our years select box
    for (i = new Date().getFullYear(); i > 1897; i--){
        $('#years').append($('<option />').val(i).html(i));
    }
    //populate our months select box
    for (i = 1; i < 13; i++){
        $('#months').append($('<option />').val(i).html(i));
    }
    //populate our Days select box
    updateNumberOfDays(); 

    //"listen" for change events
    $('#years, #months').change(function(){
        updateNumberOfDays(); 
    });

    for (var i = 50; i < 91; i+=5) {
        $('#coinsNum').append($('<option />').val(i).html(i));
    };

    for (var i = 60; i < 301; i+=5) {
        $('#timeToPlay').append($('<option />').val(i).html(i));
    };

    for (var i = 1; i < 4; i++) {
        $('#ghostsNum').append($('<option />').val(i).html(i));
    };

    // Email must be an email
    $('#contact_email').on('input', function() {
    var input=$(this);
    var re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var is_email=re.test(input.val());
    if(is_email){input.removeClass("invalid").addClass("valid");}
    else{input.removeClass("valid").addClass("invalid");}    
    });

    <!--Name cant be blank-->
    $('#contact_name').on('input', function() {
        var input=$(this);
        var is_name=input.val() && !(input[0].value in users);
        if(is_name){input.removeClass("invalid").addClass("valid");}
        else{input.removeClass("valid").addClass("invalid");}
    });

    <!--first Name cant be blank-->
    $('#contact_firstName').on('input', function() {
        var input=$(this);
        var letters = /^[A-Za-z]+$/;
        var is_name=letters.test(input.val());
        if(is_name){input.removeClass("invalid").addClass("valid");}
        else{input.removeClass("valid").addClass("invalid");}
    });

    <!--last Name cant be blank-->
    $('#contact_lastName').on('input', function() {
        var input=$(this);
        var letters = /^[A-Za-z]+$/;
        var is_name=letters.test(input.val());
        if(is_name){input.removeClass("invalid").addClass("valid");}
        else{input.removeClass("valid").addClass("invalid");}
    });

    $('#contact_password').on('input', function() {
        var input=$(this);
        var re = /^(?=.*\d)(?=.*[a-zA-Z])[0-9a-zA-Z]{8,}$/;
        var is_password=re.test(input.val());
        if(is_password){input.removeClass("invalid").addClass("valid");}
        else{input.removeClass("valid").addClass("invalid");}
    });

    <!-- After Form Submitted Validation-->
            $("#contact_submit button").click(function(event){
                var form_data=$("#contact-R").serializeArray();
                var error_free=true;
                for (var input in form_data){
                    var element=$("#contact_"+form_data[input]['name']);
                    var valid=element.hasClass("valid");
                    var error_element=$("span", element.parent());
                    if (!valid){error_element.removeClass("error").addClass("error_show"); error_free=false;}
                    else{error_element.removeClass("error_show").addClass("error");}
                }
                if (!error_free){
                    event.preventDefault(); 
                }
                else{
                    var insert = addUser(form_data[0].value, form_data[1].value);
                    if(insert)
                        alert('No errors: Form will be submitted');
                    else
                        alert('error');
                }
            });

        $('#login_password').on('input', function() {
        var input=$(this);
        var is_name=input.val();
        if(is_name){input.removeClass("invalid").addClass("valid");}
        else{input.removeClass("valid").addClass("invalid");}
    });

        $('#login_name').on('input', function() {
        var input=$(this);
        var is_name=input.val() && (input[0].value in users);
        if(is_name){input.removeClass("invalid").addClass("valid");}
        else{input.removeClass("valid").addClass("invalid");}
        });

    <!-- After Form Submitted Validation-->
            $("#login_submit button").click(function(event){
                
                var error_free=true;
                var form_data=$("#contact-L").serializeArray();                
                    var element=$("#login_name");
                    var valid=element.hasClass("valid");
                    var error_element=$("span", element.parent());
                    if (!valid){error_element.removeClass("error").addClass("error_show"); error_free=false;}
                    else{error_element.removeClass("error_show").addClass("error");}
                var exists = userExists(form_data[0].value, form_data[1].value);
                    if(exists){
                        //user exists but the password incorrent
                        if(!rightPassword(form_data[0].value, form_data[1].value)){
                            var passelement = $("#login_password");
                            var error_password_element=$("span", passelement.parent());
                            error_password_element.removeClass("error").addClass("error_show");
                            error_free=false;
                        }
                    }
                    else{
                        error_free=false;
                    }
                if (!error_free){
                    event.preventDefault(); 
                }
                else{
                        alert('No errors: Form will be submitted');
                        userLogIn(form_data[0].value);                                           
                }
            });

});

function userLogIn(user){
    currentUser = user;
    document.getElementById('helloLable').innerHTML = 'Hello ' + currentUser;
    userIn = true;
    showUserConect();
    ShowSection('game');
    $("#setting").show();
    $("#div_game").hide(); 
}

//function to update the days based on the current values of month and year
function updateNumberOfDays(){
    $('#days').html('');
    month = $('#months').val();
    year = $('#years').val();
    days = daysInMonth(month, year);

    for(i=1; i < days+1 ; i++){
            $('#days').append($('<option />').val(i).html(i));
    }
}
    //helper function
function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}


