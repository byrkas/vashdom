<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\PageRepository")
 * @ORM\Table(name="page")
 * @Gedmo\TranslationEntity(class="Application\Entity\Translation\PageTranslation")
 */
class Page
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
    private $title;

    /**
     * @Gedmo\Translatable
     *
     * @var text @ORM\Column(name="content", type="text", nullable=true)
     */
    private $content;

    /**
     *
     * @Gedmo\Translatable
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     *      @Gedmo\Slug(fields={"title"})
     */
    private $slug;

    /**
     *
     * @var ArrayCollection @ORM\OneToMany(targetEntity="Application\Entity\Translation\PageTranslation", mappedBy="object", cascade={"persist", "remove"}, orphanRemoval=true , fetch="EXTRA_LAZY")
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
     * @return the $title
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     *
     * @return the $content
     */
    public function getContent()
    {
        return $this->content;
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
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }

    /**
     *
     * @param \Application\Entity\text $content
     */
    public function setContent($content)
    {
        $this->content = $content;
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
        return sprintf('%s', $this->getTitle());
    }
}