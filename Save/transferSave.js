

/////////////// WIP

/////////// File transfer :
///// https://webrtc.github.io/samples/src/content/datachannel/filetransfer/



var peer1 = new SimplePeer({ initiator: true })
var peer2 = new SimplePeer()

peer1.on('signal', data => {
    // when peer1 has signaling data, give it to peer2 somehow
    peer2.signal(data)
})

peer2.on('signal', data => {
    // when peer2 has signaling data, give it to peer1 somehow
    peer1.signal(data)
})

peer1.on('connect', () => {
    // wait for 'connect' event before using the data channel
    peer1.send('hey peer2, how is it going?')
})

peer2.on('data', data => {
    // got a data channel message
    console.log('got a message from peer1: ' + data)
})






//// Video call

// utilise Simple Peer : https://github.com/feross/simple-peer

//compatibilité selon l'explorateur un internet
navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

document.getElementById("startButton").addEventListener('click', ()=>{
    var peerVid1 = new SimplePeer({
        initiator: true,
        config : {iceServers : []},
        trickle: false
    })

    navigator.getUserMedia({
        video : true,
        audio: true
    }, (stream)=>{

        peerVid1.addStream(stream)


        let emitterVid = document.getElementById('emitter-video')
        emitterVid.volume=0.1
        // !!! window.URL.createObjectURL désactivé sur Chrome
        try {
            emitterVid.srcObject = stream;
        } catch (error) {
            emitterVid.src = window.URL.createObjectURL(stream);
        }
        emitterVid.play()




    }, () =>{
        console.log("error getUserMedia")
    })





    console.log("clic")

    var peerVid2 = new SimplePeer({
        config : {iceServers : []},
        trickle: false})



    socket.on("responseVisio", data=> {
        console.log("response")
        if (data.conv == idConv) {

            peerVid2.signal(data.data)

            peerVid2.on('signal', data => {
                // when peer2 has signaling data, give it to peer1 somehow
                peerVid1.signal(data)
            })

            peerVid2.on('data', data => {
                // got a data channel message
                console.log('p1 a dit: ' + data)
            })


            peerVid2.on('stream', (stream) =>{
                console.log("stream","done")
                let receiverVid = document.getElementById('receiver-video')
                receiverVid.volume=0
                // !!! window.URL.createObjectURL désactivé sur Chrome
                try {
                    receiverVid.srcObject = stream;
                } catch (error) {
                    receiverVid.src = window.URL.createObjectURL(stream);
                }
                receiverVid.play()

            })

        }
    })


    peerVid1.on('connect', () => {
        // wait for 'connect' event before using the data channel
        //peerVid1.send('bonjour')
    })


    peerVid1.on('signal', data => {
        // when peer1 has signaling data, give it to peer2 somehow
        //
        console.log(data)
        socket.emit('offerVisio', {data : data, conv : idConv})
    })

})


