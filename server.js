
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
loadConv()
loadUser()
console.log(users)

var browserUser = bonjour.find({type: 'user'})

browserUser.on('up', (service)=>{

    console.log('Found an HTTP server:', service)
    servicesUser[service.name]=service
    console.log(service.name, users[service.name])

    if (users[service.name]!= undefined)
    users[service.name].connected=true

})

browserUser.on('down', (service)=>{
    console.log("dwwwn", service)
    delete servicesUser[service.name]
    users[service.name].connected=false

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
    convUsed[service.name].connected=true

})


browserConv.on('down', (service)=>{
    console.log("dwwwn", service)
    delete servicesConv[service.name]
    convUsed[service.name].connected=false

})






console.log("boot")


function loadConv(){
    for (var id in convUsed){
        console.log("load", id+" "+convUsed[id])
        if (servicesConv[id]==undefined){
            convUsed[id].connected = false
        }
    else{
            convUsed[id].connected = true
        }
    }

        }



function loadUser(){
    for (var id in users){
        console.log("load User", id+" "+users[id])
        if (servicesUser[id]==undefined){
            users[id].connected = false
        }
        else{
            users[id].connected = true
        }
    }

}





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







