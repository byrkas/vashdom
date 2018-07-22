<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\CountryRepository")
 * @ORM\Table(name="country")
 * @Gedmo\TranslationEntity(class="Application\Entity\Translation\CountryTranslation")
 */
class Country
{
    use Traits\MagicTrait;
    use Traits\TimestampableTrait;
    use Traits\TranslatableTrait;

    /**
     *
     * @var int @ORM\Id
     *      @ORM\Column(type="integer")
     *      @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @Gedmo\Translatable
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     */
    private $name;

    /**
     * @Gedmo\Translatable
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     *      @Gedmo\Slug(fields={"name"})
     */
    private $slug;

    /**
     *
     * @var ArrayCollection @ORM\OneToMany(targetEntity="Application\Entity\Translation\CountryTranslation", mappedBy="object", cascade={"persist", "remove"}, orphanRemoval=true , fetch="EXTRA_LAZY")
     */
    private $translations;

    public function __construct()
    {
        $this->translations = new ArrayCollection();
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
     * @return the $name
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     *
     * @return the $slug
     */
    public function getSlug()
    {
        return $this->slug;
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
     * @param string $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
    }

    public function __toString()
    {
        return sprintf('%s', $this->getName());
    }
}