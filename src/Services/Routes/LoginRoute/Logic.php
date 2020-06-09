<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes\LoginRoute;

use App\Entity\Player;
use App\Form\{PlayerLoginType, PlayerRegisterType, PlayerResetType};
use App\Services\Account\PlayerAccount;
use App\Services\Entities\Entities;
use App\Services\HTTP\CustomResponse;
use App\Services\Messages\{EmailMessages, Flasher};
use App\Services\Routes\CoreLogic;
use App\Services\Session\SessionHandling;
use App\Services\TextProcessing\TextProcessing;
use App\Services\Validation\Validator;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Form\{Form, FormFactoryInterface};
use Symfony\Component\HttpFoundation\{RedirectResponse, Response, Request, RequestStack};
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Twig\Environment;

/**
 * Logic for 'login' route from FrontController
 */
class Logic extends CoreLogic
{
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
   * Parameter Bag with params from `config/services.yaml`.
   * 
   * @var ParameterBagInterface
   */
  private $messages;
  
  /**
   * Performing actions on data from $_SESSION and related data.
   * 
   * @var SessionHandling
   */
  private $sessionHandler;
   
  /**
   * New session.
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
   * Validator
   * 
   * @var Validator
   */
  private $validator;
  
  /**
   * @param CustomResponse               $responser
   * @param EmailMessages                $emailer
   * @param Entities                     $entiter
   * @param EntityManagerInterface       $entityManager 
   * @param Environment                  $twig
   * @param Flasher                      $flasher
   * @param FormFactoryInterface         $formFactory
   * @param ParameterBagInterface        $messages
   * @param PlayerAccount                $playerAccount
   * @param RequestStack                 $requestStack
   * @param SessionHandling              $sessionHandler
   * @param TextProcessing               $textProcessing
   * @param UrlGeneratorInterface        $router
   * @param UserPasswordEncoderInterface $encoder
   * @param Validator                    $validator
   */
  public function __construct(
      CustomResponse $responser,
      EmailMessages $emailer,
      Entities $entiter,
      EntityManagerInterface $entityManager,
      Environment $twig,
      Flasher $flasher,
      FormFactoryInterface $formFactory,
      ParameterBagInterface $messages,
      PlayerAccount $playerAccount,
      RequestStack $requestStack,
      SessionHandling $sessionHandler,
      TextProcessing $textProcessing,
      UrlGeneratorInterface $router,
      UserPasswordEncoderInterface $encoder,
      Validator $validator
  )
  {
    parent::__construct(
        $responser,
        $entityManager,
        $twig,
        $flasher,
        $formFactory,
        $playerAccount,
        $router
    );
    $this->emailer = $emailer;
    $this->entiter = $entiter;
    $this->messages = $messages;
    $this->session = $requestStack->getCurrentRequest()->getSession();
    $this->sessionHandler = $sessionHandler;
    $this->textProcessing = $textProcessing;
    $this->encoder = $encoder;
    $this->validator = $validator;
  }
   
  /**
   * {@inheritdoc}
   */
  public function response(Request $request)
  {
    do {
      /**
       * Check that any player is logged here.
       */
      if ($this->sessionHandler->checkSession()) {
        $url = $this->router->generate('game');
        $response = new RedirectResponse($url);
        break;    
      }
      /**
       * Create forms.
       */
      $registerForm = $this->formFactory->create(
          PlayerRegisterType::class, new Player()
      );
      $loginForm = $this->formFactory->create(PlayerLoginType::class);
      $resetForm = $this->formFactory->create(PlayerResetType::class);
      
      $registerForm->handleRequest($request);
      $loginForm->handleRequest($request);
      $resetForm->handleRequest($request);
      
      if ($registerForm->isSubmitted() && $registerForm->isValid()) {
        $playerSubmitted = $registerForm->getData();
        $pwd = $request->request->get('player_register')['password'];
        /**
         * Check that inputed nick and e-mail is free.
         */
        if (!$this->playerAccount->checkAvailability($playerSubmitted)) {
          $this->flasher->add('app.acc.busy');
          break;   
        }
        $this->playerAccount->createAccount($playerSubmitted, $pwd);
      } else if ($loginForm->isSubmitted() && $loginForm->isValid()) {
        /**
         * Get password and nick inputed by player
         */
        $inputed = $request->request->get('player_login');
        $pwd = $inputed['password'];
        $nick = $inputed['nick'];
        /**
         * Check that player with given nick exists and inputed password is
         * correct
         */
        $playerFromDb = $this->playerAccount->getPlayerByNick($nick);
        if ([] === $playerFromDb) {
          $this->flasher->add('app.acc.login.404');
          break;  
        }
        if (!$this->encoder->isPasswordValid($playerFromDb[0], $pwd)) {
          $this->failedAuthentication($playerFromDb[0]);
          $this->flasher->add('app.acc.pwd.fail');
          break;   
        }
        /**
         * Check that account is enabled.
         * 
         * At this point it's known that player inputed correct password and
         * player is enabled. So counter of failed login's attempts is resetted.
         * If resetting were done in previous conditional statement, it would be
         * possible, that player was be disabled and has zero failed login's
         * attempts.
         */
        if ($this->playerAccount->checkAccBlocked($nick)) {
          $this->flasher->add('app.acc.blocked');
          $this->failedAuthentication($playerFromDb[0]);
          break;   
        } else {
          $this->playerAccount->resetCounter($playerFromDb[0]);
        }
        /**
         * Check, that player is logged.
         */
        $logged = $this->playerAccount->checkIsLogged($nick);
        /**
         * Check, that player is logged in this browser.
         */
        if (
            $logged === $this->session->get('loginToken') &&
            $nick === $this->session->get('nick')
        ) {
          $url = $this->router->generate('game');
          $response = new RedirectResponse($url);
          break;  
        }
        /**
         * Check that player was login more than 10 minutes
         */
        $moreThanTen = $this->playerAccount->checkTenMinutesLogin($nick);
        /**
         * Check than player is logged and has logged more than 10 minutes ago
         */
        if ($logged && $moreThanTen) {
          $this->playerAccount->loginAccount($nick);
          $url = $this->router->generate('game');
          $response = new RedirectResponse($url);
          break;
        }
        /**
         * Check than player is logged and has logged less than 10 minutes ago
         */
        if ($logged && !$moreThanTen) {
          $this->flasher->add('app.acc.logged');
          break;
        }
        /**
         * If player isn't logged, log in.
         */
        if (!$logged) {
          $this->playerAccount->loginAccount($nick);
          $url = $this->router->generate('game');
          $response = new RedirectResponse($url);
          break;   
        }
      } else if ($resetForm->isSubmitted() && $resetForm->isValid()) {
        $playerEmail = $resetForm->getData()['email'];
        /**
         * Check that player with inputed email exists and hasn't reset token
         * generated before. If not, generate and send reset token to player.
         */
        $playerFromDb = $this->playerAccount->getPlayerByEmail($playerEmail);
        $msgName = [] === $playerFromDb ? 'app.acc.404' : 
            $playerFromDb[0]->getResetToken() ? 'app.acc.reset.exist' : '';
        if ('' != $msgName) {
          $this->flasher->add($msgName);
          break;   
        }
        $this->playerAccount->resetToken($playerFromDb[0]);
      }
    } while (false);

    if (!isset($response)) {
      /**
       * If player wasn't login.
       */
      $renderedTemplate = $this->twig->render('login/index.html.twig', [
          'registerForm' => $registerForm->createView(),
          'resetForm' => $resetForm->createView(),
          'loginForm' => $loginForm->createView(),
      ]);
      
      /**
       * Put rendered template as content of response.
       */
      $response = $this->responser->prepareResponse($renderedTemplate);
    }
    
    return $response;
  }

  /**
   * This method is called after failed authentication to increase failed login
   * counter and resolve that player should be banned.
   * 
   * @param Player $player A player who will have updated data about the number of
   *                       failed login attempts and who may be banned.
   */
  private function failedAuthentication(Player $player)
  {
    $counter = $player->getFailedLoginAttempts();
    $player->setFailedLoginAttempts(++$counter);
    $limit = $this->messages->get('app.acc.attempts');
    /**
     * If counter's value equals (or exceeds) number 3 –
     * ban player and send him message by email and/or browser,
     * that he has just been banned.
     * 
     * Exceeding number 3 is possible,
     * if counting procedure failed previous time(s). 
     * Adding "greater than" character to comparision operator prevents
     * further mistakes by adding this possibility to blocking procedure.
     */
    if ($counter >= $limit) {
      /**
       * Ban player
       */
      $player->setEnabled(false);
      $player->setBlockedToken(Uuid::uuid4()->toString());
      /**
       * Send email with link to unblock account.
       * If message delivering fails, prepare message to player,
       * that he should send email to administrator about disabling,
       * if he want to enable account.
       * Else prepare message to player, that his account is disabled
       */
      $email = $player->getEmail();
      $title = $this->messages->get('app.acc.banned.msg.title');
      $part = $this->messages->get('app.acc.banned.msg');
      $url = $this->router->generate(
        'enable',
        ['blocked_token' => $player->getBlockedToken()],
        UrlGeneratorInterface::ABSOLUTE_URL
      );
      $content = $part.$url;
      $name = $this->emailer->sendEmail($email, $title, $content) ?
          'app.acc.banned.email' : 'app.mail.fail';
      $this->flasher->add($name);
    }
    /**
     * Change entry updating date
     */
    $player->setEntryUpdatingDate(new \DateTime());
    $this->entityManager->persist($player);
    $this->entityManager->flush();
  }
}
/*............................................................................*/