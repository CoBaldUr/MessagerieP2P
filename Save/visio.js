navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;


document.getElementById("startButton").addEventListener('click', ()=>{
    console.log("clic")
    initPeer(true)
})


function manageConn(peer){
    peer.on('signal', data => {
        console.log(data)
        if (peer.initiator) {

            socket.emit('offerVisio', {data: data, conv: idConv})
        }
    })
    peer.on('error', error =>{
        console.error( error)
    })

    if (!peer.initiator){
        peer.on('stream', (stream) =>{
            console.log("stream",peer.initiator)
            let receiverVid = document.getElementById('receiver-video')
            receiverVid.volume=0.1
            // !!! window.URL.createObjectURL désactivé sur Chrome
            try {
                receiverVid.srcObject = stream;
            } catch (error) {
                receiverVid.src = window.URL.createObjectURL(stream);
            }
            receiverVid.play()



        })
    }
    socket.on('responseVisio', data2=>{
        console.log("response", data2)

        initPeer(false)

        peer.signal(data2)



    })

}





function initPeer(initiator) {

    console.log("init",initiator)

    navigator.getUserMedia({
        video : true,
        audio: true
    }, (stream)=>{
        let peer = new SimplePeer({
            initiator: initiator,
            stream : stream,
            // config : {iceServers : []},
            trickle: false
        })
        manageConn(peer)
        if(initiator){
            let emitterVid = document.getElementById('emitter-video')
            emitterVid.volume=0.1
            // !!! window.URL.createObjectURL désactivé sur Chrome
            try {
                emitterVid.srcObject = stream;
            } catch (error) {
                emitterVid.src = window.URL.createObjectURL(stream);
            }
            emitterVid.play()
        }





    }, () =>{
        console.log("error getUserMedia")
    })

}

