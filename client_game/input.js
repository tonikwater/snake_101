
import { ws, getPlayerId, getAllowMove, setAllowMove } from "./script.js";

let inputDirection = {x: 0, y: 0};

export function setInputDirection(newInputDirection){
    inputDirection = newInputDirection;
}

window.addEventListener("keydown", e => {
    console.log("(client) keydown");
    if(getAllowMove() == false){
        console.log("(client) blocking");
        return;
    }
    switch(e.key){
        case "ArrowUp":
            console.log("(client) keydown UP");
            handleKeyInput("y", {x: 0, y: -1});
            break;
        case "ArrowDown":
            console.log("(client) keydown DOWN");
            handleKeyInput("y", {x: 0, y: 1});
            break;
        case "ArrowLeft":
            console.log("(client) keydown LEFT");
            handleKeyInput("x", {x: -1, y: 0});
            break;
        case "ArrowRight":
            console.log("(client) keydown RIGHT");
            handleKeyInput("x", {x: 1, y: 0});
            break;
    }
});

function handleKeyInput(axis, newInputDirection){
    if(inputDirection[axis] != 0) return;
    setAllowMove(false);
    inputDirection = newInputDirection; 
    transmitKeyInput(inputDirection);
}

function transmitKeyInput(direction){
    console.log("(client) transmitting input");
    let payLoad = {
        type: "key",
        playerId: getPlayerId(),
        input: direction
    };
    ws.send(JSON.stringify(payLoad));
}
