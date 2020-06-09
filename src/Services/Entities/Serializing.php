<?php
declare(strict_types=1);
/**
 * This file is part of "EscapeFrom" project.
 * "Escape From" is name of the game.
 * 
 * (copyright) Damian Orzeszek damianas1999@gmail.com
 */

namespace App\Services\Entities;

use App\Entity\{Areas, Mobs, PlayerMob, Things};
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\{AbstractNormalizer, ObjectNormalizer};
use Symfony\Component\Serializer\Serializer;

/**
 * Class for returning serialized entities.
 */
class Serializing
{
  /**
   * Custom serializer
   * 
   * @var Serializer
   */
  private $serializer;
  
  public function __construct()
  {
    $normalizers = [new ObjectNormalizer()];
    $encoders = [new JsonEncoder];
    $this->serializer = new Serializer($normalizers, $encoders);  
  }
   
  /**
   * Serialize Areas entity to JSON.
   * 
   * @param Areas $areas Instance of Areas entity
   */
  public function serializeAreas(Areas $areas): string
  {
    return $this->serializeEntity(
        $areas,
        ['areasZero', 'areasOne', 'areasTwo', 'areasThree']
    );
  }
  
  /**
   * Serialize Mobs entity to JSON.
   * 
   * @param Mobs $mobs Instance of Mobs entity
   */
  public function serializeMobs(Mobs $mobs): string
  {
    return $this->serializeEntity(
        $mobs,
        ['cleaner', 'director', 'doctor', 'elderDoctor','family', 'helperMed',
        'nurse', 'otherFamily', 'patient']
    );
  }
  
  /**
   * Serialize Things entity to JSON.
   * 
   * @param Things $things Instance of Things entity
   */
  public function serializeThings(Things $things): string
  {
    return $this->serializeEntity(
        $things,
        ['bin', 'bowl', 'chair2', 'chair3', 'chair10', 'chair11', 'chairMed',
            'chairPatient', 'cupBoard', 'doors1', 'doors2', 'doors3',
            'dripMed', 'mop', 'player']
    );
  }

  /**
   * Serialize entity to JSON.
   * 
   * @param         $entity Entity
   * @param  array  $attrs  Names of allowed attributes to serialize
   * 
   * @return string         Serialized entity
   */
  private function serializeEntity($entity, array $attrs): string
  {
    return $this->serializer->serialize(
        $entity,
        'json',
        [AbstractNormalizer::ATTRIBUTES => $attrs]
    );
  }
}
/*............................................................................*/