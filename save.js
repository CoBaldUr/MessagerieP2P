
let http = require('http')
let fs = require('fs')
var bonjour = require('bonjour')()

// advertise an HTTP server on port 3000

bonjour.publish({ name: 'My Web Server', type: 'http', port: 3000 })


let server = http.createServer()
server.on('request',(request, response) => {
    if (request.url != '/favicon.ico') {

        fs.readFile('index.html', 'utf8', (err, data) => {
            if (err) throw err

            bonjour.publish({ name: 'My Web Server 1', type: 'http', port: 3000 })
            let ip = ""

// browse for all http services
            console.log(request.url);
            console.log('Find:', 'Test')
            bonjour.find({type: 'http'}, function (service) {
                console.log('Found an HTTP server:', service)
                ip = service.referer.address+":"+service.port;
                data = data.replace('{{nom}}', service.name)

            })
            //console.log('salut');
            response.writeHead(200, {'Content-type': 'text/html; charset=utf8'})


            data= data.replace('{{nom}}',ip)
            response.end(data)

        })

    }

})

server.listen(8082)




let server2 = http.createServer()
server2.on('request',(request, response) => {
    if (request.url != '/favicon.ico') {

        fs.readFile('index.html', 'utf8', (err, data) => {
            if (err) throw err


            bonjour.publish({ name: 'My Web Server 2', type: 'http', port: 3000 })
            let ip = ""

// browse for all http services
            console.log(request.url);
            console.log('Find:', 'Test')
            let browser =  bonjour.find({type: 'http'}, function (service) {
                console.log('Found an HTTP server:', service)
                ip = service.referer.address + ":" + service.port;
                data = data.replace('{{nom}}', service.name)

            });
            //console.log('salut');
            response.writeHead(200, {'Content-type': 'text/html; charset=utf8'})

            console.log('Wait:', "Oui")
            data= data.replace('{{nom}}',browser.services.referer)
            response.end(data)

        })

    }

})

server2.listen(8083)