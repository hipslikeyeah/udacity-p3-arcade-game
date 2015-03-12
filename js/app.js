// ************************************
// **              ENEMY             **
// ************************************

var Enemy = function() {
    // Set image
    this.sprite = 'images/enemy-bug.png';

    // Set speed and position
    this.reset();
}

// update enemy location
// check if enemy is off screen or collided with player
// runs each game loop
Enemy.prototype.update = function(dt) {
    this.x += this.speed*dt;
    if (this.x > 600) this.reset();
    this.checkCollision();
}

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// reset enemy when it moves off the screen
Enemy.prototype.reset = function() {
    this.x = -110;
    // place in random row (1-3)
    this.setY(Math.floor(Math.random() * 3));
    // set random speed from 150 - 550
    this.speed = Math.floor(Math.random() * (400)) + 150;
}

// set y position based on row number
// each row position corresponds to a row of pavement
Enemy.prototype.setY = function(row) {
    switch(row) {
        case 0: this.y = 65; break;
        case 1: this.y = 145; break;
        case 2: this.y = 225; break;
    }
}

// return an object representing which cell the enemy is currently in
Enemy.prototype.getCell = function() {
    var cellX = this.x / 100 | 0;
    var cellY;

    switch (this.y) {
        case 65: cellY = 1; break;
        case 145: cellY = 2; break;
        case 225: cellY = 3; break;
    }

    return {x: cellX, y: cellY};
}

// get current cell of enemy and player
// if they are in the same cell, player loses
Enemy.prototype.checkCollision = function() {
    pCell = player.getCell();
    eCell = this.getCell();

    if (pCell.x === eCell.x && pCell.y === eCell.y) {
        player.doLose();
    }
}

// ************************************
// **             PLAYER             **
// ************************************

var Player = function() {
    // set player score
    this.score = {
        wins: 0,
        losses: 0
    };

    // set win status
    this.win = false;

    // Set image
    this.sprite = 'images/char-boy.png';

    // Set location and speed
    this.reset();
}

// check if player won
// runs each game loop
Player.prototype.update = function(dt) {
    if (this.y === -10) {
        this.doWin();
    }
}

// handles player movement
// called on keypress
Player.prototype.handleInput = function(key) {
    // check if this will move player out of bounds
    if (!this.checkMove(key)) return false;

    // if move is valid, do it
    if (key === 'left'){
        this.x -= 101;
    }
    else if (key === 'right'){
        this.x += 101;
    }
    else if (key === 'up'){
        this.y -= 83;
        //console.log(this.y);
    }
    else if (key === 'down'){
        this.y += 83;
    }
}

// Draw the player on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// reset player to starting position
// set win status to false
Player.prototype.reset = function() {
    this.x = 202;
    this.y = 405;
    this.win = false;
}

// update the scoreboard with player scores
// called on score chage (game win or loss)
Player.prototype.updateScore = function() {
    $('#wins').text(this.score.wins);
    $('#losses').text(this.score.losses);
}

// return an object representing which cell the player is currently in
Player.prototype.getCell = function() {
    var cellY, cellX;

    // determine cell.x based on possible x positions
    switch (this.x) {
        case 0: cellX = 0; break;
        case 101: cellX = 1; break;
        case 202: cellX = 2; break;
        case 303: cellX = 3; break;
        case 404: cellX = 4; break;
    }

    // determine cell.y based on possible y positions
    switch (this.y) {
        case -10: cellY = 0; break;
        case 73: cellY = 1; break;
        case 156: cellY = 2; break;
        case 239: cellY = 3; break;
        case 322: cellY = 4; break;
        case 405: cellY = 5; break;
    }

    return {x: cellX, y: cellY};
}

// reset player location and update win count
// called each time player reaches water
Player.prototype.doWin = function() {
    // if player has not handled win
    if (!this.win) {
        // fix for variable scope of this
        var that = this;

        // wait before reseting player to show user feedback
        // (player appears in water for 400ms)
        setTimeout( function() {
            that.reset();
            that.score.wins++;
            that.updateScore();
        }, 400);
    }

    // reset win status
    this.win = true;
}

// reset player and update loss count
// called each time enemy collides with player
Player.prototype.doLose = function() {
    this.reset();
    this.score.losses++;
    this.updateScore();
}

// check if intended move is valid
// based on player position, intended move, and canvas bounds
// dir: intended direction
Player.prototype.checkMove = function(dir) {
    // if player is at edge of canvas, return false
    switch(dir) {
        case 'left': if (this.x === 0) return false; break;
        case 'right': if (this.x === 404) return false; break;
        case 'up': if (this.y === -10) return false; break;
        case 'down': if (this.y === 405) return false; break;
    }

    // return true if no error found
    return true;
}

// ************************************
// **       GAME INSTANTIATION       **
// ************************************

var allEnemies = [];
var player = new Player();
var currentEnemies = 0;
var totalEnemies = 3;

// elements for scoreboard, reset button, and enemy controls
// to be appended after canvas creation
var scores = $('<div id="scores">WIN: <span id="wins">0</span>  LOSS: <span id="losses">0</span></div>');
var resetButton = $('<button id="reset">RESET</button>');
var enemyControls = $('<div id="enemy-controls">Enemies: <button id="enemy-minus">-</button><span id="enemy-num">3</span><button id="enemy-plus">+</button></div>');

// create enemies
makeEnemies();

// make enemies until total desired is reached
function makeEnemies() {
    while (currentEnemies < totalEnemies){
        allEnemies.push(new Enemy());
        currentEnemies++;
    }
}

// remove an enemy
function removeEnemy() {
    totalEnemies--;
    currentEnemies--;
    allEnemies.pop();
}


// ************************************
// **            LISTENERS           **
// ************************************

// reset game when reset button is pressed
$('body').on('click', '#reset', function(){
    // reset player
    player.score.wins = 0;
    player.score.losses = 0;
    player.updateScore();
    player.reset();

    // if more than 3 enemies, remove until there are 3
    if (totalEnemies > 3) {
        while (totalEnemies > 3) {
            removeEnemy();
        }
    }
    // of less than 3 enemies, add until there are 3
    else if (totalEnemies < 3) {
        totalEnemies = 3;
        makeEnemies();
    }

    // update enemy controls
    $('#enemy-num').text(totalEnemies);
});

// add an enemy when user clicks enemy plus button
$('body').on('click', '#enemy-plus', function(){
    totalEnemies++;
    makeEnemies();
    $('#enemy-num').text(totalEnemies);
});

// remove an enemy when user clicks enemy minus button
$('body').on('click', '#enemy-minus', function(){
    if (totalEnemies > 1){
        removeEnemy();
        $('#enemy-num').text(totalEnemies);
    }
});

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});