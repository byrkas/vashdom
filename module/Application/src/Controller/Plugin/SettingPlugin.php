<?php
namespace Application\Controller\Plugin;

use Zend\Mvc\Controller\Plugin\AbstractPlugin;
use Zend\Session\Container;

class SettingPlugin extends AbstractPlugin
{
    private $em;

    public function __construct($entityManager)
    {
        $this->em = $entityManager;
    }

    public function getValue($code, $notReplace = false)
    {
        if(in_array($code, ['phone','phone_business']) && !$notReplace){
            $session = new Container('geolocation');
            if(isset($session->country_code) && $session->country_code == "MD"){
                $code = "phone_md";
            }
        }

        return $this->em->getRepository('Application\Entity\Setting')->getValueByCode($code);
    }
}
