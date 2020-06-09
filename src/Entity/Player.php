<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\PlayerRepository")
 * @ORM\Table(name="player")
 */
class Player implements UserInterface
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     * @Assert\Email(message="Wprowadzony tekst nie jest poprawnym adresem e-mail.")
     * @Assert\NotBlank(message="E-mail nie może być pusty.")
     */
    private $email;
    
    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @ORM\Column(type="string", length=50)
     * @Assert\NotBlank(message="Nick nie może być pusty")
     * @Assert\Regex(pattern="/^\w+$/", message="Nick może składać się tylko z liter, cyfr i znaku '_'")
     */
    private $nick;

    /**
     * @ORM\Column(type="string", length=400)
     */
    private $password;

    /**
     * @ORM\Column(type="boolean")
     */
    private $enabled;

    /**
     * @ORM\Column(type="integer")
     */
    private $failedLoginAttempts;

    /**
     * @ORM\Column(type="datetime")
     */
    private $registrationDate;

    /**
     * @ORM\Column(type="datetime")
     */
    private $entryUpdatingDate;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $loginDate;

    /**
     * @ORM\Column(type="string", length=400, nullable=true)
     */
    private $blockedToken;

    /**
     * @ORM\Column(type="string", length=400, nullable=true)
     */
    private $resetToken;

    /**
     * @ORM\Column(type="string", length=400, nullable=true)
     */
    private $loginToken;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\Game", inversedBy="player", cascade={"persist", "remove"})
     */
    private $game;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }
    
    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getNick(): ?string
    {
        return $this->nick;
    }

    public function setNick(string $nick): self
    {
        $this->nick = $nick;

        return $this;
    }
    
    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUsername(): string
    {
        return (string) $this->nick;
    }

    /**
     * @see UserInterface
     */
    public function getPassword(): ?string
    {
        return (string) $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }
    
    /**
     * @see UserInterface
     */
    public function getSalt()
    {
        // not needed when using the "bcrypt" algorithm in security.yaml
    }
    
    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getEnabled(): ?bool
    {
        return $this->enabled;
    }

    public function setEnabled(bool $enabled): self
    {
        $this->enabled = $enabled;

        return $this;
    }

    public function getFailedLoginAttempts(): ?int
    {
        return $this->failedLoginAttempts;
    }

    public function setFailedLoginAttempts(int $failedLoginAttempts): self
    {
        $this->failedLoginAttempts = $failedLoginAttempts;

        return $this;
    }

    public function getRegistrationDate(): ?\DateTimeInterface
    {
        return $this->registrationDate;
    }

    public function setRegistrationDate(\DateTimeInterface $registrationDate): self
    {
        $this->registrationDate = $registrationDate;

        return $this;
    }

    public function getEntryUpdatingDate(): ?\DateTimeInterface
    {
        return $this->entryUpdatingDate;
    }

    public function setEntryUpdatingDate(\DateTimeInterface $entryUpdatingDate): self
    {
        $this->entryUpdatingDate = $entryUpdatingDate;

        return $this;
    }

    public function getLoginDate(): ?\DateTimeInterface
    {
        return $this->loginDate;
    }

    public function setLoginDate(?\DateTimeInterface $loginDate): self
    {
        $this->loginDate = $loginDate;

        return $this;
    }

    public function getBlockedToken(): ?string
    {
        return $this->blockedToken;
    }

    public function setBlockedToken(?string $blockedToken): self
    {
        $this->blockedToken = $blockedToken;

        return $this;
    }

    public function getResetToken(): ?string
    {
        return $this->resetToken;
    }

    public function setResetToken(?string $resetToken): self
    {
        $this->resetToken = $resetToken;

        return $this;
    }

    public function getLoginToken(): ?string
    {
        return $this->loginToken;
    }

    public function setLoginToken(?string $loginToken): self
    {
        $this->loginToken = $loginToken;

        return $this;
    }

    public function getGame(): ?Game
    {
        return $this->game;
    }

    public function setGame(Game $game): self
    {
        $this->game = $game;

        return $this;
    }
}
