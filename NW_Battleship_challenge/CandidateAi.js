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

	// ~~~~~~~~~~~~~~~~~~~~~~~~~~
	// function getFiringSolution
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~
	x = -1;
	y = -1;
    this.getFiringSolution = function() {
		
		this.getPossibleShipLocations();
		
		var primaryTargetCount = 0;
		var secondaryTargetCount = 0;
		var hitCount = 0;
		var cell;
		
		for (i = 0; i < cells.length; i++) {
			for (j = 0; j < cells.length; j++) {
				cell = cells[i][j];
				switch (parseInt(cell.status)) {
					case cellStatus.primaryTarget:
						primaryTargetCount++;
						break;
					case cellStatus.secondaryTarget:
						secondaryTargetCount++;
						break;
					case cellStatus.hit:
						hitCount++;
						break;
					default:
						break;
				}				
			}
		}
	
		var targetCellList = [];
		
		if (hitCount > 0) {			
			// analyze hits and return coords
			for (i = 0; i < cells.length; i++) {
				for (j = 0; j < cells.length; j++) {
					cell = cells[i][j];
					if(cell.status == cellStatus.hit) {
						targetCellList.push(cell);
						// return this.attemptToSink(targetCellList);
					}
				}
			}			
		}
		
		if ((enemyShips[0].sunk && enemyShips[1].sunk && (enemyShips[2].sunk || enemyShips[3].sunk)) || primaryTargetCount < 5) { // this is arbitrary
			for (i = 0; i < cells.length; i++) {
				for (j = 0; j < cells.length; j++) {
					cell = cells[i][j];
					if(cell.status == cellStatus.primaryTarget || cell.status = cellStatus.secondaryTarget) {
						targetCellList.push(cell);
						// return this.chooseTarget(targetCellList);
					}
				}
			}
		}

		for (i = 0; i < cells.length; i++) {
			for (j = 0; j < cells.length; j++) {
				cell = cells[i][j];
				if(cell.status == cellStatus.primaryTarget) {
					targetCellList.push(cell);
					// return this.chooseTarget(targetCellList);
				}
			}
		}
		
		// placeholder code:	
		x++;
		if (x > 9){
			x = 0;
			y++;
		}
			
		return ({x:x, y:y});
		// end placeholder code		
    } // end function getFiringSolution
	
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
	
	// function attemptToSink
	this.attemptToSink = function(targetCellList) {
		var firstCell = targetCellList[0];
		var lastCell = targetCellList[1];
		
		if (targetCellList.length == 1) {
			var x = firstCell.x;
			var y = firstCell.y;
			
			// check the (up to) four adjacent cells
			if (this.isValidShot(x, y - 1) {
				return {x: x, y: y - 1};
			}
			if (this.isValidShot(x + 1, y) {
				return {x: x + 1, y: y};
			}
			if (this.isValidShot(x, y+1) {
				return {x: x, y: y + 1};
			}
			if (this.isValidShot(x-1, y){
				return {x: x - 1, y: y};
			}
		}
		
		// horizontal first
		if (firstCell.y == lastCell.y) {
			// check left end
			if (this.isValidShot(firstCell.x - 1, firstCell.y) {
				return {x: firstCell.x - 1, firstCell.y};
			}
			//check right end
			while (cells[lastCell.x + 1][lastCell.y].status == cellStatus.hit) {
				lastCell = cells[lastCell.x + 1][lastCell.y];
			}			
			if (this.isValidShot(lastCell.x + 1, lastCell.y) {
				return {x: lastCell.x + 1, lastCell.y};
			}
			
			// if we get here, then ships are broadside, so check along the other axis
			do {
				lastCell = firstCell;
				// check top end
				if (this.isValidShot(firstCell.x, firstCell.y - 1) {
					return {x: firstCell.x, firstCell.y - 1};
				}
				// check bottom end
				while (cells[lastCell.x][lastCell.y + 1].status == cellStatus.hit) {
					lastCell = cells[lastCell.x][lastCell.y + 1];
				}
				if (this.isValidShot(lastCell.x, lastCell.y + 1) {
					return {x: lastCell.x, lastCell.y + 1};
				}
				// if we still haven't found a valid shot, move to the right along the original line
				firstCell = cells[firstCell.x + 1][firstCell.y];
			} while (firstCell.status == cellStatus.hit);
		} else {		
			// vertical first
			// check top end
			if (this.isValidShot(firstCell.x, firstCell.y - 1) {
				return {x: firstCell.x, firstCell.y - 1};
			}
			//check bottom end
			while (cells[lastCell.x][lastCell.y + 1].status == cellStatus.hit) {
				lastCell = cells[lastCell.x][lastCell.y + 1];
			}			
			if (this.isValidShot(lastCell.x, lastCell.y + 1) {
				return {x: lastCell.x, lastCell.y + 1};
			}
			
			// if we get here, then ships are broadside, so check along the other axis
			do {
				lastCell = firstCell;
				// check right end
				if (this.isValidShot(firstCell.x - 1, firstCell.y) {
					return {x: firstCell.x - 1, firstCell.y};
				}
				// check left end
				while (cells[lastCell.x + 1][lastCell.y].status == cellStatus.hit) {
					lastCell = cells[lastCell.x + 1][lastCell.y];
				}
				if (this.isValidShot(lastCell.x + 1, lastCell.y) {
					return {x: lastCell.x + 1, lastCell.y};
				}
				// if we still haven't found a valid shot, move down along the original line
				firstCell = cells[firstCell.x + 1][firstCell.y];
			} while (firstCell.status == cellStatus.hit);
		}
		// if we haven't returned yet, something's wrong
	} // end function attemptToSink
	
	// ~~~~~~~~~~~~~~~~~~~~~
	// function chooseTarget
	// ~~~~~~~~~~~~~~~~~~~~~
	this.chooseTarget = function(targetCellList) {
		var targetCell;
		var highestWeight = 0;
		var cell, ship;
		var cellX, cellY;
		var above, below, left, right;
		var locations = 0;
		var status;
		for (i = 0; i < targetCellList.length; i++) {
			above = 0;
			below = 0;
			left = 0;
			right = 0;
			cell = targetCellList[i];
			cellX = cell.x;
			cellY = cell.y;
			// find empty cells above
			for (k = 1; k <= 4; k++) {
				if (!this.isValidShot(cellX, cellY-k)) {
					break;
				}
				above++;
			}
			// find empty cells below
			for (k = 1; k <= 4; k++) {
				if (!this.isValidShot(cellX, cellY+k)) {
					break;
				}
				below++;
			}
			// find empty cells to the left
			for (k = 1; k <= 4; k++) {
				if (!this.isValidShot(cellX-k, cellY)) {
					break;
				}
				left++;
			}
			// find empty cells to the right
			for (k = 1; k <= 4; k++) {
				if (!this.isValidShot(cellX+k, cellY)) {
					break;
				}
				right++;
			}
			
			// find the probability that any unsunk enemy ship is in this cell
			for (s = 0; s < enemyShips.length; s++) {
				ship = enemyShips[s];
				if (!ship.sunk) {
					cell.weight += Math.max(0, (Math.max(above, ship.size - 1) + Math.max(below, ship.size - 1) - (ship.size - 2))) / ship.possibleLocations;
				}
			}
			
			cell.weight = Math.round(cell.weight * 1000) / 1000;
			if (cell.weight == 0) {
				cell.status = cellStatus.clear;
			}
			if (cell.weight > highestWeight) {
				targetCell = cell;
				highestWeight = cell.weight;
			}
		}
		
		return ({x : targetCell.x, y : targetCell.y});
	} // end function chooseTarget
	
	// ~~~~~~~~~~~~~~~~~~~~
	// function isValidShot
	// ~~~~~~~~~~~~~~~~~~~~
	this.isValidShot = function(x, y) {
		return x > 0 && x < 10 && y > 0 && y < 10
			&& !(
				cells[x][y].status == cellStatus.hit
				|| cells[x][y].status == cellStatus.miss
				|| cells[x][y].status == cellStatus.sunk
				|| cells[x][y].status == cellStatus.clear
			);
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
	//alert("got here: shoot");
    var solution = this.getFiringSolution();
    var result = this.player.shoot(solution.x, solution.y);
    //result is one of Cell.<type> so that you can re-shoot if necessary. (e.g. you are shooting someplace you already shot)
	switch (parseInt(result.state)) {
		case Cell.TYPE_MISS:
			cells[solution.x][solution.y].status = cellStatus.miss;
			break;
		case Cell.TYPE_HIT:
			cells[solution.x][solution.y].status = cellStatus.hit;
			break;
		case Cell.TYPE_SUNK:
			// handle sunk ship - pass in result
			break;
		default:
			break;
	}
};

/**
 * [called at the conclusion of each game]
 */
CandidateAI.prototype.endGame = function() {

};