<?php
namespace Application\View\Helper;

use Zend\View\Helper\AbstractHelper;

class ConvertToHoursMins extends AbstractHelper
{

    public function __invoke($time, $format = '%02d:%02d')
    {
        if ($time < 1) {
            return;
        }
        $hours = floor($time / 60);
        $minutes = ($time % 60);
        return sprintf($format, $hours, $minutes);
    }
}