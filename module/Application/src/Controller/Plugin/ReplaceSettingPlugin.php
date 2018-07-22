<?php
namespace Application\Controller\Plugin;

use Zend\Mvc\Controller\Plugin\AbstractPlugin;
use Zend\Session\Container;

class ReplaceSettingPlugin extends AbstractPlugin
{
    private $em;

    public function __construct($entityManager)
    {
        $this->em = $entityManager;
    }

    public function searchPattern($content)
    {
        $settings = [];
        preg_match_all('/{{(.*?)}}/', $content, $matches);

        if(isset($matches[1])){
            foreach ($matches[1] as $match){
                if(!in_array($match, $settings)){
                    $settings[] = $match;
                }
            }
        }

        return $settings;
    }

    public function replace($content){
        $settings = $this->searchPattern($content);
        if(!empty($settings)){
            foreach ($settings as $setting){
                $value = $this->getValue($setting);
                if($value){
                    $content = str_replace("{{".$setting."}}", $value, $content);
                }
            }
        }

        return $content;
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
