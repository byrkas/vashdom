<?php
namespace Backend\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\CityPack;
use DoctrineModule\Form\Element as DoctrineElement;

class CityPackFieldset extends Fieldset implements InputFilterProviderInterface
{

    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        parent::__construct('CityPack');
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\CityPack'))->setObject(new CityPack());
        
        $this->add([
            'type' => Element\Hidden::class,
            'name' => 'id'
        ])
            ->add([
            'name' => 'City',
            'options' => [
                'label' => 'City',
                'empty_option' => 'Choose city',
                'object_manager' => $this->objectManager,
                'target_class' => 'Application\Entity\City',
                'property' => 'name',
                'is_method' => true,
                'find_method' => [
                    'name' => 'findBy',
                    'params' => [
                        'criteria' => [],
                        'orderBy' => [
                            'name' => 'ASC'
                        ]
                    ]
                ]
            ],
            'attributes' => [
                'class' => 'm-select2',
                'data-placeholder' => 'Choose city'
            ],
            'type' => DoctrineElement\ObjectSelect::class
        ])
            ->add([
            'name' => 'sort',
            'options' => [
                'label' => 'Sort'
            ],
            'attributes' => [
                'placeholder' => 'Sort',
                'style' => 'width:100px;'
            ],
            'type' => Element\Number::class
        ])
            ->add([
            'name' => 'startEnd',
            'options' => [
                'label' => 'Start-End <span></span>',
                'label_attributes' => [
                    'class' => 'm-checkbox  m-checkbox--focus'
                ]
            ],
            'type' => Element\Checkbox::class
        ])
            ->add([
            'name' => 'remove_btn',
            'options' => [
                'fontAwesome' => 'trash-o',
                'twb-layout' => \TwbBundle\Form\View\Helper\TwbBundleForm::LAYOUT_INLINE
            ],
            'attributes' => [
                'value' => 'Remove',
                'class' => 'btn m-btn m-btn--gradient-from-danger m-btn--gradient-to-warning',
                'onclick' => 'confirmRemove(this,"Are you sure want to remove this city from pack");'
            ],
            'type' => Element\Button::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'id' => [
                'required' => false
            ],
            'City' => [
                'required' => true
            ]
        ];
    }
}