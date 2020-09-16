
// local import

import { initInput } from "./input.js";

// variables

export let ws = new WebSocket("ws://localhost:9090");
const gameBoard = document.getElementById("game-board");

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
            gameBoard.innerHTML = "";
            drawSnake(gameBoard, snakeBody);
            drawFood(gameBoard, food);
            break;
        case "over":
            console.log("(client) GAME OVER!");
            let msg = "GAME OVER!";
            alert(msg); 
            break;
    }
}

// draw functions

function drawSnake(gameBoard, snakeBody){
    snakeBody.forEach(part =>{
        const snakeElem = document.createElement("div"); // create html elem
        snakeElem.style.gridColumnStart = part.x; // set x pos
        snakeElem.style.gridRowStart = part.y; // set y pos
        snakeElem.classList.add("snake"); // add to elem to snake class
        gameBoard.appendChild(snakeElem); // make this div elem child of the div game-board
    });
}

function drawFood(gameBoard, foodPos){
    const foodElem = document.createElement("div"); // create html elem
    foodElem.style.gridColumnStart = foodPos.x; // set x pos
    foodElem.style.gridRowStart = foodPos.y; // set y pos
    foodElem.classList.add("food"); // add to elem to snake class
    gameBoard.appendChild(foodElem); // make this div elem child of the div game-board
}
