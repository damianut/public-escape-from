<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Account;

use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Receiving player's data about game
 */
class GameData
{
  /**
   * Service to performing actions on player's account
   * 
   * @var PlayerAccount
   */
  private $playerAccount;
  
  /**
   * Current session.
   * 
   * @var SessionInterface
   */
  private $session;
  
  /**
   * @param RequestStack $requestStack
   */
  public function __construct(
      PlayerAccount $playerAccount,
      RequestStack $requestStack
  )
  {
    $this->playerAccount = $playerAccount;
    $this->session = $requestStack->getCurrentRequest()->getSession();
  }
   
  /**
   * Get all data about player's game from database.
   */
  public function getAllData()
  {
    $loginToken = $this->session->get('loginToken');
    $player = $this->playerAccount->getPlayerByLoginToken(
        $loginToken->__toString()
    );
    //Jak teraz określić, które dane pobrać? Stworzyć nowe Entity
    // i nową tabelę, która będzie połączona 
  }
}
/*............................................................................*/