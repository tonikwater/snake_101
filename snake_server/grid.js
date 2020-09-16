
const { GRID_SIZE } = require("./options.js");

function randomGridPos(){
    return {
        x: Math.floor(Math.random()*GRID_SIZE)+1,
        y: Math.floor(Math.random()*GRID_SIZE)+1,
    }
}

function outsideGrid(pos){
    return(
        pos.x < 1 || pos.x > GRID_SIZE ||
        pos.y < 1 || pos.y > GRID_SIZE
    );
}

module.exports = { outsideGrid, randomGridPos };
