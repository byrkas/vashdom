<?php
namespace Backend\Controller\Factory;

use Interop\Container\ContainerInterface;
use Zend\ServiceManager\Factory\FactoryInterface;
use Backend\Service\AuthManager;
use Backend\Service\UserManager;
use Application\Service\QuoteSendManager;

class IndexControllerFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $config = $container->get('config');
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $authManager = $container->get(AuthManager::class);
        $userManager = $container->get(UserManager::class);
        $quoteManager = $container->get(QuoteSendManager::class);
        return new \Backend\Controller\IndexController($entityManager, $config, $authManager, $userManager, $quoteManager);
    }
}