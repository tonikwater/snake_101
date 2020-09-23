
// local import

import { setInputDirection } from "./input.js";

// variables

// websocket ip depends on host ip
// PORT is set in server.js login.js script.js
export const ws = new WebSocket(`ws://${document.location.hostname}:9090`);
const gameBoard = document.getElementById("game_board");
const playerTurn = document.getElementById("player_turn");
const players = document.getElementById("players");
export let playerId = localStorage.getItem("playerId");
let currentPlayerId = null;
let allPlayers = null; // { id : username }
// prevents from cheating when inputing more than 1 key per render
// at 1st set to valid move, then to move which is possible from this move
// but not the one before => move gets rendered which is illegal
// in terms of the game rules
let allowMove = false;

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
            allowMove = true;
            let snakeBody = result.snakeBody;
            let food = result.food;
            currentPlayerId = result.currentPlayerId;
            let ateFood = result.ateFood;
            do{
                let temp = gameBoard.firstChild;
                if(temp != null && temp.className != "food"){
                    gameBoard.removeChild(temp);
                }
            }while(gameBoard.firstChild);
            if(ateFood){
                // allows correct possible move directions after player switch
                console.log("drawing food");
                setInputDirection(result.inputDirection);
                drawFood(food);
            }
            drawSnake(snakeBody);
            drawPlayerTurn(allPlayers[currentPlayerId]);
            break;
        case "connect":
            console.log(`(client) you connected: ${playerId}`);
            allPlayers = result.allPlayers;
            Object.values(allPlayers).forEach(value => drawPlayerId(value));
            subscribeBroadcast();
            break;
        case "join":
            console.log("(client) someone joined");
            let newPlayerId = result.newPlayerId;
            let newUsername = result.newUsername;
            allPlayers[newPlayerId] = newUsername;
            drawPlayerId(newUsername);
            break;
        case "over":
            console.log("(client) GAME OVER!");
            currentPlayerId = result.currentPlayerId;
            let msg = null; 
            if(currentPlayerId != playerId){
                msg = `CONGRATS, ${allPlayers[playerId]} ! You won !`;
            }else{
                msg = `GAME OVER, ${allPlayers[playerId]} ! Maybe next time !`; 
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

export function getAllowMove(){
    return allowMove;
}

export function setAllowMove(newAllowMove){
    allowMove = newAllowMove;
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
    td.classList.add("mytext");
    players.appendChild(td);
}
