<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes\SaveGameRoute;

use App\Services\Account\PlayerAccount;
use App\Services\Entities\UpdateGame;
use App\Services\HTTP\CustomResponse;
use App\Services\Messages\Flasher;
use App\Services\Routes\CoreLogic;
use App\Services\Session\SessionHandling;
use App\Services\Validation\Validator;
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
  
  /**
   * Custom validator.
   * 
   * @var Validator
   */
  private $validator;

  /**
   * @param CustomResponse               $responser
   * @param EntityManagerInterface       $entityManager 
   * @param Environment                  $twig
   * @param Flasher                      $flasher
   * @param FormFactoryInterface         $formFactory
   * @param PlayerAccount                $playerAccount
   * @param SessionHandling              $sessionHandler
   * @param UrlGeneratorInterface        $router
   * @param Validator                    $validator
   */
  public function __construct(
    CustomResponse $responser,
    EntityManagerInterface $entityManager,
    Environment $twig,
    Flasher $flasher,
    FormFactoryInterface $formFactory,
    PlayerAccount $playerAccount,
    SessionHandling $sessionHandler,
    UrlGeneratorInterface $router,
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
    $this->sessionHandler = $sessionHandler;
    $this->validator = $validator;
  }

  /**
   * {@inheritdoc}
   */
  public function response(Request $request)
  {
    do {
      if (!$this->sessionHandler->checkSession()) {
        $routeName = 'login';
        break;
      }
      /**
       * Check that player with login token from $_SESSION exists
       */
      $loginToken = $request->getSession()->get('loginToken')->__toString();
      $player = $this->playerAccount->getPlayerByLoginToken($loginToken);
      if ([] === $player) {
        $this->sessionHandler->clearSession();
        $this->flasher->add('app.acc.login.none');
        $routeName = 'login';
        break;
      }
      /**
       * Get current data in JSON format.
       */
      $areas = $request->request->get('data-areas');
      $mobs = $request->request->get('data-mobs');
      $things = $request->request->get('data-things');
      $playerTime = $request->request->get('data-player-time');
      $playerMob = $request->request->get('data-player-mob');
      /**
       * Validate retrieved data.
       */
      $areasDecoded = json_decode($areas);
      $playerTimeDecoded = json_decode($playerTime);
      $validAreas = $this->validator->validateAreas($areasDecoded);
      $validMobs = $this->validator->validateJson($mobs);
      $validThings = $this->validator->validateJson($things);
      $validPlayerTime = $this->validator
          ->validatePlayerTime($playerTimeDecoded);
      $validPlayerMob = $this->validator->validateJson($playerMob);
      /**
       * If data is valid, save this data in database and prepare message
       * about successful saving. Else prepare message about failed saving
       */
      if ($validAreas && $validMobs && $validThings && $validPlayerTime &&
           $validPlayerMob) {
        /**
         * Get "Game" entity thanks to "Player" entity.
         */
        $game = $player[0]->getGame();
        $gameUpdater = new UpdateGame($game);
        $gameUpdater->updateAreas($areas);
        $gameUpdater->updateMobs($mobs);
        $gameUpdater->updateThings($things);
        $gameUpdater->updatePlayerTime($playerTime);
        $gameUpdater->updatePlayerMob($playerMob);
        $updatedGame = $gameUpdater->returnGame();
        $this->entityManager->persist($updatedGame);
        $this->entityManager->flush();
        $this->flasher->add('app.save.200');
      } else {
        $this->flasher->add('app.save.fail');
      }
      $routeName = 'game';
    } while (false);
    $url = $this->router->generate($routeName);

    return new RedirectResponse($url);  
  }
}
/*............................................................................*/