
// local import

import { setInputDirection } from "./input.js";

// variables

export let ws = new WebSocket("ws://localhost:9090");
const gameBoard = document.getElementById("game-board");
const playerTurn = document.getElementById("player-turn");
export let playerId = null;
let currentPlayerId = null;

// client websocket

ws.onopen = function(e){
    ws.send(JSON.stringify({
        "type" : "connect"
    }));
    console.log("(client) initialized ws connection");
}

ws.onmessage = function(msg){
    const result = JSON.parse(msg.data);
    switch(result.type){
        case "new":
            console.log("(client) drawing");
            let snakeBody = result.snakeBody;
            let food = result.food;
            currentPlayerId = result.currentPlayerId;
            let ateFood = result.ateFood;
            if(ateFood){
                // allows correct possible move directions after player switch
                setInputDirection(result.inputDirection);
            }
            gameBoard.innerHTML = "";
            drawSnake(snakeBody);
            drawFood(food);
            drawPlayerTurn(currentPlayerId);
            break;
        case "connect":
            console.log("(client) connected");
            playerId = result.playerId;
            break;
        case "over":
            console.log("(client) GAME OVER!");
            currentPlayerId = result.currentPlayerId;
            let msg = null; 
            if(currentPlayerId != playerId){
                msg = "CONGRATS! YOU WON!";
            }else{
                msg = "GAME OVER! MAYBE NEXT TIME ...";
            }
            alert(msg);
            break;
    }
}

// draw functions

function drawSnake(snakeBody){
    snakeBody.forEach(part =>{
        const snakeElem = document.createElement("div"); // create html elem
        snakeElem.style.gridColumnStart = part.x; // set x pos
        snakeElem.style.gridRowStart = part.y; // set y pos
        snakeElem.classList.add("snake"); // add to elem to snake class
        gameBoard.appendChild(snakeElem); // make this div elem child of the div game-board
    });
}

function drawFood(foodPos){
    const foodElem = document.createElement("div"); // create html elem
    foodElem.style.gridColumnStart = foodPos.x; // set x pos
    foodElem.style.gridRowStart = foodPos.y; // set y pos
    foodElem.classList.add("food"); // add to elem to snake class
    gameBoard.appendChild(foodElem); // make this div elem child of the div game-board
}

function drawPlayerTurn(currentPlayerId){
    playerTurn.innerHTML = currentPlayerId;
}
