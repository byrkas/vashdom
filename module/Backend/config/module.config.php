<?php
namespace Backend;

use Zend\Router\Http\Literal;
use Zend\Router\Http\Segment;
use Zend\Mvc\Controller\LazyControllerAbstractFactory;

return [
    'router' => [
        'routes' => [
            'backend' => [
                'type' => Literal::class,
                'options' => [
                    'route'    => '/backend',
                    'defaults' => [
                        '__NAMESPACE__' => 'Backend\Controller',
                        'controller' => Controller\IndexController::class,
                        'action'     => 'index',
                    ],
                ],
                'may_terminate' => true,
                'child_routes' => [
                    'default' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/[:action[/:id][/]]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\IndexController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'change_language' => [
                        'type'    => 'Segment',
                        'options' => [
                            'route'    => '/change-language-to-[:locale][/]',
                            'constraints' => [
                                'locale' => '[a-zA-Z][a-zA-Z_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\IndexController::class,
                                'action'     => 'change-language',
                            ],
                        ],
                    ],
                    'site' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/site[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\SiteController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'page' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/page[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\PageController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'news' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/news[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\NewsController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'region' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/region[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\RegionController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'setting' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/setting[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\SettingController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'country' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/country[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\CountryController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'city' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/city[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\CityController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'social' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/social[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\SocialController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'language' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/language[/:action[/:id]][/]',
                            'constraints' => [
                                'action'     => '[a-zA-Z][a-zA-Z0-9_-]*',
                            ],
                            'defaults' => [
                                'controller' => Controller\LanguageController::class,
                                'action'     => 'index',
                            ],
                        ],
                    ],
                    'profile' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/profile[/]',
                            'constraints' => [
                            ],
                            'defaults' => [
                                'controller' => Controller\IndexController::class,
                                'action'     => 'profile',
                            ],
                        ],
                    ],
                    'create_user' => [
                        'type'    => Segment::class,
                        'options' => [
                            'route'    => '/create-user[/]',
                            'constraints' => [
                            ],
                            'defaults' => [
                                'controller' => Controller\IndexController::class,
                                'action'     => 'create-user',
                            ],
                        ],
                    ],
                    'meta_tags' => [
                        'type'      => Segment::class,
                        'options'   => [
                            'route'    => '/meta-tags[/:action[/:id]][/]',
                            'constraints' => [
                            ],
                            'defaults' => [
                                'controller' => Controller\MetaTagsController::class,
                                'action'     => 'index',
                            ],
                        ]
                    ],
                ]
            ],
        ],
    ],
    'controllers' => [
        'abstract_factories' => [
            LazyControllerAbstractFactory::class,
        ],
        'factories' => [
            Controller\IndexController::class => Controller\Factory\IndexControllerFactory::class,
            Controller\SettingController::class => Controller\Factory\SettingControllerFactory::class,
            Controller\SocialController::class => Controller\Factory\SocialControllerFactory::class,
            Controller\MetaTagsController::class => Controller\Factory\MetaTagsControllerFactory::class,
        ],
    ],
    'access_filter' => [
        'controllers' => [
            Controller\IndexController::class => [
                ['actions' => ['login', 'logout','createUser','forget','resetPassword'], 'allow' => '*'],
                // Give access to "index", "add", "edit", "view", "changePassword" actions to authorized users only.
                ['actions' => ['index'], 'allow' => '@']
            ],
        ]
    ],
    'service_manager' => [
        'factories' => [
            \Zend\Authentication\AuthenticationService::class => Service\Factory\AuthenticationServiceFactory::class,
            Service\AuthAdapter::class => Service\Factory\AuthAdapterFactory::class,
            Service\AuthManager::class => Service\Factory\AuthManagerFactory::class,
            Service\UserManager::class => Service\Factory\UserManagerFactory::class,
        ],
        'abstract_factories' => [
            \Zend\Navigation\Service\NavigationAbstractServiceFactory::class,
        ]
    ],
    'view_manager' => [
        'template_path_stack' => [
            'backend' => __DIR__ . '/../view',
        ],
    ],
    'navigation'    =>  [
        'backend'   =>  [
            [
                'label' =>  'Geo',
                'uri' => '',
                'id'    =>  'geo',
                'pages' =>  [
                    [
                        'label' => 'Regions',
                        'route' => 'backend/region',
                    ],
                    [
                        'label' => 'Countries',
                        'route' => 'backend/country',
                    ],
                    [
                        'label' => 'Cities',
                        'route' => 'backend/city',
                    ],
                ],
            ],
            [
                'label' => 'Pages',
                'route' => 'backend/page',
            ],
            [
                'label' => 'News',
                'route' => 'backend/news',
            ],
            [
                'label' => 'Site',
                'route' => 'backend/default',
                'pages' => [
                    [
                        'label' => 'Site config',
                        'route' => 'backend/site',
                    ],
                    [
                        'label' => 'Settings',
                        'route' => 'backend/setting',
                    ],
                    [
                        'label' => 'Languages',
                        'route' => 'backend/language',
                    ],
                    [
                        'label' => 'Social links',
                        'route' => 'backend/social',
                    ],
                ]
            ],
            [
                'label' => 'Seo',
                'route' => 'backend/default',
                'pages' => [
                    [
                        'label' => 'Meta tags',
                        'route' => 'backend/meta_tags',
                    ],
                ]
            ],
        ],
    ]
];
