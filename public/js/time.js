'use strict';
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

//=============================================================================/
// Functions to create and run game's clock.
//=============================================================================/

//=============================================================================/
// FUNCTIONS DEFINITIONS
//=============================================================================/

/**
 * Display time to the player above game area.
 */
function showTime() {
  let minutes = playerTime[3] < 10 ? `0${playerTime[3].toString()}` :
      playerTime[3].toString();
  document.getElementById('showTime').innerHTML =
      '| Week: ' +
	  playerTime[0] +
	  ' | Day: ' +
	  playerTime[1] +
	  ' | Time: ' +
      playerTime[2] +
	  ':' +
      minutes
  ;
}

/**
 * "Mechanism" of game's clock
 */
function gameClock() {
  playerTime[3]++;
  if (playerTime[3] === 60) {
  	playerTime[2]++;
  	playerTime[3] = 0;
  	if (playerTime[2] === 24) {
  	  playerTime[1]++;
  	  playerTime[2] = 0;
  	  if (playerTime[1] === 8) {
  	  	playerTime[0]++;
  	  	playerTime[1] = 1;
  	  	if (playerTime[0] === 4) {
		  const message =
		      'Gra została ukończona w czasie 4 tygodni - ' +
			  'zostałeś wypisany/a ze szpitala.';
  	  	  alert(message);
  	  	}
  	  }
  	}
  }
}

/**
 * Show current time and run game's clock.
 * Time is updated after each 60000 miliseconds.
 */
function runClock() {
  launchedClock = setInterval(function(){
      gameClock();
      showTime();
  }, 60000);
}