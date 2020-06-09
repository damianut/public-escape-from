<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes\LogoutRoute;

use App\Services\Account\PlayerAccount;
use App\Services\HTTP\CustomResponse;
use App\Services\Messages\Flasher;
use App\Services\Routes\CoreLogic;
use App\Services\Session\SessionHandling;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\{RedirectResponse, Request};
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Twig\Environment;

/**
 * Logic for 'logout' route from FrontController.
 */
class Logic extends CoreLogic
{
  /**
   * Performing actions on data from $_SESSION and related data.
   * 
   * @var SessionHandling
   */
  private $sessionHandler;

  public function __construct(
    CustomResponse $responser,
    EntityManagerInterface $entityManager,
    Environment $twig,
    Flasher $flasher,
    FormFactoryInterface $formFactory,
    PlayerAccount $playerAccount,
    SessionHandling $sessionHandler,
    UrlGeneratorInterface $router
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
    $this->sessionHandler = $sessionHandler;
  }

  /**
   * {@inheritdoc}
   */
  public function response(Request $request)
  {
    /**
     * .1. Check that valid session exists.
     * .2. Get 'loginToken'.
     * .3. Remove 'loginToken' from database.
     * .4. Delete player's session.
     * .5. Create flash message about logout operation.
     * .6. Redirect player to login page.
     */
    do {
      if (!$this->sessionHandler->checkSession()) {
        $this->flasher->add('app.acc.logout.none');
        break;
      }
      $loginToken = $request->getSession()->get('loginToken')->__toString();
      $this->sessionHandler->clearSession();
      $player = $this->playerAccount->getPlayerByLoginToken($loginToken);
      
      if ([] === $player) {
        $this->flasher->add('app.acc.logout.none');
        break;
      }

      $this->playerAccount->logout($player[0]);
      $this->sessionHandler->clearSession();
      $this->flasher->add('app.acc.logout.200');
    } while (false);
    $url = $this->router->generate('login');

    return new RedirectResponse($url);  
  }
}
/*............................................................................*/