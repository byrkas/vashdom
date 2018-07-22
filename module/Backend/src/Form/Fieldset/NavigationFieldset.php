<?php
namespace Backend\Form\Fieldset;

use Zend\Form\Fieldset;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;

class NavigationFieldset extends Fieldset implements InputFilterProviderInterface
{

    public function __construct()
    {
        parent::__construct('Navigation');

        $this->setAttribute('class','fieldset-sort');

        $this->add([
            'name' => 'label',
            'options' => [
                'label' => 'Label'
            ],
            'attributes' => [
                'placeholder'   =>  'Label',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'route',
            'options' => [
                'label' => 'Route'
            ],
            'attributes' => [
                'placeholder'   =>  'Route',
            ],
            'type'  => Element\Text::class,
        ])->add([
            'name' => 'id',
            'options' => [
                'label' => 'ID'
            ],
            'attributes' => [
                'placeholder'   =>  'ID',
            ],
            'type'  => Element\Text::class,
        ]);


        $params = new \Zend\Form\Fieldset('params');
        $params->add([
            'name' => 'slug',
            'options' => [
                'label' => 'SLUG',
            ],
            'attributes' => [
                'placeholder'   =>  'SLUG',
            ],
            'type'  => Element\Text::class,
        ]);


        $this->add($params)
        ->add([
            'name' => 'remove_btn',
            'options' => [
                'fontAwesome' => 'trash-o',
                'twb-layout' => \TwbBundle\Form\View\Helper\TwbBundleForm::LAYOUT_INLINE
            ],
            'attributes' => [
                'value' => 'Remove',
                'class' => 'btn m-btn m-btn--gradient-from-danger m-btn--gradient-to-warning',
                'onclick' => 'confirmRemove(this,"Are you sure want to remove this nav entry");'
            ],
            'type' => Element\Button::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'label'   =>  [
                'required'  =>  true
            ],
        ];
    }
}