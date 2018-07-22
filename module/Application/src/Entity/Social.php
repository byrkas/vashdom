<?php
namespace Application\Entity;

use Doctrine\ORM\Mapping as ORM;
use Gedmo\Mapping\Annotation as Gedmo;

/**
 * @ORM\Entity(repositoryClass="Application\Entity\Repository\SocialRepository")
 * @ORM\Table(name="social")
 */
class Social
{
    use Traits\MagicTrait;
    use Traits\TimestampableTrait;

    const TYPE_FACEBOOK = 'facebook', TYPE_TWITTER = 'twitter', TYPE_GOOGLE_PLUS = 'google', TYPE_LINKEDIN = 'linkedin', TYPE_PINTEREST = 'pinterest', TYPE_YOUTUBE = 'youtube';

    /**
     *
     * @var int @ORM\Id
     *      @ORM\Column(type="integer")
     *      @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     *
     * @var string @ORM\Column(type="string", length=255, nullable=false)
     */
    private $link;

    /**
     *
     * @var string @ORM\Column(type="string", length=25, nullable=false)
     */
    private $type;

    /**
     *
     * @var integer @ORM\Column(type="smallint", nullable=true)
     */
    private $sort = 0;

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
     * @return the $link
     */
    public function getLink()
    {
        return $this->link;
    }

    /**
     *
     * @return the $type
     */
    public function getType()
    {
        return $this->type;
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
     * @param number $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     *
     * @param string $link
     */
    public function setLink($link)
    {
        $this->link = $link;
    }

    /**
     *
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     *
     * @param number $sort
     */
    public function setSort($sort)
    {
        $this->sort = $sort;
    }

    public static function getTypes()
    {
        return [
            self::TYPE_FACEBOOK => 'Facebook',
            self::TYPE_GOOGLE_PLUS => 'Google+',
            self::TYPE_TWITTER => 'Twitter',
            self::TYPE_LINKEDIN => 'Linkedin',
            self::TYPE_PINTEREST => 'Pinterest',
            self::TYPE_YOUTUBE => 'YouTube',
        ];
    }

    public function __toString()
    {
        return sprintf('%s', $this->getLink());
    }
}