<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\DateTime;

/**
 * Processing DateTime objects:
 * -counting interval between timestamps
 */
class DateTimeProcessing
{
  /**
   * Counting number of seconds from now to time from DateTime object.
   * 
   * @param  \DateTime $dateTime1
   * 
   * @return int       $seconds   Time in seconds. 
   */
  public function intervalSeconds(\DateTime $dateTime1): int
  {
    $dateTime2 = new \DateTime();
    $seconds2 = $dateTime2->getTimestamp();
    $seconds1 = $dateTime1->getTimestamp();
    $seconds = $seconds2 - $seconds1;
    
    return $seconds;
  }
}