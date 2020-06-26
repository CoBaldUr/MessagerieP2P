//const queryString = window.location.search;
//console.log(queryString)

const messageContainer = document.getElementById('message-container')
const formContainer = document.getElementById('form-send')

const messageForm = document.getElementById('form-send')




let idConv =""
let type =""

socket.on("conv", data=>{
    console.log("id", data.id-usrId)

        console.log("type", type)
        type = data.type

        console.log("usrs", userNames[data.id - usrId])
        if (userNames[data.id - usrId] != undefined) {
            idConv = data.id


                startConv()


        } else {
            console.log("non")
    }



})




function startConv() {
    console.log("Type", type)
if (type=="conv"){
    socket.emit('ask-messagesConv', idConv)
}
if (type=="private") {
        socket.emit('ask-messagesPrivate', idConv)
    }



appendForm()

    socket.on("messagesConv", messages =>{
        //console.log("messages", messages)
        appendConv(messages)



    })


}






function appendForm() {

    document.getElementById("default").style.display="none"


    messageForm.innerText=''


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
        console.log("clic")
        e.preventDefault()
        const message = messageInput.value


        sendMessage(message)
        messageInput.value = ''
    })




    socket.on("sentMessage", data=>{
        appendMessage(data)
    })

}

function sendMessage(message) {
let messageData = {conv : idConv, msg :message, date: Date.now()}
    socket.emit("sendMessage", messageData)
    console.log("message", messageData)



}


function appendMessage(dataMessage) {

        const messageElement = document.createElement('p')
        messageElement.id= dataMessage.date
    messageElement.title= new Date(dataMessage.date)
        messageElement.innerText = dataMessage.msg
    console.log("color", usrId)

    // nom de l'envoyeur affiché :
    const infoElement =  document.createElement("div")
    infoElement.id="infoElement"

    if(dataMessage.sender==usrId){

        messageElement.style.backgroundColor = "#00c4fe"
        messageElement.style.textAlign= "right";
        infoElement.innerText= "Vous"
    }
// blocs de la taille du texte
//messageElement.style.display = "inline-block";
else{
    infoElement.innerText= userNames[dataMessage.sender].name




}
    messageElement.append(infoElement)



        messageContainer.append(messageElement)




    window.scrollTo(0,document.body.scrollHeight);
}


function appendConv(messages) {
    messageContainer.innerText=''
    for (let id in messages){
        appendMessage(messages[id])
    }

}


socket.on("received", data=>{
    // Jouer un son
    var audio = new Audio('clav.wav');
    audio.play()
    
    if (data.conv==idConv){
        console.log(data)
        appendMessage(data)
    }
    else{
        console.log("notif", data.conv)
        if(data.sender!=usrId) {
            addNotif(data)
        }
    }
})



function addNotif(data) {

    console.log("addNotif", data.conv-usrId)
    let num =data.conv-usrId
    let elemConv = document.getElementById(num+"")




    let elementNotif =elemConv.querySelector('#notif')
    if (elementNotif.style.display === "none"){
        elementNotif.style.display = "initial";

    }

elementNotif.innerText = (Number(elementNotif.innerText)+1)+""




}