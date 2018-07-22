<?php
namespace Backend\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Translation\RegionTranslation;

class RegionTranslationFieldset extends Fieldset implements InputFilterProviderInterface
{

    protected $objectManager;

    public function __construct(ObjectManager $objectManager, $locale = null, $field = null, $key = 0)
    {
        $this->objectManager = $objectManager;
        parent::__construct("translations[$key]");
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\RegionTranslation'))->setObject(new RegionTranslation($locale, $field, ''));

        $this->add([
            'type' => Element\Hidden::class,
            'name' => 'locale',
            'attributes' => [
                'value' => $locale
            ]
        ])->add([
            'type' => Element\Hidden::class,
            'name' => 'field',
            'attributes' => [
                'value' => $field
            ]
        ])->add([
            'name' => 'content',
            'options' => [
                'label' => 'Name',
                'label_attributes' => [
                    'class' => 'required'
                ],
            ],
            'attributes' => [
                'placeholder'   =>  'Name '.$locale,
            ],
            'type'  => Element\Text::class,
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'locale' => [
                'required' => true
            ],
            'content' => [
                'required' => true
            ]
        ];
    }
}