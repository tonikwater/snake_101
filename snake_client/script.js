
// local import

import { setInputDirection } from "./input.js";

// variables

export const ws = new WebSocket("ws://localhost:9090");
const gameBoard = document.getElementById("game_board");
const playerTurn = document.getElementById("player_turn");
const players = document.getElementById("players");
export let playerId = localStorage.getItem("playerId");
let currentPlayerId = null;
let allPlayers = null; // { id : username } 

// client websocket

ws.onopen = function(e){
    let payLoad = {
        "type" : "connect",
        "playerId" : playerId
    };
    ws.send(JSON.stringify(payLoad));
    console.log("(client) initialized ws connection");
}

ws.onmessage = function(msg){
    const result = JSON.parse(msg.data);
    switch(result.type){
        case "new":
            console.log("(client) drawing");
            let snakeBody = result.snakeBody;
            let food = result.food;
            // EXPORT THIS VAR TO INPUT TO NOT SEND WHEN !=
            currentPlayerId = result.currentPlayerId;
            let ateFood = result.ateFood;
            if(ateFood){
                // allows correct possible move directions after player switch
                setInputDirection(result.inputDirection);
            }
            // TRY LOOPING OVER CHILDS
            gameBoard.innerHTML = "";
            drawSnake(snakeBody);
            drawFood(food);
            drawPlayerTurn(allPlayers[currentPlayerId]);
            break;
        case "connect":
            console.log("(client) you connected : "+playerId);
            allPlayers = result.allPlayers;
            Object.values(allPlayers).forEach(value => drawPlayerId(value));
            subscribeBroadcast();
            break;
        case "join":
            console.log("(client) someone joined");
            let newUsername = result.newUsername;
            drawPlayerId(newUsername);
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

function subscribeBroadcast(){
    let payLoad = {
        "type" : "ready",
        "playerId" : playerId
    };
    ws.send(JSON.stringify(payLoad));
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
    playerTurn.textContent = currentPlayerId;
}

function drawPlayerId(pId){
    let td = document.createElement("td");
    td.textContent =  pId;
    players.appendChild(td);
}
