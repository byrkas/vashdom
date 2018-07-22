<?php
namespace Backend\Form;

use Application\Entity\MetaTags;
use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;


class MetaTagsForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\MetaTags'))->setObject(new MetaTags());

        parent::__construct('form');

        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-form m-form--fit m-form--label-align-right'
        ]);

        $this->add([
            'name' => 'route',
            'options' => [
                'label' => 'Link'
            ],
            'attributes' => [
                'placeholder' => 'Link'
            ],
            'type' => Element\Text::class
        ])
            ->add([
                'name' => 'title',
                'options' => [
                    'label' => 'Title'
                ],
                'attributes' => [
                    'placeholder' => 'Title'
                ],
                'type' => Element\Text::class
            ])
            ->add([
                'name' => 'description',
                'options' => [
                    'label' => 'Description'
                ],
                'attributes' => [
                    'placeholder' => 'Description',
                    'class' => 'form-control'
                ],
                'type' => Element\Textarea::class
            ])
            ->add([
                'name' => 'keywords',
                'options' => [
                    'label' => 'Keywords'
                ],
                'attributes' => [
                    'placeholder' => 'Keywords',
                    'class' => 'form-control'
                ],
                'type' => Element\Textarea::class
            ])
            ->add([
                'name' => 'isEnabled',
                'options' => [
                    'label' => 'Is enabled <span></span>',
                    'label_attributes' => [
                        'class' => 'm-checkbox  m-checkbox--focus'
                    ]
                ],
                'type' => Element\Checkbox::class,
                'attributes' => [
                    'checked' => 'checked',
                ],
            ])
            ->add([
                'name' => 'submit',
                'options' => [],
                'attributes' => [
                    'value' => 'Submit',
                    'class' => 'btn m-btn m-btn--gradient-from-success m-btn--gradient-to-accent'
                ],
                'type' => Element\Submit::class
            ])
            ->add([
                'name' => 'cancel',
                'options' => [],
                'attributes' => [
                    'value' => 'Cancel'
                ],
                'type' => Element\Submit::class
            ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'route' => [
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ]
                ]
            ]
        ];
    }
}