

const socket = io('http://localhost:3000')
const sideBar = document.getElementById("sidenav")


socket.emit('ask-name')


socket.on('user-name', userName => {
    console.log("test",userName)
    if (userName=="Base"){

        let divUser = document.createElement('div')
        divUser.setAttribute('id',"users-container")
        divUser.innerText="Utilisateurs"
        sideBar.append(divUser)


        let divConv = document.createElement('div')
        divConv.setAttribute('id',"conv-container")
        divConv.innerText="Conversation"
        sideBar.append(divConv)


        let divCurrentUser = document.createElement('div')
        divCurrentUser.setAttribute('id',"me-container")
        divCurrentUser.innerText=userName
        sideBar.append(divCurrentUser)

    }



})

