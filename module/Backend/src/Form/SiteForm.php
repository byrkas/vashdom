<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;

class SiteForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        parent::__construct('form');
        $languages = $objectManager->getRepository('Application\Entity\Language')->getListArray();

        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-form m-form--fit m-form--label-align-right'
        ]);

        $this->add([
            'name' => 'domain',
            'options' => [
                'label' => 'Domain',
            ],
            'attributes' => [
                'placeholder'   =>  'Domain',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'siteName',
            'options' => [
                'label' => 'Name',
            ],
            'attributes' => [
                'placeholder'   =>  'Name',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'siteTitle',
            'options' => [
                'label' => 'Title',
            ],
            'attributes' => [
                'placeholder'   =>  'Title',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'keywords',
            'options' => [
                'label' => 'Keywords',
            ],
            'attributes' => [
                'placeholder'   =>  'Keywords',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'description',
            'options' => [
                'label' => 'Description',
            ],
            'attributes' => [
                'placeholder'   =>  'Description',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'default_locale',
            'options' => [
                'label' => 'Default language',
                'value_options' => $languages,
                'empty_option'  =>  'Choose default language',
            ],
            'attributes' => [
            ],
            'type'  => Element\Select::class,
        ])->add([
            'name' => 'locales',
            'options' => [
                'label' => 'Languages',
                'value_options' => $languages,
            ],
            'attributes' => [
                'placeholder'   =>  'Languages',
                'multiple' => 'multiple',
                'class' =>  'select2multiple',
                'data-placeholder' => 'Choose Languages',
            ],
            'type'  => Element\Select::class,
        ])->add([
            'name' => 'maintenance',
            'options' => [
                'label' => 'Maintenance mode',
            ],
            'attributes' => [
            ],
            'type'  => Element\Checkbox::class,
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
            'domain' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'siteName' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'siteTitle' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'description' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'keywords' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
        ];
    }
}