<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\MobsRepository")
 */
class Mobs
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="json")
     */
    private $cleaner = [];

    /**
     * @ORM\Column(type="json")
     */
    private $director = [];

    /**
     * @ORM\Column(type="json")
     */
    private $doctor = [];

    /**
     * @ORM\Column(type="json")
     */
    private $elderDoctor = [];

    /**
     * @ORM\Column(type="json")
     */
    private $family = [];

    /**
     * @ORM\Column(type="json")
     */
    private $helper_med = [];

    /**
     * @ORM\Column(type="json")
     */
    private $nurse = [];

    /**
     * @ORM\Column(type="json")
     */
    private $other_family = [];

    /**
     * @ORM\Column(type="json")
     */
    private $patient = [];

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Game", mappedBy="mobs", cascade={"persist", "remove"})
     */
    private $game;
    
    public function __clone()
    {
        if ($this->id) {
            $this->id = null;
        }
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCleaner(): ?array
    {
        return $this->cleaner;
    }

    public function setCleaner(array $cleaner): self
    {
        $this->cleaner = $cleaner;

        return $this;
    }

    public function getDirector(): ?array
    {
        return $this->director;
    }

    public function setDirector(array $director): self
    {
        $this->director = $director;

        return $this;
    }

    public function getDoctor(): ?array
    {
        return $this->doctor;
    }

    public function setDoctor(array $doctor): self
    {
        $this->doctor = $doctor;

        return $this;
    }

    public function getElderDoctor(): ?array
    {
        return $this->elderDoctor;
    }

    public function setElderDoctor(array $elderDoctor): self
    {
        $this->elderDoctor = $elderDoctor;

        return $this;
    }

    public function getFamily(): ?array
    {
        return $this->family;
    }

    public function setFamily(array $family): self
    {
        $this->family = $family;

        return $this;
    }

    public function getHelperMed(): ?array
    {
        return $this->helper_med;
    }

    public function setHelperMed(array $helper_med): self
    {
        $this->helper_med = $helper_med;

        return $this;
    }

    public function getNurse(): ?array
    {
        return $this->nurse;
    }

    public function setNurse(array $nurse): self
    {
        $this->nurse = $nurse;

        return $this;
    }

    public function getOtherFamily(): ?array
    {
        return $this->other_family;
    }

    public function setOtherFamily(array $other_family): self
    {
        $this->other_family = $other_family;

        return $this;
    }

    public function getPatient(): ?array
    {
        return $this->patient;
    }

    public function setPatient(array $patient): self
    {
        $this->patient = $patient;

        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(Game $game): self
    {
        $this->game = $game;

        // set the owning side of the relation if necessary
        if ($game->getMobs() !== $this) {
            $game->setMobs($this);
        }

        return $this;
    }
}
