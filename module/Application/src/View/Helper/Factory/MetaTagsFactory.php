<?php
namespace Application\View\Helper\Factory;

use Interop\Container\ContainerInterface;
use Application\View\Helper\MetaTags;

class MetaTagsFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $cache = $container->get('FilesystemCache');
        $router = $container->get('router');
        $request = $container->get('request');


        return new MetaTags($entityManager, $cache, $router, $request);
    }
}