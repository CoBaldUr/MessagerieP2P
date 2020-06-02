
let bonjour = require('bonjour')()


let io = require('socket.io')(3000)
let userData =readFile('userData')

    // utilisateurs connus
const users = userData.usersMet,
    // conversations utilisées
    convUsed =userData.conv,
    // services des utilisateurs sur le réseau
    servicesUser ={},
    // services des conversations sur le réseau
    servicesConv ={}

let userName=userData.userName

function readFile(nameFile) {
    var fs=require('fs');
    var data=fs.readFileSync(nameFile+'.json', 'utf8');
    return JSON.parse(data);

}



var browserUser = bonjour.find({type: 'user'})

browserUser.on('up', (service)=>{

    console.log('Found an HTTP server:', service)
    servicesUser[service.name]=service

})

browserUser.on('down', (service)=>{
    console.log("dwwwn", service)
    delete servicesUser[service.name]


})

console.log("serv ",servicesUser[userName])
// Eviter doublons
if (servicesUser[userName]==undefined){

        let userLocal = bonjour.publish({ name: userName, type: 'user', port: 3000 }).on('error', (error)=>{
            console.log("erreur on", error)
        })
}

var browserConv = bonjour.find({type: 'conv'})

browserConv.on('up', (service)=>{

    console.log('Found an HTTP server:', service)
    servicesConv[service.name]=service

})

browserConv.on('down', (service)=>{
    console.log("dwwwn", service)
    delete servicesConv[service.name]


})


for( let id in convUsed){



}




console.log("boot")









// Gestion des échanges

io.on('connection', socket => {
    socket.on('ask-name', ()=>{

        socket.emit('user-name', userName)
    })

    socket.on('ask-users', ()=>{
        socket.emit('users', users)
    })
    socket.on('ask-convs', ()=>{
        socket.emit('convs', convUsed)
    })

})







///  test publication du html
var express = require('express');
var app = express();
var path = require("path");

app.set('view engine', 'ejs')


app.use( express.static( __dirname + '/views/client/' ))
app.get( '/', function( req, res ) {
    console.log("GET")
    let ipLocal = servicesLocal[nomServeur].referer.address+":"+servicesLocal[nomServeur].port
    console.log(ipLocal)
        //res.sendFile( path.join( __dirname, 'client', 'index.html' ));
    res.render('client/conv', {ipLocal : ipLocal})


});


app.get('/views/client/script.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/client/script.js'));
});

app.listen(8080)