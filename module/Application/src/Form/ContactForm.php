<?php
namespace Application\Form;

use Zend\Form\Form;
use Zend\Form\Element;
use Zend\InputFilter\InputFilterProviderInterface;
use Doctrine\Common\Persistence\ObjectManager;
use DoctrineModule\Stdlib\Hydrator\DoctrineObject as DoctrineHydrator;
use Application\Entity\Contact;

class ContactForm extends Form implements InputFilterProviderInterface
{

    protected $objectManager;

    public function __construct(ObjectManager $objectManager)
    {
        $this->objectManager = $objectManager;
        $this->setHydrator(new DoctrineHydrator($objectManager, 'Application\Entity\Contact'))->setObject(new Contact());

        parent::__construct('form');

        $this->setAttributes([
            'method' => 'post',
            'id' => 'contact-form'
        ]);

        $this->add([
            'name' => 'name',
            'attributes' => [
                'placeholder' => 'Enter your name',
                'class' => 'form-control',
                //'required' => 'required'
            ],
            'type' => Element\Text::class
        ])
            ->add([
            'name' => 'email',
            'attributes' => [
                'placeholder' => 'E-mail',
                'class' => 'form-control',
                //'required' => 'required'
            ],
            'type' => Element\Email::class
        ])
            ->add([
            'name' => 'phoneText',
            'attributes' => [
                'class' => 'form-control',
                //'required' => 'required',
                'id' => 'phoneText',
                'placeholder' => 'Phone'
            ],
            'type' => Element\Tel::class
        ])
            ->add([
            'name' => 'phone',
            'attributes' => [
                'id' => 'phone'

            ],
            'type' => Element\Hidden::class
        ])
            ->add([
            'name' => 'message',
            'attributes' => [
                'placeholder' => 'Enter your message here',
                'class' => 'form-control',
            ],
            'type' => Element\Textarea::class
        ]);
    }

    public function getInputFilterSpecification()
    {
        return [
            'phone' => [
                'required' => true,
            ],
            'email' => [
                'required' => true,
            ],
            'name' => [
                'required' => true,
            ],
            'message' => [
                'required' => false,
                'filters' => [
                    ['name' => 'StringTrim'],
                    ['name' => 'StripTags'],
                ],
            ]
        ];
    }
}