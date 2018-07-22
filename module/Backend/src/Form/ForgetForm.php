<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;

class ForgetForm extends Form implements InputFilterProviderInterface
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
            'name' => 'email',
            'options' => [
            ],
            'attributes' => [
                'placeholder'   =>  'Email',
                'autocomplete'  =>  'off',
                'class' =>  'form-control m-input'
            ],
            'type'  => Element\Email::class,
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'email' => [
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
                    [
                        'name'	=> 'DoctrineModule\Validator\ObjectExists',
                        'options' => [
                            'object_repository' => $this->objectManager->getRepository('Application\Entity\Admin'),
                            'fields' => 'email'
                        ],
                    ],
                ],
                'filters' => [
                    ['name' => 'StripTags'],
                    ['name' => 'StringTrim'],
                ],
            ],
        ];
    }
}