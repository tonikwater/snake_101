
// npm modules

const express = require("express");
const app = express();
const WebSocket = require("ws");

// local imports 

const { snakeBody, snakeIntersection, updateSnake, posOnSnake } = require("./snake_server/snake.js");
let { inputDirection } = require("./snake_server/snake.js");
const { updateFood } = require("./snake_server/food.js");
let { food } = require("./snake_server/food.js");
const { outsideGrid }  = require("./snake_server/grid.js");
const { SNAKE_SPEED, GRID_BARRIER }  = require("./snake_server/options.js");

// variables

const PORT = 9090;
const wss = new WebSocket.Server({port : PORT});
const MAX_PLAYERS = 2;
let gameRunning = false;
let gameOver = false;
let ateFood = false;
let clientCount = 0;
let currentPlayerId = 0;
// to ensure that player's won't overwrite others input, before drawing that input
let nextPlayerId = 0;

// serve html page

app.listen(PORT+1, () => console.log(`listening on http port ${PORT+1}`));
app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`));
app.use("/snake_client", express.static("./snake_client/"));

// server websocket 

wss.on("connection", function connection(ws, req){
    console.log("(server) connection");
    if(clientCount == MAX_PLAYERS){
        console.log("(server) refused connection");
        ws.terminate();
    }
    ws.on("message", function incoming(msg){
        const result = JSON.parse(msg);
        switch(result.type){
            case "key":
                console.log("(server) client input from "+result.playerId);
                if(currentPlayerId == result.playerId){
                    inputDirection = result.input;
                }else{
                    console.log("(server) refused input");
                }
                break;
            case "connect":
                //console.log("(server) new client");
                //start game
                if(!gameRunning){
                    gameRunning = true;
                    updateSnakeGame();
                    console.log("(server) starting game");
                }
                let payLoad = {
                    "type" : "connect",
                    "playerId" : clientCount++
                };
                ws.send(JSON.stringify(payLoad));
                break;
        }
    });
});

// main game functions 

function updateSnakeGame(){

    if(gameOver){
        //console.log("(server) GAME OVER!");
        let payLoad = {
            "type" : "over",
            "currentPlayerId" : currentPlayerId
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

    //console.log(`current: ${currentPlayerId} next: ${nextPlayerId}`);

    setTimeout(updateSnakeGame, 1000/SNAKE_SPEED);
}

function update(){
    //console.log("(server) update");
    updateSnake(inputDirection);
    if(posOnSnake(food)){
        // player switch happens
        food = updateFood(food);
        ateFood = true;
        nextPlayerId = currentPlayerId == 0 ? 1 : 0;
    }
    checkAlive();
}

function broadcastGame(){
    //console.log("(server) broadcast");
    let payLoad = {
        "type" : "new",
        "snakeBody" : snakeBody,
        "food" : food,
        "currentPlayerId" : currentPlayerId,
        "inputDirection" : inputDirection,
        "ateFood" : ateFood 
    };
    wss.clients.forEach(client => {
        client.send(JSON.stringify(payLoad));
    });
}

function checkAlive(){
    if(GRID_BARRIER){
        gameOver = outsideGrid(snakeBody[0]) || snakeIntersection();
    }else{
        gameOver = snakeIntersection();
    }
}
