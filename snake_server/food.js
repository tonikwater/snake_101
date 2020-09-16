
const { posOnSnake, expandSnake }  =  require("./snake.js");
const { randomGridPos } = require("./grid.js");
const { GROW_LEN } =  require("./options.js");

let food = randomGridPos();

function updateFood(food){
    if(posOnSnake(food)){   // ate food?
        expandSnake(GROW_LEN); // increase growth
        do{
            food = randomGridPos(); 
        }while(posOnSnake(food));  // find new random food pos != snake pos's
    }
    return food;
}

module.exports = { food, updateFood };
