'use strict';
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

//=============================================================================/
// Executed functions after window loading
//=============================================================================/

window.onload = function() {
    let promise = new Promise((resolve, reject) => {
        createGameArea();
        transferDataFromPHP('player-game-data');
        resolve(true);
    });
    promise.then((result, error) => {
        return new Promise((resolve, reject) => {
            prepareGameArea();
            putMobsPictures();
            putPlayerPicture();
            putThingsPictures();
            resolve(true);
        });
    }).then((result, error) => {
        return new Promise((resolve, reject) => {
            setEventsListeners();
            runClock();
            showTime();
            resolve(true);
        });
    });
};
/*............................................................................*/