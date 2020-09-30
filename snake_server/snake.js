
const { randomGridPos, outsideGrid } = require("./grid.js");
const { GRID_SIZE, GRID_BARRIER } = require("./options.js");

let remaining_growth = 0;

function resetInputDirection(){
    return {x: 0, y: 0};
}

function resetSnakePos(){
    return [randomGridPos()];
}

function updateSnake(snakeBody, inputDirection){

    // let snake grow
    snakeGrow(snakeBody);

    // move everything behind the head
    for(let i = snakeBody.length-1; i >= 1; i--){
        // syntax for assigning objects: i'th obj to i-1'th obj
        snakeBody[i] = Object.assign({}, snakeBody[i-1]);
    }

    // let snake move
    let head = snakeBody[0];
    head.x += inputDirection.x;
    head.y += inputDirection.y;

    // continue snake on opposite side if overlap
    if(!GRID_BARRIER && outsideGrid(head)){
        if(head.x < 1){
            head.x = GRID_SIZE; 
        }else if(head.x > GRID_SIZE){
            head.x = 1;
        }else if(head.y < 1){
            head.y = GRID_SIZE;
        }else if(head.y > GRID_SIZE){
            head.y = 1;
        }
    }

    return snakeBody;
}

function expandSnake(amount){
    remaining_growth += amount;
}

function posOnSnake(snakeBody, pos, {ignoreHead=false}={}){
    // if some body coordinates match the food coordinates,
    // it means that the snake ate the food with his mouth.
    // Because the not mouth parts are following the head,
    // its not possible that the snake accidently eats with
    // his body. Where the not mouth parts are,
    // the snake already has been to.
    return snakeBody.some((part, index) =>{
        if(ignoreHead && index == 0) return false;
        return part.x == pos.x && part.y == pos.y;
    });
}

function snakeIntersection(snakeBody){
    return posOnSnake(snakeBody, snakeBody[0], {ignoreHead: true});
}

function snakeGrow(snakeBody){
    for(let i = 0; i < remaining_growth; i++){
        snakeBody.push(snakeBody[snakeBody.length-1]);
    }
    remaining_growth = 0;
}

module.exports = { snakeIntersection, updateSnake, posOnSnake, expandSnake, resetSnakePos, resetInputDirection };
