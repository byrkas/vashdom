<?php
namespace Application\View\Helper\Factory;

use Interop\Container\ContainerInterface;
use Application\View\Helper\ContactBlock;

class ContactBlockFactory
{
    public function __invoke(ContainerInterface $container)
    {
        $entityManager = $container->get('doctrine.entitymanager.orm_default');

        return new ContactBlock($entityManager);
    }
}