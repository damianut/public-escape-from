<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Validation;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Validator\Constraints as Asserts;
use Symfony\Component\Validator\{ConstraintViolationList, Validation};

/**
 * Custom validation's methods.
 */
class Validator
{
  /**
   * Bag with Parameters from `services.yaml`.
   * 
   * @var ParameterBagInterface
   */
  private $params;
  
  /**
   * Validator
   * 
   * @var Validation
   */
  private $validator;

  public function __construct(ParameterBagInterface $params)
  {
    $this->params = $params;
    $this->validator = Validation::createValidator();
  }
  
  /**
   * Validate Uuid generated by `Ramsey\Uuid\Uuid:uuid4()`
   * 
   * @param  Uuid        $uuid Uuid token to validate
   * 
   * @return string|null       String with '\n' separated lines with violations or null, 
   *                                            if violations don't exists
   */
  public function validateUuid($uuid): ?string
  {
    $violations = $this->validator->validate($uuid, [
        new Asserts\NotBlank([
            'message' => 'Token nie może być pusty.',
        ]),
        new Asserts\Uuid([
            'message' => 'Nieprawidłowy token',
            'versions' => [4],
        ]),
    ]);
    
    return $this->createMessage($violations, 'app.token');
  }
  
  /**
   * Validate data about areas retrieved while game saving.
   * 
   * @param  array $areas Array with info about areas in game
   * 
   * @return bool  $valid True if data is valid, false otherwise
   */
  public function validateAreas(array $areas): bool
  {
    do {
      $lvls = \count($areas);
      if (4 != $lvls) {
        break;   
      }
      for ($i = 0; $i < $lvls; $i++) {
        $rows = \count($areas[$i]);
        if (60 != $rows) {
          break;   
        }
        for ($j = 0; $j < $rows; $j++) {
          if (0 === preg_match('/^\d+$/', $areas[$i][$j])) {
            break;   
          }
        }
      }
      $valid = true;
    } while (false);
    
    return $valid ?? false;
  }
  
  /**
   * Check that string in argument is a valid JSON.
   * 
   * @param  string $json
   * 
   * @return bool         True if string is valid, false otherwise
   */
  public function validateJSON(string $json): bool
  {
    $violations = $this->validator->validate($json, [
        new Asserts\Json(),
    ]);
    
    return 0 === $violations->count();
  }
  
  /**
   * Validate player's time retrieved while game saving.
   * 
   * @param  array $pt    Array with info about player's time in game
   * 
   * @return bool  $valid True if data is valid, false otherwise
   */
  public function validatePlayerTime(array $pt): bool
  {
    do {
      if (!(\count($pt) === 4)) {
        break;
      }
      if (!\is_int($pt[0]) || $pt[0] > 4 || $pt[0] < 1) {
        break;   
      }
      if (!\is_int($pt[1]) || $pt[1] > 7 || $pt[1] < 1) {
        break;   
      }
      $hours = intval($pt[2]);
      if (
          (0 === $hours && !('00' === $pt[2])) ||
          0 > $hours ||
          24 <= $hours
      ) {
        break;   
      }
      $minutes = intval($pt[3]);
      if (
          (0 === $minutes && !('00' === $pt[3])) ||
          0 > $minutes ||
          59 < $minutes
      ) {
        break;   
      }
      $valid = true;
    } while (false);
    
    return $valid ?? false;
  }
   
  /**
   * Creating message with detected violations
   * 
   * @param  ConstraintViolationList $violations  List with messages about violations
   * @param  string                  $messageName Name of message from 'services.yaml' to show for player,
   *                                              when violation(s) exist(s)
   * 
   * @return string|null             $message     Message for player or null
   */
  private function createMessage(ConstraintViolationList $violations, string $messageName): ?string
  {
    return 0 === $violations->count() ? null : $this->params->get($messageName);
  }
}
/*............................................................................*/