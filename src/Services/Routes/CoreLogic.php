<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Routes;

use App\Services\Account\PlayerAccount;
use App\Services\HTTP\CustomResponse;
use App\Services\Messages\Flasher;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Twig\Environment;

/**
 * Core of logics of routes from FrontController
 */
abstract class CoreLogic
{
  /**
   * Service for preparing custom response on request
   * 
   * @var CustomResponse
   */
  protected $responser;
  
  /**
   * Just Entity Manager.
   * 
   * @var EntityManagerInterface
   */
  protected $entityManager;
  
  /**
   * Twig for template rendering
   * 
   * @var Environment
   */
  protected $twig;
  
  /**
   * Service for creating flash messages defined in 'config/services.yaml'
   * 
   * @var Flasher
   */
  protected $flasher;
  
  /**
   * Form Factory.
   * 
   * @var FormFactoryInterface
   */
  protected $formFactory;
  
  /**
   * Service to performing actions on player's account
   * 
   * @var PlayerAccount
   */
  protected $playerAccount;
  
  /**
   * URL generator
   * 
   * @var UrlGeneratorInterface
   */
  protected $router;
  
  /**
   * @param CustomResponse               $responser
   * @param EntityManagerInterface       $entityManager  
   * @param Environment                  $twig
   * @param Flasher                      $flasher
   * @param FormFactoryInterface         $formFactory
   * @param PlayerAccount                $playerAccount
   * @param UrlGeneratorInterface        $router
   */
  public function __construct(
      CustomResponse $responser,
      EntityManagerInterface $entityManager,
      Environment $twig,
      Flasher $flasher,
      FormFactoryInterface $formFactory,
      PlayerAccount $playerAccount,
      UrlGeneratorInterface $router
  )
  {
    $this->responser = $responser;
    $this->entityManager = $entityManager;
    $this->twig = $twig;
    $this->flasher = $flasher;
    $this->formFactory = $formFactory;
    $this->playerAccount = $playerAccount;
    $this->router = $router;
  }
  
  /**
   * Create response for request from 'login' route.
   * 
   * @param  Request                   $request
   * 
   * @return Response|RedirectResponse $response
   */
  abstract public function response(Request $request);
}
/*............................................................................*/