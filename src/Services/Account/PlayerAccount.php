<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Account;

use App\Entity\Player;
use App\Services\DateTime\DateTimeProcessing;
use App\Services\Entities\Entities;
use App\Services\Messages\{EmailMessages, Flasher};
use App\Services\TextProcessing\TextProcessing;
use App\Services\Validation\Validator;
use Doctrine\ORM\{EntityManagerInterface, Exception, OptimisticLockException};
use Ramsey\Uuid\Uuid;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

/**
 * Performs actions on Player entity
 */
class PlayerAccount
{
  /**
   * Processing DateTime objects:
   * -counting interval between timestamps
   * 
   * @var DateTimeProcessing
   */
  private $dateTime;

  /**
   * Service for email sending
   * 
   * @var EmailMessages
   */
  private $emailer;
  
  /**
   * Performing actions on entities
   * 
   * @var Entities
   */
  private $entities;

  /**
   * Just Entity Manager.
   * 
   * @var EntityManagerInterface
   */
  private $entityManager;

  /**
   * Service for creating flash messages defined in 'config/services.yaml'
   * 
   * @var Flasher
   */
  private $flasher;
  
  /**
   * Bag with Parameters from `services.yaml`.
   * 
   * @var ParameterBagInterface
   */
  private $params;

  /**
   * Current session.
   * 
   * @var SessionInterface
   */
  private $session;
  
  /**
   * Service for perfming actions on text
   * 
   * @var TextProcessing
   */
  private $textProcessing;
  
  /**
   * Password encoder selected by Symfony (configured in `security.yaml`)
   * 
   * @var UserPasswordEncoderInterface
   */
  private $encoder;
  
  /**
   * Custom validator.
   * 
   * @var Validator
   */
  private $validator;
  
  /**
   * @param DateTimeProcessing           $dateTime
   * @param EmailMessages                $emailer
   * @param Entities                     $entiter
   * @param EntityManagerInterface       $entityManager
   * @param Flasher                      $flasher
   * @param ParameterBagInterface        $params
   * @param RequestStack                 $requestStack
   * @param TextProcessing               $textProcessing
   * @param UserPasswordEncoderInterface $encoder
   * @param Validator                    $validator
   */
  public function __construct(
      DateTimeProcessing $dateTime,
      EmailMessages $emailer,
      Entities $entiter,
      EntityManagerInterface $entityManager,
      Flasher $flasher,
      ParameterBagInterface $params,
      RequestStack $requestStack,
      TextProcessing $textProcessing,
      UserPasswordEncoderInterface $encoder,
      Validator $validator
  )
  {
    $this->dateTime = $dateTime;
    $this->emailer = $emailer;
    $this->entiter = $entiter;
    $this->entityManager = $entityManager;
    $this->flasher = $flasher;
    $this->params = $params;
    $this->session = $requestStack->getCurrentRequest()->getSession();
    $this->textProcessing = $textProcessing;
    $this->encoder = $encoder;
    $this->validator = $validator; 
  }
  
  /**
   * Check that account is blocked
   * 
   * @param  string $nick Nick of player
   * 
   * @return bool         True if is, false otherwise
   */
  public function checkAccBlocked(string $nick): bool
  {
    $players = $this->getPlayerByNick($nick);
    
    return [] === $players ?? !$players[0]->getEnabled();
  }
  
  /**
   * Get player by email
   * 
   * @param  string $email
   * 
   * @return array         Array with players found, empty array if none was found
   */
  public function getPlayerByEmail(string $email): array
  {
    return $this->getPlayerBy('email', $email); 
  }
  
  /**
   * Get player by nick
   * 
   * @param  string $nick
   * 
   * @return array        Array with players found, empty array if none was found
   */
  public function getPlayerByNick(string $nick): array
  {
    return $this->getPlayerBy('nick', $nick); 
  }
  
  /**
   * Get player by blocked token.
   * 
   * @param string $token
   * 
   * @return array        Array with players found, empty array if none was found
   */
  public function getPlayerByBlockedToken(string $token): array
  {
    return $this->getPlayerBy('blockedToken', $token);
  }
  
  /**
   * Get player by reset token.
   * 
   * @param string $token
   * 
   * @return array        Array with players found, empty array if none was found
   */
  public function getPlayerByResetToken(string $token): array
  {
    return $this->getPlayerBy('resetToken', $token);
  }
  
  /**
   * Get player by login token.
   * 
   * @param string $token
   * 
   * @return array        Array with players found, empty array if none was found
   */
  public function getPlayerByLoginToken(string $token): array
  {
    return $this->getPlayerBy('loginToken', $token);
  }
  
  /**
   * Core of 'getPlayerBy' methods
   * 
   * @param string $propName  Name of player's property againts which to look for existing player
   * @param        $propValue Value of given property
   * 
   * @return array            Array with players found, empty array if none was found
   */
  public function getPlayerBy($propName, $propValue): array
  {
    $repo = $this->entityManager->getRepository(Player::class);
    
    return $repo->findBy([$propName => $propValue]);   
  }
  
  /**
   * Check that any account with given email and/or nick exists.
   * 
   * @param  Player $player Player with email and nick to check.
   * 
   * @return bool   $status True if email and nick is available, false otherwise 
   */
  public function checkAvailability(Player $player): bool
  {
    $byEmail = $this->getPlayerByEmail($player->getEmail());
    $byNick = $this->getPlayerByNick($player->getNick());
    
    return ([] === $byEmail) && ([] === $byNick);
  }

  /**
   * Check that player is logged.
   * 
   * @param  string      $nick Nick of player
   * 
   * @return null|string       Token if is logged, null otherwise
   */
  public function checkIsLogged(string $nick): ?string
  {
    return $this->getPlayerByNick($nick)[0]->getLoginToken();
  }

  /**
   * Create account in `_escape_from_`.`player` table.
   * 
   * @param  Player $player Player entity with data given by player in form
   * @param  string $pwd    Password for player's account
   */
  public function createAccount(Player $player, string $pwd): void
  {
    $player = $this->entiter->createPlayer($player, $pwd);
    $this->entityManager->persist($player);
    $this->entityManager->flush();
    $name = $this->emailer->creatingAccountEmail($player);
    $this->flasher->add($name);
  }

  /**
   * Login account
   * 
   * @param string $nick Nick of player
   */
  public function loginAccount(string $nick): void
  {
    $this->session->set('nick', $nick);
    $loginToken = Uuid::uuid4();
    $player = $this->getPlayerByNick($nick)[0];
    $player->setLoginToken($loginToken->__toString());
    $player->setLoginDate(new \DateTime());
    $this->entityManager->persist($player);
    $this->entityManager->flush();
    $this->session->set('loginToken', $loginToken);
  }
  
  /**
   * Activating or enabling account.
   * 
   * @param  string $token Confirmation token
   * @param  string $type  Type of operation ('activate' or 'enable')
   * 
   * @return string        Message about activating or enabling
   */
  public function activateAccount(?string $token, string $type = 'activate'): string
  {
    $message = $this->validator->validateUuid($token);
    /**
     * If token is valid - continue.
     */
    if (null === $message) {
      $player = $this->getPlayerByBlockedToken($token)[0];
      /**
       * If player with given token exists - activate him.
       * Else not.
       * In both cases prepare message to player about activating or not.
       * If activating procedure fails - prepare message about it.
       */
      $prefix = 'app.acc.'.$type;
      $paramName = $player instanceof Player ?
          $this->enable($player) ? $prefix.'.1' : $prefix.'.0' :
          $prefix.'.token.404'
      ;
      $message = $this->params->get($paramName);
    }
    
    return $message;
  }

  /**
   * Reset player's password.
   * 
   * @param  string|null $token Resetting token
   * @param  string|null $pwd   New password
   * 
   * @return string             Message about resetting
   */
  public function resetPassword(?string $token, ?string $pwd): string
  {
    do {
      $message = $this->validator->validateUuid($token);
      if (null != $message) {
        break;
      }
      if ('' === $pwd) {
        $message = $this->params->get('app.acc.pwd.404');
        break;   
      }
      $player = $this->getPlayerByResetToken($token);
      if ([] === $player) {
        $message = $this->params->get('app.token');
        break;
      }
      /**
       * Check that typed password contains only valid chars.
       */
      if (!$this->textProcessing->checkPwd($pwd)) {
        $message = $this->params->get('app.acc.pwd.403');
        break;   
      }
      $paramName = $this->changePassword($player[0], $pwd) ?
          'app.acc.reset.done' : 'app.acc.reset.fail';
      $message = $this->params->get($paramName);
    } while (false);
    
    return $message;
  }

  /**
   * Logout account.
   * 
   * @param Player $player A player who will be logged out.
   */
  public function logout(Player $player): void
  {
    $player->setLoginToken(null);
    $this->entityManager->persist($player);
    $this->entityManager->flush();
  }

  /**
   * Check that user wasn't login less than 10 minutes ago.
   * 
   * @param  string $nick Nick of player
   * 
   * @return bool         True in positive case, false otherwise 
   */
  public function checkTenMinutesLogin(string $nick): bool
  {
    $player = $this->getPlayerByNick($nick)[0];
    $datetime = $player->getLoginDate();
    
    return 
        null === $datetime ? true : 
        $this->dateTime->intervalSeconds($datetime) >= 600 ? true :
        false
    ;   
  }

  /**
   * Create and send reset token.
   * 
   * @param Player $player Player entity with data given by player in form
   */
  public function resetToken(Player $player): void
  {
    $player->setResetToken(Uuid::uuid4()->toString());
    $this->entityManager->persist($player);
    $this->entityManager->flush();
    $name = $this->emailer->resetTokenEmail($player);
    $this->flasher->add($name);
  }
  
  /**
   * Increase counter of failed login attempts.
   * 
   * @param  Player $player A player whose data will be changed
   * 
   * @return bool           Result of increasing
   */
  public function increaseCounter(Player $player): bool
  {
    $counter = $player->getFailedLoginAttempts();
    
    return $this->failedLoginAttempts($player, ++$counter);
  }
  
  /**
   * Reset counter of failed login attempts
   * 
   * @param  Player $player An player whose data will be changed
   * 
   * @return bool           Result of resetting
   */
  public function resetCounter(Player $player): bool
  {
    return $this->failedLoginAttempts($player, 0);
  }
  
  /**
   * Enabling player
   * 
   * @param  Player Entity of player to enabled
   * 
   * @return bool   Result of enabling
   */
  private function enable(Player $player): bool
  {
    $player->setBlockedToken(null);
    $player->setEnabled(true);
    if (0 != $player->getFailedLoginAttempts()) {
      $player->setFailedLoginAttempts(0);
    }
    return $this->update($player);
  }
  
  /**
   * Change player password and erase reset token
   * 
   * @param  Player $player Entity of player to password changing
   * @param  string $pwd    New password
   * 
   * @return bool           Result of password changing
   */
  private function changePassword(Player $player, string $pwd): bool
  {
    $player->setPassword($this->encoder->encodePassword($player, $pwd));
    $player->setResetToken(null);
    
    return $this->update($player);
  }
  
  /**
   * Update Player entity and return boolean value about update was successful.
   * 
   * @param  Player $player Entity of player to enabled
   * 
   * @return bool           Status of updating.
   */
  private function update(Player $player): bool
  {
    try {
      $this->entityManager->persist($player);
      $this->entityManager->flush();
    } catch (Exception | OptimisticLockException $e) {
      $status = false;
    }
    
    return $status ?? true;
  }
  
  /**
   * Change counted number of failed login attempts
   * 
   * @param  Player $player An player whose data will be changed
   * @param  int    $value  Number of failed login attempts
   * 
   * @return bool           Result of changing data
   */
  private function failedLoginAttempts(Player $player, ?int $value = 0): bool
  {
    $player->setFailedLoginAttempts($value);
 
    return $this->update($player);
  }
}
/*............................................................................*/