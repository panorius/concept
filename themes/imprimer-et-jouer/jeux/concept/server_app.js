var express = require('express'),
    http = require('http'),
    fs = require('fs'),
    ent = require('ent'),
    bodyParser = require("body-parser"),
    path = require('path'),
    randomColor = require('randomcolor'),
    $ = require('jQuery');

/** TODO: Create a new Express application */
var app = express();

var cpt = require('./game');
var chat = require('./chat');
//var selection = require('./selection');

var tabjoueur = [];
var tabMess = [];
var tabReady = {};
var counter = null;
// var colorPanel = ["#00a657","#ef4956","#46a1ef","#fcd54e"];

/** TODO: Create a simple Express application */
// Turn down the logging activity
// app.use(express.logger('dev'));

// Serve static html, js, css, and image files from the 'public' directory
//app.use('/',php.cgi(path.join(__dirname, '/public')));
app.use('/',express.static(path.join(__dirname, '/public')));

// app.use(bodyParser.urlencoded({ extended: true }));
//
// app.post('/post.html', function(request, response) {
//     var p1 = request.body.p1;
//     console.log("p1=" + p1);
// });

/** TODO: Create an http server with Node's HTTP module. Pass it the Express application, and listen on port 8080. */
var server = http.createServer(app).listen(process.env.PORT || 8080);

/** TODO: Instantiate Socket.IO hand have it listen on the Express/HTTP server */
var io = require('socket.io').listen(server);

/** TODO: Listen for Socket.IO Connections. Once connected, start the game logic. */
io.sockets.on('connection', function (socket) {
    console.log('client connected');
    socket.on('disconnect', function(){
        console.log('client disconnected');
    });

    cpt.initGame(io, socket);
    chat.initChat(io, socket);

    // Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
    socket.on('s_nouveau_client', function(pseudo, id) {
        // socket.color = colorPanel[Math.floor(Math.random()*4)];
        socket.color = randomColor();
        tabjoueur.push({'id':id, 'pseudo': pseudo, 'ready':false, 'color':socket.color, "sid": socket.id});
        if(!(id in tabReady)){
            io.to(socket.id).emit('buttonLaunch', "", "tous pas pret", "#e67e22", false);
            socket.king = {'id': socket.id};
            tabReady[id]={'nbj': {}, 'tabJrRound': [], 'nbjrdy': 0, 'pseudo': {}, 'varCounter': null, 'varCounter2': null, 'goChrono': 30,
                'beginChrono': 10, 'countEntract': 5, 'kingID': socket.id, 'timerForBegin': false, 'gameLaunched': false, 'isRunning': false,
                'turnOf': null, "whoNb": 0, "nbTurn": 1};
            tabReady[id]['nbj'][socket.id] = false;
            tabReady[id]['tabJrRound'].push(socket.id);
            console.log(tabReady[id]['tabJrRound']);
            tabReady[id]['pseudo'][socket.id] = pseudo;
            // socket.emit('getCrown');
        }else{
            // tabReady[id]['nbj'] = tabReady[id]['nbj'] +1;
            tabReady[id]['nbj'][socket.id] = false;
            tabReady[id]['tabJrRound'].push(socket.id);
            console.log(tabReady[id]['tabJrRound']);
            tabReady[id]['pseudo'][socket.id] = pseudo;
            // tabReady[id]['nbj'].push(socket.id);
        }
        // console.log(socket.id);
        socket.chrono = 60;
        socket.pseudo = pseudo;
        socket.room = id;
        socket.radioColor = {cgreen: true, cblue: true, cyellow: true, cred: true, green:9, blue:9, yellow:9, red:9};
        socket.div = {green:{}, blue:{}, red:{}, yellow:{}};
        socket.ready = false;
        socket.join(id);
        var tab=[];
        for(var i=0; i<tabjoueur.length;i++){
            if(tabjoueur[i].id===id){
                tab.push({'pseudo':tabjoueur[i]['pseudo'], 'color':tabjoueur[i]['color'], "sid": tabjoueur[i]["sid"]});
            }
        }
        socket.emit('nouveau_client', pseudo, tab, tabReady[socket.room]["king"]);
        socket.in(id).emit('autre_connexion', pseudo, tab);
        var tm=[];
        if(tabMess.length != 0){
            for(var i in tabMess){
                if(tabMess[i].id==id){
                    tm.push(tabMess[i]);
                }
            }
            socket.emit('recupereMessage', tm);
        }
    });

    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    socket.on('message', function (message) {
        var myMessage = ent.encode(message);
        tabMess.push({id: socket.room["id"], pseudo: socket.pseudo, color: socket.color, mess: myMessage});
        console.log("Message envoyé par le server: "+socket.room["id"]+", "+socket.pseudo+", "+socket.color+", "+myMessage);
        io.in(socket.room).emit('message', myMessage, socket.color, socket.pseudo);
    });
    socket.on('div', function (div, c) {
        if(tabReady[socket.room]["timerForBegin"] == true){
            if(tabReady[socket.room]["turnOf"] == socket.id) {
                var a = "c"+c;
                if((socket.radioColor[c] > 0)&&(socket.radioColor[c] < 10)){
                    if(socket.radioColor[a] == true){
                        if((socket.radioColor[c] == 9)&&(socket.radioColor[a] == true)){
                            var dc = div+"c";
                            if(!(dc in socket.div[c])){
                                socket.div[c][dc] = false;
                            }
                            io.in(socket.room).emit('div', div, c, socket.radioColor[c], socket.div[c][div],socket.radioColor[a]);
                            socket.radioColor[a] = false;
                            // console.log(socket.div);
                        }
                    }else{
                        if(!(div in socket.div[c])){
                            socket.div[c][div] = 0;
                        }
                        socket.radioColor[c] = socket.radioColor[c]-1;
                        socket.div[c][div] = 1+socket.div[c][div];
                        io.in(socket.room).emit('div', div, c, socket.radioColor[c], socket.div[c][div], socket.radioColor[a]);//envoi des messages à tous le monde
                        // console.log(socket.div);
                    }
                }else{
                    socket.emit('alertColor', "Vous n'avez plus de jeton "+c+" !");
                }
            }else{
                io.to(socket.id).emit('popupLaunch', "Ce n'est pas à ton tour", false);
            }
        }else{
            io.to(socket.id).emit('popupLaunch', "La partie n'a pas encore commencée", false);
        }
    });
    socket.on('removeColor', function (div, c) {
        if(tabReady[socket.room]["timerForBegin"] == true){
            if(tabReady[socket.room]["turnOf"] == socket.id) {
                var a = "c"+c;
                var int = 0;
                var dc = div+"c";
                if((c == "green")||(c == "blue")||(c == "red")||(c == "yellow")){
                    if((socket.radioColor[c] < 9) && (socket.radioColor[c] >=0)){
                        if(div in socket.div[c]){
                            socket.radioColor[c] = 1 + socket.radioColor[c];//reduire la valeur des radio couleur -1
                            socket.div[c][div] = socket.div[c][div] - 1;//augmenter la valauer des etiquettes +1
                            if(socket.div[c][div]==0){
                                delete socket.div[c][div];
                                if((div in socket.div.green)||(div in socket.div.red)||(div in socket.div.blue)||(div in socket.div.yellow)||(dc in socket.div.green)||(dc in socket.div.red)||(dc in socket.div.blue)||(dc in socket.div.yellow)){
                                    io.in(socket.room).emit('dispelJeton', div, c, socket.radioColor[c], int, false);
                                }else{
                                    io.in(socket.room).emit('dispelJeton', div, c, socket.radioColor[c], int, true);
                                }
                            }else{
                                io.in(socket.room).emit('dispelJeton', div, c, socket.radioColor[c], socket.div[c][div], false);
                            }
                        }
                    }else{
                        if(socket.radioColor[c] == 9){
                            if(socket.radioColor[a] == false){
                                if (dc in socket.div[c]) {
                                    delete socket.div[c][dc];
                                    if((div in socket.div.green)||(div in socket.div.red)||(div in socket.div.blue)||(div in socket.div.yellow)||(dc in socket.div.green)||(dc in socket.div.red)||(dc in socket.div.blue)||(dc in socket.div.yellow)){
                                        socket.radioColor[a] = true;
                                        io.in(socket.room).emit('dispelConcept', div, c, false);
                                    }else{
                                        socket.radioColor[a] = true;
                                        io.in(socket.room).emit('dispelConcept', div, c, true);
                                    }
                                }
                            }
                        }
                    }
                }
            }else{
                io.to(socket.id).emit('popupLaunch', "Ce n'est pas à ton tour", false);
            }
        }else{
            io.to(socket.id).emit('popupLaunch', "La partie n'a pas encore commencée", false);
        }
    });
    socket.on('removeAllColor', function (c) {
        if(tabReady[socket.room]["timerForBegin"] == true){
            if(tabReady[socket.room]["turnOf"] == socket.id) {
                io.in(socket.room).emit('dispellAllColor', socket.div,c);
                socket.div[c]={};
                var a = "c"+c;
                socket.radioColor[a]=true;
                socket.radioColor[c]=9;
            }else{
                io.to(socket.id).emit('popupLaunch', "Ce n'est pas à ton tour", false);
            }
        }else{
            io.to(socket.id).emit('popupLaunch', "La partie n'a pas encore commencée", false);
        }
    });
    socket.on('removeAll', function() {
        if(tabReady[socket.room]["turnOf"] == socket.id) {
            io.in(socket.room).emit('dispelAll', socket.div);
            delete socket.div;
            delete socket.radioColor;
            socket.radioColor = {cgreen: true, cblue: true, cyellow: true, cred: true, green:9, blue:9, yellow:9, red:9};
            socket.div = {green:{}, blue:{}, red:{}, yellow:{}};
        }
    });

    socket.on('rdy', function () {
        if(socket.id != tabReady[socket.room]["kingID"] && tabReady[socket.room]["gameLaunched"] != true){
            if(tabReady[socket.room]["timerForBegin"] != true) {
                if (socket.id in tabReady[socket.room]['nbj']) {
                    if (tabReady[socket.room]['nbj'][socket.id] == false) {
                        tabReady[socket.room]['nbjrdy'] = tabReady[socket.room]['nbjrdy'] + 1;
                        tabReady[socket.room]['nbj'][socket.id] = true;
                        io.to(socket.id).emit('rdyPlayer', "prêt", "green");
                        io.in(socket.room).emit('sayRdy', "Prêt", "green", socket.id);
                        if (tabReady[socket.room]['nbjrdy'] == Object.keys(tabReady[socket.room]['nbj']).length - 1) {
                            // tabReady[socket.room]["timerForBegin"] = true;
                            io.in(socket.room).emit("Tous le monde est prêt, ", "Hôte à toi de jouer !");
                            io.to(tabReady[socket.room]["kingID"]).emit('buttonLaunch', "socket.emit('beginParty')", "Let's GO !", "green");
                        } else {
                            tabReady[socket.room]["timerForBegin"] = false;
                            io.to(tabReady[socket.room]["kingID"]).emit('buttonLaunch', "socket.emit('rdy')", "pas tous pret", "#e67e22");
                        }
                    } else {
                        tabReady[socket.room]["timerForBegin"] = false;
                        io.to(tabReady[socket.room]["kingID"]).emit('buttonLaunch', "socket.emit('rdy')", "pas tous pret", "#e67e22");
                        tabReady[socket.room]['nbjrdy'] = tabReady[socket.room]['nbjrdy'] - 1;
                        tabReady[socket.room]['nbj'][socket.id] = false;
                        io.to(socket.id).emit('rdyPlayer', "pas prêt", "#e67e22");
                        io.in(socket.room).emit('sayRdy', "Pas prêt", "black", socket.id);
                    }
                }
            }
        }else{
            if(tabReady[socket.room]['nbjrdy'] != Object.keys(tabReady[socket.room]['nbj']).length - 1){
                io.to(tabReady[socket.room]["kingID"]).emit('popupLaunch', "Veuillez attendre que tous le monde soit prêt", false);
            }
        }
    });

    socket.on('beginCounter', function() {
        if(tabReady[socket.room]["isRunning"] != true){
            tabReady[socket.room]["varCounter"] = setInterval(function() {
                tabReady[socket.room]["goChrono"] = tabReady[socket.room]["goChrono"]-1;

                io.in(socket.room).emit('counter', "Tour de "+socket.pseudo+" | ", "Temps restant: "+tabReady[socket.room]["goChrono"]);

                if(tabReady[socket.room]["goChrono"] == 0) {
                    clearInterval(tabReady[socket.room]["varCounter"]);
                    nextRound();
                }
            }, 1000);
        }
    });

    socket.on('stopCounterByHost', function(){
        if(tabReady[socket.room]["beginChrono"] > 0 && tabReady[socket.room]["gameLaunched"] != true) {
            clearInterval(tabReady[socket.room]["varCounter"]);
            tabReady[socket.room]["beginChrono"] = 10;
            var s = "timerForBegin";
            tabReady[socket.room]["timerForBegin"] = false;
            tabReady[socket.room]["nbjrdy"] = 0;
            io.in(socket.room).emit('counter', "L'hôte ", "à stoppé le lancement de la partie");
            io.to(tabReady[socket.room]["kingID"]).emit('buttonLaunch', "socket.emit('rdy')", "tous pas pret", "#e67e22");
            Object.keys(tabReady[socket.room]["nbj"]).forEach(function(k) {
                if(k != tabReady[socket.room]["kingID"]){
                    tabReady[socket.room]["nbj"][k] = false;
                    io.to(k).emit('rdyPlayer', "pas prêt", "#e67e22");
                    io.to(k).emit('disableRdyButton', "#e67e22", false);
                }
            });
        }
    });

    socket.on('beginParty', function(){
        if(tabReady[socket.room]["beginChrono"] == 10 && tabReady[socket.room]["timerForBegin"] == false && tabReady[socket.room]["gameLaunched"] != true){
            Object.keys(tabReady[socket.room]["nbj"]).forEach(function(k) {
                if(k != tabReady[socket.room]["kingID"]){
                    io.to(k).emit('disableRdyButton', "grey", true);
                }
            });
            tabReady[socket.room]["timerForBegin"] = true;
            io.to(tabReady[socket.room]["kingID"]).emit('buttonLaunch', "socket.emit('stopCounterByHost')", "stopper le chrono", "#e67e22", false);
            socket.to(socket.room).emit('popupLaunch', "L'hôte a lancé le décompte !", false);
            tabReady[socket.room]["varCounter"] = setInterval(function() {

                tabReady[socket.room]["beginChrono"] = tabReady[socket.room]["beginChrono"]-1;

                io.in(socket.room).emit('counter', "La partie commence dans ", tabReady[socket.room]["beginChrono"]+" !");

                if(tabReady[socket.room]["beginChrono"] == 0) {
                    clearInterval(tabReady[socket.room]["varCounter"]);
                    tabReady[socket.room]["gameLaunched"] = true;
                    tabReady[socket.room]["beginChrono"] = 10;
                    delete tabReady[socket.room]["varCounter"];
                    io.in(socket.room).emit('displayWordPass', "display", "block", "none", true);
                    nextRound();
                    // io.in(socket.room).emit('popupLaunch', "La partie commence dans ", tabReady[socket.room]["beginChrono"]+" !");
                }
            }, 1000);
        }
    });

    function beginCounter(pseudo){
        console.log("CHRONO");
        tabReady[socket.room]["varCounter"] = setInterval(function() {

            console.log(tabReady[socket.room]["goChrono"]);
            io.in(socket.room).emit('counter', "Tour de "+pseudo+" | ", "Temps restant: "+tabReady[socket.room]["goChrono"]);

            tabReady[socket.room]["goChrono"] = tabReady[socket.room]["goChrono"]-1;

            if(tabReady[socket.room]["goChrono"] == 0) {
                clearInterval(tabReady[socket.room]["varCounter"]);
                delete tabReady[socket.room]["varCounter"];
                tabReady[socket.room]["goChrono"] = 30;
                nextRound();
            }
        }, 1000);
    }

    function betweenRound(pseudo){
        console.log("ENTRACT");
        console.log(pseudo);
        tabReady[socket.room]["varCounter2"] = setInterval(function() {
            console.log(tabReady[socket.room]["countEntract"]);
            io.in(socket.room).emit('counter', "Le prochain joureur sera "+pseudo+" | ", "Début dans: "+tabReady[socket.room]["countEntract"]);

            tabReady[socket.room]["countEntract"] = tabReady[socket.room]["countEntract"]-1;

            if(tabReady[socket.room]["countEntract"] == 0) {
                console.log("STOOP");
                clearInterval(tabReady[socket.room]["varCounter2"]);
                tabReady[socket.room]["varCounter2"] = null;
                tabReady[socket.room]["countEntract"] = 5;
                beginCounter(pseudo);
            }
        }, 1000);
    }

    function nextRound(){

        if(tabReady[socket.room]["turnOf"] != null){
            if(tabReady[socket.room]["whoNb"] < io.sockets.adapter.rooms[socket.room].length ){
                var n = tabReady[socket.room]["whoNb"];
                tabReady[socket.room]["turnOf"] = tabReady[socket.room]["tabJrRound"][n];
                tabReady[socket.room]["whoNb"] = tabReady[socket.room]["whoNb"] + 1;
                // io.in(socket.room).emit("counter", "Tour de "+tabReady[socket.room]["pseudo"][tabReady[socket.room]["turnOf"]], " | Début dans 5 secondes...");
                betweenRound(tabReady[socket.room]["pseudo"][tabReady[socket.room]["turnOf"]]);
                return false;
            }else{
                tabReady[socket.room]["whoNb"] = 0;
                tabReady[socket.room]["nbTurn"] += 1;
                var n = tabReady[socket.room]["whoNb"];
                tabReady[socket.room]["turnOf"] = tabReady[socket.room]["tabJrRound"][n];
                tabReady[socket.room]["whoNb"] = tabReady[socket.room]["whoNb"] + 1;
                // io.in(socket.room).emit("counter", "Tour de "+tabReady[socket.room]["pseudo"][tabReady[socket.room]["turnOf"]], " | Début dans 5 secondes...");
                betweenRound(tabReady[socket.room]["pseudo"][tabReady[socket.room]["turnOf"]]);
            }
        }else{
            var n = tabReady[socket.room]["whoNb"];
            tabReady[socket.room]["turnOf"] = tabReady[socket.room]["tabJrRound"][n];
            tabReady[socket.room]["whoNb"] = tabReady[socket.room]["whoNb"] + 1;
            // io.in(socket.room).emit("counter", "Tour de "+tabReady[socket.room]["pseudo"][tabReady[socket.room]["turnOf"]], " | Début dans 5 secondes...");
            beginCounter(tabReady[socket.room]["pseudo"][tabReady[socket.room]["turnOf"]]);
            return false;
        }
    }
});