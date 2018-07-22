<?php
namespace Application;

use Zend\Router\Http\Literal;
use Zend\Mvc\I18n\Router\TranslatorAwareTreeRouteStack;
use Zend\Router\Http\Segment;
use Zend\ServiceManager\Factory\InvokableFactory;
use Zend\Mvc\Controller\LazyControllerAbstractFactory;
return [
    'router' => [
        'router_class' => TranslatorAwareTreeRouteStack::class,
        'translator_text_domain' => 'routing',
        'routes' => [
            'home' => [
                'type' => Literal::class,
                'options' => [
                    'route' => '/',
                    'defaults' => [
                        '__NAMESPACE__' => 'Application\Controller',
                        'controller' => Controller\IndexController::class,
                        'action' => 'index'
                    ]
                ],
                'may_terminate' => true,
                'child_routes' => [
                    'default' => [
                        'type' => Segment::class,
                        'options' => [
                            'route' => '[:lang/][:action[/:id]][/]',
                            'constraints' => [
                                'lang' => '[a-z]{2}?',
                                'action' => '[a-zA-Z][a-zA-Z0-9_-]*'
                            ],
                            'defaults' => [
                                'controller' => Controller\IndexController::class,
                                'action' => 'index'
                            ]
                        ]
                    ],
                    'page' => [
                        'type' => Segment::class,
                        'options' => [
                            'route' => '[:lang/][:slug][/]',
                            'constraints' => [
                                'lang' => '[a-z]{2}?',
                                'slug' => 'about|terms-of-use|terms-and-conditions|contact-us|privacy-policy'
                            ],
                            'defaults' => [
                                'controller' => Controller\PageController::class,
                                'action' => 'index'
                            ]
                        ]
                    ],
                    'page_modal' => [
                        'type' => Segment::class,
                        'options' => [
                            'route' => '[:lang/]modal-[:slug][/]',
                            'constraints' => [],
                            'defaults' => [
                                'controller' => Controller\PageController::class,
                                'action' => 'modal'
                            ]
                        ]
                    ],
                    'lang' => [
                        'type' => Segment::class,
                        'options' => [
                            'route' => '[:lang[/]]',
                            'constraints' => [
                                'lang' => '[a-z]{2}?'
                            ],
                            'defaults' => [
                                'controller' => Controller\IndexController::class,
                                'action' => 'index'
                            ]
                        ]
                    ],
                    'news_archive' => [
                        'type' => Segment::class,
                        'options' => [
                            'route' => '[:lang/]news[/]',
                            'constraints' => [
                                'lang' => '[a-z]{2}?'
                            ],
                            'defaults' => [
                                'controller' => Controller\NewsController::class,
                                'action' => 'index'
                            ]
                        ]
                    ],
                    'news_page' => [
                        'type' => Segment::class,
                        'options' => [
                            'route' => '[:lang/]news/:slug[/]',
                            'constraints' => [
                                'lang' => '[a-z]{2}?'
                            ],
                            'defaults' => [
                                'controller' => Controller\NewsController::class,
                                'action' => 'view'
                            ]
                        ]
                    ],
                ]
            ],
        ]
    ],
    'controllers' => [
        'abstract_factories' => [
            LazyControllerAbstractFactory::class
        ],
    ],
    'controller_plugins' => [
        'factories' => [
            Controller\Plugin\SettingPlugin::class => Controller\Plugin\Factory\SettingPluginFactory::class,
            Controller\Plugin\ReplaceSettingPlugin::class => Controller\Plugin\Factory\ReplaceSettingPluginFactory::class,
            Controller\Plugin\MailSenderPlugin::class => Controller\Plugin\Factory\MailSenderFactory::class,
            Controller\Plugin\TranslatorPlugin::class => Controller\Plugin\Factory\TranslatorPluginFactory::class,
        ],
        'aliases' => [
            'setting' => Controller\Plugin\SettingPlugin::class,
            'replaceSetting' => Controller\Plugin\ReplaceSettingPlugin::class,
            'mailSender' => Controller\Plugin\MailSenderPlugin::class,
            'translator' => Controller\Plugin\TranslatorPlugin::class,
        ]
    ],
    'view_helpers' => [
        'invokables' => [
            'showMessages' => View\Helper\ShowMessages::class,
            'convertToHoursMins' => View\Helper\ConvertToHoursMins::class
        ],
        'aliases' => [
            'settingValue' => View\Helper\SettingValue::class,
            'socials' => View\Helper\Socials::class,
            'meta_tags' => View\Helper\MetaTags::class
        ],
        'factories' => [
            View\Helper\SettingValue::class => View\Helper\Factory\SettingValueFactory::class,
            View\Helper\Socials::class => View\Helper\Factory\SocialsFactory::class,
            View\Helper\MetaTags::class => View\Helper\Factory\MetaTagsFactory::class
        ]
    ],
    'view_manager' => [
        'display_not_found_reason' => false,
        'display_exceptions' => false,
        'doctype' => 'HTML5',
        'not_found_template' => 'error/404',
        'exception_template' => 'error/index',
        'template_map' => [
            'layout/layout' => __DIR__ . '/../view/layout/layout.phtml',
            'application/index/index' => __DIR__ . '/../view/application/index/index.phtml',
            'error/404' => __DIR__ . '/../view/error/404.phtml',
            'error/index' => __DIR__ . '/../view/error/index.phtml'
        ],
        'template_path_stack' => [
            __DIR__ . '/../view'
        ],
        'strategies' => [
            'ViewJsonStrategy'
        ]
    ],
    'access_filter' => [
        'controllers' => []
    ],
    'service_manager' => [
        'factories' => [
            'translator' => \Zend\Mvc\I18n\TranslatorFactory::class,
        ],
        'aliases' => [
        ]
    ],
    'navigation' => [
        'default' => [
            [
                'label' => _('Home'),
                'route' => 'home/lang',
                'id' => 'home'
            ],
        ],
        'footer' => [
        ]
    ]
];
