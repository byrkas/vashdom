<?php
namespace Application\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;

class QuoteInfoFieldset extends Fieldset implements InputFilterProviderInterface
{

    public function __construct()
    {
        parent::__construct('info');
        $flightFieldset = new FlightInfoFieldset();
        $flightFieldset->get('fromText')->setAttribute('class', 'form-control');
        $flightFieldset->get('toText')->setAttribute('class', 'form-control');
        $flightFieldset->get('departureDate')->setAttribute('class', 'form-control dateRangePicker');
        $flightFieldset->get('arrivalDate')->setAttribute('class', 'form-control dateRangePicker');
        $multiflightFieldset = new FlightInfoFieldset();
        $multiflightFieldset->remove('arrivalDate');

        $this->add([
            'name' => 'adults',
            'attributes' => [
                'data-min' => 1,
                'data-max' => 8,
                'id' => 'searchform-adults',
                'class' => 'form-control passengers-number__quant-input',
                //'disabled' => true,
                'readonly'  =>  'readonly',
                'value' => 1
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'children',
            'attributes' => [
                'data-min' => 0,
                'data-max' => 8,
                'class' => 'form-control passengers-number__quant-input',
                'id' => 'searchform-children',
                //'disabled' => true,
                'readonly'  =>  'readonly',
                'value' => 0
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'tripType',
            'options' => [
                'value_options' => [
                    'ow' => _('One-Way'),
                    'rt' => _('Round-Trip'),
                    'mc' => _('Multi-City')
                ]
            ],
            'attributes' => [
                'value' => 'rt'
            ],
            'type' => Element\Radio::class
        ])
            ->add([
            'name' => 'cabin',
            'options' => [
                'value_options' => [
                    'e' => _('Economy'),
                    'p' => _('Premium Economy'),
                    'b' => _('Business'),
                    'f' => _('First')
                ]
            ],
            'attributes' => [
                'value' => 'e',
                'class' => 'form-control'
            ],
            'type' => Element\Select::class
        ])
            ->add($flightFieldset)
            ->add([
            'name' => 'Flights',
            'options' => [
                'count' => 2,
                'should_create_template' => true,
                'allow_add' => true,
                'allow_remove' => true,
                'template_placeholder' => '__flight__',
                'target_element' => $multiflightFieldset
            ],
            'attributes' => [
                'id' => 'flight'
            ],
            'type' => Element\Collection::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'cabin' => [
                'required' => false
            ],
            'children' => [
                'required' => false
            ],
            'adults' => [
                'required' => false
            ],
            'flight' => [
                'type' => 'Zend\InputFilter\InputFilter',
                'fromText' => [
                    'required' => ($this->get('tripType')->getValue() != 'mc'),
                    'filters' => [
                        [
                            'name' => 'StringTrim'
                        ]
                    ]
                ],
                'toText' => [
                    'required' => ($this->get('tripType')->getValue() != 'mc'),
                    'filters' => [
                        [
                            'name' => 'StringTrim'
                        ]
                    ]
                ],
                'departureDate' => [
                    'required' => ($this->get('tripType')->getValue() != 'mc'),
                    'filters' => [
                        [
                            'name' => 'StringTrim'
                        ]
                    ]
                ],
                'arrivalDate' => [
                    'required' => ($this->get('tripType')->getValue() == 'rt'),
                    'filters' => [
                        [
                            'name' => 'StringTrim'
                        ]
                    ]
                ]
            ]
        ];
    }
}