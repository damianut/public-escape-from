<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Entities;

use App\Entity\Game;

/**
 * Update "Game" entity with data in JSON format.
 */
class UpdateGame
{
  /**
   * "Game" Entity which should be updated.
   * 
   * @var Game
   */
  private $game;
   
  /**
   * @param Game $game;
   */
  public function __construct(Game $game)
  {
    $this->game = $game;   
  }
  
  /**
   * Get Game Entity
   * 
   * @return Game $this->game
   */
  public function returnGame(): Game
  {
    return $this->game;   
  }
   
  /**
   * Update "areas" property of "Game" entity with data in JSON format.
   * 
   * @param string $areas
   */
  public function updateAreas(string $areas)
  {
    $decoded = \json_decode($areas);
    $areasEntity = $this->game->getAreas();
    $areasEntity->setAreasZero($decoded[0]);
    $areasEntity->setAreasOne($decoded[1]);
    $areasEntity->setAreasTwo($decoded[2]);
    $areasEntity->setAreasThree($decoded[3]);
    $this->game->setAreas($areasEntity);
  }
  
  /**
   * Update "mobs" property of "Game" entity with data in JSON format.
   * 
   * @param string $mobs
   */
  public function updateMobs(string $mobs)
  {
    $decoded = \json_decode($mobs);
    $mobsEntity = $this->game->getMobs();
    foreach ($decoded as $key => $value) {
      $mobsEntity->{'set'.\substr($key, 3)}($value);
    }
    $this->game->setMobs($mobsEntity);
  }
  
  /**
   * Update "things" property of "Game" entity with data in JSON format.
   * 
   * @param string $things
   */
  public function updateThings(string $things)
  {
    $decoded = \json_decode($things);
    $thingsEntity = $this->game->getThings();
    foreach ($decoded as $key => $value) {
      $thingsEntity->{'set'.\ucfirst($key)}($value);
    }
    $this->game->setThings($thingsEntity); 
  }
  
  /**
   * Update "player_time" property of "Game" entity by converting
   * and saving string in following format:
   *
   *    W0D0H00M00
   * 
   * where '0''s place can be taken by all digits.
   * 
   * W - week
   * D - day
   * H - hours
   * M - minutes
   * 
   * @param string $playerTime
   */
  public function updatePlayerTime(string $playerTime)
  {
    $arr = \json_decode($playerTime);
    $hour = \intval($arr[2]);
    if ($hour < 10) {
      $hour = '0'.$hour;
    }
    $minutes = \intval($arr[3]);
    if ($minutes < 10) {
      $minutes = '0'.$minutes;   
    }
    $str = 'W'.$arr[0].'D'.$arr[1].'H'.$hour.'M'.$minutes;
    $this->game->setPlayerTime($str);
  }
  
  /**
   * Update "player_mob" property of "Game" entity with data in JSON format.
   * 
   * @param string $playerMob
   */
  public function updatePlayerMob(string $playerMob)
  {
    $this->game->getPlayerMob()->setPlayer([$playerMob]);
  }
}
/*............................................................................*/