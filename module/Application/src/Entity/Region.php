<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;
use Application\Entity\Translation\RegionTranslation;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\RegionRepository")
 * @ORM\Table(name="region")
 * @ORM\HasLifecycleCallbacks
 * @Gedmo\TranslationEntity(class="Application\Entity\Translation\RegionTranslation")
 */
class Region
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
     * @Gedmo\Translatable
     * @var text @ORM\Column(type="text", nullable=true)
     */
    private $description;

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
     * @var ArrayCollection @ORM\OneToMany(targetEntity="Application\Entity\Translation\RegionTranslation", mappedBy="object", cascade={"persist", "remove"}, orphanRemoval=true , fetch="EXTRA_LAZY")
     */
    private $translations;

    /**
     *
     * @var integer @ORM\Column(type="smallint", nullable=true)
     */
    private $sort = 0;

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

    /**
     *
     * @return the $sort
     */
    public function getSort()
    {
        return $this->sort;
    }

    /**
     *
     * @param number $sort
     */
    public function setSort($sort)
    {
        $this->sort = $sort;
    }

    public function __toString()
    {
        return sprintf('%s', $this->getName());
    }
}