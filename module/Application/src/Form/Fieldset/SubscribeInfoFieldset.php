<?php
namespace Application\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;

class SubscribeInfoFieldset extends Fieldset implements InputFilterProviderInterface
{
    public function __construct()
    {
        parent::__construct('info');

        $this->add([
            'name' => 'subscription-cust',
            'options' => [
                'disable_inarray_validator' => true,
            ],
            'attributes' => [
            ],
            'type'  => Element\MultiCheckbox::class,
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'subscription-cust' =>  ['required' => false]
        ];
    }
}