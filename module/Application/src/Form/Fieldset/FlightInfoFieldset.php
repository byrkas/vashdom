<?php
namespace Application\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;

class FlightInfoFieldset extends Fieldset implements InputFilterProviderInterface
{

    public function __construct()
    {
        parent::__construct('flight');

        $this->add([
            'name' => 'from',
            'type' => Element\Hidden::class,
            'attributes' => [
                'id' => 'from'
            ]
        ])
            ->add([
            'name' => 'to',
            'type' => Element\Hidden::class,
            'attributes' => [
                'id' => 'to'
            ]
        ])
            ->add([
            'name' => 'fromText',
            'options' => [
                'label' => _('Origin City'),
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                //'placeholder' => _('Origin'),
                'class' => 'form-control fromText',
                'id' => 'fromText',
                'autocomplete' => 'off'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'toText',
            'options' => [
                'label' => _('Destination City'),
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
               // 'placeholder' => _('Destination'),
                'class' => 'form-control toText',
                'id' => 'toText',
                'autocomplete' => 'off'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'departureDate',
            'options' => [
                'label' => _('Departure Date'),
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                //'placeholder' => _('Departure'),
                'class' => 'form-control dateRangePicker js-dateRangePicker',
                'id' => 'departureDate',
                'autocomplete' => 'off',
                'readonly' => true
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'arrivalDate',
            'options' => [
                'label' => _('Returning Date'),
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                //'placeholder' => _('Return'),
                'class' => 'form-control dateRangePicker js-dateRangePicker',
                'id' => 'arrivalDate',
                'autocomplete' => 'off',
                'readonly' => true
            ],
            'type' => Element\Text::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'fromText' => [
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ]
                ]
            ],
            'toText' => [
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ]
                ]
            ],
            'departureDate' => [
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ]
                ]
            ],
            'arrivalDate' => [
                'required' => false,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ]
                ]
            ]
        ];
    }
}