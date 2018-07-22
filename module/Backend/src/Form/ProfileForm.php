<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Admin;

class ProfileForm extends Form implements InputFilterProviderInterface
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
                'readonly'  =>  true,
                'disabled' => true,
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
            'name' => 'old_password',
            'options' => [
                'label' => 'Old password',
            ],
            'attributes' => [
                'placeholder'   =>  'Old password',
            ],
            'type'  => Element\Password::class,
        ])->add([
            'name' => 'new_password',
            'options' => [
                'label' => 'New password',
            ],
            'attributes' => [
                'placeholder'   =>  'password',
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
            'email' =>  [
                'required' => false,
            ],
            'nickname' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'old_password' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'new_password' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'confirm_password' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
                'validators' => [
                    [
                        'name'  =>  'Identical',
                        'options' => [
                            'token' => 'new_password',
                        ],
                    ]
                ],
            ],
        ];
    }
}