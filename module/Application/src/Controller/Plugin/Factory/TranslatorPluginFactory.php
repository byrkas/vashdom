<?php
namespace Application\Controller\Plugin\Factory;

use Zend\ServiceManager\Factory\FactoryInterface;
use Interop\Container\ContainerInterface;
use Application\Controller\Plugin\TranslatorPlugin;

class TranslatorPluginFactory implements FactoryInterface
{
    public function __invoke(ContainerInterface $container, $requestedName, array $options = null)
    {
        if (!$container->has('translator')) {
            throw new \Exception("Zend I18n Translator not configured");
        }

        $translator = $container->get('translator');
        return new TranslatorPlugin($translator);
    }
}