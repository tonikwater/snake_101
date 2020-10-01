
// npm modules

const express = require("express");
const app = express();
const WebSocket = require("ws");
const bodyParser = require("body-parser");

// local imports 

const { snakeIntersection, updateSnake, posOnSnake, resetSnakePos, resetInputDirection } = require("./snake_server/snake.js");
const { updateFood, resetFoodPos } = require("./snake_server/food.js");
const { outsideGrid }  = require("./snake_server/grid.js");
const { SNAKE_SPEED, GRID_BARRIER, GROW_LEN }  = require("./snake_server/options.js");

// variables

// PORT is set in server.js login.js script.js
const PORT = 9090;
const wss = new WebSocket.Server({ port : PORT });
let payLoad = null;
const MAX_PLAYERS = 3;
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
let participating = null;

// serve html page
// add skins, add music + sound, input: allow change/render

app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use("/client_login", express.static("./client_login/"));
app.use("/client_game", express.static("./client_game/"));

app.listen(PORT+1, () => console.log(`(server) listening on http port ${PORT+1}`));

app.get("/", (req, res) => {
    console.log("(server) sending login.html");
    res.sendFile(`${__dirname}/login.html`)
});

app.post("/submit_login", (req, res) => {
    let username = req.body.username;
    console.log(`(server) login from: ${username}`);
    newPlayerId = pseudoRandomId++;
    allPlayers[newPlayerId] = {
        username: username,
        score: 0
    };
    res.redirect("/client_game/game.html"); 
});

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
                    console.log(`(server) refused input from: ${result.playerId}`);
                }
                break;
            case "connect":
                let username = result.username;  
                console.log(`(server) connect from: ${username}`);
                playerCount++;
                // start game
                if(!gameRunning){
                    gameRunning = true;
                    updateSnakeGame(); // trigger once
                    console.log("(server) starting game");
                }
                let playerId = null; 
                // reverse search: playerId for username
                // because user dont know his playerId yet
                Object.keys(allPlayers).forEach(key => {
                    if(allPlayers[key].username == username){
                        playerId = key;
                    }
                });
                payLoad = {
                    type: "connect",
                    playerId: playerId, 
                    allPlayers: allPlayers,
                    growLen: GROW_LEN
                };
                ws.send(JSON.stringify(payLoad));
                // inform others about new player
                payLoad = {
                    type: "join",
                    newPlayerId: playerId,
                    newUsername: username 
                };
                connections.forEach(client => {
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
                if(restartCount < participating) return;
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

// main game functions 

function updateSnakeGame(){

    if(gameOver){
        console.log("(server) GAME OVER !");
        let payLoad = {
            type: "over",
            currentPlayerId: currentPlayerId
        };
        participating = connections.length;
        connections.forEach(client => {
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
        nextPlayerId = getNextPlayerId(currentPlayerId); 
    }
    checkAlive();
}

function getNextPlayerId(currentPlayerId){
    return currentPlayerId == playerCount-1 ? 0 : currentPlayerId+1;
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
