<?php
namespace Application\Controller\Plugin\Factory;

use Zend\ServiceManager\Factory\FactoryInterface;
use Interop\Container\ContainerInterface;
use Application\Controller\Plugin\MailSenderPlugin;

class MailSenderFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        $entityManager = $container->get('doctrine.entitymanager.orm_default');
        $config = $container->get('config');

        return new MailSenderPlugin($entityManager, $config);
    }
}