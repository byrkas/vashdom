<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
// use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Hydrator\Translations as TranslationsHydrator;
use Application\Entity\Region;
use DoctrineModule\Form\Element as DoctrineElement;

class RegionForm extends Form implements InputFilterProviderInterface
{

    protected $objectManager;

    public function __construct(ObjectManager $objectManager, $locales = [])
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new TranslationsHydrator($objectManager, 'Application\Entity\Region'))->setObject(new Region());

        parent::__construct('form');

        $translations = new \Zend\Form\Fieldset('translations');
        $translations->setAttributes([
            'class' => 'tab-content'
        ]);
        foreach ($locales as $locale) {
            $fieldset = new \Zend\Form\Fieldset($locale);
            $fieldset->setAttributes(array(
                'class' => 'tab-pane',
                'id' => 'm_tabs_' . $locale
            ));

            $fieldset->add([
                'name' => 'name',
                'options' => [
                    'label' => 'Name',
                    'label_attributes' => [
                        'class' => 'required'
                    ]
                ],
                'attributes' => [
                    'class' => 'name-' . $locale,
                    'placeholder' => 'Name'
                ],
                'type' => Element\Text::class
            ])->add([
                'name' => 'description',
                'options' => [
                    'label' => 'Description',
                ],
                'attributes' => [
                    'placeholder'   =>  'Description',
                    'class' =>  'form-control summernote description-'.$locale,
                ],
                'type'  => Element\Textarea::class,
            ]);
            $translations->add($fieldset);
        }
        $this->add($translations);

        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-form m-form--fit m-form--label-align-right'
        ]);

        $this->add([
            'name' => 'name',
            'options' => [
                'label' => 'Name',
                'label_attributes' => [
                    'class' => 'required'
                ]
            ],
            'attributes' => [
                'placeholder' => 'Name',
                'id' => 'name'
            ],
            'type' => Element\Text::class
        ])->add([
            'name' => 'description',
            'options' => [
                'label' => 'Description',
            ],
            'attributes' => [
                'placeholder'   =>  'Description',
                'class' =>  'form-control summernote',
                'id' => 'description',
            ],
            'type'  => Element\Textarea::class,
        ])
            ->add([
            'name' => 'sort',
            'options' => [
                'label' => 'Sort'
            ],
            'attributes' => [
                'placeholder' => 'Sort'
            ],
            'type' => Element\Number::class
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
            'name' => [
                'required' => true
            ],
            'sort' => [
                'required' => false
            ]
        ];
    }
}