
const username = document.getElementById("username"); 
const form = document.getElementById("form");
// websocket ip depends on host ip
// PORT is set in server.js login.js script.js
const ws = new WebSocket(`ws://${document.location.hostname}:9090`);
let playerId = null;


$( "#dialog" ).dialog();

form.addEventListener("submit", (e) => {
    e.preventDefault(); // dont load some page
    let valid = true;
    //
    // * some validation logic *
    //
    if(valid){
        sendInput();
    }
});

function sendInput(){
    let payLoad = {
        "type" : "login",
        "username" : username.value
    };
    if(ws.readyState == 1){
        ws.send(JSON.stringify(payLoad));
        console.log(`(client) sending username: ${username.value}`);
    }else{
        alert("Failed to submit username");
    }
}

ws.onmessage = function(msg){
    const result = JSON.parse(msg.data);
    switch(result.type){
        case "login":
            playerId = result.playerId;
            localStorage.setItem("playerId", playerId);
            console.log(`(client) received playerId: ${playerId}`);
            break;
    }
}
