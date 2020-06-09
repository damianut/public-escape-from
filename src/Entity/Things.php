<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ThingsRepository")
 */
class Things
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
    private $bin = [];

    /**
     * @ORM\Column(type="json")
     */
    private $bowl = [];

    /**
     * @ORM\Column(type="json")
     */
    private $chair10 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $chair11 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $chair2 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $chair3 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $chair_med = [];

    /**
     * @ORM\Column(type="json")
     */
    private $chair_patient = [];

    /**
     * @ORM\Column(type="json")
     */
    private $cup_board = [];

    /**
     * @ORM\Column(type="json")
     */
    private $doors_1 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $doors_2 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $doors_3 = [];

    /**
     * @ORM\Column(type="json")
     */
    private $drip_med = [];

    /**
     * @ORM\Column(type="json")
     */
    private $mop = [];

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Game", mappedBy="things", cascade={"persist", "remove"})
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

    public function getBin(): ?array
    {
        return $this->bin;
    }

    public function setBin(array $bin): self
    {
        $this->bin = $bin;

        return $this;
    }

    public function getBowl(): ?array
    {
        return $this->bowl;
    }

    public function setBowl(array $bowl): self
    {
        $this->bowl = $bowl;

        return $this;
    }

    public function getChair10(): ?array
    {
        return $this->chair10;
    }

    public function setChair10(array $chair10): self
    {
        $this->chair10 = $chair10;

        return $this;
    }

    public function getChair11(): ?array
    {
        return $this->chair11;
    }

    public function setChair11(array $chair11): self
    {
        $this->chair11 = $chair11;

        return $this;
    }

    public function getChair2(): ?array
    {
        return $this->chair2;
    }

    public function setChair2(array $chair2): self
    {
        $this->chair2 = $chair2;

        return $this;
    }

    public function getChair3(): ?array
    {
        return $this->chair3;
    }

    public function setChair3(array $chair3): self
    {
        $this->chair3 = $chair3;

        return $this;
    }

    public function getChairMed(): ?array
    {
        return $this->chair_med;
    }

    public function setChairMed(array $chair_med): self
    {
        $this->chair_med = $chair_med;

        return $this;
    }

    public function getChairPatient(): ?array
    {
        return $this->chair_patient;
    }

    public function setChairPatient(array $chair_patient): self
    {
        $this->chair_patient = $chair_patient;

        return $this;
    }

    public function getCupBoard(): ?array
    {
        return $this->cup_board;
    }

    public function setCupBoard(array $cup_board): self
    {
        $this->cup_board = $cup_board;

        return $this;
    }

    public function getDoors1(): ?array
    {
        return $this->doors_1;
    }

    public function setDoors1(array $doors_1): self
    {
        $this->doors_1 = $doors_1;

        return $this;
    }

    public function getDoors2(): ?array
    {
        return $this->doors_2;
    }

    public function setDoors2(array $doors_2): self
    {
        $this->doors_2 = $doors_2;

        return $this;
    }

    public function getDoors3(): ?array
    {
        return $this->doors_3;
    }

    public function setDoors3(array $doors_3): self
    {
        $this->doors_3 = $doors_3;

        return $this;
    }

    public function getDripMed(): ?array
    {
        return $this->drip_med;
    }

    public function setDripMed(array $drip_med): self
    {
        $this->drip_med = $drip_med;

        return $this;
    }

    public function getMop(): ?array
    {
        return $this->mop;
    }

    public function setMop(array $mop): self
    {
        $this->mop = $mop;

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
        if ($game->getThings() !== $this) {
            $game->setThings($this);
        }

        return $this;
    }
}
