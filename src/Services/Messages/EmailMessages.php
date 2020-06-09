<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Messages;

use App\Entity\Player;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use \Swift_Mailer;

/**
 * Preparing and sending emails by SwiftMailer.
 */
class EmailMessages
{
  /**
   * Service for creating flash messages defined in 'config/services.yaml'
   * 
   * @var Flasher
   */
  private $flasher;
  
  /**
   * Service for creating logs
   * 
   * @var LoggerInterface
   */
  private $logger;
  
  /**
   * Parameter bag with defined messages from 'config/services.yaml'
   * 
   * @var ParameterBagInterface
   */
  private $messages;
  
  /**
   * SwiftMailer.
   * 
   * @var Swift_Mailer
   */
  private $mailer;
  
  /**
   * URL generator
   * 
   * @var UrlGeneratorInterface
   */
  private $router;
  
  /**
   * @param Flasher               $flasher
   * @param LoggerInterface       $logger
   * @param ParameterBagInterface $messages
   * @param Swift_Mailer          $mailer
   * @param UrlGeneratorInterface $router
   */
  public function __construct(
      Flasher $flasher,
      LoggerInterface $logger,
      ParameterBagInterface $messages,
      Swift_Mailer $mailer,
      UrlGeneratorInterface $router
  )
  {
    $this->flasher = $flasher;
    $this->logger = $logger;
    $this->messages = $messages;
    $this->mailer = $mailer;
    $this->router = $router;
  }
    
  /**
   * Generally defined email sending by SwiftMailer
   * 
   * @param  string $email   Email of receiver
   * @param  string $title   Title of email
   * @param  string $content contains content without URL with confirmation token
   * 
   * @return bool   $status  Indicate, that sending email was successful or not
   */
  public function sendEmail(string $email, string $title, string $content): bool
  {
    $message = new \Swift_Message($title);
    $message->setFrom($this->messages->get('app.mail.sender'));
    $message->setTo($email);
    $message->setBody($content);
    /**
     * Method 'send' of \Swift_Mailer return the number of successful recipient.
     * 0 mean, that email was not delivered to user.
     * In this case, this method return false to indicate failed delivering
     * or return true otherwise.
     * In case of failure, flash message and log will be created.
     */
    if (0 === $this->mailer->send($message)) {
      $this->flasher->add('app.mail.fail');
      $logMsg = $this->messages->get('app.mail.log.fail');
      $this->logger->error($logMsg);
      $status = false;
    } else {
      $status = true;   
    }
    
    return $status;
  }
  
  /**
   * Generally defined e-mail preparing and sending
   * 
   * @param  Player $player Entity of player's account
   * 
   * @return string         Name of message from "config/services.yaml" used as flash message 
   */
  private function prepareSendEmail(Player $player, string $titleName, string $contentName, string $route, string $kindOfToken, string $successFlash, string $failureFlash): string
  {
    $email = $player->getEmail();
    $title = $this->messages->get($titleName);
    $part = $this->messages->get($contentName);
    $url = $this->router->generate(
      $route,
      ['token' => $player->{'get'.$kindOfToken.'Token'}()],
      UrlGeneratorInterface::ABSOLUTE_URL
    );
    $content = $part.$url;
    
    return $this->sendEmail($email, $title, $content) ?
        $successFlash : $failureFlash;    
  }

  /**
   * Prepare and send e-mail after creating account for player
   * 
   * @param  Player $player Entity of newly created player's account
   * 
   * @return string         Name of message from "config/services.yaml" used as flash message 
   */
  public function creatingAccountEmail(Player $player): string
  {
    return $this->prepareSendEmail(
        $player,
        'app.acc.created.email.title',
        'app.acc.created.email.content',
        'activate',
        'Blocked',
        'app.acc.created.flash',
        'app.acc.confirm.email.fail'
    );
  }
  
  /**
   * Prepare and send e-mail after creating reset token for player
   * 
   * @param  Player $player Entity of player's account
   * 
   * @return string         Name of message from "config/services.yaml" used as flash message 
   */
  public function resetTokenEmail(Player $player): string
  {
    return $this->prepareSendEmail(
        $player,
        'app.acc.reset.email.title',
        'app.acc.reset.email.content',
        'reset',
        'Reset',
        'app.acc.reset.flash',
        'app.acc.reset.email.fail'
    );
  }
}
/*............................................................................*/