var socket = io.connect('http://localhost:8080');
var color_radio = "";
var randomID = Math.floor((Math.random() * 1) + 1);
var modal = document.getElementById('myModal');
/**
 * CHAT FUNCTIONS
 * Lorsqu'on envoie le formulaire, on transmet le message
 * et on l'affiche sur la page
 */
// On demande le pseudo, on l'envoie au serveur
socket.on('connect', function () {
    socket.emit('s_nouveau_client', prompt('Quel est votre pseudo ?'), randomID);
});

// Quand un nouveau client se connecte au serveur
socket.on('nouveau_client', function(pseudo, tabj, king) {
    $('#messages').append('<li><em> Bienvenue ' + pseudo + ' !</em></li>');//bienvenue nouveau dans le chat
    scrollToBottom();
    $.each(tabj, function (key) {
        if(king != tabj[key].pseudo) {
            $('.tp').append($('<tr class="'+tabj[key].pseudo+'">').html('<td><i class="name_'+tabj[key].pseudo+' fa fa-caret-right" aria-hidden="true"></i></td><td><i style="color:'+tabj[key].color+'" class="fa fa-user" aria-hidden="true"></i></td><td class="f-weight">'+tabj[key].pseudo+'</td><td> : </td><td><span id="'+tabj[key].sid+'_file">Pas prêt</span></td></tr>'));
        }else{
            $('.tp').append($('<tr class="'+tabj[key].pseudo+'">').html('<td><i class="name_'+tabj[key].pseudo+' fa fa-caret-right" aria-hidden="true"></i></td><td><i style="color:'+tabj[key].color+'" class="fa fa-user" aria-hidden="true"></i></td><td class="f-weight">'+tabj[key].pseudo+'</td><td> : </td><td><span id="'+tabj[key].sid+'_file">Hôte</span></td></tr>'));
        }
    });//<input type="radio" id="'+tabj[key]+'" name="plus"/><label for="plus01"><span><i class="fa fa-plus" aria-hidden="true"></i></span>
});
//Quand il y a un nouveau joueur, le client reçoit le message dans le chat et l'ajoute dans la liste de tout les autres clients
socket.on('autre_connexion', function(pseudo, tabj){
    // $('.pseu').remove();
    console.log(tabj);
    $.each(tabj, function (key) {
        if(tabj[key].pseudo == pseudo) {
            $('.tp').append($('<tr class="pseu">').html('<td><i class="name_'+tabj[key].pseudo+' fa fa-caret-right" aria-hidden="true"></i></td><td><i style="color:'+tabj[key].color+'" class="fa fa-user" aria-hidden="true"></i></td><td class="f-weight">'+tabj[key].pseudo+'</td><td> : </td><td><span id="'+tabj[key].sid+'_file">Pas prêt</span></td></tr>'));
        // }else{
        //     $('.tp').append($('<tr class="pseu">').html('<td><span class="name_' + tabj[key] + '">' + tabj[key] + '<td><input disabled class="tgl tgl-flip" id="' + tabj[key] + 'rdy" type="checkbox"><label class="tgl-btn" data-tg-off="Attente" data-tg-on="Prêt!" for="' + tabj[key] + 'rdy"></label></td>'));
        }
    });
    $('#messages').append('<li><em>' + pseudo + ' à rejoint la partie !</em></li>');
    scrollToBottom();
});
//recupere le message du chat ecrit pour l'envoyer vers le serveur(ajouter au chat et vide au passage le chat apres envoie)
$('#form_chat').submit(function(e) {
    e.preventDefault();
    var message = $('#m').val();
    $('#m').val('').focus(); // Vide la zone de Chat et remet le focus dessus
    if (message.trim().length !== 0) { // Gestion message vide
        socket.emit('message', message);
    }
    $('#chat').find('input').focus(); // Focus sur le champ du message
});

//Reception message
socket.on('message', function (sendMess, color, pseudo) {
    $('#messages').append($('<li>').html('<span style="background:'+color+'" class="username">'+pseudo+'</span> ' + sendMess));
    scrollToBottom();
});

//Après une connexion, reçoit les anciens message(20max)
socket.on('recupereMessage', function(tabMess) {
    if(tabMess.length > 21) {
        for (var i = 0; i < 20; i++) {
            $('#messages').append($('<li>').html('<span style="background: '+tabMess[i].color+'" class="recup_username">' + tabMess[i].pseudo + '</span> ' + tabMess[i].mess));
            scrollToBottom();
        }
    }else{
        for (var i = 0; i < tabMess.length; i++) {
            $('#messages').append($('<li>').html('<span style="background: '+tabMess[i].color+'" class="recup_username">' + tabMess[i].pseudo + '</span> ' + tabMess[i].mess));
            scrollToBottom();
        }
    }
});
//function pour le scroll auto vers le bas quand il y a une nouvelle entrée dans le chat.
function scrollToBottom() {
    $('#messages').stop().animate({scrollTop: $('#messages')[0].scrollHeight}, 1000);
}
/**
 * END CHAT FUNCTIONS
 */
$('#delete-all').click(function(){
   socket.emit('removeAll');
});

$('#delete-yellow').click(function(){
    socket.emit('removeAllColor',"yellow");
});

$('#delete-blue').click(function(){
    socket.emit('removeAllColor',"blue");
});

$('#delete-green').click(function(){
    socket.emit('removeAllColor',"green");
});

$('#delete-red').click(function(){
    socket.emit('removeAllColor',"red");
});

//prêt
// $('#rdy').click(function () {
//    socket.emit('rdy');
// });

//fonction envoie div
$(".radio_color").click(function () {
    color_radio = $(this).val();
});
$(".radio_color").each(function () {
    if($(this).prop("checked")){
        color_radio = $(this).val();
    }
});
//ajouter concept/label(jeton)
$("div.group-icon div").click(function() {
    socket.emit('div', this.getAttribute('id'), color_radio);
});
//retirer le concept
$("div.group-icon div/*.group-icon div > div*/").contextmenu(function(e){
    e.preventDefault();
    socket.emit('removeColor', this.getAttribute('id')/*$(this).attr('class')*/, color_radio/*,parseInt($(this).text()), $(this).parent().attr('id')*/);
});
//Eviter le drag sur tout le boardgame//
$("div.container-boardgame").on("mousedown", function(){
    return false;
});
socket.on('allready', function () {
    // alert("GO !");
    // modal.style.display = "block";//modal.style.display = "none";
    // $('#messageModal').html(countStart);
    // var counter = setInterval(function() {
    //     countStart -= 1;
    //     console.log(countStart);
    //     // Supposons que tu as fait tous les import necessaire, et que tu as une socket stocké dans la variable `socket`
    //     $('#messageModal').html(countStart);
    //
    //     if (countStart = 0) {
    //         clearInterval(countStart);
    //         // socket.emit('endCounter');
    //         modal.style.display = "none";
    //     }
    // }, 1000);
    socket.emit('beginParty');

    // $('#rdy').css("display", "none");
    // $('#pass').css("display", "block");
    // $('#word').css("display", "block");
});

socket.on('popupLaunch', function(message, b){
    console.log(message);
    modal.style.display = "none";
    $('#messageModal').empty();
    if(b){
        modal.style.display = "block";
        $('#messageModal').append(message);
    }else{
        modal.style.display = "block";
        $('#messageModal').append(message);
        var pop = setTimeout(function(){
            modal.style.display = "none";
            $('#messageModal').empty();
        },1500);
    }
});

socket.on('displayWordPass', function(a, b, c, d) {
    if(d){
        $('#word').css(a, b);
        $('#pass').css(a, b);
        $('#rdy').css(a, c);
    }else{
        $('#word').css(a, c);
        $('#pass').css(a, c);
        $('#rdy').css(a, b);
    }
});

socket.on('rdyPlayer', function(message, color){
    console.log(color);
    $('#rdy').text(message);
    $('#rdy').css('background-color', color);
});

socket.on('sayRdy', function(message, color, id){
    $("#"+id+"_file").text(message);
    $("#"+id+"_file").css("color", color);
});

socket.on('disableRdyButton', function (color, b) {
    if(b){
        $('#rdy').attr("disabled", true);
        $('#rdy').css("background-color", color);
    }else{
        $('#rdy').attr("disabled", false);
        $('#rdy').css("background-color", color);
    }
});

socket.on('buttonLaunch', function(cmd, message, color){
    console.log(color);
    $('#rdy').attr("onclick", cmd);
    $('#rdy').text(message);
    $('#rdy').css("background-color", color);
});

// socket.on('buttonLaunchOff', function(cmd, message){
//     $('#rdy').attr("onclick", cmd);
//     $('#rdy').text(message);
//     $('#rdy').attr("id", "rdy");
// });

socket.on('counter', function(pseudoMessage, count){
    $('#turnMessage').html(pseudoMessage+count);
});

//supprimer label(jeton)
socket.on('dispelJeton', function (div, c, nbrd, nbj, b) {
   removeColor(div, c, nbrd, nbj, b);
});

socket.on('getCrown', function(){

});

//recois div
socket.on('div', function (div, color, npick, nimg, concept) {
    var a = "#"+div;
    var colorPick = "."+color+"-color-pick";
    var img = "#"+div+" img";
    if (concept) {
        switch(color){
            case "green":
                $(a).css('border', "solid 5px #00A657");
                break;
            case "red":
                $(a).css('border', "solid 5px #EF4956");
                break;
            case "blue":
                $(a).css('border', "solid 5px #46A1EF");
                break;
            case "yellow":
                $(a).css('border', "solid 5px #FCD54E");
                break;
        }
        $(a).css('padding', "0px");
        $(colorPick).find('.concept').text('');
        console.log("yolo");
        $(img).css("opacity", 1);
    }else{
        var b = a+" ."+color;
        $(b).text(nimg);
        $(colorPick).find('.number').html(npick);
        $(b).css('display', "initial");
        $(img).css("opacity", 1);
    }
});
socket.on('alertColor', function (str) {
    alert(str);
});
socket.on('dispelConcept', function(div, c, b) {
   removeConcept(div,c,b);
});
socket.on('dispelAll', function (t) {
    for(var k in t) {
        if(Object.keys(t[k]).length != 0){
            $.each(t[k],function (key) {
                if(key.length == 3){
                    removeConcept(key.substr(0, 2),k,true);
                }else{
                    removeColor(key,k,9,0,true);
                }
            });
        }
    }
});
socket.on('dispellAllColor', function (t, c) {
    for(var k in t) {
        if(Object.keys(t[k]).length != 0) {
            if (k == c) {
                $.each(t[k],function (key) {
                    if(key.length == 3){
                        removeConcept(key.substr(0, 2),k,true);
                    }else{
                        removeColor(key,k,9,0,true);
                    }
                });
            }
        }
    }
});
function removeColor(div, c, nbrd, nbj, b){
    var img = "#"+div+" ."+c;
    var group = "."+c+"-color-pick";
    var d = "#"+div+" img";
    if(nbj != 0){
        $(img).text(nbj);
        $(group).find('.number').html(nbrd);
    }else{
        if(b) {
            $(img).text(nbj);
            $(group).find('.number').html(nbrd);
            $(img).removeAttr('style');
            $(d).css("opacity", 0.6);
        }else{
            $(img).text(nbj);
            $(group).find('.number').html(nbrd);
            $(img).removeAttr('style');
        }
    }
}
function removeConcept(div, c, b) {
    var a = "#"+div;
    var img = "#"+div+" img";
    var colorPick = "."+c+"-color-pick .concept";
    $(a).removeAttr('border');
    $(a).removeAttr('style');
    switch(c){
        case "green":
            if(b){
                $(colorPick).text('?');
                $(img).css("opacity", 0.6);
                break;
            }else{
                $(colorPick).text('?');
                break;
            }
        case "yellow":
        case "red":
        case "blue":
            if(b){
                $(colorPick).text('!');
                $(img).css("opacity", 0.6);
                break;
            }else{
                $(colorPick).text('!');
                break;
            }
    }
}