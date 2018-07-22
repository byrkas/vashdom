<?php
namespace Application\View\Helper;

use Zend\View\Helper\AbstractHelper;

class Socials extends AbstractHelper
{
    protected $em;
    protected $cache;

    public function __construct($em, $cache)
    {
        $this->em = $em;
        $this->cache = $cache;
    }

    public function __invoke()
    {
        $key    = 'socials';
        $data = [];
        if (($data = $this->cache->getItem($key)) == FALSE) {
            $data = $this->em->getRepository('Application\Entity\Social')->getListForSite();
            $this->cache->setItem($key, $data);
            $this->cache->setTags($key,['socials']);
        }

        if(!empty($data))
            return $this->getView()->render('application/partial/socials', ['socials' => $data]);

        return '';
    }
}