
const { posOnSnake, expandSnake }  =  require("./snake.js");
const { randomGridPos } = require("./grid.js");
const { GROW_LEN } =  require("./options.js");

function resetFoodPos(snakeBody){
    let foodPos = null;
    do{
        foodPos = randomGridPos(); 
    }while(posOnSnake(snakeBody, foodPos));  // find new random food pos != snake pos's
    return foodPos;
}

function updateFood(snakeBody){
    expandSnake(GROW_LEN); // increase growth
    return resetFoodPos(snakeBody); // return new food pos
}

module.exports = { updateFood, resetFoodPos };
