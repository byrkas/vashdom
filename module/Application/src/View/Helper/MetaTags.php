<?php
namespace Application\View\Helper;

use Zend\Http\Request;
use Zend\Router\RouteStackInterface;
use Zend\View\Helper\AbstractHelper;

class MetaTags extends AbstractHelper
{
    protected $em;
    protected $cache;
    /**
     * RouteStackInterface instance.
     *
     * @var RouteStackInterface
     */
    protected $router;

    /**
     * @var Request
     */
    protected $request;

    public function __construct($em, $cache, RouteStackInterface $router, Request $request)
    {
        $this->em = $em;
        $this->cache = $cache;
        $this->router = $router;
        $this->request = $request;
    }

    public function __invoke()
    {
        $data = [];
        $routeHash = md5($this->request->getURI()->getPath());
        // key mmust be as rout
        $key    = 'meta_tags'.$routeHash;
        if (($data = $this->cache->getItem($key)) == FALSE) {
            $data = $this->em->getRepository('Application\Entity\MetaTags')->getMetaTagsByPathHash($routeHash);
            $this->cache->setItem($key, $data);
            $this->cache->setTags($key,['meta_tags']);
        }

        if (!empty($data)) {
            $this->getView()->headMeta()->setName("description", $data['description']);
            $this->getView()->headMeta()->setName("keywords", $data['keywords']);

            $this->getView()->headMeta($data['title'], "og:title", "property", array(), 'SET' );
            $this->getView()->headMeta()->setProperty("og:description", $data['description']);
            $this->getView()->headMeta()->setProperty("og:keywords", $data['keywords']);

            return $data['title'];
        }

        return '';
    }
}