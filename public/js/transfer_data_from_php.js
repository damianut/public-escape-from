'use strict';
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

//=============================================================================/
// Functions for transfer data from PHP to JS.
//=============================================================================/

//=============================================================================/
// FUNCTIONS DEFINITIONS
//=============================================================================/

/**
 * Load last game.
 * 
 * .1. Prevent sending a request to FrontController
 * .2. Check if a player really wants to load last game and losing all not
 *     saved changes in game.
 * .3. Depending on player's decision, load last game or cancel loading.
 * 
 * @var {Event} evt Form event
 */
function loadLastGame(evt) {
  evt.preventDefault();
  let msg = "Czy na pewno wczytać ostatni zapis?\n" +
      "Po wczytaniu zapisu cała niezapisana rozgrywka zostanie utracona!";
  if (window.confirm(msg)) {
    $('form[name="load_game"]').submit();   
  } else {
    $('form[name="load_game"]').one('submit', function(evt){loadLastGame(evt)});  
  }
}
  
/**
 * Save data in global @var {Array} table and split cell with data about
 * each rows in game.
 * 
 * 'k' is the number of level (0, 1, 2, 3)
 * 'i' us the number of row (0, 1, 2, ... 59)
 * 
 * @var {string} areasData Data about fields in JSON format
 */
function transferDataToTable(areasData) {
  areasData = JSON.parse(areasData);
  let k = 0;
  for (let area in areasData) {
    table[k++] = areasData[area];  
  }
  for (k = 0; k < 4; k++) {
    for (let i = 0; i <= 59; i++) {
      table[k][i] = table[k][i].split('');
    }
  }
}

/**
 * Save data about things in game in @var {Array} things
 * 
 * @var {string} thingsData Data about "things" in JSON format
 */
function transferDataToThings(thingsData) {
  let thingsObject = JSON.parse(thingsData);
  let i = 0;
  for (let attrName in thingsObject) {
    things[i++] = thingsObject[attrName];
  }
  for (i = 0; i < thingsNames.length; i++) {
    let result = jQuery.inArray(
        thingsNames[i][0],
        ['doors1', 'doors2', 'doors3']
    );
    /**
     * All "things" expect doors are placed on game area.
     * In this purpose URLs to images's of this "things" are saved 
     * in "src" attribute.
     */
    if (-1 === result) {
      things[i].picture =
          `${location.origin}/images/game/movable/${thingsNames[i][0]}.png`;
    }
  }
}

/**
 * Save data about mobs in game in @var {Array} mobs
 * 
 * @var {string} mobsData Data about mobs in JSON format
 */
function transferDataToMobs(mobsData) {
  let mobsObject = JSON.parse(mobsData);
  let i = 0;
  for (let attrName in mobsObject) {
    mobs[i++] = mobsObject[attrName];
  }
  for (let i = 0; i < mobs.length; i++) {
  	mobs[i].picture = 
        `${location.origin}/images/game/mobs/${mobsNames[i][0]}.png`; 
  	switch (mobsNames[i]) {
  	  case 'mobOtherFamily':
  		for (let j = 0; j < mobs[i].length; j++) {
  		  mobs[i][j] =
  		      new MobOtherFamily(
  		    	    'mobOtherFamily',
  		    	    mobs[i].picture,
  		    	    mobs[i][j].lvl,
  		    	    mobs[i][j].pY,
  		    	    mobs[i][j].pX,
  		    	    mobs[i][j].deg,
  		    	    mobs[i][j].velocity,
  		    	    mobs[i][j].destinationY,
  		    	    mobs[i][j].destinationX,
  	  	      );
  		}
    }
  }
}

/**
 * Save data about player in @var {Player} player
 * 
 * @var {string} playerData Data about player in JSON format
 */
function transferDataToPlayer(playerData) {
  let playerTempObject = JSON.parse(playerData);
  let pictureSrc = `${location.origin}/images/game/movable/player.png`;
  player = new Player(
      pictureSrc,
      playerTempObject.lvl,
      playerTempObject.pX,
      playerTempObject.pY,
      playerTempObject.deg,
      playerTempObject.velocity,
      playerTempObject.isBusy,
      playerTempObject.isSitting,
      playerTempObject.isDraggable,
  );
}

/**
 * Save data about player's time in game in @var {string} playerTime
 * 
 * @var {string} playerTimeData Data about player.
 */
function transferDataToPlayerTime(playerTimeData) {
  playerTime = [
    Number(playerTimeData.charAt(1)),
    Number(playerTimeData.charAt(3)),
    Number(playerTimeData.substring(5,7)),
    Number(playerTimeData.substring(8,10)),
  ];
}

/**
 * In "src/Controller/FrontController.php" in method for route "game" data
 * about game from database is passed to Twig template. While rendering, 
 * <div> with this data in attributes's values of this <div> is created.
 * 
 * Below defined method is used for transfer data from <div> about player's game
 * and save in global variables. On the end <div> is removed.
 * 
 * This is the way to transfer data from PHP to JavaScript.
 * 
 * @var {string} divId Id of <div> with data about player's game
 */
function transferDataFromPHP(divId) {
  let prefixed = '#' + divId;
  
  let areasData = $(prefixed).attr('data-areas');
  let thingsData = $(prefixed).attr('data-things');
  let mobsData = $(prefixed).attr('data-mobs');
  let playerData = $(prefixed).attr('data-player-mob');
  let playerTimeData = $(prefixed).attr('data-player-time');
  
  transferDataToTable(areasData);
  transferDataToThings(thingsData);
  transferDataToMobs(mobsData);
  transferDataToPlayer(playerData);
  transferDataToPlayerTime(playerTimeData);

  /**
   * Remove element with player's data from DOM.
   */
  $(prefixed).remove();
}
/*............................................................................*/