
const socket = io('http://localhost:3000')
const sideBar = document.getElementById("sidenav")

let userNames


function openNav() {
    sideBar.style.width = "250px";


}

function closeNav() {
    sideBar.style.width = "0";


}
closeNav()

socket.emit('ask-name')

let usrName
let usrId

socket.on('user-name', userName => {
    console.log("test",userName)
    socket.on("user-id", id=>{
        usrId=id
    })


    if (userName==""){





        displayRegister()



    }

    else{

usrName=userName

        usersInit()


        convInit()


        let divCurrentUser = document.createElement('div')
        divCurrentUser.setAttribute('id',"me-container")
        divCurrentUser.innerText=userName
        sideBar.append(divCurrentUser)

    }


})

function usersInit() {

    const divUser = document.createElement('div')
    divUser.setAttribute('id',"users-container")
    divUser.innerText="Utilisateurs"
    sideBar.append(divUser)



    socket.on("users", users =>{
        userNames=users
        console.log("usersGet ", userNames)
        for(var id in users){
            //console.log("user", id)
            appendDiv(users[id].name, divUser, id, "user", users[id].connected)
        }
    })
    socket.emit("ask-users")

    socket.on("user-Connect", userData =>{


        changeStatus(userData.user.name, divUser, userData.id, "user", userData.user.connected)
        //console.log(userData)
    })


}


function convInit(){
let divConv = document.createElement('div')
divConv.setAttribute('id',"conv-container")
divConv.innerText="Conversation"

    divAddConv = document.createElement('input')
    divAddConv.type ="button"
    divAddConv.name ="Ajouter une conversation"
    divAddConv.value ="+"
    divAddConv.style.float ="right"
    divAddConv.style.borderRadius="15px"
    divAddConv.onclick= function(){
    addConv()
    }


    divConv.appendChild(divAddConv)
sideBar.append(divConv)

    /*
    socket.on("convs", convs =>{
        for(var id in convs){
            //console.log("conv", convs[id])
            appendDiv(convs[id].name, divConv, id, "conv",convs[id].connected)
        }
    })
    socket.emit("ask-convs")

     */

    appendDiv("EN CONSTRUCTION", divConv, 0, "conv", false)


}


function appendDiv(value, div, id, type, connected) {
    const element = document.createElement('a')



    element.innerText = value

    element.setAttribute("id", id)
    element.onclick = function () {
        console.log(type, id)
        //location.href = 'conv.html?' + type + "=" + id;
        initPage(id, type)


    }
    if (type == "user") {

        const elementDot = document.createElement('span')
        elementDot.className = "dot"
        //elementDot.id ="dot"

    var color = "#bbb"
    if (connected) color = "#00ced1"


        var colorNotif = "rgba(0,136,255,0.13)"


        const elementNotif = document.createElement('span')
        elementNotif.id = "notif"
        //elementDot.id ="dot"
        elementNotif.innerText="0"
        elementNotif.style.borderRadius="5px"
        elementNotif.style.marginLeft ="2px"

        //console.log(color)
        elementNotif.style.backgroundColor = colorNotif
        elementNotif.style.display ="none"
        element.appendChild(elementNotif)




    //console.log(color)
    elementDot.style.backgroundColor = color
    element.appendChild(elementDot)
}

    div.append(element)
}

function changeStatus(name, divUser, id, user, connected) {

    var element = document.getElementById(id)

if (element ==null)
    appendDiv(name, divUser, id, user, connected)
else{
    console.log(element)
var elementDot =element.getElementsByClassName("dot").item(0)
console.log(elementDot)
    var color = "#bbb"
    if (connected) color= "#00ced1"

    //console.log(color)
    elementDot.style.backgroundColor= color
}


}



function displayRegister(){

    var modal = document.querySelector(".login");

    var logButton = document.querySelector(".logButt");

    function toggleModal() {
        modal.classList.toggle("show-login");
    }



    toggleModal()


    logButton.addEventListener("click", ()=>{
        const name = document.getElementById('logForm').value
        if(name!=""){
            socket.emit("login", name)
            toggleModal()
            }


    });


}


function addConv() {
console.log("conv")

}



function initPage(id, type){

    console.log("clic", id)
    document.getElementById("default").style.display="initial"
    // à modifier car plus de query
    socket.emit("ask-convId", "?"+type+"="+id)
}