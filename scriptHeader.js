
const socket = io('http://localhost:3000')
const sideBar = document.getElementById("sidenav")




function openNav() {
    sideBar.style.width = "250px";


}

function closeNav() {
    sideBar.style.width = "0";


}
closeNav()

socket.emit('ask-name')


socket.on('user-name', userName => {
    console.log("test",userName)
    if (userName==""){





        displayRegister()



    }

    else{


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
sideBar.append(divConv)

    socket.on("convs", convs =>{
        for(var id in convs){
            //console.log("conv", convs[id])
            appendDiv(convs[id].name, divConv, id, "conv",convs[id].connected)
        }
    })
    socket.emit("ask-convs")

}


function appendDiv(value, div, id, type, connected) {
    const element = document.createElement('a')

    const elementDot =document.createElement('span')
    elementDot.className="dot"
    //elementDot.id ="dot"

    element.innerText = value

    element.setAttribute("id", id)
    element.onclick = function( ){
        console.log(type, id)
        location.href='conv.html?'+type+"="+id;
    }

    var color = "#bbb"
    if (connected) color= "#00ced1"

    //console.log(color)
    elementDot.style.backgroundColor= color
    element.appendChild(elementDot)


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