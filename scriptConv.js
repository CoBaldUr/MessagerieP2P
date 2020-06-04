const queryString = window.location.search;
console.log(queryString)


socket.emit("ask-convIp", queryString)
let serviceConv
socket.on("IPConv", ipConv =>{
    let ip=ipConv
    console.log("service",ip)
})