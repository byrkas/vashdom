<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Admin;

class UserForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\Admin'))->setObject(new Admin());

        parent::__construct('form');

        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-form m-form--fit m-form--label-align-right'
        ]);

        $this->add([
            'name' => 'email',
            'options' => [
                'label' => 'Email',
            ],
            'attributes' => [
                'placeholder'   =>  'Email',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'nickname',
            'options' => [
                'label' => 'Nickname',
            ],
            'attributes' => [
                'placeholder'   =>  'Nickname',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'password',
            'options' => [
                'label' => 'Password',
            ],
            'attributes' => [
                'placeholder'   =>  'Old password',
            ],
            'type'  => Element\Password::class,
        ])->add([
            'name' => 'confirm_password',
            'options' => [
                'label' => 'Confirm password',
            ],
            'attributes' => [
                'placeholder'   =>  'Confirm Password',
                'class' =>  'form-control m-input m-login__form-input--last'
            ],
            'type'  => Element\Password::class,
        ])
        ->add([
            'name' => 'submit',
            'options' => [
            ],
            'attributes' => ['value' => 'Submit','class' => 'btn m-btn m-btn--gradient-from-success m-btn--gradient-to-accent'],
            'type'  => Element\Submit::class
        ])->add([
            'name' => 'cancel',
            'options' => [
            ],
            'attributes' => ['value' => 'Cancel'],
            'type'  => Element\Submit::class
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
                        'name'	=> 'DoctrineModule\Validator\NoObjectExists',
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
            'nickname' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'password' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'confirm_password' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
                'validators' => [
                    [
                        'name'  =>  'Identical',
                        'options' => [
                            'token' => 'password',
                        ],
                    ]
                ],
            ],
        ];
    }
}