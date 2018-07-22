<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\MetaTagsRepository")
 * @ORM\Table(name="meta_tags")
 */
class MetaTags
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
     * @var string @ORM\Column(name="route_hash", type="string", length=32)
     */
    private $routeHash;

    /**
     *
     * @var string @ORM\Column(name="route", type="string", length=2000)
     */
    private $route;

    /**
     *
     * @var string @ORM\Column(name="title", type="string", length=2000, nullable=true)
     */
    private $title;

    /**
     *
     * @var string @ORM\Column(name="description", type="string", length=300, nullable=true)
     */
    private $description;

    /**
     *
     * @var string @ORM\Column(name="keywords", type="string", length=300, nullable=true)
     */
    private $keywords;

    /**
     *
     * @var boolean @ORM\Column(name="is_enabled",type="boolean", options={"default": true})
     */
    private $isEnabled;

    /**
     *
     * @var string @ORM\Column(name="edited_by_user", type="integer")
     */
    private $editedByUser;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getRouteHash()
    {
        return $this->routeHash;
    }

    /**
     * @param string $routeHash
     */
    public function setRouteHash($routeHash)
    {
        $this->routeHash = $routeHash;
    }

    /**
     * @return string
     */
    public function getRoute()
    {
        return $this->route;
    }

    /**
     * @param string $route
     */
    public function setRoute($route)
    {
        $this->route = $route;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->title;
    }

    /**
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->title = $title;
    }

    /**
     * @return string
     */
    public function getDescription()
    {
        return $this->description;
    }

    /**
     * @param string $description
     */
    public function setDescription($description)
    {
        $this->description = $description;
    }

    /**
     * @return string
     */
    public function getKeywords()
    {
        return $this->keywords;
    }

    /**
     * @param string $keywords
     */
    public function setKeywords($keywords)
    {
        $this->keywords = $keywords;
    }

    /**
     * @return string
     */
    public function getEditedByUser()
    {
        return $this->editedByUser;
    }

    /**
     * @param string $editedByUser
     */
    public function setEditedByUser($editedByUser)
    {
        $this->editedByUser = $editedByUser;
    }

    /**
     * @return \DateTime
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param \DateTime $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return \DateTime
     */
    public function getUpdated()
    {
        return $this->updated;
    }

    /**
     * @param \DateTime $updated
     */
    public function setUpdated($updated)
    {
        $this->updated = $updated;
    }

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="created", type="datetime")
     */
    private $created;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="updated", type="datetime", nullable=true)
     */
    private $updated;

    /**
     * Gets triggered only on insert
     * @ORM\PrePersist
     */
    public function onPrePersist()
    {
        $this->created = new \DateTime("now");
    }

    /**
     * Gets triggered every time on update
     * @ORM\PreUpdate
     */
    public function onPreUpdate()
    {
        $this->updated = new \DateTime("now");
    }

    /**
     * @return bool
     */
    public function isEnabled()
    {
        return $this->isEnabled;
    }

    /**
     * @param bool $isEnabled
     */
    public function setIsEnabled($isEnabled)
    {
        $this->isEnabled = $isEnabled;
    }
}