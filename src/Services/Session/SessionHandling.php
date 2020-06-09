<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Session;

use App\Services\Account\PlayerAccount;
use App\Services\Validation\Validator;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

/**
 * Performing actions on data from $_SESSION and related data.
 */
class SessionHandling
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
   * Custom validator.
   * 
   * @var Validator
   */
  private $validator;
  
  /**
   * @param PlayerAccount    $playerAccount
   * @param RequestStack     $requestStack
   * @param Validator        $validator
   */
  public function __construct(
      PlayerAccount $playerAccount,
      RequestStack $requestStack,
      Validator $validator
  )
  {
    $this->playerAccount = $playerAccount;
    $this->session = $requestStack->getCurrentRequest()->getSession();
    $this->validator = $validator;
  }
   
  /**
   * Clear player's session
   */
  public function clearSession(): void
  {
    $this->session->remove('loginToken');
    $this->session->remove('nick');   
  }
  
  /**
   * Check that session with nick and login token exists in this browser.
   * Next validate data from session.
   * Then check that data from this session is valid by compare with data
   * from database.
   * 
   * @param bool $status True if valid session exists, false otherwise.
   */
  public function checkSession(): bool
  {
    do {
      $token = $this->session->get('loginToken');
      $nick = $this->session->get('nick');
      if (null === $token || null === $nick) {
        break;
      }
      if (
          !(null === $this->validator->validateUuid($token)) ||
          !preg_match('/^\w+$/', $nick)
      ) {
        break;
      }
      $playerToken = $this->playerAccount->getPlayerByLoginToken(
          $token->__toString()
      );
      if ([] === $playerToken) {
        break; 
      }
      $playerNick = $this->playerAccount->getPlayerByNick($nick);
      if ([] === $playerNick) {
        break;  
      }
      if (!($playerToken === $playerNick)) {
        break;  
      }
      $status = true;
    } while (false);
    /**
     * If in do-while loop '$status' variable wasn't set, it's mean
     * that session should be cleared.
     * If '$status' is true, it's mean that session is valid, so session
     * shouldn't be cleared.
     */
    if (!isset($status)) {
      $this->clearSession();
      $status = false;
    }
    
    return $status;
  } 
}
/*............................................................................*/