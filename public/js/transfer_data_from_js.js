'use strict';
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

//=============================================================================/
// FUNCTIONS DEFINITIONS
//=============================================================================/

/**
 * Log out account.
 * 
 * .1. Prevent sending a request to FrontController
 * .2. Check if a player really wants to log out
 * .3. Depending on player's decision, log out account or cancel log out.
 * 
 * @var {Event} evt Form event
 */
function logout(evt) {
  evt.preventDefault();
  let msg = "Czy na pewno wylogować konto?\n" +
      "Po wylogowaniu cała niezapisana rozgrywka zostanie utracona!";
  if (window.confirm(msg)) {
    $('form[name="logout"]').submit();   
  } else {
    $('form[name="logout"]').one('submit', function(evt){logout(evt)});
  }
}

/**
 * Clone @var {Array} table
 * 
 * @return {Array} Cloned variable.
 */
function cloneTable() {
  let tableClone = [];
  for (let i = 0; i < table.length; i++) {
    tableClone[i] = [];
    for (let j = 0; j < table[i].length; j++) {
      tableClone[i][j] = [];
      for (let k = 0; k < table[i][j].length; k++) {
        tableClone[i][j][k] = table[i][j][k];   
      }
    }
  }
  
  return tableClone;
}

/**
 * Convert data about areas to JSON.
 * 
 * @return {string}
 */
function jsonAreas() {
  let tableCopy = cloneTable();
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i <= 59; i++) {
      tableCopy[k][i] = tableCopy[k][i].join('');
    }
  }

  return JSON.stringify(tableCopy);
}

/**
 * Clone @var {Array} things and convert to {Object}
 * 
 * @return {Object}
 */
function cloneThings() {
  let thingsClone = new Object();
  for (let i = 0; i < thingsNames.length; i++) {
    thingsClone[thingsNames[i]] = things[i];
  }
  
  return thingsClone;
}

/**
 * Convert data about things to JSON.
 * 
 * @return {string} 
 */
function jsonThings() {
  return JSON.stringify(cloneThings());
}

/**
 * Clone @var {Array} mobs and convert to {Object}
 * 
 * @return {Array}
 */
function cloneMobs() {
  let mobsClone = new Object();
  for (let i = 0; i < mobsNames.length; i++) {
    mobsClone[mobsNames[i]] = mobs[i];
  }
  
  return mobsClone;
}

/**
 * Convert data about mobs to JSON.
 * 
 * @return {string}
 */
function jsonMobs() {
  return JSON.stringify(cloneMobs());
}

/**
 * Convert data about player to JSON.
 * 
 * @return {string}
 */
function jsonPlayer() {
  return JSON.stringify(player);   
}

/**
 * Prepare string with player's time in proper format.
 * 
 * @return {string}
 */
function stringifyPlayerTime () {
    let formattedPlayerTime = playerTime.slice(0);
    if (playerTime[3] < 10) {
      formattedPlayerTime[3] = '0' + Number(playerTime[3])
    }
    if (playerTime[2] < 10) {
      formattedPlayerTime[2] = '0' + Number(playerTime[2])
    }

    return JSON.stringify(formattedPlayerTime);
}

/**
 * Create hidden input with specified name and value.
 * 
 * @var    {string} name  Name of input
 * @var    {string} value Value of input
 * 
 * @return {Element}
 */
function createHiddenInput(name, value) {
  let newInput = document.createElement('input');
  newInput.setAttribute('type', 'hidden');
  newInput.setAttribute('name', name);
  newInput.setAttribute('value', value);
  
  return newInput;
}

/**
 * In "src/Controller/FrontController.php" in method for route "game" form
 * to game saving is passed to Twig template. On submitting, data from 
 * <input type="hidden" id="data_container"> is sended to mentioned
 * controller.
 * 
 * Below defined method is used for transfer data from global variables to 
 * this input by data-* attributes. On the end these attributes are removed.
 * 
 * This is the way to transfer data from JS to PHP.
 * 
 * @var {Event} evt Form event
 */
function saveGame(evt) {
  evt.preventDefault();

  let areasJson = jsonAreas();
  let thingsJson = jsonThings();
  let mobsJson = jsonMobs();
  let playerJson = jsonPlayer();
  let playerTimeString = stringifyPlayerTime();
  
  let newInput_1 = createHiddenInput('data-areas', areasJson);
  let newInput_2 = createHiddenInput('data-things', thingsJson);
  let newInput_3 = createHiddenInput('data-mobs', mobsJson);
  let newInput_4 = createHiddenInput('data-player-mob', playerJson);
  let newInput_5 = createHiddenInput('data-player-time', playerTimeString);
  
  let divInForm = document.getElementById('save_game');
  divInForm.appendChild(newInput_1);
  divInForm.appendChild(newInput_2);
  divInForm.appendChild(newInput_3);
  divInForm.appendChild(newInput_4);
  divInForm.appendChild(newInput_5);
  
  $('form[name="save_game"]').submit();
  $('form[name="save_game"]').one('submit', function(evt){saveGame(evt)});
  
  createCommunique('Zapisywanie gry..');
}
/*............................................................................*/