<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\LanguageRepository")
 * @ORM\Table(name="language")
 */
class Language
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
     * @var string @ORM\Column(type="string", length=25, nullable=false)
     */
    private $name;

    /**
     *
     * @var string @ORM\Column(type="string", length=5, nullable=false)
     */
    private $locale;

    /**
     *
     * @var string @ORM\Column(type="string", length=5, nullable=false)
     */
    private $code;

    /**
     *
     * @var array @ORM\Column(type="json_array", nullable=true)
     */
    private $info;

    public function __construct()
    {}

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
     * @return the $name
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     *
     * @return the $code
     */
    public function getCode()
    {
        return $this->code;
    }

    /**
     *
     * @param number $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     *
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     *
     * @param string $code
     */
    public function setCode($code)
    {
        $this->code = $code;
    }

    /**
     *
     * @return the $locale
     */
    public function getLocale()
    {
        return $this->locale;
    }

    /**
     *
     * @param string $locale
     */
    public function setLocale($locale)
    {
        $this->locale = $locale;
    }

    /**
     *
     * @return the $info
     */
    public function getInfo()
    {
        return $this->info;
    }

    /**
     *
     * @param array $info
     */
    public function setInfo($info)
    {
        $this->info = $info;
    }

    public function __toString()
    {
        return sprintf('%s', $this->getName());
    }
}