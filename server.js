
let bonjour = require('bonjour')()


let io = require('socket.io')(3000)


const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    }

    console.log('Connected to database.');
});



// utilisateurs connus
const users ={},
    // conversations utilisées
    convUsed = {},
    // services des utilisateurs sur le réseau
    servicesUser ={}
getUsers()
getConv()

let userLocal={}
let userData =readFile('userData')
let userName=userData.userName
let userId=userData.id
let userComputer =userData.computerName











/// Gestion de la bdd

function  getUsers(){

    db.all("select * from users", [], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("ROW ", row)

        for(let id in row){
            users[row[id].idUser]= {name : row[id].userName}

            if (servicesUser[row[id].idUser]==undefined){
                users[row[id].idUser].connected = false
            }
            else{
                users[row[id].idUser].connected = true
            }


        }

        console.log("users",users)



    });


}

function addNewUser(idUser, userName) {
    console.log("ADD", userName)
    db.run("insert into 'users' values (?, ?)", [idUser , userName], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`User inserted `);
    });
}


function getConv(){

    db.all("select * from conversations", [], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("ROW CONV", row)

        for(let id in row){
            convUsed[row[id].idConv]= {name : row[id].nameConv}

            db.all("select idUser from userConv where idConv = ?", [row[id].idConv], (err, row2) => {
                if (err) {
                    return console.error(err.message);
                }
                convUsed[row[id].idConv].userList= row2
                console.log("ConvUsers", row2)
            });

        }
        console.log("conv", convUsed)

    });

}

function getMessagesConv(idConv, socket) {
    let msgs={}
    db.all("select * from messageConv where idConv = ?", [idConv], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("ROW MSGS "+idConv, row)

        for(let id in row){
            msgs[id]= {conv : row[id].idConv,
            date : row[id].date,
                msg: row[id].content,
                sender : row[id].sender
            }


        }
        console.log("Messconv", msgs)
        socket.emit("messagesConv", msgs)
    });


}


function getMessagesPrivate(idConv, socket) {
    let msgs={}
    db.all("select * from messagePerso where conv = ?", [idConv], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("ROW MSGS "+idConv, row)

        for(let id in row){
            msgs[id]= {
                date : row[id].date,
                msg: row[id].content,
                type: row[id].type,
                conv : row[id].conv,
                sender : row[id].sender
            }


        }
        console.log("conv", msgs)
        socket.emit("messagesConv", msgs)
    });


}


function saveMessage(data, type, queued){
    let sql = "insert into 'messageConv' values (null , ?, ?, ?, ?)"
    let array = [data.date , data.conv, data.msg, data.sender]
    if (type=="private"){
        sql="insert into 'messagePerso' values (null , ?, ?, 'msg', ?, ?, ?)"
        console.log("array", array)
        array = [data.date , data.msg, data.sender, data.conv-userId, queued]
    }
    db.run(sql , array, function(err) {
        if (err) {
            return console.error(err.message);
        }

        console.log(`Msg inserted `, this.lastID);
        console.log("queued?", queued)
        if (queued &&(type=="conv")){
            queueMessageConv(this.lastID, type)
        }
    });



}



async function queueMessageConv(idInsert , type){



    console.log("QUEUE :",idInsert+" "+ type)
    let sql = "insert into 'queueConv' values (null , ?)"
    let array = [idInsert]

    db.run(sql , array, function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Msg Queued `);
    });

}

function deQueueMessages(idUser){

    let msgs={}
    db.all("select * from messagePerso where status == 0 and conv = ?", [idUser], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        console.log("ROW DEQUEUE "+idUser, row)

        for(let id in row){
            msgs[id]= {
                date : row[id].date,
                msg: row[id].content,
                conv: row[id].conv,
                type: row[id].type,
                sender : row[id].sender
            }

            sendQueuedMessage(msgs[id])

        }
        console.log("conv", msgs)

    });



}
















var browserUser = bonjour.find({type: 'user'})

browserUser.on('up', (service)=>{

    console.log('Found an HTTP server:', service)
    servicesUser[service.name]=service
    console.log(service.name, users)
    console.log("Name :", service.txt.name)


    if(service.name==userId){

        userLocal.referer=service.referer
    }

    else if (users[service.name]==undefined){
        users[service.name] ={ "name" :service.txt.name}

        addNewUser(service.name,service.txt.name )

    }

    if (users[service.name]!= undefined){
        users[service.name].connected=true
        deQueueMessages(service.name)

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















// Gestion des échanges

io.on('connection', socket => {


    socket.on("login", name =>{
        userData.userName= name
        userData.id =Date.now()
        userName=userData.userName
        userId = userData.id
        userComputer =process.env['COMPUTERNAME']
        updateFile("userData.json", userData )
        socket.emit('user-name', userName)
        socket.emit('user-id', userId)
        serviceLocal()
    })




    socket.on('ask-name', ()=>{
    if(userComputer!=process.env['COMPUTERNAME']){
        userName=""
    }
        socket.emit('user-name', userName)
        socket.emit('user-id', userId)
    })

    socket.on('ask-users', ()=>{
        console.log("users asked",users)
        socket.emit('users', users)
    })
    socket.on('ask-convs', ()=>{
        console.log("convUsed", convUsed)
        socket.emit('convs', convUsed)
    })
    socket.on("ask-convId", url =>{
        const urlParams = new URLSearchParams(url);
        console.log(urlParams.get("user"))
        console.log("test", urlParams)

        // gestion conversation entres utilisateurs
        if(urlParams.has("user")){
            let userIdConv = urlParams.get("user")
            socket.emit("idConv",(parseInt(userIdConv, 10)+ parseInt(userId, 10)))
            socket.emit("type", "private")
             }



        // gestion conversation entres groupes
        else if(urlParams.has("conv")){
            let idConv = urlParams.get("conv")

            socket.emit("idConv", idConv)
            socket.emit("type", "conv")
        }


    })
    
    
    
    socket.on("ask-messagesConv", idConv=>{
        
        getMessagesConv(idConv, socket)
        
        
    })
    socket.on("ask-messagesPrivate", idConv=>{

        getMessagesPrivate(idConv-userId, socket)


    })


    socket.on('hello', data =>{
        console.log(data)
    })

    socket.on('sendMessage', data=>{
        data.sender = userId
        console.log(data)
        console.log(typeof (data.conv))
        // Réponse du serveur quand il a reçu le message
        socket.emit("sentMessage", data)
        // si conversation à plusieurs
        if (typeof(data.conv) == "string"){

            console.log(data)
            console.log("usersList", convUsed[data.conv].userList)
            let listUser =convUsed[data.conv].userList
            for(let id in listUser){
                console.log("userConv : "+listUser[id].idUser)
                sendToUser(data, listUser[id].idUser, "conv")
            }


        }
// conversation à un seul utilisateur
        else{
            sendToUser(data, getUserIdFromConv(data), "private")
        }

    })


    socket.on('transferMessage', data=>{
        console.log('receive',data)
        socket.broadcast.emit("received", data)


    })



})











function sendToUser(data, userId, type) {

    let ipServ
    ipServ = getIpServer(userId)
    console.log(userId+" "+ipServ)
        let socketConv = require("socket.io-client")('http://'+ipServ)
        socketConv.emit('transferMessage',data)

    // si ipServ=="unknown" vrai alors il doit être placé en file d'attente
        saveMessage(data, type,(ipServ=="unknown"))



}


function sendQueuedMessage(msg) {

    sendToUser(msg, msg.conv, "private" )

let ipServ =getIpServer(getUserIdFromConv(msg))
    console.log("REPLACE", [msg.date , msg.sender, (ipServ=="unknown")])
    db.run("update 'messagePerso' set status=?   where date =? and sender = ?", [(ipServ=="unknown"), msg.date , msg.sender], function(err) {
        if (err) {
            return console.error(err.message);
        }
        else{
        console.log(`message Modified `);
        }
    });

}







function getUserIdFromConv(data) {
    let idConv = data.conv

    return (parseInt(idConv, 10)- parseInt(userId, 10))

}


function readFile(nameFile) {
    var fs=require('fs');
    var data=fs.readFileSync(nameFile+'.json', 'utf8');
    return JSON.parse(data);

}


function updateFile(nameFile, dataRaw){
    var fs=require('fs');

    let data = JSON.stringify(dataRaw, null, 2);
    fs.writeFile(nameFile, data, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}


function getIpServer(userID) {

    if(servicesUser[userID]==undefined){
        return "unknown"
    }
    else{
        return servicesUser[userID].referer.address+":"+servicesUser[userID].port

    }
}