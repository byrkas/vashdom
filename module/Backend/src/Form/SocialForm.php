<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Social;

class SocialForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\Social'))->setObject(new Social());
        $types = Social::getTypes();

        parent::__construct('form');

        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-form m-form--fit m-form--label-align-right'
        ]);

        $this->add([
            'name' => 'type',
            'options' => [
                'label' => 'Type',
                'value_options' => $types,
                'empty_option'  =>  'Choose type',
            ],
            'attributes' => [
                'placeholder'   =>  'Type',
            ],
            'type'  => Element\Select::class,
        ])->add([
            'name' => 'link',
            'options' => [
                'label' => 'Link',
            ],
            'attributes' => [
                'placeholder'   =>  'Link',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'sort',
            'options' => [
                'label' => 'Sort',
            ],
            'attributes' => [
                'placeholder'   =>  'Sort',
            ],
            'type'  => Element\Number::class,
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
            'link' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'sort' => [
                'required' => false,
            ],
        ];
    }
}