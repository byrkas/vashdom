<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity
 * @ORM\Table(name="admin")
 */
class Admin
{
    use Traits\MagicTrait;
    use Traits\TimestampableTrait;

    /**
     *
     * @var int @ORM\Id
     *      @ORM\Column(type="integer")
     *      @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     *
     * @var string @ORM\Column(type="string", length=45, nullable=true)
     */
    private $nickname;

    /**
     *
     * @var string @ORM\Column(type="string", length=45, nullable=false, unique=true)
     */
    private $email;

    /**
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     */
    private $password;

    /**
     *
     * @var string @ORM\Column(type="string", length=255)
     */
    private $access = 'Backend';

    /**
     *
     * @var string @ORM\Column(name="pwd_reset_token",type="string", length=255, nullable=true)
     */
    private $passwordResetToken;

    /**
     * @ORM\Column(name="pwd_reset_token_creation_date", type="datetime", nullable=true)
     */
    private $passwordResetTokenCreationDate;

    public function __construct()
    {
    }

    /**
     *
     * @return the $id
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     *
     * @return the $email
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     *
     * @return the $password
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     *
     * @param string $email            
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     *
     * @param string $password            
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     *
     * @return the $nickname
     */
    public function getNickname()
    {
        return $this->nickname;
    }

    /**
     *
     * @param string $nickname            
     */
    public function setNickname($nickname)
    {
        $this->nickname = $nickname;
    }

    /**
     *
     * @return the $passwordResetToken
     */
    public function getPasswordResetToken()
    {
        return $this->passwordResetToken;
    }

    /**
     *
     * @return the $passwordResetTokenCreationDate
     */
    public function getPasswordResetTokenCreationDate()
    {
        return $this->passwordResetTokenCreationDate;
    }

    /**
     *
     * @param string $passwordResetToken            
     */
    public function setPasswordResetToken($passwordResetToken)
    {
        $this->passwordResetToken = $passwordResetToken;
    }

    /**
     *
     * @param field_type $passwordResetTokenCreationDate            
     */
    public function setPasswordResetTokenCreationDate($passwordResetTokenCreationDate)
    {
        $this->passwordResetTokenCreationDate = $passwordResetTokenCreationDate;
    }

    public function __toString()
    {
        return sprintf('%s', $this->getNickname());
    }

    /**
     * @return string
     */
    public function getAccess()
    {
        return $this->access;
    }

    /**
     * @param string $access
     */
    public function setAccess($access)
    {
        $this->access = $access;
    }
}