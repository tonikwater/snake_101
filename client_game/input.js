
import { ws, getPlayerId } from "./script.js";

let inputDirection = {x: 0, y: 0};

export function setInputDirection(newInputDirection){
    inputDirection = newInputDirection;
}

window.addEventListener("keydown", e => {
    console.log("(client) keydown");
    switch(e.key){
        case "ArrowUp":
            console.log("(client) keydown UP");
            if(inputDirection.y != 0) return;
            transmitKeyInput({x: 0, y: -1});
            break;
        case "ArrowDown":
            console.log("(client) keydown DOWN");
            if(inputDirection.y != 0) return;
            transmitKeyInput({x: 0, y: 1});
            break;
        case "ArrowLeft":
            console.log("(client) keydown LEFT");
            if(inputDirection.x != 0) return;
            transmitKeyInput({x: -1, y: 0});
            break;
        case "ArrowRight":
            console.log("(client) keydown RIGHT");
            if(inputDirection.x != 0) return;
            transmitKeyInput({x: 1, y: 0});
            break;
    }
});

function transmitKeyInput(direction){
    console.log("(client) transmitting input");
    let payLoad = {
        type: "key",
        playerId: getPlayerId(),
        input: direction
    };
    ws.send(JSON.stringify(payLoad));
}
