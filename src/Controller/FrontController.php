<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Controller;

use App\Services\Routes\ActivateRoute\Logic as ActivateLogic;
use App\Services\Routes\EnableRoute\Logic as EnableLogic;
use App\Services\Routes\LoginRoute\Logic as LoginLogic;
use App\Services\Routes\LogoutRoute\Logic as LogoutLogic;
use App\Services\Routes\GameRoute\Logic as GameLogic;
use App\Services\Routes\ResetRoute\Logic as ResetLogic;
use App\Services\Routes\SaveGameRoute\Logic as SaveGameLogic;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class FrontController extends AbstractController
{
  /**
   * @Route("/", name="login")
   */
  public function login(LoginLogic $logic, Request $request)
  {
    return $logic->response($request);
  }
  
  /**
   * @Route("/game", name="game")
   */
  public function game(GameLogic $logic, Request $request)
  {
    return $logic->response($request);
  }
  
  /**
   * @Route("/activate", name="activate")
   */
  public function activate(ActivateLogic $logic, Request $request)
  {
    return $logic->response($request);   
  }
  
  /**
   * @Route("/reset", name="reset")
   */
  public function reset(ResetLogic $logic, Request $request)
  {
    return $logic->response($request);   
  }
  
  /**
   * @Route("/enable", name="enable")
   */
  public function enable(EnableLogic $logic, Request $request)
  {
    return $logic->response($request);   
  }

  /**
   * @Route("/logout", name="logout")
   */
  public function logout(LogoutLogic $logic, Request $request)
  {
    return $logic->response($request);
  }
  
  /**
   * @Route("/save-game", name="save-game")
   */
  public function saveGame(SaveGameLogic $logic, Request $request)
  {
    return $logic->response($request);   
  }
}
/*............................................................................*/