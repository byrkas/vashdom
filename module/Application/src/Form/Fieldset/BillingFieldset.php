<?php
namespace Application\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Zend\Validator\CreditCard;

class BillingFieldset extends Fieldset implements InputFilterProviderInterface
{

    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        parent::__construct('Billing');
        $this->objectManager = $objectManager;
        $nowYear = date('Y');
        $countries = $this->objectManager->getRepository('Application\Entity\Country')->getListCodes();

        $this->add([
            'name' => 'country',
            'options' => [
                'label' => 'Country',
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
            'name' => 'city',
            'options' => [
                'label' => 'City',
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'City',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'state',
            'options' => [
                'label' => 'State / Province',
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'State / Province',
                'class' => 'form-control'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'address',
            'options' => [
                'label' => 'Street Address',
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'Street Address',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'zip',
            'options' => [
                'label' => 'Zip / Postal Code',
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'Zip Code',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'cardName',
            'options' => [
                'label' => "Cardholder's Name",
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'Name on Card',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'cardNumber',
            'options' => [
                'label' => "Card Number",
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'xxxx',
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\Tel::class
        ])
            ->add([
            'name' => 'expirationDate',
            'options' => [
                'label' => "Expiration Date",
                'label_attributes' => [
                    'class' => 'control-label show'
                ],
                'min_year' => $nowYear,
                'max_year' => $nowYear + 50,
                'render_delimiters' => false,
                'create_empty_option' => true
            ],
            'attributes' => [
                'class' => 'form-control',
                'required' => 'required'
            ],
            'type' => Element\MonthSelect::class
        ])
            ->add([
            'name' => 'securityCode',
            'options' => [
                'label' => "Security Code",
                'label_attributes' => [
                    'class' => 'control-label'
                ]
            ],
            'attributes' => [
                'placeholder' => 'CVV',
                'class' => 'form-control',
                'maxlength' => 4,
                'required' => 'required'
            ],
            'type' => Element\Tel::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'country' => [
                'required' => true,
                'filters'  => [
                    ['name' => 'Alpha'],
                    ['name' => 'StringTrim'],
                    ['name' => 'StringToUpper'],
                ],
                'validators' => [
                    ['name'=>'StringLength', 'options'=>['min'=>2, 'max'=>2]]
                ],
            ],
            'city' => [
                'required' => true,
                'filters'  => [
                    ['name' => 'StringTrim'],
                ],
                'validators' => [
                    ['name'=>'StringLength', 'options'=>['min'=>1, 'max'=>255]]
                ],
            ],
            'address' => [
                'required' => true
            ],
            'zip' => [
                'required' => true,
                'validators' => [
                    ['name' => 'IsInt'],
                    ['name'=>'Between', 'options'=>['min'=>0, 'max'=>999999]]
                ],
            ],
            'cardName' => [
                'required' => true
            ],
            'cardNumber' => [
                'required' => true,
                'validators' => [
                    [
                        'name' => 'CreditCard',
                        'options' => [
                            'messages' => [
                                \Zend\Validator\CreditCard::CHECKSUM => 'Not valid card number'
                            ]
                        ]
                    ]
                ]
            ],
            'expirationDate' => [
                'required' => true
            ],
            'securityCode' => [
                'required' => true,
                'validators' => [
                    ['name' => 'IsInt'],
                    ['name'=>'Between', 'options'=>['min'=>0, 'max'=>99999]]
                ]
            ]
        ];
    }
}