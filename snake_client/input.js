
import { ws, playerId } from "./script.js";

let inputDirection = {x:0, y:0};

export function initInput (){ console.log("Hello World!"); }

export function setInputDirection(newInputDirection){
    inputDirection = newInputDirection;
}

window.addEventListener("keydown", e => {
    console.log("(client) keydown");
    switch(e.key){
        case "ArrowUp":
            if(inputDirection.y != 0) break;
            console.log("(client) keydown UP");
            inputDirection = {x:0, y:-1};
            transmitKeyInput(inputDirection);
            break;
        case "ArrowDown":
            if(inputDirection.y != 0) break;
            console.log("(client) keydown DOWN");
            inputDirection = {x:0, y:1};
            transmitKeyInput(inputDirection);
            break;
        case "ArrowLeft":
            if(inputDirection.x != 0) break;
            console.log("(client) keydown LEFT");
            inputDirection = {x:-1, y:0};
            transmitKeyInput(inputDirection);
            break;
        case "ArrowRight":
            if(inputDirection.x != 0) break;
            console.log("(client) keydown RIGHT");
            inputDirection = {x:1, y:0};
            transmitKeyInput(inputDirection);
            break;
    }
});

function transmitKeyInput(direction){
    console.log("SENDING FROM"+playerId+" IN "+direction);
    let payLoad = {
        "type" : "key",
        "playerId" : playerId,
        "input" : direction
    };
    ws.send(JSON.stringify(payLoad));
}
