<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\GameRepository")
 */
class Game
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Player", mappedBy="game", cascade={"persist", "remove"})
     */
    private $player;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Areas", inversedBy="game", cascade={"persist", "remove"})
     */
    private $areas;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Things", inversedBy="game", cascade={"persist", "remove"})
     */
    private $things;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Mobs", inversedBy="game", cascade={"persist", "remove"})
     */
    private $mobs;
    
    /**
     * @ORM\Column(type="string", length=30)
     */
    private $player_time;
    
    /**
     * @ORM\OneToOne(targetEntity="App\Entity\PlayerMob", inversedBy="game", cascade={"persist", "remove"})
     */
    private $player_mob;
    
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

    public function getPlayer(): ?Player
    {
        return $this->player;
    }

    public function setPlayer(Player $player): self
    {
        $this->player = $player;
        
        // set the owning side of the relation if necessary
        if ($player->getGame() !== $this) {
            $player->setGame($this);
        }

        return $this;
    }
    
    public function getAreas(): ?Areas
    {
        return $this->areas;
    }

    public function setAreas(Areas $areas): self
    {
        $this->areas = $areas;

        return $this;
    }
    
    public function getThings(): ?Things
    {
        return $this->things;
    }

    public function setThings(Things $things): self
    {
        $this->things = $things;

        return $this;
    }
    
    public function getMobs(): ?Mobs
    {
        return $this->mobs;
    }

    public function setMobs(Mobs $mobs): self
    {
        $this->mobs = $mobs;

        return $this;
    }
    
    public function getPlayerMob(): ?PlayerMob
    {
        return $this->player_mob;
    }

    public function setPlayerMob(PlayerMob $player_mob): self
    {
        $this->player_mob = $player_mob;
        
        return $this;
    }
    
    public function getPlayerTime(): ?string
    {
        return $this->player_time;   
    }

    public function setPlayerTime(string $player_time): self
    {
        $this->player_time = $player_time;

        return $this;
    }  
}
