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
	
	cells = [];
	enemyShips = [];
	
	// initialize cells and set initial status
	for (i = 0; i < 10; i++) {
		cells[i] = [];		
		for (j = 0; j < 10; j++) {			

			status = cellStatus.unknown;			

			if ((i + j) % 4 == 0) {
				status = cellStatus.primaryTarget;
			}else{			
				if ((i + j) % 2 == 0) {
					status = cellStatus.secondaryTarget;
				}
			}
			
			cells[i].push({
				x : i,
				y : j,
				status : status,
				weight : 0
			});
		}
	}
	
	// initialize enemy ships for tracking status
	enemyShips.push({
		type : "carrier",
		size : 5,
		possibleLocations : 0,
		sunk : false
	});	
	enemyShips.push({
		type : "battleship",
		size : 4,
		possibleLocations : 0,
		sunk : false
	});	
	enemyShips.push({
		type : "destroyer",
		size : 3,
		possibleLocations : 0,
		sunk : false
	});	
	enemyShips.push({
		type : "submarine",
		size : 3,
		possibleLocations : 0,
		sunk : false
	});	
	enemyShips.push({
		type : "patrolboat",
		size : 2,
		possibleLocations : 0,
		sunk : false
	});

	// ~~~~~~~~~~~~~~~~~~~~~
	// function getNextCoord
	// ~~~~~~~~~~~~~~~~~~~~~
	x = -1;
	y = -1;
    this.getNextCoord = function() {
	
		// or, instead of this mess, we could get probabilities for all primary and secondary target cells, and add 1 to primaries to weight them,
		// depending on what ships haven't been sunk yet
		
		this.getPossibleShipLocations();
		
		alert("Possible Carrier locations: " + enemyShips[0].possibleLocations);

		
			
		// placehoder code:	
		if (x == 9) {
			x = -1;
		}
		if (y == 9) {
			y = -1;
		}
		x++;
		y++;
		return ({x:x, y:y});
		// end placeholder
		
		// we'd handle hits and the cells surrounding them differently (or just assign them probability + 2)
			// or or... do the probability math for cells surrounding a hit, and just let the chips fall where they may? 
				// depends on what the actual probability turns out to be, I think
				// ...this is turning out not to be a small project :P
    } // end function getNextCoord
	
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// function getPossibleShipLocations
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	this.getPossibleShipLocations = function () {
		// get total possible locations remaining for each unsunk enemy ship
		var ship;
		var maxStartingX, maxStartingY;
		var possibleLocation;		
		for (n = 0; n < enemyShips.length; n++) {
			ship = enemyShips[n];
			if (!ship.sunk) {
				ship.possibleLocations = 0;
				maxStartingX = cells.length - ship.size + 1
				for (i = 0; i < maxStartingX; i++) {
					maxStartingY = cells[i].length - ship.size + 1;
					for (j = 0; j < maxStartingY; j++) {
						// check horizontal ship position at this cell
						possibleLocation = true;
						for (p = 0; p < ship.size; p++) {
							var currentStatus = cells[i+p][j].status;
							if (currentStatus == cellStatus.miss || currentStatus == cellStatus.sunk || currentStatus == cellStatus.clear) {
								possibleLocation = false;
								break;
							}
						}
						if (possibleLocation) {
							ship.possibleLocations++;
						}
						// check vertical ship position at this cell
						possibleLocation = true;
						for (p = 0; p < ship.size; p++) {
							var currentStatus = cells[i][j+p].status;
							if (currentStatus == cellStatus.miss || currentStatus == cellStatus.sunk || currentStatus == cellStatus.clear) {
								possibleLocation = false;
								break;
							}
						}
						if (possibleLocation) {
							ship.possibleLocations++;
						}
					}
				}
			}
		}	
	}	
	
	// ~~~~~~~~~~~~~~~~~~~~~
	// function getRandomInt
	// ~~~~~~~~~~~~~~~~~~~~~
	this.getRandomInt = function (min, max) {	
		return Math.floor(Math.random() * (max - min + 1)) + min;
	} // end function getRandomInt
	
	// ~~~~~~~~~~~~~~~~~~~~~~~~~
	// function outputGameStatus
	// ~~~~~~~~~~~~~~~~~~~~~~~~~
	// shamelessly stolen from battleship.js
	this.outputGameStatus = function () {		
		var shipTable = "";
		shipTable += "    0  1  2  3  4  5  6  7  8  9\n\n";
		for (var row = 0; row < 10; row++) {
			shipTable += row + "  ";
			for (var column = 0; column < 10; column++) {
				var ship = this.player.grid.getShipByCoord(row, column);
				var shipType = ship ? ship.type : "";
				switch (shipType) {
					case Fleet.BATTLESHIP:
						shipTable += " B ";
						break;
					case Fleet.CARRIER:
						shipTable += " C ";
						break;
					case Fleet.PATROLBOAT:
						shipTable += " P ";
						break;
					case Fleet.DESTROYER:
						shipTable += " D ";
						break;
					case Fleet.SUBMARINE:
						shipTable += " S ";
						break;
					default:
						shipTable += " - ";
						break;
				}
			}
			shipTable += "\n";
		}
		shipTable += "\n";
		
		var shotTable = "";
		shotTable += "    0  1  2  3  4  5  6  7  8  9\n\n";
		for (var row = 0; row < 10; row++) {
			shotTable += row + "  ";
			for (var column = 0; column < 10; column++) {
				var cell = cells[column][row];
				switch (parseInt(cell.status)) {
					case cellStatus.primaryTarget:
						shotTable += " 1 ";
						break;
					case cellStatus.secondaryTarget:
						shotTable += " 2 ";
						break;
					case cellStatus.possibleShip:
						shotTable += " P ";
						break;
					case cellStatus.hit:
						shotTable += " X ";
						break;
					case cellStatus.miss:
						shotTable += " 0 ";
						break;
					case cellStatus.sunk:
						shotTable += " S ";
						break;
					case cellStatus.unknown:
						shotTable += " ? ";
						break;
					default:
						shotTable += " - ";
						break;
				}
			}
			shotTable += "\n";
		}
		shotTable += "\n";
		
		console.log("Upper grid: \n");
		console.log(shotTable);
		console.log("Lower grid: \n");
		console.log(shipTable);
	} // end function outputGameStatus
};

/**
 * [called before each game. This is where you must place your ships.]
 */
CandidateAI.prototype.startGame = function() {
	var x, y, orientation;
	var tableCell;
	
	// dock Carrier
	do{
		orientation = this.getRandomInt(0, 1) == 0 ? Ship.HORIZONTAL : Ship.VERTICAL;
		if (orientation == Ship.HORIZONTAL) {
			x = this.getRandomInt(0, 5);
			y = this.getRandomInt(0, 9);			
		} else {
			x = this.getRandomInt(0, 9);
			y = this.getRandomInt(0, 5);
		}
	}
	while (! this.player.grid.dockShip(x, y, orientation, Fleet.CARRIER));	

	orientation = this.getRandomInt(0, 1) == 0 ? Ship.HORIZONTAL : Ship.VERTICAL;
	if (orientation == Ship.HORIZONTAL) {
		x = this.getRandomInt(0, 5);
		y = this.getRandomInt(0, 9);			
	} else {
		x = this.getRandomInt(0, 9);
		y = this.getRandomInt(0, 5);
	}
	this.player.grid.dockShip(x, y, orientation, Fleet.CARRIER);
	
	// dock Battleship
	do{
		orientation = this.getRandomInt(0, 1) == 0 ? Ship.HORIZONTAL : Ship.VERTICAL;
		if (orientation == Ship.HORIZONTAL) {
			x = this.getRandomInt(0, 6);
			y = this.getRandomInt(0, 9);			
		} else {
			x = this.getRandomInt(0, 9);
			y = this.getRandomInt(0, 6);
		}
	}
	while (! this.player.grid.dockShip(x, y, orientation, Fleet.BATTLESHIP));

	// dock Destroyer
	do{
		orientation = this.getRandomInt(0, 1) == 0 ? Ship.HORIZONTAL : Ship.VERTICAL;
		if (orientation == Ship.HORIZONTAL) {
			x = this.getRandomInt(0, 7);
			y = this.getRandomInt(0, 9);			
		} else {
			x = this.getRandomInt(0, 9);
			y = this.getRandomInt(0, 7);
		}
	}
	while (! this.player.grid.dockShip(x, y, orientation, Fleet.DESTROYER));
	
	// dock Submarine
	do{
		orientation = this.getRandomInt(0, 1) == 0 ? Ship.HORIZONTAL : Ship.VERTICAL;
		if (orientation == Ship.HORIZONTAL) {
			x = this.getRandomInt(0, 7);
			y = this.getRandomInt(0, 9);			
		} else {
			x = this.getRandomInt(0, 9);
			y = this.getRandomInt(0, 7);
		}
	}
	while (! this.player.grid.dockShip(x, y, orientation, Fleet.SUBMARINE));
	
	// dock Patrolboat
	do{
		orientation = this.getRandomInt(0, 1) == 0 ? Ship.HORIZONTAL : Ship.VERTICAL;
		if (orientation == Ship.HORIZONTAL) {
			x = this.getRandomInt(0, 8);
			y = this.getRandomInt(0, 9);			
		} else {
			x = this.getRandomInt(0, 9);
			y = this.getRandomInt(0, 8);
		}
	}
	while (! this.player.grid.dockShip(x, y, orientation, Fleet.PATROLBOAT));
	
	this.outputGameStatus();
};

/**
 * [called each time it is your turn to shoot]
 */
CandidateAI.prototype.shoot = function() {
	alert("got here: shoot");
    var coords = this.getNextCoord();
    var result = this.player.shoot(coords.x, coords.y);
    //result is one of Cell.<type> so that you can re-shoot if necessary. (e.g. you are shooting someplace you already shot)
};

/**
 * [called at the conclusion of each game]
 */
CandidateAI.prototype.endGame = function() {

};