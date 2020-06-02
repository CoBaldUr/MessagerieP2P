
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
            console.log("user", id)
            appendDiv(users[id], divUser, "user")
        }
    })
    socket.emit("ask-users")

}


function convInit(){
let divConv = document.createElement('div')
divConv.setAttribute('id',"conv-container")
divConv.innerText="Conversation"
sideBar.append(divConv)

    socket.on("convs", convs =>{
        for(var id in convs){
            console.log("conv", convs[id])
            appendDiv(id, divConv, "conv")
        }
    })
    socket.emit("ask-convs")

}


function appendDiv(value, div, id) {
    const element = document.createElement('a')
    element.innerText = value
    element.setAttribute("id", id)
    div.append(element)
}
