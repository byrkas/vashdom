<?php
namespace Application\View\Helper;

use Zend\View\Helper\AbstractHelper;
use Zend\View\Helper\FlashMessenger;

class ShowMessages extends AbstractHelper
{
    public function __invoke()
    {
        $messenger = new FlashMessenger();
        $error_messages = $messenger->getErrorMessages();
        $success_messages = $messenger->getSuccessMessages();
        $messages = $messenger->getMessages();
        $result = '';
        if (count($error_messages)) {
            $result .= '<div class="m-alert m-alert--outline alert alert-danger alert-dismissible" role="alert">'.
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>';
            $result .= '<span>'.implode(' ',$error_messages).'</span></div>';
        }
        if (count($success_messages)) {
            $result .= '<div class="m-alert m-alert--outline alert alert-dismissible alert-success" role="alert">'.
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button>';
            $result .= '<span>'.implode(' ',$success_messages).'</span></div>';
        }

        if (count($messages)) {
            $result .= '<div class="m-alert m-alert--outline alert alert-info alert-dismissible" role="alert">'.
                '<button type="button" class="close" data-dismiss="alert" aria-label="Close"></button><span>';
                foreach ($messages as $message) {
                    $result .= '<p>' . $message . '</p>';
                }
                $result .= '</span></div>';
        }
        
        
        return $result;
    }
}