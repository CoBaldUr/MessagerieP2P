const queryString = window.location.search;
console.log(queryString)

const messageContainer = document.getElementById('message-container')
const formContainer = document.getElementById('send-container')

const messageForm = document.getElementById('send-container')





socket.emit("ask-convIp", queryString)
let ipConv
socket.on("IPConv", ipConvR =>{
    ipConv=ipConvR
    console.log("service",ipConv)
    startConv()


})

let idConv =""
socket.on("idConv", id=>{
    idConv=id
})



function startConv() {

appendForm()



}






function appendForm() {
    const inputForm =document.createElement('input')
    inputForm.setAttribute("type","text")
    inputForm.setAttribute("id","message-input")

    formContainer.append(inputForm)

    const buttonForm = document.createElement("BUTTON")
    buttonForm.setAttribute("type","submit")
    buttonForm.setAttribute("id","send-button")
    buttonForm.innerText ="Envoyer"

    formContainer.append(buttonForm)

    const messageInput = document.getElementById('message-input')
    messageForm.addEventListener('submit', e => {
        e.preventDefault()
        const message = messageInput.value


        sendMessage(message)
        messageInput.value = ''
    })


    socket.on("received", data=>{
        console.log(data)
    })

}

function sendMessage(message) {
let messageData = {conv : idConv, msg :message, date: Date.now()}
    socket.emit("sendMessage", messageData)
    console.log("message", messageData)



}