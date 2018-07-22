<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Application\Entity\Hydrator\Translations as TranslationsHydrator;
use Application\Entity\Country;
use DoctrineModule\Form\Element as DoctrineElement;

class CountryForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager, $locales = [])
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new TranslationsHydrator($objectManager, 'Application\Entity\Country'))->setObject(new Country());

        parent::__construct('form');

        $translations = new \Zend\Form\Fieldset('translations');
        $translations->setAttributes([ 'class' => 'tab-content']);
        foreach ($locales as $locale) {
            $fieldset = new \Zend\Form\Fieldset($locale);
            $fieldset->setAttributes(array(
                'class' => 'tab-pane',
                'id' => 'm_tabs_'.$locale
            ));

            $fieldset->add([
                'name' => 'name',
                'options' => [
                    'label' => 'Name',
                    'label_attributes' => [
                        'class' => 'required'
                    ],
                ],
                'attributes' => [
                    'class' => 'name-'.$locale,
                    'placeholder'   =>  'Name',
                ],
                'type'  => Element\Text::class,
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
            ],
            'attributes' => [
                'placeholder'   =>  'Name',
                'id' => 'name'
            ],
            'type'  => Element\Text::class,
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
            'name' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
        ];
    }
}