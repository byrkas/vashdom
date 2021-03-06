<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use Application\Entity\Hydrator\Translations as TranslationsHydrator;
use Application\Entity\Page;

class PageForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager, $locales = [])
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new TranslationsHydrator($objectManager, 'Application\Entity\Page'))->setObject(new Page());

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
                'name' => 'title',
                'options' => [
                    'label' => 'Title',
                ],
                'attributes' => [
                    'placeholder'   =>  'Title',
                    'class' => 'title-'.$locale,
                ],
                'type'  => Element\Text::class,
            ])->add([
                'name' => 'slug',
                'options' => [
                    'label' => 'SLUG',
                ],
                'attributes' => [
                    'placeholder'   =>  'SLUG',
                    'class' => 'slug-'.$locale,
                ],
                'type'  => Element\Text::class,
            ])->add([
                'name' => 'content',
                'options' => [
                    'label' => 'Content',
                ],
                'attributes' => [
                    'placeholder'   =>  'content',
                    'class' =>  'form-control summernote content-'.$locale
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
            'name' => 'title',
            'options' => [
                'label' => 'Title',
            ],
            'attributes' => [
                'placeholder'   =>  'Title',
                'id' => 'title'
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'slug',
            'options' => [
                'label' => 'SLUG',
            ],
            'attributes' => [
                'placeholder'   =>  'SLUG',
                'id' => 'slug'
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'content',
            'options' => [
                'label' => 'Content',
            ],
            'attributes' => [
                'placeholder'   =>  'content',
                'class' =>  'form-control summernote',
                'id' => 'content'
            ],
            'type'  => Element\Textarea::class,
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
            'title' => [
                'required' => true,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
            'slug' => [
                'required' => false,
            ],
            'content' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                ],
            ],
        ];
    }
}