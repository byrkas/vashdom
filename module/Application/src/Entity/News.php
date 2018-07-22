<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;
use Doctrine\Common\Collections\ArrayCollection;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\NewsRepository")
 * @ORM\Table(name="news")
 * @Gedmo\TranslationEntity(class="Application\Entity\Translation\NewsTranslation")
 */
class News
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
     * @var string @ORM\Column(type="string", length=500, nullable=false)
     */
    private $description;

    /**
     * @Gedmo\Translatable
     *
     * @var string @ORM\Column(name="content", type="text", nullable=true)
     */
    private $content;

    /**
     *
     * @Gedmo\Slug(fields={"title"})
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     *
     */
    private $slug;

    /**
     *
     * @var boolean @ORM\Column(name="is_published",type="boolean")
     */
    private $isPublished = true;

    /**
     *
     * @var datetime @ORM\Column(name="publish_date",type="date", nullable=true)
     */
    private $publishDate;

    /**
     *
     * @var ArrayCollection @ORM\OneToMany(targetEntity="Application\Entity\Translation\NewsTranslation", mappedBy="object", cascade={"persist", "remove"}, orphanRemoval=true , fetch="EXTRA_LAZY")
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
     * @param string $content
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

    /**
     *
     * @return the $isPublished
     */
    public function getIsPublished()
    {
        return $this->isPublished;
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
     * @param boolean $isPublished
     */
    public function setIsPublished($isPublished)
    {
        $this->isPublished = $isPublished;
    }

    /**
     *
     * @return the $publishDate
     */
    public function getPublishDate()
    {
        return $this->publishDate;
    }

    /**
     *
     * @param \Application\Entity\datetime $publishDate
     */
    public function setPublishDate($publishDate)
    {
        $this->publishDate = $publishDate;
    }

    /**
     *
     * @return the $description
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     *
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    public function __toString()
    {
        return sprintf('%s', $this->getTitle());
    }
}