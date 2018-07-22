<?php
namespace Backend\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;

class NavigationForm extends Form implements InputFilterProviderInterface
{
    protected $objectManager;

    public function __construct()
    {
        parent::__construct('form');
        $naviFieldset = new Fieldset\NavigationFieldset();

        $this->setAttributes([
            'method' => 'post',
            'class' => 'm-form m-form--fit m-form--label-align-right'
        ]);

        $this->add([
            'name' => 'pages',
            'options' => [
                'count' => 1,
                'should_create_template' => true,
                'allow_add' => true,
                'allow_remove' => true,
                'twb-layout' => \TwbBundle\Form\View\Helper\TwbBundleForm::LAYOUT_INLINE,
                'template_placeholder' => '__pages__',
                'target_element' => $naviFieldset
            ],
            'attributes' => [
                'id' => 'pages',
                'class' => 'sorted_fieldset'
            ],
            'type' => Element\Collection::class
        ])
        ->add([
            'name' => 'newPage',
            'options' => [
                'fontAwesome' => 'plus',
                'twb-layout' => \TwbBundle\Form\View\Helper\TwbBundleForm::LAYOUT_INLINE
            ],
            'attributes' => [
                'value' => '',
                'class' => 'btn btn-success m-btn m-btn--icon m-btn--icon-only',
                'onclick' => 'return add_field(\'pages\',\'pages\')'
            ],
            'type' => Element\Button::class
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

        ];
    }
}