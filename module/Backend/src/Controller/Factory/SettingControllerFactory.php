<?php
namespace Backend\Controller\Factory;

use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Factory\FactoryInterface;

class SettingControllerFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $config = $container->get('config');
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $cache = $container->get('FilesystemCache');
        return new \Backend\Controller\SettingController($entityManager, $config, $cache);
    }
}