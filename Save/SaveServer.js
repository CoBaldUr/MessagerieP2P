




loadUser()














console.log("boot")


function loadUser(){
    for (var id in users){
        console.log("load User", id+" "+users[id])
        if (servicesUser[id]==undefined){
            users[id].connected = false
        }
        else{
            users[id].connected = true
        }
    }

}

























