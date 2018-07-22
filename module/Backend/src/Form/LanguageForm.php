<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Language;

class LanguageForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\Language'))->setObject(new Language());

        parent::__construct('form');

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
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'locale',
            'options' => [
                'label' => 'Locale',
            ],
            'attributes' => [
                'placeholder'   =>  'Locale',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'code',
            'options' => [
                'label' => 'Code',
            ],
            'attributes' => [
                'placeholder'   =>  'Code',
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
            'code' => [
                'required' => true,
            ],
            'locale' => [
                'required' => true,
            ],
        ];
    }
}