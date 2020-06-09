'use strict';
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

//=============================================================================/
// Functions for prepare game area to play. 
//=============================================================================/

//=============================================================================/
// FUNCTIONS DEFINITIONS (FD)
//=============================================================================/


//=============================================================================/
// (FD): pictures manipulation
//=============================================================================/

/**
 * Remove images of mobs and things from game area.
 */
function clearGameArea() {
  const cellsToClear = document.getElementsByClassName('cell');
  for (let i = 0; i < cellsToClear.length; i++) {
      cellsToClear[i].src = `${location.origin}/images/game/mobs/clean.png`;
  }   
}

/**
 * Changing background of game area to the correct one
 */
function properBackground() {
  let lvl = player.lvl.toString();
  document.getElementById('mapReal').src =
      `${location.origin}/images/game/levels/pietro${lvl}.jpg`; 
}

/**
 * Put picture of one from movable elements (except for the player) of game
 * in proper orientation.
 * 
 * @var {Array}   movables "things" or "mobs"
 * @var {integer} i        An indicator pointing to type of thing
 * @var {integer} j        Position of particular thing in things[i] array.
 */
function putPicture(movables, i, j) {
  let oneElement = 
      document.getElementsByClassName('row')[movables[i][j].pY].
      getElementsByClassName('divCell')[movables[i][j].pX].children[0];
  oneElement.src = movables[i].picture;
  oneElement.style.transform = `rotate(${movables[i][j].deg}deg)`;
}
 
/**
 * Put 'mobs's pictures on map in proper orientation:
 */
function putMobsPictures() {
  for (let i = 0; i < mobs.length; i++) {
  	for (let j = 0; j < mobs[i].length; j++) {
  	  if (mobs[i][j].lvl === player.lvl) {
        putPicture(mobs, i, j);      
      }
  	}
  }
}

/**
 * Put player's picture on map in proper orientation:
 */
function putPlayerPicture() {
  let oneElement = 
      document.getElementsByClassName('row')[player.pY].
      getElementsByClassName('divCell')[player.pX].children[0];
  oneElement.src = player.picture;
  oneElement.style.transform = `rotate(${player.deg}deg)`;   
}

/**
 * Put 'things's pictures on map in proper orientation:
 */
function putThingsPictures() {
  for (let i = 0; i < things.length; i++) {
  	for (let j = 0; j < things[i].length; j++) {
	  let result = jQuery.inArray(
          thingsNames[i][0],
          ['doors1', 'doors2', 'doors3']
      );
      if (-1 === result && things[i][j].lvl === player.lvl) {
        putPicture(things, i, j);
  	  }
  	}
  }
}


//=============================================================================/
// (FD): creating or refreshing game area
//=============================================================================/

/**
 * Scroll to player position.
 */
function scrollToPlayer() {
  document.getElementById('gameArea').scrollTo(
      (player.pX * 40) - 200,
      (player.pY * 40) - 240,
  );  
}

/**
 * Creating game area with 60 rows and 48 columns
 * for 'things's pictures and mob's pictures and player's picture.
 * Game area has following structure:
 * 
 * <div id="tableWithImages"> contains 60 <div class="row"> elements. 
 * Each "row" has 48 <div class="divCell"> elements.
 * Each <div class="divCell"> contains <img class="cell"> element.
 * 
 * Part of described above elements have attached event listeners for
 * interacting with player while game.
 */
function createGameArea() {
  const board = document.getElementById('tableWithImages');
  for (let i = 0; i <= 59; i++) {
    const rowY = document.createElement('div');
    rowY.classList.add('row');	
    rowY.id = i.toString();	
    for (let j = 0; j <= 47; j++) {
      const columnDiv = document.createElement('div');
      columnDiv.classList.add('divCell');
      columnDiv.id = j.toString();
      columnDiv.addEventListener(
          'dragover',
          function () {event.preventDefault()},
	  );
      columnDiv.addEventListener(
          'drop',
          function () {dropInDiv(event)},
	  );
      columnDiv.addEventListener(
          'contextmenu',
          function () {sitOnChair(event)},
	  );
      rowY.appendChild(columnDiv);  
      const columnCell = document.createElement('img');
      columnCell.classList.add('cell');
      columnCell.addEventListener(
          'click',
          function () {player.openDoor(event)},
	  );
      columnCell.addEventListener(
          'dragstart',
          function () {dropImg(event)},
	  );
      columnDiv.appendChild(columnCell);
    }
    board.appendChild(rowY);
  }
}

/** 
 * Clear game area from images of mobs and things. 
 * Change background and focus view on player's position (by scrolling).
 */ 
function prepareGameArea() {
  clearGameArea();
  properBackground();
  scrollToPlayer();
}

/**
 * Events listeners for:
 * .1. Game saving
 * .2. Logout <<TEMP DONE>>
 * .3. Game loading <<TEMP DONE>>
 * .4. (...)
 */
function setEventsListeners() {
  $('form[name="save_game"]').one('submit', function(evt){saveGame(evt)});
  $('form[name="logout"]').one('submit', function(evt){logout(evt)});
  $('form[name="load_game"]').one('submit', function(evt){loadLastGame(evt)});
  $('#gameArea').on(
    'keypress',
    function() {
        setTimeout(
            function (keyCode) {
                player.going(keyCode);
            },
            player.velocity,
            event.keyCode);
    });//here takes place player's handling
  $('#clearInfoBox').on('click', clearInfoBox);
/** Code for testing purposes:
 * 
 *  $('#load_table').on('click', function() {console.log(table)});
 *  $('#load_things').on('click', function() {console.log(things)});
 *  $('#load_player').on('click', function() {console.log(player)});
 *  $('#load_thingsNames').on('click', function() {console.log(thingsNames)});
 *  $('#load_mobs').on('click', function() {console.log(mobs)});
 *  $('#moveMob').on(
 *  	  'click',
 *  	  function() {
 *  	    mobs[8][0].mobMover = setInterval(
 *  	  	    function() {mobs[8][0].determiningWhereToGo()},
 *            mobs[8][0].velocity
 *        );
 *  	  });
 *  $('#stayMob').on(
 *  	  'click',
 *          function() {clearInterval(mobs[8][0].mobMover)});
 */
}
/*............................................................................*/