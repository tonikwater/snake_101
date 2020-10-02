
// local import

import { setInputDirection } from "./input.js";

// variables

// websocket ip depends on host ip
// PORT is set in server.js login.js script.js
export const ws = new WebSocket(`ws://${document.location.hostname}:9090`);
const gameBoard = $("#game_board");
const username = localStorage.getItem("username");
let playerId = null;
let currentPlayerId = null;
let allPlayers = null; // {id: {username: "", score: 0}}
// prevents from cheating when inputing more than 1 key per render
// at 1st set to valid move, then to move which is possible from this move
// but not the one before => move gets rendered which is illegal
// in terms of the game rules
let snakeLen = 1;
let growLen = null;

export function getPlayerId(){
    return playerId;
}

// play audio

const audioElem = $("<audio></audio>");
audioElem.prop("src", "sounds/spongebob.mp3");
audioElem.prop("autoplay", true);
audioElem.prop("loop", true);

// client websocket

ws.onopen = function(e){
    const payLoad = {
        type: "connect",
        username: username 
    };
    ws.send(JSON.stringify(payLoad));
    console.log("(client) initialized ws connection");
}

ws.onmessage = function(msg){
    const result = JSON.parse(msg.data);
    switch(result.type){
        case "new":
            console.log("(client) drawing");
            setInputDirection(result.inputDirection);
            const snakeBody = result.snakeBody;
            const food = result.food;
            currentPlayerId = result.currentPlayerId;
            let ateFood = result.ateFood;
            gameBoard.text("");
            if(ateFood){
                // allows correct possible move directions after player switch
                snakeLen += growLen;
                new Audio("sounds/grow.mp3").play();
            }
            drawSnake(snakeBody);
            drawFood(food);
            drawPlayerTurn(currentPlayerId);
            drawSnakeLen(snakeLen); 
            break;
        case "connect":
            playerId = result.playerId;
            console.log(`(client) you connected: ${playerId}`);
            allPlayers = result.allPlayers;
            growLen = result.growLen;
            Object.entries(allPlayers).forEach(([id, info]) => {
                drawPlayerId(id, info.username)
                drawScoreElem(id);
            });
            subscribeBroadcast();
            break;
        case "join":
            console.log("(client) someone joined");
            let newPlayerId = result.newPlayerId;
            if(allPlayers[newPlayerId] === undefined){
                let newUsername = result.newUsername;
                allPlayers[newPlayerId] = {
                    username: newUsername,
                    score: 0
                };
                drawPlayerId(newPlayerId, newUsername);
                drawScoreElem(newPlayerId);
            }
            break;
        case "over":
            console.log("(client) GAME OVER!");
            currentPlayerId = result.currentPlayerId;
            let title = null;
            let msg = null; 
            let audio = null;
            if(currentPlayerId != playerId){
                title = `CONGRATS, ${allPlayers[playerId].username} !`;
                msg = "You won !";
                audio = "sounds/win.mp3";
                console.log("(client) winner");
            }else{
                title = `GAME OVER, ${allPlayers[playerId].username} !`;
                msg = "Maybe next time !";
                audio = "sounds/loose.mp3";
                console.log("(client) looser");
            }
            const buttons = {
                    "Play again" : function(){
                        console.log("(client) play again");
                        let payLoad = {
                            type: "restart"
                        };
                        ws.send(JSON.stringify(payLoad));
                        $(this).dialog("close");
                    },
                    "Cancel" : function(){
                        console.log("(client) stop playing");
                        $(this).dialog("close");
                    }
            }
            new Audio(audio).play();
            $("#restart_content").text(msg);
            $("#restart_dialog").dialog({
                title: title,
                resizable: false,
                height: "auto", // adjust based on content
                width: 500,
                modal: true, // disable other items
                buttons: buttons 
            });
            drawScoreValue(currentPlayerId);
            setInputDirection({x: 0, y: 0});
            snakeLen = 1;
            break;
    }
}

function subscribeBroadcast(){
    const payLoad = {
        type: "ready",
        playerId: playerId
    };
    ws.send(JSON.stringify(payLoad));
}

// draw functions

drawSnakeLen(snakeLen);

function drawSnake(snakeBody){
    snakeBody.forEach(part =>{
        const snakeElem = $("<div></div>"); // create html elem
        snakeElem.css({"grid-column-start": part.x, "grid-row-start": part.y});
        snakeElem.prop("class", "snake"); // add to snake class
        gameBoard.append(snakeElem); // make this div elem child of the div game-board
    });
}

function drawFood(foodPos){
    const foodElem = $("<div></div>"); // create html elem
    foodElem.css({"grid-column-start": foodPos.x, "grid-row-start": foodPos.y});
    foodElem.prop("class", "food"); // add to food class
    gameBoard.append(foodElem); // make this div elem child of the div game-board
}

function drawPlayerId(id, username){
    const td = $("<td></td>");
    td.prop("class", "mytext");
    td.prop("id", `p_${id}`);
    td.text(username);
    $("#players").append(td);
}

function drawPlayerTurn(currentPlayerId){
    let value = null;
    Object.keys(allPlayers).forEach(playerId => {
        if(playerId == currentPlayerId){
            value = "0.1vmin dashed var(--main-highlight)";
        }else{
            value = "initial";
        }
        $(`#p_${playerId}`).css("border", value);
    });
}

function drawScoreElem(id){
    const td = $("<td></td>");
    td.prop("class", "mytext");
    td.prop("id", `s_${id}`);
    td.text(allPlayers[id].score);
    $("#scores").append(td);
}

function drawScoreValue(looserId){
    Object.keys(allPlayers).forEach(playerId => {
        if(playerId != looserId){
            $(`#s_${playerId}`).text(++allPlayers[playerId].score);
        }
    });
}

function drawSnakeLen(len){
    $("#snake_len").text(len);
}
