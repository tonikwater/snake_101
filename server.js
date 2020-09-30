
// npm modules

const express = require("express");
const app = express();
const WebSocket = require("ws");

// local imports 

const { snakeIntersection, updateSnake, posOnSnake, resetSnakePos, resetInputDirection } = require("./snake_server/snake.js");
const { updateFood, resetFoodPos } = require("./snake_server/food.js");
const { outsideGrid }  = require("./snake_server/grid.js");
const { SNAKE_SPEED, GRID_BARRIER, GROW_LEN }  = require("./snake_server/options.js");
const snake = require("./snake_server/snake.js");

// variables

// PORT is set in server.js login.js script.js
const PORT = 9090;
const wss = new WebSocket.Server({ port : PORT });
let payLoad = null;
const MAX_PLAYERS = 2;
let inputDirection = resetInputDirection();
let snakeBody = resetSnakePos();
let food = resetFoodPos(snakeBody);
let gameRunning = false;
let gameOver = false;
let ateFood = false;
let playerCount = 0;
let restartCount = 0;
let pseudoRandomId = 0;
let allPlayers = {};
let currentPlayerId = 0;
// to ensure that player's won't overwrite others input
// before drawing that input
let nextPlayerId = 0;
let newPlayerId = null;
let connections = [];

// serve html page

app.listen(PORT+1, () => console.log(`(server) listening on http port ${PORT+1}`));
app.get("/", (req, res) => res.sendFile(`${__dirname}/login.html`));
app.use("/client_login", express.static("./client_login/"));
app.use("/client_game", express.static("./client_game/"));

// server websocket 

wss.on("connection", function connection(ws, req){
    console.log("(server) connection");
    if(playerCount == MAX_PLAYERS){
        console.log("(server) refused connection");
        ws.terminate();
    }
    ws.on("message", function incoming(msg){
        const result = JSON.parse(msg);
        switch(result.type){
            case "key":
                console.log(`(server) client input from: ${result.playerId}`);
                if(currentPlayerId == result.playerId){
                    inputDirection = result.input;
                }else{
                    console.log("(server) refused input");
                }
                break;
            case "login":
                console.log(`(server) login from: ${result.username}`);
                newPlayerId = pseudoRandomId++;
                allPlayers[newPlayerId] = {
                    username: result.username,
                    score: 0
                };
                payLoad = {
                    type: "login",
                    playerId: newPlayerId,
                };
                ws.send(JSON.stringify(payLoad));
                ws.terminate();
                break;
            case "connect":
                console.log(`(server) connect from: ${allPlayers[result.playerId].username}`);
                playerCount++;
                // start game
                if(!gameRunning){
                    gameRunning = true;
                    updateSnakeGame(); // trigger once
                    // DEBUGG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    setTimeout(overToDebug, 5000);
                    console.log("(server) starting game");
                }
                payLoad = {
                    type: "connect",
                    allPlayers: allPlayers,
                    growLen: GROW_LEN
                };
                ws.send(JSON.stringify(payLoad));
                // inform others about new player
                newPlayerId = result.playerId;
                let newUsername = allPlayers[newPlayerId].username;
                payLoad = {
                    type: "join",
                    newPlayerId: newPlayerId,
                    newUsername: newUsername 
                };
                wss.clients.forEach(client => {
                    if(client !== ws){
                        client.send(JSON.stringify(payLoad));
                    }
                });
                break;
            case "ready":
                console.log("(server) ready");
                connections.push(ws);
                break;
            case "restart":
                console.log("(server) restart request");
                restartCount++;
                if(restartCount < MAX_PLAYERS) return;
                console.log("(server) restarting");
                restartCount = 0;
                gameOver = false;
                inputDirection = resetInputDirection(); 
                snakeBody = resetSnakePos();
                food = resetFoodPos(snakeBody);
                updateSnakeGame();
                break;
        }
    });
});

function overToDebug(){
    gameOver = true;
}

// main game functions 

function updateSnakeGame(){

    if(gameOver){
        console.log("(server) GAME OVER !");
        let payLoad = {
            type: "over",
            currentPlayerId: currentPlayerId
        };
        wss.clients.forEach(client => {
            client.send(JSON.stringify(payLoad));
        });
        return;
    }

    update(); // update server side
    broadcastGame(); // broadcast game state
    ateFood = false;
    currentPlayerId = nextPlayerId;

    setTimeout(updateSnakeGame, 1000/SNAKE_SPEED);
}

function update(){
    console.log("(server) update");
    snakeBody = updateSnake(snakeBody, inputDirection);
    if(posOnSnake(snakeBody, food)){
        // player switch happens
        food = updateFood(snakeBody);
        ateFood = true;
        nextPlayerId = currentPlayerId == 0 ? 1 : 0;
    }
    checkAlive();
}

function broadcastGame(){
    console.log("(server) broadcast");
    let payLoad = {
        type: "new",
        snakeBody: snakeBody,
        food: food,
        currentPlayerId: currentPlayerId,
        inputDirection: inputDirection,
        ateFood: ateFood 
    };
    connections.forEach(client => {
        client.send(JSON.stringify(payLoad));
    });
}

function checkAlive(){
    if(GRID_BARRIER){
        gameOver = outsideGrid(snakeBody[0]) || snakeIntersection();
    }else{
        gameOver = snakeIntersection(snakeBody);
    }
}
