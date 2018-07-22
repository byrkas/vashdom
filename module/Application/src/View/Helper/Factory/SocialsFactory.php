<?php
namespace Application\View\Helper\Factory;

use Interop\Container\ContainerInterface;
use Application\View\Helper\Socials;

class SocialsFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $cache = $container->get('FilesystemCache');

        return new Socials($entityManager, $cache);
    }
}