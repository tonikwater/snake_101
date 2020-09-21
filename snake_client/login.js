
//import { ws, setPlayerId } from "./script.js";

const username = document.getElementById("username"); 
const form = document.getElementById("form");
const ws = new WebSocket("ws://localhost:9090");
let playerId = null;

form.addEventListener("submit", (e) => {

    let valid = true;

    //
    // * some validation logic *
    //
    
    if(valid){
        // actually we should allow to move to next page
        // but we need the script to finish
        // so we set the url via this script
        e.preventDefault();
        sendInput();
    }else{
        e.preventDefault(); // dont go to next page
    }
});

function sendInput(){
    console.log("sending username:"+username.value);
    let payLoad = {
        "type" : "login",
        "username" : username.value
    };
    //document.location.href = "http://127.0.0.1:9091/snake_client/game.html";
    ws.send(JSON.stringify(payLoad));
    console.log("send data via socket");
    //setTimeout(function(){}, 3000);
}

ws.onmessage = function(msg){
    const result = JSON.parse(msg.data);
    switch(result.type){
        case "login":
            playerId = result.playerId;
            console.log("received playerId:"+playerId);
            localStorage.setItem("playerId", playerId);
            ws.close();
            console.log("closed ws");
            break;
    }
}
