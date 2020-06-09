'use strict';
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

//=============================================================================/
// GLOBAL VARIABLES
//=============================================================================/

/**
 * Game's clock
 * 
 * @var {number} launchedClock ID of time interval.
 */
var launchedClock;

/** 
 * @var {Array} mobs Array with mobs
 */
var mobs = [];

/**
 * @var {Array} mobsNames Array with names of mobs in game
 */
var mobsNames = [
	['mobCleaner'],
	['mobDirector'],
	['mobDoctor'],
	['mobElderDoctor'],
	['mobFamily'],
	['mobHelperMed'],
	['mobNurse'],
	['mobOtherFamily'],
	['mobPatient'],
];

/**
 * @var {Player} player Player object
 */
var player;

/**
 * Player's time in game is measured in following format:
 *
 *    W0D0H00M00
 * 
 * where '0''s place can be taken by all numbers.
 * 
 * W - week
 * D - day
 * H - hours
 * M - minutes
 * 
 * @var {string} playerTime Player's time in game
 */
var playerTime;

/**
 * @var {Array} table Array with informations about fields on which player can
 *                    staying
 * 
 * Each field has assigned value, which has following meaning:
 * "1" - free field
 * "2" - busy by player or mob
 * "3" - stairs down
 * "4" - stairs up
 * "5" - cup board
 * "6" - chair
 */
var table = [];

/**
 * @var {Array} things Data about things from game
 */
var things = [];

/**
 * @var {Array} thingsNames Names of things from game
 */
var thingsNames = [
	['bin'],
	['bowl'],
	['chair10'],
	['chair11'],
	['chair2'],
	['chair3'],
	['chairMed'],
	['chairPatient'],
	['cupBoard'],
    ['doors1'],
	['doors2'],
	['doors3'],
	['dripMed'],
	['mop'],
];

/**
 * @var {integer} timestampLastMove Last measured time of player's move.
 */
var timestampLastMove = (function () {
	const timer = new Date();
	return timer.getTime();
})();


//=============================================================================/
// FUNCTIONS DEFINITIONS (FD)
//=============================================================================/


//=============================================================================/
// (FD): Box with communiques
//=============================================================================/

/**
 * Function to create communique. Procedure of communique creating consists 
 * from following steps:
 * .1. Get reference to element with communiques.
 * .2. Get number of communiques actually displayed in this element.
 * .3. Check quantity of communiques. Optionally remove oldest communique.
 * .4. Create element with new communique.
 * .5. Append this element to element with communiques.
 * 
 * @var {string} message Communique to display in info box
 */
function createCommunique(message) {
  /**
   * @var {Element} infoBox Reference to element with communiques from DOM.
   */
  let infoBox = document.getElementById('infoBox');

  /**
   * @var {number} comNum Quantity of communiques
   */ 
  let comNum = Number(infoBox.childElementCount);

  /**
   * Check the number of communiques, if it exceeded 99, 
   * remove oldest communique.
   */
  if (comNum >= 100) {
  	infoBox.removeChild(infoBox.children[0]);
  }
  
  /**
   * Create communique
   */
  let newComLine = document.createElement('p');
  newComLine.classList.add('lineInInfoBox');
  comNum = Number(infoBox.lastElementChild.id);
  comNum++;
  newComLine.id = comNum.toString();
  let timer = new Date();
  newComLine.innerHTML = timer.toTimeString().substring(0,5) + ': ' + message;
  
  /**
   * Append communique to 'infoBox' and focus on him
   */
  infoBox.appendChild(newComLine);
  document.getElementById('infoBox').scrollTo(0, 600);
}

/**
 * Function to remove all communiques and displaying default message.
 */
function clearInfoBox() {
  let infoBox = document.getElementById('infoBox');
  while (infoBox.children.length != 0) {
  	infoBox.removeChild(infoBox.children[0]);
  }
  /**
   * Create welcoming communique and append him to 'infoBox'
   */
  let newComLine = document.createElement('p');
  newComLine.classList.add('lineInInfoBox');
  newComLine.id = '1';
  newComLine.innerHTML = '&nbsp;Witaj w oknie z komunikatami.';
  infoBox.appendChild(newComLine);
}


//=============================================================================/
// (FD): Manipulating on addresses of pictures.
//=============================================================================/

/**
 * Get length of string that contains directory of things's pictures.
 * 
 * @return {number}
 */
function getThingsImgsDirLen() {
  return `${location.origin}/images/game/movable/`.length;   
}

/**
 * Get length of string that contains directory of mobs's pictures.
 * 
 * @return {number}
 */
function getMobsImgsDirLen() {
  return `${location.origin}/images/game/mobs/`.length;   
}

/**
 * Displacement 'visitors' and chairs:
 * 
 * @var {Event} e Catched event.
 */
function dropInDiv(e) {
  //Prevent default dropping handling
  e.preventDefault();

  //Check that JSON transfer is possible
  let notParsed = e.dataTransfer.getData('application/json');
  if (!notParsed) {
  	return;
  }

  //Check that target field is free to occupy
  const fieldY = e.target.parentElement.parentElement.id;
  const fieldX = e.target.parentElement.id;
  if (!(table[player.lvl][fieldY][fieldX] === '1')) {
  	createCommunique('Pole zajęte.');
  	return;
  }
  let dataTable = JSON.parse(notParsed);
  let deltaX = Number(e.target.parentElement.id) - dataTable[0];
  let deltaY = Number(e.target.parentElement.parentElement.id) - dataTable[1];
  if (
	  !(deltaX <= 1 && deltaX >= -1 && deltaY <= 1 && deltaY >= -1) ||
      (deltaX === 0 && deltaY === 0)
  ) {
  	createCommunique('Za daleko.');
  	return;
  }
  let draggedDiv = document.getElementsByClassName(
	  'row',
	  )[dataTable[1]].getElementsByClassName(
		  'divCell',
          )[dataTable[0]];
  let dirLen = getThingsImgsDirLen();

  const draggedElementSrc = draggedDiv.children[0].src.substring(
      dirLen,
      dirLen + 7
  );
  for (let i = 0; i < things.length; i++) {
  	if (things[i].picture.substring(dirLen, dirLen + 7) === draggedElementSrc) {
  	  let len = things[i].length;
  	  for (let j = 0; j < len; j++) {
		//Here we are in properly chair's object.
  	    if (
			things[i][j].pY === dataTable[1] &&
			things[i][j].pX === dataTable[0]
		) {
  	      table[player.lvl][things[i][j].pY][things[i][j].pX] = '1';
  	      things[i][j].pY = Number(e.target.parentElement.parentElement.id);
  	      things[i][j].pX = Number(e.target.parentElement.id);	
  	      table[player.lvl][things[i][j].pY][things[i][j].pX] = '2';
  	      j = things[i].length;
  	      i = things.length;
  	    }
  	  }
  	}
  } //: If 'visitor' isn't staying in door.
  	
  for (let i = 0; i < mobs.length; i++) {
    dirLen = getMobsImgsDirLen();
      if (mobsNames[i][0] ===
            draggedDiv.children[0].src.substring(dirLen, dirLen + 14)) { 
  	  let len = mobs[i].length;
  	  for (let j = 0; j < len; j++) {
  	  	if (mobs[i][j].pY === dataTable[1] && mobs[i][j].pX === dataTable[0]) {
  	  	  table[mobs[i][j].lvl][mobs[i][j].pY][mobs[i][j].pX] = '1';
  	  	  mobs[i][j].pY = Number(e.target.parentElement.parentElement.id);
  	  	  mobs[i][j].pX = Number(e.target.parentElement.id);
  	  	  table[mobs[i][j].lvl][mobs[i][j].pY][mobs[i][j].pX] = '2';
  	  	  j = mobs[i].length;
  	  	  i = mobs.length;
  	  	}
  	  }
  	}
  }
  e.target.parentElement.appendChild(draggedDiv.children[0]);
  draggedDiv.appendChild(e.target);
  createCommunique('Przesunięto krzesło lub osobę odwiedzającą pacjenta.');
}

/**
 * Dropping picture:
 */
function dropImg(e) {
  //In comparison instruction letters are case-sensitive.
  let dirLen = getMobsImgsDirLen();
  if (
	  (e.target.src.substring(dirLen, dirLen + 14) != 'mobOtherFamily') && 
      (
		  e.target.src.substring(42,47) != 'chair' ||
		  e.target.src.charAt(47) === 'M' ||
		  e.target.src.charAt(47) === 'P'
	  )
  ) {
	const message = 
	    'Można przesuwać tylko drewniane krzesła i ' +
		'osoby odwiedzające pacjentów.';
  	createCommunique(message);
  	return;
  }

  //It's about div in which img is.
  let deltaX = player.pX - Number(e.target.parentElement.id);

  //It's about row in which div is.
  let deltaY =
      player.pY - Number(e.target.parentElement.parentElement.id);
  if (
	  !(deltaX <= 1 && deltaX >= -1 && deltaY <= 1 && deltaY >= -1) ||
	  (deltaX === 0 && deltaY === 0)
  ) {
  	createCommunique('Za daleko.');
  	return;
  }
  let dataTable = '[' +e.path[1].id + ',' + e.path[2].id + ']';

  /*
   * Already here I can check that I am moving chair, 'visitor' or someting,
   * that can't move.
   */
  e.dataTransfer.setData('application/json', dataTable); 
  createCommunique('Podniesiono krzesło lub osobę odwiedzającą pacjenta.');
}

/**
 * Sitting on chair:
 */
function sitOnChair(evt) {
  //Extract 'chair' word from 'src' attribute.
  let dirLen = getThingsImgsDirLen();
  let img = evt.target.src.substring(dirLen, dirLen + 5);  
  let deltaY = player.pY - Number(evt.path[1].id);
  let deltaX = player.pX - Number(evt.path[2].id);
  if (img != 'chair') {
  	createCommunique('Nie kliknąłeś krzesła.');
  	return;
  } else if (
	  (player.isSitting == false) && 
	  (player.isBusy == false) && 
	  (
		  (deltaX <= 1 && deltaX >= -1 && deltaY <= 1 && deltaY >= -1) &&
		  (deltaX === 0 && deltaY === 0)
	  )
  ) {
  	sitOnChairChoose(evt);
  	createCommunique("Usiadłeś.");
  }
}

/**
 * Which chair function:
 */
function whichChair (num, dirInUse, dirIsDraggable, posChairY, posChairX) {
  for (let i = 0; i <= things[num].length; i++) {
  	if (things[num][i].pY === posChairY && things[num][i].pX === posChairX) {
  	  things[num][i].inUse = dirInUse;
  	  things[num][i].isDraggable = dirIsDraggable;
  	}
  }
}

/**
 * Area of choice - sit:
 */ 
function sitOnChairChoose (evt) {
  let dirLen = getThingsImgsDirLen();
  player.isBusy = true;
  table[player.lvl][player.pY][player.pX] = "1";
  player.isDraggable = false;

  //Here i have saved chair's coords.
  player.pY = evt.target.parentElement.id;
  player.pX = evt.target.parentElement.parentElement.id;
  let posChairY = player.pY;
  let posChairX = player.pX;
  player.isSitting = true;

  switch (evt.target.src.substring(dirLen + 5, dirLen + 7)) {
  	case "10":
  	  evt.target.src = evt.target.src.substring(0,49) + "WithPlayer.png";
  	  whichChair(1,"1","0",posChairY,posChairX);
  	  break;
  	case "11":
  	  evt.target.src = evt.target.src.substring(0,49) + "WithPlayer.png";
  	  whichChair(2,"1","0",posChairY,posChairX);
  	  break;
  	case "2.":
  	  evt.target.src = evt.target.src.substring(0,48) + "WithPlayer.png";
  	  whichChair(3,"1","0",posChairY,posChairX);
  	  break;
  	case "3.":
  	  evt.target.src = evt.target.src.substring(0,48) + "WithPlayer.png";
  	  whichChair(4,"1","0",posChairY,posChairX);
  	  break;
	default:
	  break;
  }
}

/**
 * Check places around: 
 */
function checkPlace() {
  if (
	  things[player.lvl][player.pY][player.pX] != "1" &&
	  things[player.lvl][player.pY][player.pX] != "7"
  ) {
  	return true;
  } else {
  	return false;
  }
}

/**
 * Area of choice - stand up:
 */ 
function standUp (evt) {
  let posChairY = player.pY;
  let posChairX = player.pX;
  const message = "Nie można wstać z krzesła - brak wolnych miejsc dookoła.";
  player.pY--;
  if (checkPlace()) {
  	player.pX++;
  	if (checkPlace()) {
  	  player.pY++;
  	  if (checkPlace()) {
  	  	player.pY++;
  	  	if (checkPlace()) {
  	  	  player.pX--;
  	  	  if (checkPlace()) {
  	  	  	player.pX--;
  	  	  	if (checkPlace()) {
  	  	  	  player.pY--;
  	  	  	  if (checkPlace()) {
  	  	  	  	player.pY--;
  	  	  	  	if (checkPlace()) {
  	  	  	  	  player.pY++;
  	  	  	  	  player.pX++;
  	  	  	  	  createCommunique();
  	  	  	  	  return;
                }
              }
            }
          }
        }
      }
    }
  }
  //If the field fails any of the tests, it means that you can stand on it.
  things[player.lvl][player.pY][player.pX] = "1";
  document.getElementByClassName(
	  "row"
	  )[player.pY].getElementByClassName(
		  "divCell"
		  )[player.pX].src = "../images/game/mobs/player.png";
  player.playerIsSitting = false;
  player.playerIsBusy = false;
  player.isDraggable = true;
  
  switch (evt.target.src.substring(47,49)) {
  	case "10":
  	  evt.target.src = evt.target.src.substring(0,49) + "WithPlayer.png";
  	  whichChair(1,"0","1",posChairY,posChairX);
  	  break;
  	case "11":
  	  evt.target.src = evt.target.src.substring(0,49) + "WithPlayer.png";
  	  whichChair(2,"0","1",posChairY,posChairX);
  	  break;
  	case "2.":
  	  evt.target.src = evt.target.src.substring(0,48) + "WithPlayer.png";
  	  whichChair(3,"0","1",posChairY,posChairX);
  	  break;
  	case "3.":
  	  evt.target.src = evt.target.src.substring(0,48) + "WithPlayer.png";
  	  whichChair(4,"0","1",posChairY,posChairX);
  	  break;
	default:
	  break;
  }
  createCommunique("Wstałeś!");
}


//=============================================================================/
// (FD): influence on "table" (global variable)
//=============================================================================/

/**
 * Update @var {array} table
 * 
 * Saving changes in array contains informations about
 * actual blocked fields's positions during player's session.
 * 
 * @var {integer} lvl   Level of location
 * @var {integer} i     Number of row
 * @var {integer} j     Number of column
 * @var {string}  value Value of field (values's meanings are described above
 *                      declaration of @var {Array} table
 */
function changeTable(lvl, i, j, value) {
  table[lvl][i][j] = value;
}
  

//=============================================================================/
// (FD): mobs and player definitions
//=============================================================================/

/**
 * Player definition.
 * 
 * @var {string} picture     Address to picture that represents player
 * @var {number} lvl         Level of location on which player is
 * @var {number} pX          Number of row on that player stands on
 * @var {number} pY          Number of column on that player stands on
 * @var {string} deg         Degree of rotation of player
 * @var {string} velocity    Velocity of movement of player
 * @var {string} isBusy      Variable that indicates if player is busy
 * @var {string} isSitting   Variable that indicates if player is sitting
 * @var {string} isDraggable Variable that indicates if player is draggable
 * 
 * 
 * Descriptions of properties that aren't passed in arguments.
 * 
 * @var {Array}   lastPosition Level of location, row number and column number
 *                             from which player started a move.
 * @var {Element} aCG          "aCG" is acronym from "actualCellGame". It's
 *                             reference to element from DOM, that visually 
 *                             represents player's position in game area.                            
 */
function Player (picture, lvl, pX, pY, deg, velocity, isBusy, isSitting, isDraggable) {
  this.picture = picture;
  this.lvl = lvl;
  this.pX = pX;
  this.pY = pY;
  this.deg = deg;
  this.velocity = velocity;
  this.isBusy = isBusy;
  this.isSitting = isSitting;
  this.isDraggable = isDraggable;
  this.lastPosition = [this.lvl, this.pY, this.pX];
  this.aCG = document.getElementsByClassName(
  	  'row',
  	  )[this.pY].getElementsByClassName(
  	  	  'cell',
              )[this.pX];
              
  /**
   * Rotating of player.
   */
  this.spinning = function (deg) {
    this.deg = deg;
    this.aCG.style.transform = `rotate(${deg}deg)`;
  }
  
  /**
   * Check that player doesn'y try to move outside game area.
   * 
   * @var {bool}
   */
  this.checkCell = function () {
  	let X = this.pX;
    let Y = this.pY;
      
  	return (X < 0 || X > 47 || Y < 0 || Y > 59);
  };

  /**
   * 
   */
  this.changeImage = function() {
    this.aCG.src = `${location.origin}/images/game/mobs/clean.png`;
    this.aCG.removeAttribute('style');
    let cellGame =
	    document.getElementsByClassName(
			'row',
			)[this.pY].getElementsByClassName(
				'cell',
				)[this.pX];
    cellGame.src = `${location.origin}/images/game/movable/player.png`;
    cellGame.style.transform = 'rotate(' + this.deg + 'deg)';
    document.getElementById(
		'gameArea',
		).scrollTo((this.pX * 40) - 200, (this.pY * 40) - 240);
  };
  
  /**
   * Function for case, when player want to stand on field described as "1" in
   * @var {Array} table global variable.
   * 
   * Position from which player left is marked as "1" (free).
   * Position at which player stands is marked as "2" (busy by player/mob)
   */
  this.normalGoing = function() {
  	changeTable(
		this.lastPosition[0],
		this.lastPosition[1],
		this.lastPosition[2],
		'1',
	);
  	changeTable(this.lvl, this.pY, this.pX, '2');
  	this.changeImage(deg);
  };
  /**
   * Move player to higher or lower level.
   */
  this.goUpOrDown = function (dirUpDown) {
  	switch (dirUpDown) {
  	  case 1:
  	    if (this.lvl == 0) {
  	    	this.pY = 58;
  	    	this.pX = 16;
  	    }
  	    else {
  	    	this.pY += 3;
  	    }
  	  	break;
  	  case -1:
  	    if (this.lvl == 1) {
  	    	this.pY = 8;
  	    	this.pX = 21;
  	    }
  	    else {
  	    	this.pY += (dirUpDown * 3);
  	    }	
  	    break;
	  default:
	    break;
  	}
  	this.lvl += dirUpDown;
    changeTable(this.lvl, this.pY, this.pX, '2'); 
    prepareGameArea();
    putMobsPictures();
    putThingsPictures();
  };
  this.canGoUpOrDown = function (dirUpDown) {
  	changeTable(
		this.lastPosition[0],
		this.lastPosition[1],
		this.lastPosition[2],
		'1',
	);
  	switch (dirUpDown) {
  	  case 1:
  	    switch (this.lvl) {
  	      case 3:
  	        break;
  	      default:
  	        this.goUpOrDown(dirUpDown);
  	    }
  	    break;
  	  
  	  case -1:
  	    switch (this.lvl) {
  	      case 0:
  	        break;
  	      default:
  	        this.goUpOrDown(dirUpDown);
  	    }
  	    break;
	  default:
	    break;
  	}
  };
/*............................................................................*/
  /**
   * Checking if a player can stand on the field he wants to stand on
   * 
   * @var {integer} Y   The number of the row on which the player wants to stand
   * @var {integer} X   As above, but this applies to the column
   * @var {string}  deg Degree of player's rotation
   */
  this.canStandHere = function (Y, X, deg) {
    /**
     * If player wants go beyond the map or enter an obstacle, player change
     * only a degree of rotation, but not a position.
     */
    this.deg = deg;
	/**
     * Changing position in player's object
     */
    this.pY += Y;
    this.pX += X;
    /**
     * Check, that player doesn't want to go beyond the map
     */
    if (this.checkCell()) {
      this.pY -= Y;
      this.pX -= X;
      return;
    }
/*............................................................................*/
    /**
     * Actually status of field that the player will take after potentially
     * move.
     */
    let fieldStatus = table[this.lvl][this.pY][this.pX];
	/**
	 * I check, that player is standing on stairs to another location (level).
	 * If field is marked by 0 || 2 || 5 || 6 || 7 || 8
	 * player can't stand there.
	 */
  	switch (fieldStatus) {
  	  case '0':
  	  case '2':
  	  case '5':
  	  case '6':
  	  case '7':
  	  case '8':
  	    this.pY -= Y;
  	    this.pX -= X;
  	    break;
  	  case '1':
  	    this.normalGoing();
  	    break;
  	  case '3':
  	    this.canGoUpOrDown(-1);
  	    break;
  	  case '4':
  	    this.canGoUpOrDown(1);
  	    break;
	  default:
	    break;
  	}
  };
  /**
   * Time is measuring to constraint speed of player to average 
   * human's walking speed in reality.
   * If player made a move less than 360 miliseconds, execution of function
   * is interrupted.
   * 
   * @return {bool} True if player can do a move, false otherwise.
   */
  this.canMove = function () {
    let timer = new Date();
      
  	return (timer.getTime() - timestampLastMove) < this.velocity;
  }
  /**
   * Handling player's movement through the keyboard.
   * 
   * @var {integer} keyCode Key code of clicked key on keyboard.
   */
  this.going = function (keyCode) {
    if (this.canMove()) {
      return;   
    }
    /**
     * I overwriting instation of 'timer' object in purpose saving
	 * actual time in variable 'timestampLastMove'
     */
  	let timer = new Date();
    /**
     * I save time in purpose compare it to the time of next click.
     * @var {integer} timestampLastMove is a global variable 
     */
    timestampLastMove = timer.getTime();
        
    /**
     * Currently occupied field. It's reference to element from DOM.
	 * aCG - actualCellGame
     */
  	this.aCG = document.getElementsByClassName(
		  'row',
		  )[this.pY].getElementsByClassName(
			  'cell',
              )[this.pX];
    this.lastPosition = [this.lvl, this.pY, this.pX];
/*............................................................................*/
  	switch (keyCode) {
  	  /**
	   * Code which determines moving in 4 main directions
	   * Numbers are the keyCode for group keys:
	   * w s a d
	   */
  	  case 119:
  	    this.canStandHere(-1, 0, '0'); 
  	    break;
  	  
  	  case 115:
  	    this.canStandHere(1, 0, '180');
  	    break;
  	  
  	  case 97:
  	    this.canStandHere(0, -1, '270');
  	    break;
  	  
  	  case 100:
  	    this.canStandHere(0, 1, '90');
  	    break;
  	  
  	  /**
	   * Code for turning in place
	   * Numbers are the keyCode for group keys:
	   * W S A D
	   */
  	  case 87:
  	    this.spinning('0');
  	    break;
  	  case 83:
  	    this.spinning('180');
  	    break;
  	  case 65:
  	    this.spinning('270');
  	    break;
  	  case 68:
  	    this.spinning('90');
  	    break;
  	  
  	  /**
	   * Code for walking diagonally
	   * Numbers are the keyCode for group keys:
	   * q e z c
	   */
  	  case 113:
  	    this.canStandHere(-1, -1, '0');
  	    break;
  	  case 101:
  	    this.canStandHere(-1, 1, '0');
  	    break;
  	  case 122:
  	    this.canStandHere(1, -1, '180');
  	    break;
  	  case 99:
  	    this.canStandHere(1, 1, '180');
  	    break;
	  default:
	    break;
  	}
  };
  /**
   * 6) Door opening/closing and checking that door is closed or not.
   * Click simultaneously following combination of buttons:
   * -to open or close door:
   * 
   *    Ctrl + Left mouse's button on door picture
   * 
   * -to check that door is closed or not
   * 
   *    Shift + Left mouse's button on door picture
   */
  this.openDoor = function (e) {
    /*
     * Stop executing of function, if player didn't click 'CTRL' or 'SHIFT' 
     * when the mouse event was triggered. 
     */
    if (!(e.ctrlKey === true || e.shiftKey === true)) {
      return;
    }
    //X - number of column in which clicked element is.
    const X = Number(e.target.parentElement.id);

    //Y - number of row in which clicked element is.
    const Y = Number(e.target.parentElement.parentElement.id);
  
    /*
     * n - number of level; doors from different level are in different arrays,
     * and 'n' is needed to get access to the properly array.
     */
    const n = this.lvl; 
  
    /*
     * Following statements measure distance player from clicked element on map
     * in two dimensions.
     */
    const posY = Y - this.pY;
    const posX = X - this.pX;
  
    /*
     * Stop executing of function, if player isn't staying near clicked element.
     * It's situation occurs, when distance in one or two dimensions is greater
     * than '1' or when player clicked on himself.
     */
    if (
	    (posY < -1) ||
	    (posY > 1) ||
	    (posX < -1) ||
	    (posX > 1) ||
	    (posY === 0 && posX === 0)
    ) {
      createCommunique('Za daleko lub kliknąłeś/aś na siebie.');
  	  return;
    }

    /**
     * BROKEN FUNCTION
     */
    //Check all doors from array until you find clicked door
    for (let i = 0; i < things[11 + n].length; i++) {
      if ((things[11 + n][i].pY == Y) && (things[11 + n][i].pX == X)) {
        switch (things[11 + n][i].isOpen) {
          case '0':
            if (e.ctrlKey === true) {
              things[11 + n][i].isOpen = '1';
              table[n][Y][X] = '1';
              createCommunique('Otwarto drzwi.');
            } else if (e.shiftKey === true) {
            createCommunique('Te drzwi są zamknięte.');
            }
            break;
          case '1':
            if (e.ctrlKey === true) {
              things[11 + n][i].isOpen = '0';
              table[n][Y][X] = '7';
              createCommunique('Zamknięto drzwi.');
          } else if (e.shiftKey === true) {
            createCommunique('Te drzwi są otwarte.');
            }
            break;
          default:
            break;
        }
        return;
      }
    }
  };
}

/**
 * Definition of @var {Mob}
 */
function Mob (name, picture, lvl, pX, pY, deg, velocity, destinationX, destinationY) {
  this.name = name;
  this.picture = picture;
  this.lvl = lvl;
  this.pY = pY;
  this.pX = pX;
  this.deg = deg;
  this.velocity = velocity;
  this.destinationY = destinationY;
  this.destinationX = destinationX;
  this.sgnumY =
      (this.pY - this.destinationY)/Math.abs(this.pY - this.destinationY);
  this.sgnumX =
      (this.pX - this.destinationX)/Math.abs(this.pX - this.destinationX);
  this.lTM = [['',''],['',''],['','']];
  this.lFBS = ['',''];
  this.lFFP = ['',''];
  this.badDirY = '';
  this.badDirX = '';
  this.tTM = ['','','','','','','',''];
  this.aCG =
      document.getElementsByClassName(
		  'row',
		  )[this.pY].getElementsByClassName(
			  'cell',
			  )[this.pX];
  this.currentData = [this.lvl, this.pY, this.pX];
  this.secondCell = '';
  this.thirdCell = '';
  this.actualSignInCellAboutIsOccupied = '2';
  this.dirUpDown = '';
  this.isDraggable = true;
  this.mobMover = '';
}

/**
 * Definition of @var {MobOtherFamily}
 */
function MobOtherFamily (
	name,
	picture,
	lvl,
	pX,
	pY,
	deg,
	velocity,
	destinationX,
	destinationY,
) {
  Mob.call(
	  this,
	  name,
	  picture,
	  lvl,
	  pX,
	  pY,
	  deg,
	  velocity,
	  destinationX,
	  destinationY,
  );
  //FIFTH ORDER FUNCTIONS
  //The function used to change position picture with thing:
  this.changeLocalisationOfThingByMob = function (
	  movedCell,
	  newCellForThing,
	  thing,
	  pictureOfThing,
  ) {
  	movedCell.children[0].src = '../images/game/mobs/clean.png';
  	movedCell.removeAttribute('style');
  	newCellForThing.children[0].src = pictureOfThing;
  	newCellForThing.children[0].style.transform = 
	    'rotate(' + thing.deg + 'deg)';
  };
  this.minimizeFunctionMobGoToNewLocation = function () {
  	this.lvl = this.currentData[0];
  	this.pY = this.currentData[1];
  	this.pX = this.currentData[2];
  	changeTable(
		this.currentData[0],
		this.currentData[1],
		this.currentData[2],
		this.actualSignInCellAboutIsOccupied,
	);
  	return true;
  };	
		
  //FOURTH ORDER FUNCTIONS
  this.helpfulFunctionDuringThingMoving = function (
	  thing,
	  movedCell,
	  pictureOfThing,
	  signOfOccupiedCellByThing,
  ) {
  	table[this.lvl][this.pY][this.pX] = "1";
  	table[thing.lvl][thing.pY][thing.pX] = signOfOccupiedCellByThing;
  	this.pY = this.currentData[1];
  	this.pX = this.currentData[2];
  	let newCellForThing =
	    document.getElementsByClassName(
			'row',
			)[thing.pY].getElementsByClassName(
				'divCell',
				)[thing.pX];
  	this.changeLocalisationOfThingByMob(
		movedCell,
		newCellForThing,
		thing,
		pictureOfThing,
	);
  	return false;
  };

  //Function serves to change position picture with 'mob'
  this.changeLocalisationOfMobImage = function () {
  	this.aCG.src = '../images/game/mobs/clean.png';
  	this.aCG.removeAttribute('style');
  	let cellGame =
	  document.getElementsByClassName(
		  'row',
		  )[this.pY].getElementsByClassName(
			  'cell',
			  )[this.pX];
  	cellGame.src = '../images/game/mobs/mobOtherFamily.png';
  	cellGame.style.transform = 'rotate(' + this.deg + 'deg)';
  };

  /*
   * Function to shortening next function 
   */
  this.shorteningGoToNewLocationCheckCell = function() {
    if (this.newCheckCell()) {
	  //If entrancing fails, restore previous data about 'mob'.
  	  return this.minimizeFunctionMobGoToNewLocation();
  	} else {
  	  return false;
  	}
  }

  /*
   * Function to subsequently cases in which becomes on field,
   * which lead up or down.
   */
  this.mobGoToNewLocationCheckCell = function (dirUpDown) {
  	switch (dirUpDown) {
  	  case 1:
  	    if (this.lvl === 0) {
  	    	this.pY = 58;
  	    	this.pX = 16;
  	    	this.lvl += dirUpDown;
  	    } else {
  	    	this.pY += 3;
  	    	this.lvl += dirUpDown;
  	    	this.shorteningGoToNewLocationCheckCell();
  	    }
  	    break;
  	  case -1:
  	    if (this.lvl === 1) {
  	      this.pY = 8;
  	      this.pX = 21;
  	      this.lvl += dirUpDown;
  	      this.shorteningGoToNewLocationCheckCell();
  	    } else {
  	      this.pY += (dirUpDown * 3);
  	      this.lvl += dirUpDown;
  	      this.shorteningGoToNewLocationCheckCell();
  	    }	
  	    break;
	  default:
		break;
  	}
	return true;
  };

  //BLIND STREET
  this.leaveFromFirstPlaceBlindStreetDeterminingWhereToGo = function() {
    //this.isDraggable = false; - it's already sets to 'false' anyway
    //tryToMove – i remove it, because 'mob' isn't moved yet
    this.tTM = ['','','','','','','',''];
    /*
     * this.aCG = 'undefined'; – it was determined in determiningWhereToGo()
     * function – this function call this function
     */
    //this.currentData = ['','','']; – similarly
    //this.sgnumY = 'undefined'; – this direction is already counted
    //this.sgnumX = 'undefined'; – similarly
    this.secondCell = 'undefined'; //silmilarly how tTM
    this.thirdCell = 'undefined'; 
    
    //When player will want go upstairs, this sign will be determined.
    this.actualSignInCellAboutIsOccupied = 'undefined';
    this.dirUpDown = 'undefined'; //podobnie
    
    if (this.sgnumY != 0 && this.sgnumX != 0) {
      this.secondCell = table[this.lvl][this.pY][this.pX - this.sgnumX];
      this.thirdCell = table[this.lvl][this.pY - this.sgnumY][this.pX];
      if (this.newCheckCell()) {
        this.tTM[0] = table[this.lvl][this.pY][this.pX];
        this.pX -= this.sgnumX;
        if (this.newCheckCell()) {
          this.tTM[1] = table[this.lvl][this.pY][this.pX];
          this.pY -= this.sgnumY;
          this.pX += this.sgnumX;
          if (this.newCheckCell()) {
            this.tTM[2] = table[this.lvl][this.pY][this.pX];
            this.pY -= this.sgnumY;
            if (
				(
					this.tTM[0] === "0" ||
					this.tTM[0] === "5" ||
					this.tTM[0] === "8" ||
					this.tTM[0] === "9"
				) &&
				(
					this.tTM[1] === "0" ||
					this.tTM[1] === "5" ||
					this.tTM[1] === "8" ||
					this.tTM[1] === "9"
				) &&
				(
					this.tTM[2] === "0" ||
					this.tTM[2] === "5" ||
					this.tTM[2] === "8" ||
					this.tTM[2] === "9"
				)
			) {
              if (this.newCheckCell()) {
                this.tTM[3] = table[this.lvl][this.pY][this.pX];
                this.pY += this.sgnumY;
                this.pY += this.sgnumY;
                this.pX -= this.sgnumX;
                this.pX -= this.sgnumX;
                if (this.newCheckCell()) {
                  this.tTM[4] = table[this.lvl][this.pY][this.pX];
                  this.pY -= this.sgnumY;
                  if (
					  (
						  this.tTM[3] === "0" ||
						  this.tTM[3] === "5" ||
						  this.tTM[3] === "8" ||
						  this.tTM[3] === "9"
					  ) &&
					  (
						  this.tTM[4] === "0" ||
						  this.tTM[4] === "5" ||
						  this.tTM[4] === "8" ||
						  this.tTM[4] === "9"
					  )
				  ) {
                    if (this.newCheckCell()) {
                      this.tTM[5] = table[this.lvl][this.pY][this.pX];
                      this.pY -= this.sgnumY;
                      this.pX += this.sgnumX;
                      if (this.newCheckCell()) {
                        this.tTM[6] = table[this.lvl][this.pY][this.pX];
                        /*
						 * 'mob' check all fields and 
						 * couldn't interact with any of them
						 */
                        this.pY += this.sgnumX;
                      }
				    }
				  } else {
                    if (this.checkCellWithoutMove()) {
                      this.tTM[5] = table[this.lvl][this.pY][this.pX];
                      this.pY -= this.sgnumY;
                      this.pX += this.sgnumX;
                      if (this.checkCellWithoutMove()) {
                        this.tTM[6] = table[this.lvl][this.pY][this.pX];
						/*
						 * 'mob' check all fields and 
						 * couldn't interact with any of them
						 */
                        this.pY += this.sgnumX;
                      }
				    }
				  }
                }
			  }
			} else {
              if (this.checkCellWithoutMove()) {
                this.tTM[3] = table[this.lvl][this.pY][this.pX];
                this.pY += this.sgnumY;
                this.pY += this.sgnumY;
                this.pX -= this.sgnumX;
                this.pX -= this.sgnumX;
                if (this.checkCellWithoutMove()) {
                  this.tTM[4] = table[this.lvl][this.pY][this.pX];
                  this.pY -= this.sgnumY;
                  if (this.checkCellWithoutMove()) {
                    this.tTM[5] = table[this.lvl][this.pY][this.pX];
                    this.pY -= this.sgnumY;
                    this.pX += this.sgnumX;
                    if (this.checkCellWithoutMove()) {
                      this.tTM[6] = table[this.lvl][this.pY][this.pX];
					  /*
					   * 'mob' check all fields and 
					   * couldn't interact with any of them
					   */
                      this.pY += this.sgnumX;
                    }
			      }
			    }
			  }
			}
          }
	    }
	  }
    } else if (this.sgnumY !=0 && this.sgnumX === 0) {
      this.secondCell =
	      table[this.lvl][this.pY + this.sgnumX][this.pX + this.sgnumY];
      this.thirdCell =
	      table[this.lvl][this.pY - this.sgnumX][this.pX - this.sgnumY];
      if (this.newCheckCell()) {
      	this.tTM[0] = table[this.lvl][this.pY][this.pX];
      	this.pX -= this.sgnumY;
      	if (this.newCheckCell()) {
      	  this.tTM[1] = table[this.lvl][this.pY][this.pX];
      	  this.pX += this.sgnumY;
      	  this.pX += this.sgnumY;
      	  if (this.newCheckCell()) {
      	  	this.tTM[2] = table[this.lvl][this.pY][this.pX];
      	  	this.pY -= this.sgnumY;
      	  	if (
				(
					this.tTM[0] === "0" ||
					this.tTM[0] === "5" ||
					this.tTM[0] === "8" ||
					this.tTM[0] === "9"
				) &&
				(
					this.tTM[1] === "0" ||
					this.tTM[1] === "5" ||
					this.tTM[1] === "8" ||
					this.tTM[1] === "9"
				) &&
				(
				    this.tTM[2] === "0" ||
				    this.tTM[2] === "5" ||
				    this.tTM[2] === "8" ||
				    this.tTM[2] === "9"
			    )
			) {
      	  	  if (this.newCheckCell()) {
      	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
      	  	  	this.pX -= this.sgnumY;
      	  	  	this.pX -= this.sgnumY;
      	  	  	if (this.newCheckCell()) {
      	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
      	  	  	  this.pY -= this.sgnumY;
      	  	  	  if (
					  (
						  this.tTM[3] === "0" ||
						  this.tTM[3] === "5" ||
						  this.tTM[3] === "8" ||
						  this.tTM[3] === "9"
					  ) &&
					  (
						  this.tTM[4] === "0" ||
						  this.tTM[4] === "5" ||
						  this.tTM[4] === "8" ||
						  this.tTM[4] === "9"
					  )
				  ) {
      	  	  	  	if (this.newCheckCell()) {
      	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  this.pX += this.sgnumY;
      	  	  	  	  this.pX += this.sgnumY;
      	  	  	  	  if (this.newCheckCell()) {
      	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  	this.pY += this.sgnumY;
      	  	  	  	  	this.pX -= this.sgnumY;      	  	  	  
						}
					  }
				  } else {
      	  	  	  	if (this.checkCellWithoutMove()) {
      	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  this.pX += this.sgnumY;
      	  	  	  	  this.pX += this.sgnumY;
      	  	  	  	  if (this.checkCellWithoutMove()) {
      	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  	this.pY += this.sgnumY;
      	  	  	  	  	this.pX -= this.sgnumY;
      	  	  	      }
					}
				  }
      	  	    }
			  }
			} else {
      	  	  if (this.checkCellWithoutMove()) {
      	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
      	  	  	this.pX -= this.sgnumY;
      	  	  	this.pX -= this.sgnumY;
      	  	  	if (this.checkCellWithoutMove()) {
      	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
      	  	  	  this.pY -= this.sgnumY;
      	  	  	  if (this.checkCellWithoutMove()) {
      	  	  	  	this.tTM[5] = table[this.lvl][this.pY][this.pX];
      	  	  	  	this.pX += this.sgnumY;
      	  	  	  	this.pX += this.sgnumY;
      	  	  	  	if (this.checkCellWithoutMove()) {
      	  	  	  	  this.tTM[6] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  this.pY += this.sgnumY;
      	  	  	  	  this.pX -= this.sgnumY;
      	  	        }
	  	          }
	  		    }
	  	      }
	  	    }	
          }
	    }
	  }
    } else if (this.sgnumY === 0 && this.sgnumX != 0) {
      this.secondCell =
	      table[this.lvl][this.pY + this.sgnumX][this.pX + this.sgnumY];
      this.thirdCell =
	      table[this.lvl][this.pY - this.sgnumX][this.pX - this.sgnumY];
      if (this.newCheckCell()) {
      	this.tTM[0] = table[this.lvl][this.pY][this.pX];
      	this.pY += this.sgnumX;
      	if (this.newCheckCell()) {
      	  this.tTM[1] = table[this.lvl][this.pY][this.pX];
      	  this.pY -= this.sgnumX;
      	  this.pY -= this.sgnumX;
      	  if (this.newCheckCell()) {
      	  	this.tTM[2] = table[this.lvl][this.pY][this.pX];
      	  	this.pX -= this.sgnumX;
      	  	if (
				(
					this.tTM[0] === "0" ||
					this.tTM[0] === "5" ||
					this.tTM[0] === "8" ||
					this.tTM[0] === "9"
				) &&
				(
					this.tTM[1] === "0" ||
					this.tTM[1] === "5" ||
					this.tTM[1] === "8" ||
					this.tTM[1] === "9"
				) &&
				(
					this.tTM[2] === "0" ||
				    this.tTM[2] === "5" ||
					this.tTM[2] === "8" ||
					this.tTM[2] === "9"
				)
			) {
      	  	  if (this.newCheckCell()) {
      	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
      	  	  	this.pY += this.sgnumX;
      	  	  	this.pY += this.sgnumX;
      	  	  	if (this.newCheckCell()) {
      	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
      	  	  	  this.pX -= this.sgnumX;
      	  	  	  if (
					  (
						  this.tTM[3] === "0" ||
						  this.tTM[3] === "5" ||
						  this.tTM[3] === "8" ||
						  this.tTM[3] === "9"
					  ) &&
					  (
						  this.tTM[4] === "0" ||
						  this.tTM[4] === "5" ||
						  this.tTM[4] === "8" ||
						  this.tTM[4] === "9"
					  )
				  ) {
      	  	  	  	if (this.newCheckCell()) {
      	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  this.pY -= this.sgnumX;
      	  	  	  	  this.pY -= this.sgnumX;
      	  	  	  	  if (this.newCheckCell()) {
      	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  	this.pY += this.sgnumX;
      	  	  	  	  	this.pX += this.sgnumX;		
      	  	  	      }
					}
				  } else {
      	  	  	  	if (this.checkCellWithoutMove()) {
      	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  this.pY += this.sgnumX;
      	  	  	  	  this.pY += this.sgnumX;
      	  	  	  	  if (this.checkCellWithoutMove()) {
      	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
      	  	  	  	  	this.pY += this.sgnumX;
      	  	  	  	  	this.pX += this.sgnumX;
      	  	  	      }
				    }
				  }
      	  	    }
			  }
			} else {
      	  		if (this.checkCellWithoutMove()) {
      	  		  this.tTM[3] = table[this.lvl][this.pY][this.pX];
      	  		  this.pY += this.sgnumX;
      	  		  this.pY += this.sgnumX;
      	  		  if (this.checkCellWithoutMove()) {
      	  		  	this.tTM[4] = table[this.lvl][this.pY][this.pX];
      	  		  	this.pX -= this.sgnumX;
      	  		  	if (this.checkCellWithoutMove()) {
      	  		  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
      	  		  	  this.pY += this.sgnumX;
      	  		  	  this.pY += this.sgnumX;
      	  		  	  if (this.checkCellWithoutMove()) {
      	  		  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
      	  		  	  	this.pY += this.sgnumX;
      	  		  	  	this.pX += this.sgnumX;
      	  	          }
				    }
				  }
				}
			  }	
            }
	      }
	   }
    }
    this.isDraggable = true;
  };

  /*
   * ) Function to minimize function for 'Blind Street' 
   */
  this.minimizeCheckBlindStreetFunction = function() {
  	if (this.lFBS[0] === '' && this.lFBS[1] === '') {
  	  if (this.lTM[1][0] === '' && this.lTM[1][1] === '') {
  	  	this.lTM[1] = [this.pY,this.pX];
  	  } else if (this.lTM[2][0] === '' && this.lTM[2][1] === '') {
  		this.lTM[2] = [this.pY,this.pX];
  	  }
  	} else if (this.lFBS[0] === this.pY && this.lFBS[1] === this.pX) {
  	  this.sgnumY = 
		  this.currentData[1] -
		  this.pY/Math.abs(this.currentData[1] -this.pY);
  	  this.sgnumX =
		this.currentData[2] -
		this.pX/Math.abs(this.currentData[2] - this.pX);
  	  if (isNaN(this.sgnumY)) {
  		this.sgnumY = 0;
  	  }
  	  if (isNaN(this.sgnumX)) {
  		this.sgnumX = 0;
  	  }
  	  this.pY = this.currentData[1];
  	  this.pX = this.currentData[2];
  	  this.pY += this.sgnumY;
  	  this.pX += this.sgnumX;
  	  this.leaveFromBlindStreetDeterminingWhereToGo();
  	  return true;
  	} else if (
		(this.lFBS[0] != this.pY && this.lFBS[1] != this.pX) &&
		(this.lFBS[0] != '' && this.lFBS[1] != '')
	) {
  	  this.lFBS = ['',''];
  	}
  	return false;
  };
  this.leaveFromBlindStreetDeterminingWhereToGo = function() {
    /*
	 * tTM – I remove it, because now fields will be checked in relation to the
	 * new goal
	 */
  	this.tTM = ['','','','','','','',''];
  	this.secondCell = 'undefined';
  	this.thirdCell = 'undefined'; 
  	if (this.sgnumY != 0 && this.sgnumX != 0) {
  	  this.secondCell = table[this.lvl][this.pY][this.pX - this.sgnumX];
  	  this.thirdCell = table[this.lvl][this.pY - this.sgnumY][this.pX];
  	  if (this.newCheckCell()) {
  	  	this.tTM[0] = table[this.lvl][this.pY][this.pX];
  	  	this.pX -= this.sgnumX;
  	  	if (this.newCheckCell()) {
  	  	  this.tTM[1] = table[this.lvl][this.pY][this.pX];
  	  	  this.pY -= this.sgnumY;
  	  	  this.pX += this.sgnumX;
  	  	  if (this.newCheckCell()) {
  	  	  	this.tTM[2] = table[this.lvl][this.pY][this.pX];
  	  	  	this.pY -= this.sgnumY;
  	  	  	if (
				(
					this.tTM[0] === "0" ||
					this.tTM[0] === "5" ||
					this.tTM[0] === "8" ||
					this.tTM[0] === "9"
				) &&
				(
					this.tTM[1] === "0" ||
					this.tTM[1] === "5" ||
					this.tTM[1] === "8" ||
					this.tTM[1] === "9"
				) &&
				(
					this.tTM[2] === "0" ||
					this.tTM[2] === "5" ||
					this.tTM[2] === "8" ||
					this.tTM[2] === "9"
				)
			) {
  	  	  	  if (this.newCheckCell()) {
  	  	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	  	  	  	this.pY += this.sgnumY;
  	  	  	  	this.pY += this.sgnumY;
  	  	  	  	this.pX -= this.sgnumX;
  	  	  	  	this.pX -= this.sgnumX;
  	  	  	  	if (this.newCheckCell()) {
  	  	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  this.pY -= this.sgnumY;
  	  	  	  	  if (
					  (
						  this.tTM[3] === "0" ||
						  this.tTM[3] === "5" ||
						  this.tTM[3] === "8" ||
						  this.tTM[3] === "9"
					  ) &&
					  (
						  this.tTM[4] === "0" ||
						  this.tTM[4] === "5" ||
						  this.tTM[4] === "8" ||
						  this.tTM[4] === "9"
					  )
				  ) {
  	  	  	  	  	if (this.newCheckCell()) {
  	  	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pY -= this.sgnumY;
  	  	  	  	  	  this.pX += this.sgnumX;
  	  	  	  	  	  if (this.newCheckCell()) {
  	  	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
						/*
						 * 'mob' check all fields and 
						 * couldn't interact with any of them
						 */
  	  	  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	      }
	  	  	  	    }
	  	  	  	  } else {
  	  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pY -= this.sgnumY;
  	  	  	  	  	  this.pX += this.sgnumX;
  	  	  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
						/*
						 * 'mob' check all fields and 
						 * couldn't interact with any of them
						 */
  	  	  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	      }
	  	  	  	    }
	  	  	  	  }
  	  	  	    }
	  	  	  }
	  	  	} else {
  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	  	  	  	this.pY += this.sgnumY;
  	  	  	  	this.pY += this.sgnumY;
  	  	  	  	this.pX -= this.sgnumX;
  	  	  	  	this.pX -= this.sgnumX;
  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  this.pY -= this.sgnumY;
  	  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	    this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	    this.pY -= this.sgnumY;
  	  	  	  	    this.pX += this.sgnumX;
  	  	  	  	    if (this.checkCellWithoutMove()) {
  	  	  	  	    	this.tTM[6] = table[this.lvl][this.pY][this.pX];
			  	    	/*
			  	         * 'mob' check all fields and 
			  	         * couldn't interact with any of them
			  	         */
  	  	  	  	    	this.pY += this.sgnumX;
  	  	  	        }
	  	  	      }
	  	  	    }
	  	  	  }
	  	  	}
  	      }
	    }
	  }
  	} else if (this.sgnumY !=0 && this.sgnumX === 0) {
  		this.secondCell =
		    table[this.lvl][this.pY + this.sgnumX][this.pX + this.sgnumY];
  		this.thirdCell =
		    table[this.lvl][this.pY - this.sgnumX][this.pX - this.sgnumY];
  	  if (this.newCheckCell()) {
  	  	this.tTM[0] = table[this.lvl][this.pY][this.pX];
  	  	this.pX -= this.sgnumY;
  	  	if (this.newCheckCell()) {
  	  	  this.tTM[1] = table[this.lvl][this.pY][this.pX];
  	  	  this.pX += this.sgnumY;
  	  	  this.pX += this.sgnumY;
  	  	  if (this.newCheckCell()) {
  	  	  	this.tTM[2] = table[this.lvl][this.pY][this.pX];
  	  	  	this.pY -= this.sgnumY;
  	  	  	if (
				(
					this.tTM[0] === "0" ||
					this.tTM[0] === "5" ||
					this.tTM[0] === "8" ||
					this.tTM[0] === "9"
				) &&
				(
					this.tTM[1] === "0" ||
					this.tTM[1] === "5" ||
					this.tTM[1] === "8" ||
					this.tTM[1] === "9"
				) &&
				(
					this.tTM[2] === "0" ||
					this.tTM[2] === "5" ||
					this.tTM[2] === "8" ||
					this.tTM[2] === "9"
				)
			) {
  	  	  	  if (this.newCheckCell()) {
  	  	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	  	  	  	this.pX -= this.sgnumY;
  	  	  	  	this.pX -= this.sgnumY;
  	  	  	  	if (this.newCheckCell()) {
  	  	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  this.pY -= this.sgnumY;
  	  	  	  	  if (
					  (
						  this.tTM[3] === "0" ||
						  this.tTM[3] === "5" ||
						  this.tTM[3] === "8" ||
						  this.tTM[3] === "9"
					  ) &&
					  (
						  this.tTM[4] === "0" ||
						  this.tTM[4] === "5" ||
						  this.tTM[4] === "8" ||
						  this.tTM[4] === "9"
					  )
				  ) {
  	  	  	  	  	if (this.newCheckCell()) {
  	  	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pX += this.sgnumY;
  	  	  	  	  	  this.pX += this.sgnumY;
  	  	  	  	  	  if (this.newCheckCell()) {
  	  	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  	this.pY += this.sgnumY;
  	  	  	  	  	  	this.pX -= this.sgnumY;
  	  	  	  	      }
					}
				  }	else {
  	  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pX += this.sgnumY;
  	  	  	  	  	  this.pX += this.sgnumY;
  	  	  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  	this.pY += this.sgnumY;
  	  	  	  	  	  	this.pX -= this.sgnumY;
  	  	  	  	      }
					}
				  }
  	  	  	    }
			  }
			} else {
  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	  	  	  	this.pX -= this.sgnumY;
  	  	  	  	this.pX -= this.sgnumY;
  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  this.pY -= this.sgnumY;
  	  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	  	this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	this.pX += this.sgnumY;
  	  	  	  	  	this.pX += this.sgnumY;
  	  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  	  this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pY += this.sgnumY;
  	  	  	  	  	  this.pX -= this.sgnumY;
  	  	  	        }
				  }
				}
			  }
		    }	
  	      }
	    }
	  }
  	} else if (this.sgnumY === 0 && this.sgnumX != 0) {
  	  this.secondCell =
		  table[this.lvl][this.pY + this.sgnumX][this.pX + this.sgnumY];
  	  this.thirdCell =
		  table[this.lvl][this.pY - this.sgnumX][this.pX - this.sgnumY];
  	  if (this.newCheckCell()) {
  	  	this.tTM[0] = table[this.lvl][this.pY][this.pX];
  	  	this.pY += this.sgnumX;
  	  	if (this.newCheckCell()) {
  	  	  this.tTM[1] = table[this.lvl][this.pY][this.pX];
  	  	  this.pY -= this.sgnumX;
  	  	  this.pY -= this.sgnumX;
  	  	  if (this.newCheckCell()) {
  	  	  	this.tTM[2] = table[this.lvl][this.pY][this.pX];
  	  	  	this.pX -= this.sgnumX;
  	  	  	if (
				(
					this.tTM[0] === "0" ||
					this.tTM[0] === "5" ||
					this.tTM[0] === "8" ||
					this.tTM[0] === "9"
				) &&
				(
					this.tTM[1] === "0" ||
					this.tTM[1] === "5" ||
					this.tTM[1] === "8" ||
					this.tTM[1] === "9"
				) &&
				(
					this.tTM[2] === "0" ||
					this.tTM[2] === "5" ||
					this.tTM[2] === "8" ||
					this.tTM[2] === "9"
				)
			) {
  	  	  	  if (this.newCheckCell()) {
  	  	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	if (this.newCheckCell()) {
  	  	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  this.pX -= this.sgnumX;
  	  	  	  	  if (
					  (
						  this.tTM[3] === "0" ||
						  this.tTM[3] === "5" ||
						  this.tTM[3] === "8" ||
						  this.tTM[3] === "9"
					  ) &&
					  (
						  this.tTM[4] === "0" ||
						  this.tTM[4] === "5" ||
						  this.tTM[4] === "8" ||
						  this.tTM[4] === "9"
					  )
				  ) {
  	  	  	  	  	if (this.newCheckCell()) {
  	  	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pY -= this.sgnumX;
  	  	  	  	  	  this.pY -= this.sgnumX;
  	  	  	  	  	  if (this.newCheckCell()) {
  	  	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	  	  	this.pX += this.sgnumX;
  	  	  	  	      }
					}
				  } else {
  	  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  	  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pY += this.sgnumX;
  	  	  	  	  	  this.pY += this.sgnumX;
  	  	  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	  	  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	  	  	this.pX += this.sgnumX;
  	  	  	  	      }
					}
				  }
  	  	  	    }
			  }
		    } else {
  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  this.pX -= this.sgnumX;
  	  	  	  	  if (this.checkCellWithoutMove()) {
  	  	  	  	  	this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	  	this.pY += this.sgnumX;
  	  	  	  	  	if (this.checkCellWithoutMove()) {
  	  	  	  	  	  this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	  	  	  	  	  this.pY += this.sgnumX;
  	  	  	  	  	  this.pX += this.sgnumX;
  	  	  	        }
				  }
				}
			  }
			}
  	      }
	    }
	  }
  	}
  	this.isDraggable = true;
  };

  //THREE ORDER FUNCTIONS
  this.mobMovingItem = function() { 
  	for (let i = 0; i < things.length; i++) {
  	  let len = things[i].length;
  	  for (let j = 0; j < len; j++) {
  	  	if (
			this.lvl === things[i][j].lvl &&
			this.pY === things[i][j].pY &&
			this.pX === things[i][j].pX
		) {
  	  	  let thing = things[i][j];
  	  	  pictureOfThing = things[i].picture;
  	  	  let signOfOccupiedCellByThing = "6";
  	  	  j = len;
  	  	  i = things.length;
  	  	}
  	  }
  	}
  	for (let i = 0; i < mobs.length; i++) {
  	  let len = mobs[i].length;
  	  for (let j = 0; j < len; j++) {
  	  	if (
			this.lvl === mobs[i][j].lvl &&
			this.pY === mobs[i][j].pY &&
			this.pX === mobs[i][j].pX
		) {
  	  	  if (
			  !(this.destinationY === mobs[i][j].destinationY) &&
			  !(this.destinationX === mobs[i][j].destinationX)
		  ) {
  	  	    let thing = mobs[i][j];
  	  	    pictureOfThing = mobs[i].picture;
  	  	    let signOfOccupiedCellByThing = "2";
  	  	    j = len;
  	  	    i = mobs.length;
  	  	  }
  	  	}
  	  }
  	}
  	if (typeof thing === 'undefined') {
  	  return true;
  	}
  	let movedCell =
	    document.getElementsByClassName(
			'row',
			)[this.pY].getElementsByClassName(
				'divCell',
				)[this.pX];
  	thing.pY++;
  	thing.pX++;
  	if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  thing.pX--;
  	  if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	thing.pY--;
  	  	thing.pX++;
  	  	if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	  thing.pY++;
  	  	  thing.pX--;
  	  	  thing.pX--;
  	  	  if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	  	thing.pY--;
  	  	  	thing.pY--;
  	  	  	thing.pX++;
  	  	  	thing.pX++;
  	  	  	if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	  	  thing.pX--;
  	  	  	  if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	  	  	thing.pY++;
  	  	  	  	thing.pX--;
  	  	  	  	if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	  	  	  thing.pY--;
  	  	  	  	  if (table[thing.lvl][thing.pY][thing.pX] != "1") {
  	  	  	  	  	thing.pY++;
  	  	  	  	  	thing.pX++;
  	  	  	  	  	return true;
  	  	  	  	  }
				}
			  }
			}
		  }
	    }
	  }
	}
	return this.helpfulFunctionDuringThingMoving(
		thing,
		movedCell,
		pictureOfThing,
		signOfOccupiedCellByThing,
	);
  };

  /*
   * Function serves to changing localisation of 'mob'
   * (after entracing on field with sign '3' or '4').
   */
  this.mobGoToNewLocation = function(dirUpDown) {
  	this.actualSignInCellAboutIsOccupied = 
	    table[this.currentData[0]][this.currentData[1]][this.currentData[2]];
  	changeTable(
		this.currentData[0],
		this.currentData[1],
		this.currentData[2],
		'1'
	);

	//It's mean, that 'mob' didn't change this location (level).
  	let isDone = true; //to oznacza, że nie zmienił tej lokacji
  	switch (dirUpDown) {
  	  case 1:
  	    switch (this.lvl) {
  	      case 3:
  	      break;
  	      default:
  	      isDone = this.mobGoToNewLocationCheckCell(dirUpDown);
  	    }
  	    break;
  
  	  case -1:
  	    switch (this.lvl) {
  	      case 0:
  	      break;
  	      default:
  	      isDone = this.mobGoToNewLocationCheckCell(dirUpDown);
  	    }
  	    break;
	  default:
		break;
  	}
  	if (isDone === false) {
  	  if (this.lFFP[0] != '' && this.lFFP[1] != '') {
  	    this.lFFP = ['',''];
  	    this.lTM[0] = [this.pY,this.pX];
  	    console.log('9');
  	  } else if (this.lFFP[0] === '' && this.lFFP[1] === '') {
  	    if (this.lFBS[0] != '' && this.lFBS[1] != '') {
  	  	  this.lFBS = ['',''];
  	  	  console.log('10');
  	    }
  	  }
  	  if (this.lFBS[0] === '' && this.lFBS[1] === '') {
  	    if (
			(this.lTM[0][0] != '' && this.lTM[0][1] != '') &&
			(this.lTM[1][0] === '' && this.lTM[1][1] === '')
		) {
  	      this.lTM[1] = [this.pY,this.pX];
  	      console.log('3');
  	    } else if (
			(this.lTM[0][0] != '' && this.lTM[0][1] != '') &&
			(this.lTM[1][0] != '' && this.lTM[1][1] != '') &&
			(this.lTM[2][0] === '' && this.lTM[2][1] === '')
		) {
  	      this.lTM[2] = [this.pY,this.pX];
  	      console.log('4');
  	    }
  	  }
  	}
	
	//I check that 'mob' really changed localisation (level)
  	return isDone;
  };

  //Functions to move 'mob' on fields with sign '1'.
  this.normalMobGoing = function() {
  	if (this.lFFP[0] != '' && this.lFFP[1] != '') {
  	  this.lFFP = ['',''];
  	  this.lTM[0] = [this.pY,this.pX];
  	  console.log('9');
  	} else if (this.lFFP[0] === '' && this.lFFP[1] === '') {
  	  if (this.lFBS[0] != '' && this.lFBS[1] != '') {
  	  	this.lFBS = ['',''];
  	  	console.log('10');
  	  }
  	}
  	if (this.lFBS[0] === '' && this.lFBS[1] === '') {
  	  if (
	  	(this.lTM[0][0] != '' && this.lTM[0][1] != '') &&
	  	(this.lTM[1][0] === '' && this.lTM[1][1] === '')
	  ) {
  	  	this.lTM[1] = [this.pY,this.pX];
  	  	console.log('3');
  	  } else if (
		  (this.lTM[0][0] != '' && this.lTM[0][1] != '') &&
		  (this.lTM[1][0] != '' && this.lTM[1][1] != '') &&
		  (this.lTM[2][0] === '' && this.lTM[2][1] === '')
	  ) {
  	  	this.lTM[2] = [this.pY,this.pX];
  	  	console.log('4');
  	  }
  	}
  	changeTable(
		this.currentData[0],
		this.currentData[1],
		this.currentData[2],
		'1'
	);
  	changeTable(this.lvl, this.pY, this.pX, '2');
  	this.changeLocalisationOfMobImage();
  	return false;
  };

  //SECOND ORDER FUNCTIONS
  this.checkCellWithoutMove = function() {
  	switch (table[this.lvl][this.pY][this.pX]) {
	  //Field is constantly occupied
  	  case '0': 
  	  case '5':
  	  case '8':
  	    return true;
  	    break;
	  //Function for moving the item as far as possible from me
  	  case '2':
  	  case '6':
  	    return this.mobMovingItem();
  	    break;
	  //Function to open closed door
  	  case '7':
		//Return false, if the door will open
  	    return false;
  	    break;
	  //Function to open door, if you have permissions
  	  case '9':
  	    return true;
  	    break;
  	  default:
  	    return true;
  	    break;
  	}
  };
  this.newCheckCell = function() {
  	switch (table[this.lvl][this.pY][this.pX]) {
  	  case '1':
  	    return this.normalMobGoing();
  	    break;
  	  case '3':
  	    return this.mobGoToNewLocation(-1);			
  	    break;
  	  case '4':
  	  return this.mobGoToNewLocation(1);
  	  break;
	  //Field is constantly occupied
  	  case '0': 
  	  case '5':
  	  case '8':
  	    return true;
  	    break;
	  //Function for moving the item as far as possible from me
  	  case '2':
  	  case '6':
		/*
		 * If a mob can get around an obstacle,
		 * don't let it move it - it's inelegant
		 */
  	    if (
			(this.secondCell === '1' ||  this.thirdCell === '1') && 
  	        !(
				(Math.abs(this.pY - this.destinationY) <= 1) &&
				(Math.abs(this.pX - this.destinationX) <= 1)
			)
		) {
  	    	return true;
  	    } else {
  	      return this.mobMovingItem();
  	    }
  	    break;
	  //Function to open closed door
  	  case '7':
  	    return false;
  	    break;
	  //Function to open door, if you have permissions
  	  case '9':
  	    return true;
  	    break;
  	  default:
		return false;
  	    break;
  	}
  };

  //MAIN FUNCTION
  this.determiningWhereToGo =  function() {
  	this.isDraggable = false;
  	this.tTM = ['','','','','','','',''];
  	this.aCG = 'undefined';
  	this.currentData = ['','',''];
  	this.sgnumY = 'undefined';
  	this.sgnumX = 'undefined';
  	this.secondCell = 'undefined';
  	this.thirdCell = 'undefined';
  	this.actualSignInCellAboutIsOccupied = 'undefined';
  	this.dirUpDown = 'undefined';
  	if (this.destinationY === this.pY && this.destinationX === this.pX) {
  	  this.isDraggable = true;
  	  this.lTM = [['',''],['',''],['','']];
  	  this.lFBS = ['',''];
  	  this.lFFP = ['',''];
  	  createCommunique('Odwiedzający pacjenta dotarł do celu.');
  	  clearInterval(this.mobMover);
  	} else if (this.destinationY != this.pY || this.destinationX != this.pX) {
  	  this.aCG =
		  document.getElementsByClassName(
			  'row',
			  )[this.pY].getElementsByClassName(
				  'cell',
				  )[this.pX];
  	  this.currentData = [this.lvl, this.pY, this.pX];
  	  this.sgnumY =
		  (this.pY - this.destinationY)/Math.abs(this.pY - this.destinationY);
  	  this.sgnumX =
		  (this.pX - this.destinationX)/Math.abs(this.pX - this.destinationX);
  	  if (isNaN(this.sgnumY)) {
  	    this.sgnumY = 0;
  	  }
  	  if (isNaN(this.sgnumX)) {
  	    this.sgnumX = 0;
  	  }
  	  if (this.lFBS[0] === '' && this.lFBS[1] === '') {
  	  	console.log('1');
  	  	if (this.lTM[0][0] === ''  && this.lTM[0][1] === '') {
  	  	  console.log('2');
  	  	  this.lTM[0] = [this.pY,this.pX];
  	  	} else if (
			!(this.lTM[2][0] === '' && this.lTM[2][1] === '') &&
			!(
				this.lTM[0][0] === this.lTM[2][0] &&
				this.lTM[0][1] === this.lTM[2][1]
			)
		) {
  	  	  console.log('5');
  	  	  this.lTM = [[this.pY,this.pX],['',''],['','']];
		  /*
		   * I'm starting from the beginning checking three following fields
		   * on which mob stayed.
		   */
  	  	} else if (
			!(this.lTM[2][0] === '' && this.lTM[2][1] === '') &&
			!(
			    !(this.lTM[0][0] === this.lTM[2][0]) &&
				!(this.lTM[0][1] === this.lTM[2][1])
			)
			) {
  	  	  console.log('6');
  	  	  this.sgnumY =
			  (this.lTM[0][0] - this.lTM[1][0]) /
			  Math.abs(this.lTM[0][0] - this.lTM[1][0]);
  	  	  this.sgnumX =
			  (this.lTM[0][1] - this.lTM[1][1]) /
			  Math.abs(this.lTM[0][1] - this.lTM[1][1]);
		  /*
		   * In the case, where 'mob' is in the same column as the target field,
		   * it assigns sgnumY number 0, similarly below for rows.
		   */
  	  	  if (isNaN(this.sgnumY)) {
  	  	  	this.sgnumY = 0;
  	  	  }
  	  	  if (isNaN(this.sgnumX)) {
  	  	  	this.sgnumX = 0;
  	  	  }
  	  	  console.log(this.sgnumY);
  	  	  console.log(this.sgnumX);
  	  	  this.pY += this.sgnumY;
  	  	  this.pX += this.sgnumX;
  	  	  this.lFBS = this.lTM[0];
  	  	  this.lFFP = this.lTM[1];
  	  	  console.log(this.lFBS);
  	  	  console.log(this.lFFP);
		  //Data about three last visited fields are removed.
  	  	  this.lTM = [['',''],['',''],['','']];
  	  	  this.leaveFromFirstPlaceBlindStreetDeterminingWhereToGo();
  	  	  return;
  	  	}
  	  } else if (this.lFBS[0] != '' && this.lFBS[1] != '') {
  	  	if (this.lFFP[0] != '' && this.lFFP[1] != '') {
  	  	  console.log('7');
  	  	  this.leaveFromFirstPlaceBlindStreetDeterminingWhereToGo();
  	  	  return;
  	  	} else if (this.lFFP[0] === '' && this.lFFP[1] === '') {
  	  	  console.log('8');
  	  	  this.sgnumY =
			  (this.pY - this.lFBS[0])/Math.abs(this.pY - this.lFBS[0]);
  	  	  this.sgnumX =
			  (this.pX - this.lFBS[1])/Math.abs(this.pX - this.lFBS[1]);
		  /*
		   * In the case, where 'mob' is in the same column as the target field,
		   * it assigns sgnumY number 0, similarly below for rows.
		   */
  	  	  if (isNaN(this.sgnumY)) {
  	  	  	this.sgnumY = 0;
  	  	  }
  	  	  if (isNaN(this.sgnumX)) {
  	  	  	this.sgnumX = 0;
  	  	  }
  	  	  console.log(this.sgnumY);
  	  	  console.log(this.sgnumX);
  	  	  this.pY += this.sgnumY;
  	  	  this.pX += this.sgnumX;
  	  	  this.leaveFromBlindStreetDeterminingWhereToGo();
  	  	  return;
  	  	}		
  	  }
      /*
	   * I'm trying to stay on subsequently fields, if in 'table' it field is 
	   * signed by '1', I don'y stay on it.
	   * 
	   * I'm checking, what is possible to do around 'mob' in the case,
	   * when target field isn't in single row or column with field,
	   * in which 'mob' is.
	   */
  	  if (this.sgnumY != 0 && this.sgnumX != 0) {
	    //I'm substracting 'sgnum', because 'Visitor' strives to reach the goal.
  	    this.pY += -this.sgnumY;
  	    this.pX += -this.sgnumX;
  	    this.secondCell = table[this.lvl][this.pY][this.pX + this.sgnumX];
  	    this.thirdCell = table[this.lvl][this.pY + this.sgnumY][this.pX];
  	    if (this.newCheckCell()) {
  	      this.tTM[0] = table[this.lvl][this.pY][this.pX];
  	      this.pX += this.sgnumX;
  	      if (this.newCheckCell()) {
  	        this.tTM[1] = table[this.lvl][this.pY][this.pX];
  	        this.pY += this.sgnumY;
  	        this.pX -= this.sgnumX;
  	        if (this.newCheckCell()) {
  	          this.tTM[2] = table[this.lvl][this.pY][this.pX];
  	          this.pY += this.sgnumY;
  	          if (
		  	      (
		  	  	      this.tTM[0] === "0" ||
		  	  	      this.tTM[0] === "5" ||
		  	  	      this.tTM[0] === "8" ||
		  	  	      this.tTM[0] === "9"
		  	      ) &&
		  	      (
		  	  	      this.tTM[1] === "0" ||
		  	  	      this.tTM[1] === "5" ||
		  	  	      this.tTM[1] === "8" ||
		  	  	      this.tTM[1] === "9"
		  	      ) &&
		  	      (
		  	  	      this.tTM[2] === "0" ||
		  	  	      this.tTM[2] === "5" ||
		  	  	      this.tTM[2] === "8" ||
		  	  	      this.tTM[2] === "9"
		  	      )
		      ) {
  	          	if (this.newCheckCell()) {
  	          	  this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	          	  this.pY -= this.sgnumY;
  	          	  this.pY -= this.sgnumY;
  	          	  this.pX += this.sgnumX;
  	          	  this.pX += this.sgnumX;
  	          	  if (this.newCheckCell()) {
  	          	    this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	          	    this.pY += this.sgnumY;
  	          	    if (
		  	  	        (
		  	  	        	this.tTM[3] === "0" ||
		  	  	        	this.tTM[3] === "5" ||
		  	  	        	this.tTM[3] === "8" ||
		  	  	        	this.tTM[3] === "9"
		  	  	        ) &&
		  	  	        (
		  	  	        	this.tTM[4] === "0" ||
		  	  	        	this.tTM[4] === "5" ||
		  	  	        	this.tTM[4] === "8" ||
		  	  	        	this.tTM[4] === "9"
		  	  	        )
		  	        ) {
  	          	      if (this.newCheckCell()) {
  	          	        this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	          	        this.pY += this.sgnumY;
  	          	        this.pX -= this.sgnumX;
  	          	        if (this.newCheckCell()) {
  	          	          this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	          	          this.pY += this.sgnumY;
  	          	          if (
		  	    	          (
		  	    	      	    this.tTM[5] === "0" ||
		  	    	      	    this.tTM[5] === "5" ||
		  	    	      	    this.tTM[5] === "8" ||
		  	    	      	    this.tTM[5] === "9"
		  	    	          ) &&
		  	    	          (
		  	    	      	    this.tTM[6] === "0" ||
		  	    	      	    this.tTM[6] === "5" ||
		  	    	      	    this.tTM[6] === "8" ||
		  	    	      	    this.tTM[6] === "9"
		  	    	          )
		  	              ) {
  	          	            if (this.newCheckCell()) {
  	          	              this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	              this.pY -= this.sgnumY;
  	          	              this.pX -= this.sgnumX;							
  	          	            }
		  	              } else {
  	          	            if (this.checkCellWithoutMove()) {
  	          	              this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	              this.pY -= this.sgnumY;
  	          	              this.pX -= this.sgnumX;
  	          	            }
		  	  	          }
		  	            }
  	          	      }
		            } else {
  	          	      if (this.checkCellWithoutMove()) {
  	          	        this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	          	        this.pX += this.sgnumX;
  	          	        this.pY -= this.sgnumY;
  	          	        if (this.checkCellWithoutMove()) {
  	          	          this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	          	          this.pY += this.sgnumY;
  	          	          if (this.checkCellWithoutMove()) {
  	          	            this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	            this.pY -= this.sgnumY;
  	          	            this.pX -= this.sgnumX;					
  	          	          }
		  	  	        }
		  	          }
		  	        }
  	              }
		        }
	          } else {
  	            if (this.checkCellWithoutMove()) {
  	              this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	              this.pY += this.sgnumY;
  	              this.pY += this.sgnumY;
  	              this.pX -= this.sgnumX;
  	              this.pX -= this.sgnumX;
  	              if (this.checkCellWithoutMove()) {
  	              	this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	              	this.pX += this.sgnumX;
  	                if (this.checkCellWithoutMove()) {
  	                  this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	                  this.pX += this.sgnumX;
  	                  this.pY -= this.sgnumY;
  	                  if (this.checkCellWithoutMove()) {
  	                  	this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	                  	this.pY += this.sgnumY;
  	                    if (this.checkCellWithoutMove()) {
  	                      this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	                      this.pY -= this.sgnumY;
  	                      this.pX -= this.sgnumX;
		        	    }
		        	  }
		        	}
		          }
          		}
          	  }	
            }
          }
        }
      } else if (this.sgnumY != 0 && this.sgnumX === 0) {
  	    /*
	     * I'm trying to stay on subsequently fields, if in 'table' it field is 
	     * signed by '1', I don'y stay on it.
	     * 
	     * I'm checking, what is possible to do around 'mob' in the case,
	     * when target field isn't in single row or column with field,
	     * in which 'mob' is.
	     */

		//I'm substracting 'sgnum', because 'Visitor' strives to reach the goal.
		this.pY += -this.sgnumY;
  	    this.secondCell =
		    table[this.lvl][this.pY + this.sgnumX][this.pX + this.sgnumY];
  	    this.thirdCell =
		    table[this.lvl][this.pY - this.sgnumX][this.pX - this.sgnumY];
  	    if (this.newCheckCell()) {
  	      this.tTM[0] = table[this.lvl][this.pY][this.pX];
  	      this.pX += this.sgnumY;
  	      if (this.newCheckCell()) {
  	      	this.tTM[1] = table[this.lvl][this.pY][this.pX];
  	      	this.pX -= this.sgnumY;
  	      	this.pX -= this.sgnumY;
  	        if (this.newCheckCell()) {
  	    	  this.tTM[2] = table[this.lvl][this.pY][this.pX];
  	    	  this.pY += this.sgnumY;
  	    	  if (
				  (
					  this.tTM[0] === "0"  ||
					  this.tTM[0] === "5"  ||
					  this.tTM[0] === "8"  ||
					  this.tTM[0] === "9"
				  ) &&
				  (
					  this.tTM[1] === "0"  ||
					  this.tTM[1] === "5"  ||
					  this.tTM[1] === "8"  ||
					  this.tTM[1] === "9"
				  ) &&
				  (
					  this.tTM[2] === "0"  ||
					  this.tTM[2] === "5"  ||
					  this.tTM[2] === "8"  ||
					  this.tTM[2] === "9"
				  )
			  ) {
  	    	  	if (this.newCheckCell()) {
  	    	  	  this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	    	  	  this.pX += this.sgnumY;
  	    	  	  this.pX += this.sgnumY;
  	    	  	  if (this.newCheckCell()) {
  	    	  	    this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	    	  	    this.pY += this.sgnumY;
  	    	  	    if (
			  		    (
			  		        this.tTM[3] === "0"  ||
			  		  	    this.tTM[3] === "5"  ||
			  		  	    this.tTM[3] === "8"  ||
			  		  	    this.tTM[3] === "9"
			  	        ) &&
			  		    (
			  		  	    this.tTM[4] === "0"  ||
			  		  	    this.tTM[4] === "5"  ||
			  		  	    this.tTM[4] === "8"  ||
			  		  	    this.tTM[4] === "9"
			  		    )
			  	    ) {
  	    	          if (this.newCheckCell()) {
  	    	            this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	    	            this.pX -= this.sgnumY;
  	    	            this.pX -= this.sgnumY;
  	    	            if (this.newCheckCell()) {
  	    	              this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	    	              this.pX += this.sgnumY;
  	    	              if (
			  		  	      (
			  		  	      	  this.tTM[5] === "0" ||
			  		  	      	  this.tTM[5] === "5" ||
			  		  	      	  this.tTM[5] === "8" ||
			  		  	      	  this.tTM[5] === "9"
			  		  	      ) &&
			  		  	      (
			  		  	      	  this.tTM[6] === "0" ||
			  		  	      	  this.tTM[6] === "5" ||
			  		  	      	  this.tTM[6] === "8" ||
			  		  	      	  this.tTM[6] === "9"
			  		  	      )
			  		      ) {
  	    	                if (this.newCheckCell()) {
  	    	                  this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	    	                  this.pX -= this.sgnumY;									
  	    	                }
			  		      } else {
  	    	                if (this.checkCellWithoutMove()) {
  	    	                  this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	    	                  this.pX -= this.sgnumY;
  	    	                }
			  		      }
			  		    }
  	    	          }
			  	    } else {
  	    	  	      if (this.checkCellWithoutMove()) {
  	    	  	        this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	    	  	        this.pX -= this.sgnumY;
  	    	  	        this.pX -= this.sgnumY;
  	    	  	        if (this.checkCellWithoutMove()) {
  	    	  	          this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	    	  	          this.pX += this.sgnumY;
  	    	  	          if (this.checkCellWithoutMove()) {
  	    	  	            this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	    	  	            this.pX -= this.sgnumY;					
  	    	                }
			  	        }
			  	      }
			  	    }
  	    	      }
			    }
			  } else {
  	    	    if (this.checkCellWithoutMove()) {
  	    	      this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	    	      this.pX += this.sgnumY;
  	    	      this.pX += this.sgnumY;
  	    	      if (this.checkCellWithoutMove()) {
  	    	        this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	    	        this.pY += this.sgnumY;
  	    	        if (this.checkCellWithoutMove()) {
  	    	          this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	    	          this.pX -= this.sgnumY;
  	    	          this.pX -= this.sgnumY;
  	    	          if (this.checkCellWithoutMove()) {
  	    	            this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	    	            this.pX += this.sgnumY;
  	    	            if (this.checkCellWithoutMove()) {
  	    	              this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	    	              this.pX -= this.sgnumY;
  	    	            }
			          }
			        }
			      }
			    }
			  }	
  	    	}
		  }
		}
  	  } else if (this.sgnumY === 0 && this.sgnumX != 0) {
  	    /* 
	     * I'm checking, what is possible to do around 'mob' in the case,
	     * when target field isn't in single row or column with field,
	     * in which 'mob' is.
	     */

		//I'm substracting 'sgnum', because 'Visitor' strives to reach the goal.
		this.pX += -this.sgnumX;
  	    this.secondCell =
	    	table[this.lvl][this.pY + this.sgnumX][this.pX + this.sgnumY];
  	    this.thirdCell =
			table[this.lvl][this.pY - this.sgnumX][this.pX - this.sgnumY];
  	    if (this.newCheckCell()) {
  	      this.tTM[0] = table[this.lvl][this.pY][this.pX];
  	      this.pY += this.sgnumX;
  	      if (this.newCheckCell()) {
  	      	this.tTM[1] = table[this.lvl][this.pY][this.pX];
  	      	this.pY -= this.sgnumX;
  	      	this.pY -= this.sgnumX; 
  	        if (this.newCheckCell()) {
  	          this.tTM[2] = table[this.lvl][this.pY][this.pX];
  	          this.pX += this.sgnumX;
  	          if (
				  (
				  	  this.tTM[0] === "0" ||
				  	  this.tTM[0] === "5" ||
				  	  this.tTM[0] === "8" ||
				  	  this.tTM[0] === "9"
				  ) &&
				  (
				  	  this.tTM[1] === "0" ||
				  	  this.tTM[1] === "5" ||
				  	  this.tTM[1] === "8" ||
				  	  this.tTM[1] === "9"
				  ) &&
				  (
				  	  this.tTM[2] === "0" ||
				  	  this.tTM[2] === "5" ||
				  	  this.tTM[2] === "8" ||
				  	  this.tTM[2] === "9"
				  )
				) {
  	          	if (this.newCheckCell()) {
  	          	  this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	          	  this.pY += this.sgnumX;
  	          	  this.pY += this.sgnumX;
  	          	  if (this.newCheckCell()) {
  	          	    this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	          	    this.pX += this.sgnumX;
  	          	    if (
						(
							this.tTM[3] === "0" ||
							this.tTM[3] === "5" ||
							this.tTM[3] === "8" ||
							this.tTM[3] === "9"
						) &&
						(
							this.tTM[4] === "0" ||
							this.tTM[4] === "5" ||
							this.tTM[4] === "8" ||
							this.tTM[4] === "9"
						)
					) {
  	          	      if (this.newCheckCell()) {
  	          	        this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	          	        this.pY -= this.sgnumX;
  	          	        this.pY -= this.sgnumX;
  	          	        if (this.newCheckCell()) {
  	          	          this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	          	          this.pY += this.sgnumX;
  	          	          if (
					  		  (
					  		  	  this.tTM[5] === "0" ||
					  		  	  this.tTM[5] === "5" ||
					  		  	  this.tTM[5] === "8" ||
					  		  	  this.tTM[5] === "9"
					  		  ) &&
					  		  (
					  		  	  this.tTM[6] === "0" ||
					  		  	  this.tTM[6] === "5" ||
					  		  	  this.tTM[6] === "8" ||
					  		  	  this.tTM[6] === "9"
					  		  )
					  	  ) {
  	          	            if (this.newCheckCell()) {
  	          	              this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	              this.pY += this.sgnumX;									
  	          	            }
					  	  } else {
  	          	            if (this.checkCellWithoutMove()) {
  	          	              this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	              this.pY += this.sgnumX;
  	          	            }
					  	  }
					    }
  	          	      }
				    } else {
  	          	      if (this.checkCellWithoutMove()) {
  	          	        this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	          	        this.pY -= this.sgnumX;
  	          	        this.pY -= this.sgnumX;
  	          	        if (this.checkCellWithoutMove()) {
  	          	          this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	          	          this.pY += this.sgnumX;
  	          	          if (this.checkCellWithoutMove()) {
  	          	            this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	        	this.pY += this.sgnumX;					
  	          	          }
					    }
					  }
					}
  	              }
				}
			  } else {
  	          	if (this.checkCellWithoutMove()) {
  	          	  this.tTM[3] = table[this.lvl][this.pY][this.pX];
  	          	  this.pY += this.sgnumX;
  	          	  this.pY += this.sgnumX;
  	          	  if (this.checkCellWithoutMove()) {
  	          	    this.tTM[4] = table[this.lvl][this.pY][this.pX];
  	          	    this.pX += this.sgnumX;
  	          	    if (this.checkCellWithoutMove()) {
  	          	      this.tTM[5] = table[this.lvl][this.pY][this.pX];
  	          	      this.pY -= this.sgnumX;
  	          	      this.pY -= this.sgnumX;
  	          	      if (this.checkCellWithoutMove()) {
  	          	        this.tTM[6] = table[this.lvl][this.pY][this.pX];
  	          	        this.pY += this.sgnumX;
  	          	        if (this.checkCellWithoutMove()) {
  	          	          this.tTM[7] = table[this.lvl][this.pY][this.pX];
  	          	          this.pY += this.sgnumX;
  	          	        }
					  }
					}
				  }
				}
			  }	
  	        }
		  }
		}
  	  } 
  	}
  	this.isDraggable = true;
  };
}
/*............................................................................*/