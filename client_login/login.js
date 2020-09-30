
const form = $("#myform");
const info = $("#myinfo");
const username = $("#username");
// websocket ip depends on host ip
// PORT is set in server.js login.js script.js
const ws = new WebSocket(`ws://${document.location.hostname}:9090`);
let sent = false;

form.submit(function(e){
    e.preventDefault(); // dont load some page
    let valid = true;
    //
    // * some validation logic *
    //
    if(valid && !sent){
        sendInput();
    }
});

function sendInput(){
    const payLoad = {
        type: "login",
        username: username.val()
    };
    if(ws.readyState == 1 && !sent){
        sent = true;
        ws.send(JSON.stringify(payLoad));
        showInfo("Waiting ...");
        console.log(`(client) sending username: ${username.val()}`);
    }else{
        showInfo("Failed to join");
    }
}

function showInfo(msg){
    info.css("color", "var(--main-highlight)");
    info.text(msg);
}

ws.onmessage = function(msg){
    const result = JSON.parse(msg.data);
    switch(result.type){
        case "login":
            const playerId = result.playerId;
            localStorage.setItem("playerId", playerId);
            window.location.pathname = "/client_game/game.html";
            console.log(`(client) received playerId: ${playerId}`);
            break;
    }
}
