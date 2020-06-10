<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Entities;

use App\Entity\{Areas, Game, Mobs, Player, PlayerMob, Things};
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * Class for performing actions on entities
 */
class Entities
{
  /**
   * Just Entity Manager.
   * 
   * @var EntityManagerInterface
   */
  private $entityManager;
  
  /**
   * Password encoder selected by Symfony (configured in `security.yaml`)
   * 
   * @var UserPasswordEncoderInterface
   */
  private $encoder;
  
  /**
   * @param EntityManagerInterface $entityManager
   * @param UserPasswordEncoderInterface $encoder
   */
  public function __construct(
      EntityManagerInterface $entityManager,
      UserPasswordEncoderInterface $encoder
  ){
    $this->entityManager = $entityManager;
    $this->encoder = $encoder;
  }
   
  /**
   * Append data independent from inputed data by player to Player entity
   * while creating account process.
   * 
   * @param  Player $player Player entity with data given by player in form
   * @param  string $pwd    Password for player's account
   * 
   * @return Player $player Updated instance of Player entity
   */
  public function createPlayer(Player $player, string $pwd): Player
  {
    $player->setEnabled(false);
    $player->setFailedLoginAttempts(0);
    $player->setPassword($this->encoder->encodePassword($player, $pwd));
    $currentDateTime = new \DateTime();
    $player->setRegistrationDate($currentDateTime);
    $player->setEntryUpdatingDate($currentDateTime);
    $player->setBlockedToken(Uuid::uuid4()->toString());
    $game = $this->createGame();
    $player->setGame($game);

    return $player;
  }

  /**
   * Get entity with default values (and with id === 1)
   * 
   * @param $instance Empty instance of entity            
   */
  private function getDefaultEntity($instance)
  {
    $repo = $this->entityManager->getRepository(get_class($instance));
    
    return $repo->findBy(['id' => '1'])[0];   
  }

  /**
   * Create instance of Areas entity with default values.
   */
  private function createAreas(): Areas
  {  
    return clone $this->getDefaultEntity(new Areas());
  }
  
  /**
   * Create instance of Mobs entity with default values.
   */
  private function createMobs(): Mobs
  {
    return clone $this->getDefaultEntity(new Mobs());
  }
  
  /**
   * Create instance of Things entity with default values.
   */
  private function createThings(): Things
  {
    return clone $this->getDefaultEntity(new Things());
  }
  
  /**
   * Create instance of PlayerMob entity with default values.
   */
  private function createPlayerMob(): PlayerMob
  {
    return clone $this->getDefaultEntity(new PlayerMob());   
  }
   
  /**
   * Create instance of Game entity with default values.
   * 
   * @return Game $game Created game
   */
  private function createGame(): Game
  {
    $game = new Game();
    $game->setPlayerTime('W1D1H21M00');
    $areas = $this->createAreas();
    $game->setAreas($areas);
    $mobs = $this->createMobs();
    $game->setMobs($mobs);
    $things = $this->createThings();
    $game->setThings($things);
    $playerMob = $this->createPlayerMob();
    $game->setPlayerMob($playerMob);
    
    return $game;
  }
}
/*............................................................................*/