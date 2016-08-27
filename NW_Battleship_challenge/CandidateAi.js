/**
 * [constructor function for a CandidateAI object. A new instance of your AI is created for each game.]
 * @param {Object} player [your player instance]
 */
function CandidateAI (player) {
    this.player = player;
}

/**
 * []
 */
CandidateAI.prototype.initializeSimulation = function() {

};

/**
 * [initializes a CandidateAI instance.]
 */
CandidateAI.prototype.initializeGame = function() {
    var x = -1, y = 0;
    this.getNextCoord = function() {
        if (++x > 9) {
            x = 0;
            ++y;
        }
        return {
            x: x,
            y: y
        };
    }
};

/**
 * [called before each game. This is where you must place your ships.]
 */
CandidateAI.prototype.startGame = function() {
    this.player.grid.dockShip(0, 0, Ship.VERTICAL, Fleet.CARRIER);
    this.player.grid.dockShip(1, 0, Ship.VERTICAL, Fleet.BATTLESHIP);
    this.player.grid.dockShip(2, 0, Ship.VERTICAL, Fleet.DESTROYER);
    this.player.grid.dockShip(3, 0, Ship.VERTICAL, Fleet.SUBMARINE);
    this.player.grid.dockShip(4, 0, Ship.VERTICAL, Fleet.PATROLBOAT);
};

/**
 * [called each time it is your turn to shoot]
 */
CandidateAI.prototype.shoot = function() {
    var coords = this.getNextCoord();
    var result = this.player.shoot(coords.x, coords.y);
    //result is one of Cell.<type> so that you can re-shoot if necessary. (e.g. you are shooting someplace you already shot)
};

/**
 * [called at the conclusion of each game]
 */
CandidateAI.prototype.endGame = function() {

};