<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes\ResetRoute;

use App\Form\ResetPasswordType;
use App\Services\Routes\CoreLogic;
use Symfony\Component\HttpFoundation\Request;

/**
 * Logic for 'reset' route from FrontController.
 */
class Logic extends CoreLogic
{
  /**
   * {@inheritdoc}
   */
  public function response(Request $request)
  {
    $form = $this->formFactory->create(ResetPasswordType::class);
    $form->handleRequest($request);
    if ($form->isSubmitted() && $form->isValid()) {
      $token = $request->query->get('token');
      $pwd = $request->request->get('reset_password')['password'];
      $message = $this->playerAccount->resetPassword($token, $pwd);
      $this->flasher->addPlain($message, 'info');
    }
    $template = $this->twig->render("reset/index.html.twig", [
        'form' => $form->createView(),
    ]);
    
    return $this->responser->prepareResponse($template);   
  }
}
/*............................................................................*/