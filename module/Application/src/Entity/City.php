<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\CityRepository")
 * @ORM\Table(name="city")
 * @Gedmo\TranslationEntity(class="Application\Entity\Translation\CityTranslation")
 */
class City
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
     *
     * @Gedmo\Translatable
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     */
    private $name;

    /**
     *
     * @var Country @ORM\ManyToOne(targetEntity="Country")
     *      @ORM\JoinColumn(name="country_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Country;

    /**
     *
     * @var Region @ORM\ManyToOne(targetEntity="Region")
     *      @ORM\JoinColumn(name="region_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $Region;

    /**
     *
     * @Gedmo\Translatable
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     *      @Gedmo\Slug(fields={"name"})
     */
    private $slug;

    /**
     *
     * @var ArrayCollection @ORM\OneToMany(targetEntity="Application\Entity\Translation\CityTranslation", mappedBy="object", cascade={"persist", "remove"}, orphanRemoval=true , fetch="EXTRA_LAZY")
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
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     *
     * @param string $image
     */
    public function setImage($image)
    {
        $this->image = $image;
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
     * @param string $slug
     */
    public function setSlug($slug)
    {
        $this->slug = $slug;
    }

    /**
     *
     * @return the $Region
     */
    public function getRegion()
    {
        return $this->Region;
    }

    /**
     *
     * @param Region $Region
     */
    public function setRegion($Region)
    {
        $this->Region = $Region;
    }

    /**
     *
     * @return the $Country
     */
    public function getCountry()
    {
        return $this->Country;
    }

    /**
     *
     * @param \Application\Entity\Country $Country
     */
    public function setCountry($Country)
    {
        $this->Country = $Country;
    }

    public function __toString()
    {
        return sprintf('%s', $this->getName());
    }
}