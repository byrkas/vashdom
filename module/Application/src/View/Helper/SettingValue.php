<?php
namespace Application\View\Helper;

use Zend\View\Helper\AbstractHelper;
use Zend\Session\Container;

class SettingValue extends AbstractHelper
{
    protected $em;
    protected $cache;

    public function __construct($em, $cache)
    {
        $this->em = $em;
        $this->cache = $cache;
    }

    public function __invoke($code, $notReplace = false)
    {
        $value = '';
        if(in_array($code, ['phone','phone_business']) && !$notReplace){
            $session = new Container('geolocation');
            if(isset($session->country_code) && $session->country_code == "MD"){
                $code = "phone_md";
            }
        }
        $key    = 'setting'.$code;

        if (($value = $this->cache->getItem($key)) == FALSE) {
            $value = $this->getValue($code);
            $value = $this->replace($value);

            $this->cache->setItem($key, $value);
            $this->cache->setTags($key,['setting']);
        }
        return $value;
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

    public function getValue($code)
    {
        return $this->em->getRepository('Application\Entity\Setting')->getValueByCode($code);
    }
}