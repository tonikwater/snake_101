# snake_multiplayer

**Credits**

Big thanks to Web Dev Simplified for his snake game tutorial and to Hussein Nasser for his websocket multiplayer game tutorial !

This knowledge allowed me to create this project. Enjoy !

## Description

A server running a local multiplayer browser snake game. Players connect to the website and control the snake alternately. If the snake eats the food, the game switches to the next player. The player who bites himself looses, all others win.

## Run

**1. Install Node.js**

**2. Init project, install modules and start server**

```
$ npm init -y
$ npm i express ws
$ node server.js
```

**3. Connect to website**

On server machine:

`http://localhost:9091`

On other machines:

`http://<server_machine_ip>:9091`

## Note

Because the game makes use of browsers local storage, opening the game multiple times concurrently on one machine will only work with different browsers.

## Options

Changes to be made for different game behaviour.

**Max. players**

Default: `3`.

Defines the possible maximum of players participating at once in the game.

In `server.js`:
```
const MAX_PLAYERS = newInteger;
```

**Snake speed**

Default: `3`.

Defines how many cells per second the snake moves.

In `snake_server/options.js`:
```
const SNAKE_SPEED = newInteger;
```

**Grow length**

Default: `3`.

Defines the number of cells the snake grows, when eating the food.

In `snake_server/options.js`:
```
const GROW_LEN = newInteger;
```

**Grid barrier**

Default: `false`.

If `false`, running into some wall, causes the snake to continue on the opposite side.

If `true`, running into some wall, lets the game end.

In `snake_server/options.js`:
```
const GRID_BARRIER = newBoolean;
```

**Snake skins**

Default: `cell_9.png`.

Change the look of the website and the game.

1. Overview of all skins in `client_game/skins/skins.png`.

2. Copy CSS Variables from `client_game/skins/skins.txt` from favorite skin.

3. Replace them in `client_game/game.css` and `client_login/login.css`.

4. In `client_game/game.css` change the background image of `#game_board` to corresponding cell png from `client_game/skins`.

**Grid size**

Default: `25`.

Defines the number of cells in width and height on the game board.

In `snake_server/options.js`:
```
const GRID_SIZE = newInteger;
```
In `client_game/game.css`:
```
background-size: (100/newInteger)% (100/newInteger)%;
grid-template-rows: repeat(newInteger, 1fr);
grid-template-columns: repeat(newInteger, 1fr);
```
