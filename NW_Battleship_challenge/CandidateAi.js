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
		miss : 4,
		hit : 5,
		sunk : 6,
		clear : 7
	}
	
	myCells = [];
	enemyShips = [];
	
	// initialize cells and set initial status
	for (i = 0; i < 10; i++) {
		myCells[i] = [];		
		for (j = 0; j < 10; j++) {			

			status = cellStatus.unknown;			

			if ((i + j) % 4 == 0) {
				status = cellStatus.primaryTarget;
			}else{			
				if ((i + j) % 2 == 0) {
					status = cellStatus.secondaryTarget;
				}
			}
			
			myCells[i].push({
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
    this.getFiringSolution = function() {
		
		var primaryTargetCount = 0;
		var secondaryTargetCount = 0;
		var hitCount = 0;
		var cell;	
		var targetCellList = [];
		
		for (i = 0; i < myCells.length; i++) {
			for (j = 0; j < myCells[i].length; j++) {
				cell = myCells[i][j];
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
				}				
			}
		}
		
		if (hitCount > 0) {			
			// analyze hits and return coords
			for (i = 0; i < myCells.length; i++) {
				for (j = 0; j < myCells.length; j++) {
					cell = myCells[i][j];
					if(cell.status == cellStatus.hit) {
						targetCellList.push(cell);
					}
				}
			}
			//console.log("got here: getFiringSolution 1");
			return this.attemptToSink(targetCellList);			
		}
		
		this.getPossibleShipLocations();
		
		if ((enemyShips[0].sunk && enemyShips[1].sunk && (enemyShips[2].sunk || enemyShips[3].sunk)) || primaryTargetCount < 5) { // this is arbitrary
			for (i = 0; i < myCells.length; i++) {
				for (j = 0; j < myCells.length; j++) {
					cell = myCells[i][j];
					if(cell.status == cellStatus.primaryTarget || cell.status == cellStatus.secondaryTarget) {
						targetCellList.push(cell);
					}
				}
			}
			//console.log("got here: getFiringSolution 2");
			return this.chooseTarget(targetCellList);
		}

		for (i = 0; i < myCells.length; i++) {
			for (j = 0; j < myCells.length; j++) {
				cell = myCells[i][j];
				if(cell.status == cellStatus.primaryTarget) {
					targetCellList.push(cell);
				}
			}
		}
		//console.log("got here: getFiringSolution 3");
		return this.chooseTarget(targetCellList);	
    } // end function getFiringSolution
	
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// function getPossibleShipLocations
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	this.getPossibleShipLocations = function () {
		// get total possible locations remaining for each unsunk enemy ship
		// this could be made more efficient, to make fewer isValidShot checks:
			// go first row by row, then column by column
			// after each position check, skip ahead to the square after the one we just checked, since we already know the status of the others
			// be mindful of the math required
		var ship, cell;
		var maxStartingX, maxStartingY;
		var possibleLocation;		
		for (n = 0; n < enemyShips.length; n++) {
			ship = enemyShips[n];
			if (!ship.sunk) {
				ship.possibleLocations = 0;
				maxStartingX = myCells.length - ship.size + 1
				for (i = 0; i < maxStartingX; i++) {
					maxStartingY = myCells[i].length - ship.size + 1;
					for (j = 0; j < maxStartingY; j++) {
						// check horizontal ship position at this cell
						possibleLocation = true;
						for (p = 0; p < ship.size; p++) {
							cell = myCells[i + p][j];
							if(cell.status == cellStatus.miss || cell.status == cellStatus.sunk || cell.status == cellStatus.clear) {
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
							cell = myCells[i][j + p];
							if(cell.status == cellStatus.miss || cell.status == cellStatus.sunk || cell.status == cellStatus.clear) {
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
	// function chooseTarget
	// ~~~~~~~~~~~~~~~~~~~~~
	this.chooseTarget = function(targetCellList) {
		var targetCandidates = [targetCellList[0]];
		var targetCell;
		var randomIndex;
		var thresholdWeight = 0;
		var cell, ship;
		var cellX, cellY;
		var empties;
		var above, below, left, right;
		var locations = 0;
		var status;
		for (i = 0; i < targetCellList.length; i++) {
			cell = targetCellList[i];
			empties = this.getSurroundingEmptyCells(cell, cell);
			above = empties.above;
			below = empties.below;
			left = empties.left;
			right = empties.right;
			cell.weight = 0;
			
			// find the probability that any unsunk enemy ship is in this cell
			for (s = 0; s < enemyShips.length; s++) {
				ship = enemyShips[s];
				if (!ship.sunk) {
					cell.weight += (Math.max(0, (Math.min(above, ship.size - 1) + Math.min(below, ship.size - 1) - (ship.size - 2)))
						+ Math.max(0, (Math.min(left, ship.size - 1) + Math.min(right, ship.size - 1) - (ship.size - 2))))
						/ ship.possibleLocations;
				}
			}
			
			cell.weight = Math.round(cell.weight * 1000) / 1000;
			if (cell.weight == 0) {
				cell.status = cellStatus.clear;
			}
			
			// maintain a running list of the top three (maximum) highest-weighted cells, with ties broken randomly
			if (cell.weight >= thresholdWeight) {
				thresholdWeight = cell.weight;
				for (p = 0; p < Math.min(targetCandidates.length, 3); p++) {
					if (cell.weight > targetCandidates[p].weight) {
						for (q = targetCandidates.length; q > p; q--) {
							if (q < 3) {
								targetCandidates[q] = targetCandidates[q - 1];
							}
						}
						targetCandidates[p] = cell;
						break;
					} else if (cell.weight == targetCandidates[p].weight && this.getRandomInt(0, 1) == 1) {
						for (q = targetCandidates.length; q > p; q--) {
							if (q < 5) {
								targetCandidates[q] = targetCandidates[q - 1];
							}
						}
						targetCandidates[p] = cell;
						break;
					}
				}
			}
		}
		
		targetCell = targetCandidates[this.getRandomInt(0, targetCandidates.length - 1)];
		
		//console.log("got here: chooseTarget 1");
		return ({x : targetCell.x, y : targetCell.y});
	} // end function chooseTarget
	
	// ~~~~~~~~~~~~~~~~~~~~~~
	// function attemptToSink
	// ~~~~~~~~~~~~~~~~~~~~~~
	this.attemptToSink = function(targetCellList) {
		var firstCell = targetCellList[0];
		var lastCell = targetCellList[1];
		
		var empties;
		var above, below, left, right;
		var aboveWeight, belowWeight, leftWeight, rightWeight;
			
		var x = firstCell.x;
		var y = firstCell.y;
		var highestWeight = 0;
		var returnX, returnY;
		
		if (targetCellList.length == 1) {
			empties = this.getSurroundingEmptyCells(firstCell, firstCell);
			above = empties.above;
			below = empties.below;
			left = empties.left;
			right = empties.right;
			
			if (this.isValidShot(x, y - 1)) {			
				aboveWeight = this.getWeightForHitFollowup("above", above, below, 1);
				highestWeight = aboveWeight;
				returnX = x;
				returnY = y - 1;
			}
			if (this.isValidShot(x, y + 1)) {
				belowWeight = this.getWeightForHitFollowup("below", above, below, 1);
				if (belowWeight > highestWeight) {
					highestWeight = belowWeight;
					returnX = x;
					returnY = y + 1;
				}
			}
			if (this.isValidShot(x - 1, y)) {
				leftWeight = this.getWeightForHitFollowup("left", left, right, 1);
				if (leftWeight > highestWeight) {
					highestWeight = leftWeight;
					returnX = x - 1;
					returnY = y;
				}
			}
			if (this.isValidShot(x + 1, y)) {
				rightWeight = this.getWeightForHitFollowup("right", left, right, 1);
				if (rightWeight > highestWeight) {
					returnX = x + 1;
					returnY = y;
				}
			}
			
			//console.log("got here: attemptToSink 1");
			return {x: returnX, y: returnY};
		}
		
		// if hits are in a horizontal line
		if (firstCell.y == lastCell.y) {
			while (lastCell.x < myCells.length - 1 && myCells[lastCell.x + 1][lastCell.y].status == cellStatus.hit) {
				lastCell = myCells[lastCell.x + 1][lastCell.y];
			}
			
			if (this.isValidShot(firstCell.x - 1, firstCell.y) && this.isValidShot(lastCell.x + 1, lastCell.y))
			{
				empties = this.getSurroundingEmptyCells(firstCell, lastCell);
				left = empties.left;
				right = empties.right;
				leftWeight = this.getWeightForHitFollowup("left", left, right, targetCellList.length);
				rightWeight = this.getWeightForHitFollowup("right", left, right, targetCellList.length);
				
				if (Math.max(leftWeight, rightWeight) == leftWeight) {
					//console.log("got here: attemptToSink 2");
					return {x: firstCell.x - 1, y: firstCell.y};
				} else {
					//console.log("got here: attemptToSink 3");
					return {x: lastCell.x + 1, y: lastCell.y};
				}
			} else if (this.isValidShot(firstCell.x - 1, firstCell.y)) {
				//console.log("got here: attemptToSink 4");
				return {x: firstCell.x - 1, y: firstCell.y};
			} else if (this.isValidShot(lastCell.x + 1, lastCell.y)) {
				//console.log("got here: attemptToSink 5");
				return {x: lastCell.x + 1, y: lastCell.y};
			}
			
			// if we get here, then ships are broadside, so check along the other axis
			lastCell = firstCell;
			while (lastCell.y < myCells[0].length - 1 && myCells[lastCell.x][lastCell.y + 1].status == cellStatus.hit) {
				lastCell = myCells[lastCell.x][lastCell.y + 1];
			}
			
			if (this.isValidShot(firstCell.x, firstCell.y - 1) && this.isValidShot(lastCell.x, lastCell.y + 1)) {
				empties = this.getSurroundingEmptyCells(firstCell, lastCell);
				above = empties.above;
				below = empties.below;
				aboveWeight = this.getWeightForHitFollowup("above", above, below, targetCellList.length);
				belowWeight = this.getWeightForHitFollowup("below", above, below, targetCellList.length);
				
				if (Math.max(aboveWeight, belowWeight) == aboveWeight) {
					//console.log("got here: attemptToSink 6");
					return {x: firstCell.x, y: firstCell.y - 1};
				} else {
					//console.log("got here: attemptToSink 7");
					return {x: lastCell.x, y: lastCell.y + 1};
				}
			} else if (this.isValidShot(firstCell.x, firstCell.y - 1)) {
				//console.log("got here: attemptToSink 8");
				return {x: firstCell.x, y: firstCell.y - 1};
			} else if (this.isValidShot(lastCell.x, lastCell.y + 1)) {
				//console.log("got here: attemptToSink 9");
				return {x: lastCell.x, y: lastCell.y + 1};
			}
		} else { // hits are in a vertical line
			while (lastCell.y < myCells[0].length - 1 && myCells[lastCell.x][lastCell.y + 1].status == cellStatus.hit) {
				lastCell = myCells[lastCell.x][lastCell.y + 1];
			}
			
			if (this.isValidShot(firstCell.x, firstCell.y - 1) && this.isValidShot(lastCell.x, lastCell.y + 1))
			{
				empties = this.getSurroundingEmptyCells(firstCell, lastCell);
				above = empties.above;
				below = empties.below;
				aboveWeight = this.getWeightForHitFollowup("above", above, below, targetCellList.length);
				belowWeight = this.getWeightForHitFollowup("below", above, below, targetCellList.length);
				
				if (Math.max(aboveWeight, belowWeight) == aboveWeight) {
					//console.log("got here: attemptToSink 10");
					return {x: firstCell.x, y: firstCell.y - 1};
				} else {
					//console.log("got here: attemptToSink 11");
					return {x: lastCell.x, y: lastCell.y + 1};
				}
			} else if (this.isValidShot(firstCell.x, firstCell.y - 1)) {
				//console.log("got here: attemptToSink 12");
				return {x: firstCell.x, y: firstCell.y - 1};
			} else if (this.isValidShot(lastCell.x, lastCell.y + 1)) {
				//console.log("got here: attemptToSink 13");
				return {x: lastCell.x, y: lastCell.y + 1};
			}
			
			// if we get here, then ships are broadside, so check along the other axis
			lastCell = firstCell;
			while (lastCell.x < myCells.length  - 1 && myCells[lastCell.x + 1][lastCell.y].status == cellStatus.hit) {
				lastCell = myCells[lastCell.x + 1][lastCell.y];
			}
			
			if (this.isValidShot(firstCell.x - 1, firstCell.y) && this.isValidShot(lastCell.x + 1, lastCell.y)) {
				empties = this.getSurroundingEmptyCells(firstCell, lastCell);
				left = empties.left;
				right = empties.right;
				leftWeight = this.getWeightForHitFollowup("left", left, right, targetCellList.length);
				rightWeight = this.getWeightForHitFollowup("right", left, right, targetCellList.length);
				
				if (Math.max(leftWeight, rightWeight) == leftWeight) {
					//console.log("got here: attemptToSink 14");
					return {x: firstCell.x - 1, y: firstCell.y};
				} else {
					//console.log("got here: attemptToSink 15");
					return {x: lastCell.x + 1, y: lastCell.y};
				}
			} else if (this.isValidShot(firstCell.x - 1, firstCell.y)) {
				//console.log("got here: attemptToSink 16");
				return {x: firstCell.x - 1, y: firstCell.y};
			} else if (this.isValidShot(lastCell.x + 1, lastCell.y)) {
				//console.log("got here: attemptToSink 17");
				return {x: lastCell.x + 1, y: lastCell.y};
			}
		}
		// if we haven't returned yet, something's wrong
		//console.log("We got here somehow");
	} // end function attemptToSink
	
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// function getSurroundingEmptyCells
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	this.getSurroundingEmptyCells = function(head, tail) {
		var cellX, cellY;
		var directions = {
			nil : 0,
			horizontal : 1,
			vertical : 2
		};
		var direction;
		var diff;
		var myAbove = 0;
		var myBelow = 0;
		var myLeft = 0;
		var myRight = 0;
		
		if (tail.x - head.x > 0) {
			direction = directions.horizontal;
			diff = tail.x - head.x;
		} else if (tail.y - head.y > 0) {
			direction = directions.vertical;
			diff = tail.y - head.y;
		} else {
			direction = directions.nil;
			diff = 0;
		}
		
		cellX = head.x;
		cellY = head.y;
		
		// find empty cells above
		if (direction == directions.vertical || direction == directions.nil) {
			for (k = diff + 1; k <= 4; k++) {
				if (!this.isValidShot(cellX, cellY - k)) {
					break;
				}
				myAbove++;
			}
		}
		// find empty cells below
		if (direction == directions.vertical || direction == directions.nil) {
			for (k = diff + 1; k <= 4; k++) {
				if (!this.isValidShot(cellX, cellY + k)) {
					break;
				}
				myBelow++;
			}
		}
		// find empty cells to the left
		if (direction == directions.horizontal || direction == directions.nil) {
			for (k = diff + 1; k <= 4; k++) {
				if (!this.isValidShot(cellX - k, cellY)) {
					break;
				}
				myLeft++;
			}
		}
		// find empty cells to the right
		if (direction == directions.horizontal || direction == directions.nil) {
			for (k = diff + 1; k <= 4; k++) {
				if (!this.isValidShot(cellX + k, cellY)) {
					break;
				}
				myRight++;
			}
		}
		
		return {above: myAbove, below: myBelow, left: myLeft, right: myRight};
	}
	
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// function getWeightForHitFollowup
	// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	this.getWeightForHitFollowup = function(direction, leadCells, trailCells, hits) {
		// if ships are end-to-end, it's possible for a cell to return a lower-than-actual weight - that's ok; it'll work itself out eventually
		var ship;
		var totalWeight = 0;
		
		if (direction == "above" || direction == "left") {
			if (leadCells == 0) {
				return -1;
			}
			for (i = 0; i < enemyShips.length; i++) {
				ship = enemyShips[i];
				if (!ship.sunk) {
					// in brief:
					// available space = available positions leadward + hits + (available positions trailward - 1)
					// total positions = "wiggle room" = available space - ship size + 1
					totalWeight += Math.min(ship.size - hits, leadCells) + hits + Math.min(ship.size - hits - 1, trailCells) - ship.size + 1;
				}
			}
		} else {
			if (trailCells == 0) {
				return -1;
			}
			for (i = 0; i < enemyShips.length; i++) {
				ship = enemyShips[i];
				if (!ship.sunk) {
					// same as above, only with leadward and trailward swapped
					totalWeight += Math.min(ship.size - hits, trailCells) + hits + Math.min(ship.size - hits - 1, leadCells) - ship.size + 1;
				}
			}
		}
	
		return totalWeight;
	}
	
	// ~~~~~~~~~~~~~~~~~~~~
	// function isValidShot
	// ~~~~~~~~~~~~~~~~~~~~
	this.isValidShot = function(x, y) {
		return x >= 0 && x < 10 && y >= 0 && y < 10
			&& !(
				myCells[x][y].status == cellStatus.hit
				|| myCells[x][y].status == cellStatus.miss
				|| myCells[x][y].status == cellStatus.sunk
				|| myCells[x][y].status == cellStatus.clear
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
		var shotTable = "";
		var row, column;
		var cell;
		var ship;
		var shipType;
		/*
		shipTable += "    0  1  2  3  4  5  6  7  8  9\n\n";
		for (row = 0; row < 10; row++) {
			shipTable += row + "  ";
			for (column = 0; column < 10; column++) {
				ship = this.player.grid.getShipByCoord(row, column);
				shipType = ship ? ship.type : "";
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
		*/
		
		shotTable += "    0  1  2  3  4  5  6  7  8  9\n\n";
		for (row = 0; row < 10; row++) {
			shotTable += row + "  ";
			for (column = 0; column < 10; column++) {
				cell = myCells[column][row];
				switch (parseInt(cell.status)) {
					case cellStatus.primaryTarget:
						shotTable += " ~ ";
						break;
					case cellStatus.secondaryTarget:
						shotTable += " ~ ";
						break;
					case cellStatus.hit:
						shotTable += " H ";
						break;
					case cellStatus.miss:
						shotTable += " O ";
						break;
					case cellStatus.sunk:
						shotTable += " X ";
						break;
					case cellStatus.unknown:
						shotTable += " ~ ";
						break;
					case cellStatus.clear:
						shotTable += " - ";
						break
					default:
						shotTable += " ~ ";
						break;
				}
			}
			shotTable += "\n";
		}
		shotTable += "\n";
		
		//console.log("Upper grid: \n");
		//console.log(shotTable);
		////console.log("Lower grid: \n");
		////console.log(shipTable);
	} // end function outputGameStatus
};

/**
 * [called before each game. This is where you must place your ships.]
 */
CandidateAI.prototype.startGame = function() {
	var x, y, orientation;
	
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
	
	// this.outputGameStatus();
};

/**
 * [called each time it is your turn to shoot]
 */
CandidateAI.prototype.shoot = function() {		
    var solution = this.getFiringSolution();	
    var result = this.player.shoot(solution.x, solution.y);
	var ship;
	
    //result is one of Cell.<type> so that you can re-shoot if necessary. (e.g. you are shooting someplace you already shot)
	switch (parseInt(result.state)) {
		case Cell.TYPE_MISS:
			myCells[solution.x][solution.y].status = cellStatus.miss;
			break;
		case Cell.TYPE_HIT:
			myCells[solution.x][solution.y].status = cellStatus.hit;
			break;
		case Cell.TYPE_SUNK:
			// handle sunk ship - pass in result
			switch (parseInt(result.ship)) {
				case Fleet.CARRIER:
					ship = enemyShips[0];
					break;
				case Fleet.BATTLESHIP:
					ship = enemyShips[1];
					break;
				case Fleet.DESTROYER:
					ship = enemyShips[2];
					break;
				case Fleet.SUBMARINE:
					ship = enemyShips[3];
					break;
				case Fleet.PATROLBOAT:
					ship = enemyShips[4];
					break;
			}
			
			ship.sunk = true;
			ship.possibleLocations = 0;
			if (solution.y > 0 && myCells[solution.x][solution.y - 1].status == cellStatus.hit) {
				for (i = 0; i < ship.size; i++) {
					myCells[solution.x][solution.y - i].status = cellStatus.sunk;
				}
			} else if (solution.x < myCells.length - 1 && myCells[solution.x + 1][solution.y].status == cellStatus.hit){
				for (i = 0; i < ship.size; i++) {
					myCells[solution.x + i][solution.y].status = cellStatus.sunk;
				}
			} else if (solution.y < myCells[0].length - 1 && myCells[solution.x][solution.y + 1].status == cellStatus.hit) {
				for (i = 0; i < ship.size; i++) {
					myCells[solution.x][solution.y + i].status = cellStatus.sunk;
				}
			} else if (solution.x > 0 && myCells[solution.x - 1][solution.y].status == cellStatus.hit) {
				for (i = 0; i< ship.size; i++) {
					myCells[solution.x - i][solution.y].status = cellStatus.sunk;
				}
			}				
			break;
	}
	
	// //console.log("Shooting [" + solution.x + ", " + solution.y + "]\n"); // debugging
	//this.outputGameStatus(); // debugging
};

/**
 * [called at the conclusion of each game]
 */
CandidateAI.prototype.endGame = function() {

};