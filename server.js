
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











loadConv()
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

// chargement des conversations connues
function loadConv(){
    for (var id in convUsed){
        console.log("load", id+" "+convUsed[id])
        if (servicesConv[id]==undefined){
            //convUsed[id].connected = false
            bonjour.publish({ name: id, type: 'conv', port: 3000 }).on('error', (error)=>{
                console.log("erreur on", error)

            })
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

        if(urlParams.has("user")){
            let userIdConv = urlParams.get("user")
            // on choisit qui héberge la conversation
            // idLocal + idContact => si pair, serveur local heberge
            let number = (parseInt(userIdConv)+parseInt(userId))%2
            if (number==0){
                console.log( "ouiuiuiui" ,userLocal)
                let ipLocal =userLocal.referer.address+":"+userLocal.port
                socket.emit("IPConv", ipLocal)
            }
            else{
            let service =servicesUser[userIdConv]
                let ip =service.referer.address+":"+service.port
            socket.emit("IPConv", ip)
            }
        }





    })

})


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
