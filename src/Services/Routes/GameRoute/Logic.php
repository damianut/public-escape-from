<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes\GameRoute;

use App\Entity\{Player, Game};
use App\Form\{LoadGameType, LogoutType, SaveGameType};
use App\Services\Account\PlayerAccount;
use App\Services\Entities\{Serializing, UpdateGame};
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
 * Logic for 'game' route from FrontController
 */
class Logic extends CoreLogic
{
  /**
   * Serializing entities to JSON.
   * 
   * @var Serializing
   */
  private $serializer;
   
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
      Serializing $serializer,
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
    $this->serializer = $serializer;
    $this->sessionHandler = $sessionHandler;
  }
  
  /**
   * {@inheritdoc}
   */
  public function response(Request $request)
  {
    do {
      if (!$this->sessionHandler->checkSession()) {
        $url = $this->router->generate('login');
        $response = new RedirectResponse($url);
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
        $url = $this->router->generate('login');
        $response = new RedirectResponse($url);
        break;
      }
      
      /**
       * Get data about game in JSON format.
       */
      $player = $player[0];
      $nick = $player->getNick();
      $game = $player->getGame();
      $converted = $this->convertForJS($game);
      
      /**
       * Forms for game saving, game loading and logout.
       */
      $saveGameForm = $this->formFactory->create(SaveGameType::class);
      $loadGameForm = $this->formFactory->create(LoadGameType::class);
      $logoutForm = $this->formFactory->create(LogoutType::class); 

      /**
       * Render template
       */
      $renderedTemplate = $this->twig->render('game/index.html.twig', [
          'saveGameForm' => $saveGameForm->createView(),
          'loadGameForm' => $loadGameForm->createView(),
          'logoutForm' => $logoutForm->createView(),
          'nick' => $nick,
          'areas' => $converted[0],
          'mobs' => $converted[1],
          'things' => $converted[2],
          'playerTime' => $converted[3],
          'playerMob' => $converted[4],
      ]);
      
      $response = $this->responser->prepareResponse($renderedTemplate);
    } while (false);
    
    return $response;
  }
  
  /**
   * Convert player's game data to array of strings in purpose of transferring
   * this data to JavaScript.
   * 
   * @param  Game  $game Player's instance of Game entity
   * 
   * @return array $arr  Converted data
   */
  private function convertForJS(Game $game): array
  {
    $arr = [];

    $areas = $game->getAreas();
    $mobs = $game->getMobs();
    $things = $game->getThings();
    $playerMob = $game->getPlayerMob();

    $arr[] = $this->serializer->serializeAreas($areas);
    $arr[] = $this->serializer->serializeMobs($mobs);
    $arr[] = $this->serializer->serializeThings($things);
    $arr[] = $game->getPlayerTime();
    $arr[] = $playerMob->getPlayer()[0];

    return $arr;
  }
}
/*............................................................................*/