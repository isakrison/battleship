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
	cellStatus = {
		unknown : 1,
		primaryTarget : 2,
		secondaryTarget : 3,
		possibleShip : 4,
		miss : 5,
		hit : 6,
		sunk : 7,
		clear : 8
	}
	
	monitor = document.createElement("table");
	monitor.id = "monitor";
	monitor.style = "border:solid;border-color:black;border-width:2px;";
	var tableRow, tableCell, status;
	cells = [];
	for (i = 0; i < 10; i++) {
		cells[i] = [];
		tableRow = document.createElement("tr");
		monitor.appendChild(tableRow);
		
		for (j = 0; j < 10; j++) {
			
			tableCell = document.createElement("td");
			tableCell.id = "row" + i + "_column" + j;
			tableCell.style = "height:30px;width:30px;background-color:gray;";
			status = cellStatus.unknown;

			if ((i + j) % 4 == 0) {
				status = cellStatus.primaryTarget;
				tableCell.style.backgroundColor = "blue";
			}else{			
				if ((i + j) % 2 == 0) {
					status = cellStatus.secondaryTarget;
					tableCell.style.backgroundColor = "lightblue";
				}
			}
			tableRow.appendChild(tableCell);
			
			cells[i].push({
				row : i,
				column : j,
				status : status
			});
		}
	}
	document.body.appendChild(monitor);
	
	// ~~~~~~~~~~~~~~~~~~~~~~~~~
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
	
	this.getRandomInt = function (min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
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
	alert("cells[" + coords.y + "][" + coords.x + "].status = " + cells[coords.y][coords.x].status);
    var result = this.player.shoot(coords.x, coords.y);
    //result is one of Cell.<type> so that you can re-shoot if necessary. (e.g. you are shooting someplace you already shot)
};

/**
 * [called at the conclusion of each game]
 */
CandidateAI.prototype.endGame = function() {

};