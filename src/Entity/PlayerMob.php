<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\PlayerMobRepository")
 */
class PlayerMob
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
    private $player = [];
    
    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Game", mappedBy="player_mob", cascade={"persist", "remove"})
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
    
    public function getPlayer(): ?array
    {
        return $this->player;
    }

    public function setPlayer(array $player): self
    {
        $this->player = $player;

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
        if ($game->getPlayerMob() !== $this) {
            $game->setPlayerMob($this);
        }

        return $this;
    }
}