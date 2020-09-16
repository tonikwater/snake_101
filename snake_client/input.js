
import { ws } from "./script.js";

let inputDirection = {x:0, y:0};

export function initInput (){ console.log("Hello World!"); }

window.addEventListener("keydown", e => {
    console.log("(client) keydown");
    switch(e.key){
        case "ArrowUp":
            if(inputDirection.y != 0) break;
            inputDirection = {x:0, y:-1};
            transmitKeyInput(inputDirection);
            break;
        case "ArrowDown":
            if(inputDirection.y != 0) break;
            inputDirection = {x:0, y:1};
            transmitKeyInput(inputDirection);
            break;
        case "ArrowLeft":
            if(inputDirection.x != 0) break;
            inputDirection = {x:-1, y:0};
            transmitKeyInput(inputDirection);
            break;
        case "ArrowRight":
            if(inputDirection.x != 0) break;
            inputDirection = {x:1, y:0};
            transmitKeyInput(inputDirection);
            break;
    }
});

function transmitKeyInput(direction){
    let payLoad = {
        "type" : "key",
        "input" : direction
    };
    ws.send(JSON.stringify(payLoad));
}
