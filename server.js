
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
let userLocal={}

let userName=userData.userName
let userId=userData.id











loadUser()
console.log(users)

var browserUser = bonjour.find({type: 'user'})

browserUser.on('up', (service)=>{

    console.log('Found an HTTP server:', service)
    servicesUser[service.name]=service
    console.log(service.name, users[service.name])
console.log("Name :", service.txt.name)


    if(service.name==userId){

        userLocal.referer=service.referer
    }

else if (users[service.name]==undefined){
    users[service.name] ={ "name" :service.txt.name}
        userData.usersMet =users
    updateFile("userData.json", userData)
}

    if (users[service.name]!= undefined){
    users[service.name].connected=true

    }

    io.sockets.emit("user-Connect", { user :users[service.name], id :service.name})

})

browserUser.on('down', (service)=>{
    console.log("dwwwn", service)
    delete servicesUser[service.name]
    users[service.name].connected=false

    io.sockets.emit("user-Connect", { user :users[service.name], id :service.name})




})


console.log("serv ",servicesUser[userId])
// Service local utilisateur
// Eviter doublons
function serviceLocal() {
    if ((servicesUser[userName]==undefined)&&(userName!="")){

        userLocal = bonjour.publish({ name: userId, type: 'user', port: 3000, txt :{name : userName} }).on('error', (error)=>{
            console.log("erreur on", error)
        })
    }
}
serviceLocal()








console.log("boot")


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


    socket.on("login", name =>{
        userData.userName= name
        userData.id =Date.now()
        userName=userData.userName
        userId = userData.id
       updateFile("userData.json", userData )
        socket.emit('user-name', userName)
        serviceLocal()
    })




    socket.on('ask-name', ()=>{

        socket.emit('user-name', userName)
    })

    socket.on('ask-users', ()=>{
        socket.emit('users', users)
    })
    socket.on('ask-convs', ()=>{
        socket.emit('convs', convUsed)
    })
    socket.on("ask-convIp", url =>{
        const urlParams = new URLSearchParams(url);
        console.log(urlParams.get("user"))
        console.log("test", urlParams)

        // gestion conversation entres utilisateurs
        if(urlParams.has("user")){
            let userIdConv = urlParams.get("user")
            socket.emit("idConv",(parseInt(userIdConv, 10)+ parseInt(userId, 10)))
            // si l'utilisateur n'est pas connecté alorsil n'a pas d'ip
           if (servicesUser[userIdConv]==undefined){
               socket.emit("IPConv", "unknown")
           }else{

               let service = servicesUser[userIdConv]
               let ip = service.referer.address + ":" + service.port
               socket.emit("IPConv", ip)
           } }



        // gestion conversation entres groupes
        else if(urlParams.has("conv")){
            let idConv = urlParams.get("conv")
            let service = servicesConv[idConv]
            let ipConv =service.referer.address+":"+service.port
            socket.emit("IPConv", ipConv)
        }


    })


    socket.on('hello', data =>{
        console.log(data)
    })

    socket.on('sendMessage', data=>{
        data.sender = userId
        console.log(data)
        console.log(typeof (data.conv))
        // si conversation à plusieurs
        if (typeof(data.conv) == "string"){



}
// conversation à un seul utilisateur
else{
            sendToUser(data, getUserIdFromConv(data))
}

    })


    socket.on('transferMessage', data=>{
        console.log('receive',data)
        socket.broadcast.emit("received", data)

    })

})



function sendToUser(data, userId) {

    let ipServ
    ipServ = getIpServer(userId)
    console.log(userId+" "+ipServ)
    if (ipServ=="unknown"){
        console.log("Queue")

    }
    else {
        let socketConv = require("socket.io-client")('http://'+ipServ)
        socketConv.emit('transferMessage',data)


    }

}


function getUserIdFromConv(data) {
let idConv = data.conv

    return (parseInt(idConv, 10)- parseInt(userId, 10))

}







function updateFile(nameFile, dataRaw){
    var fs=require('fs');

    let data = JSON.stringify(dataRaw, null, 2);
    fs.writeFile(nameFile, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}



function readFile(nameFile) {
    var fs=require('fs');
    var data=fs.readFileSync(nameFile+'.json', 'utf8');
    return JSON.parse(data);

}

function getIpServer(userID) {

    if(servicesUser[userID]==undefined){
        return "unknown"
    }
else{
        return servicesUser[userID].referer.address+":"+servicesUser[userID].port

    }
}