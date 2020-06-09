<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\TextProcessing;

/**
 * Class to performing actions on text.
 */
class TextProcessing
{
  /**
   * Check that password contains only "word's" character and !@#_
   * 
   * @param  string $pwd Password
   * 
   * @return bool        True if contains only mentioned above characters,
   *                     false otherwise.
   */
  public function checkPwd(string $pwd): bool
  {
    return 1 === preg_match('/[^\w\!\@\#\_]+/', $pwd) ? false : true;
  }
  
  /**
   * Check that nick contains only "word's" character and _
   * 
   * @param  string $nick Nick
   * 
   * @return bool         True if contains only mentioned above characters,
   *                      false otherwise.
   */
  public function checkNick(string $nick): bool
  {
    return 1 === preg_match('/[^\w\_]+/', $nick) ? false : true;
  }
}
/*............................................................................*/
