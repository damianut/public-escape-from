<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes\EnableRoute;

use App\Services\Routes\CoreLogic;
use Symfony\Component\HttpFoundation\Request;

/**
 * Logic for 'enable' route from FrontController.
 */
class Logic extends CoreLogic
{
  /**
   * {@inheritdoc}
   */
  public function response(Request $request)
  {
    $token = $request->query->get('blocked_token');
    $message = $this->playerAccount->activateAccount($token, 'enable');
    $this->flasher->addPlain($message, 'info');
    $template = $this->twig->render("enable/index.html.twig");
    
    return $this->responser->prepareResponse($template);   
  }
}
/*............................................................................*/