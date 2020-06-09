<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\AreasRepository")
 */
class Areas
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
    private $areas_zero = [];

    /**
     * @ORM\Column(type="json")
     */
    private $areas_one = [];

    /**
     * @ORM\Column(type="json")
     */
    private $areas_two = [];

    /**
     * @ORM\Column(type="json")
     */
    private $areas_three = [];

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Game", mappedBy="areas", cascade={"persist", "remove"})
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
    
    public function getAreasZero(): ?array
    {
        return $this->areas_zero;
    }

    public function setAreasZero(array $areas_zero): self
    {
        $this->areas_zero = $areas_zero;

        return $this;
    }

    public function getAreasOne(): ?array
    {
        return $this->areas_one;
    }

    public function setAreasOne(array $areas_one): self
    {
        $this->areas_one = $areas_one;

        return $this;
    }

    public function getAreasTwo(): ?array
    {
        return $this->areas_two;
    }

    public function setAreasTwo(array $areas_two): self
    {
        $this->areas_two = $areas_two;

        return $this;
    }

    public function getAreasThree(): ?array
    {
        return $this->areas_three;
    }

    public function setAreasThree(array $areas_three): self
    {
        $this->areas_three = $areas_three;

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
        if ($game->getAreas() !== $this) {
            $game->setAreas($this);
        }

        return $this;
    }
}
