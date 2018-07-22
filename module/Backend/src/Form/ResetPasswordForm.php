<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;

class ResetPasswordForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;
    
    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        parent::__construct('form');  
                
        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-login__form m-form'
        ]);        
        
        $this->add([
            'name' => 'password',
            'options' => [
            ],
            'attributes' => [
                'placeholder'   =>  'New Password',
                'class' =>  'form-control m-input m-login__form-input--last'
            ],
            'type'  => Element\Password::class,
        ])->add([
            'name' => 'confirm_password',
            'options' => [
            ],
            'attributes' => [
                'placeholder'   =>  'Confirm Password',
                'class' =>  'form-control m-input m-login__form-input--last'
            ],
            'type'  => Element\Password::class,
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'password' => [
                'required' => true,
                'validators'    =>  [
                    [
                        'name' => 'StringLength',
                        'options' => [
                            'encoding' => 'UTF-8',
                            'min' => 1,
                            'max' => 100,
                        ],
                    ],
                ],
            ],
            'confirm_password' => [
                'required' => true,
                'validators'    =>  [
                    [
                        'name' => 'StringLength',
                        'options' => [
                            'encoding' => 'UTF-8',
                            'min' => 1,
                            'max' => 100,
                        ],
                    ],
                ],
            ],
        ];
    }
}