<?php
namespace Application\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Passenger;

class PaxFieldset extends Fieldset implements InputFilterProviderInterface
{

    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        parent::__construct('pax');
        $this->objectManager = $objectManager;
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\Passenger'))->setObject(new Passenger());

        $countries = $this->objectManager->getRepository('Application\Entity\Country')->getListCodes();

        $this->add([
            'name' => 'id',
            'type' => Element\Hidden::class
        ])
            ->add([
            'name' => 'firstName',
            'options' => [
                'label' => 'First Name',
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'E.g. John',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'middleName',
            'options' => [
                'label' => 'Middle Name',
                'label_attributes' => [
                    'class' => 'control-label'
                ],
                'label_options' => [
                    'disable_html_escape' => true
                ]
            ],
            'attributes' => [
                'placeholder' => 'E.g. Pierpont',
                'class' => 'form-control'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'lastName',
            'options' => [
                'label' => 'Last Name',
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'E.g. Smith',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'nationality',
            'options' => [
                'label' => 'Nationality',
                'label_attributes' => [
                    'class' => 'control-label'
                ],
                'value_options' => $countries,
                'empty_option' => 'Select'
            ],
            'attributes' => [
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Select::class
        ])
            ->add([
            'name' => 'gender',
            'options' => [
                'label' => 'Gender',
                'label_attributes' => [
                    'class' => 'control-label'
                ],
                'value_options' => [
                    'M' => 'Male',
                    'F' => 'Female'
                ],
                'empty_option' => 'Select'
            ],
            'attributes' => [
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Select::class
        ])
            ->add([
            'name' => 'birthDate',
            'options' => [
                'label' => 'Birth Date',
                'label_attributes' => [
                    'class' => 'control-label show'
                ],
                'month_attributes'    => [
                    'class' => 'month-formatt',
                ],
                'year_attributes' => [
                    'class' => 'year-formatt',
                ],
                'day_attributes' => [
                    'class' => 'day-formatt',
                ],
                'render_delimiters' => false,
                'create_empty_option' => true
            ],
            'attributes' => [
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\DateSelect::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'firstName' => [
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ],
                    [
                        'name' => 'StripTags'
                    ],
                    [
                        'name' => 'StripNewlines'
                    ]
                ],
                'validators' => [
                    [
                        'name' => 'StringLength',
                        'options' => [
                            'min' => 1,
                            'max' => 128
                        ]
                    ]
                ]
            ],
            'lastName' => [
                'required' => true,
                'filters' => [
                    [
                        'name' => 'StringTrim'
                    ],
                    [
                        'name' => 'StripTags'
                    ],
                    [
                        'name' => 'StripNewlines'
                    ]
                ],
                'validators' => [
                    [
                        'name' => 'StringLength',
                        'options' => [
                            'min' => 1,
                            'max' => 128
                        ]
                    ]
                ]
            ],
            'gender' => [
                'required' => true
            ],
            'birthDate' => [
                'required' => true
            ],
            'nationality' => [
                'required' => true
            ]
        ];
    }
}