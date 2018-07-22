<?php
namespace Application;

use Zend\Mvc\ModuleRouteListener;
use Zend\Mvc\MvcEvent;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\SessionManager;
use Zend\Session\Config\SessionConfig;
use Zend\Session\Container;
use Zend\Session\Validator;
use Zend\Authentication\AuthenticationService;

class Module
{

    const VERSION = '3.0.3-dev';

    public function getConfig()
    {
        return include __DIR__ . '/../config/module.config.php';
    }

    public function onBootstrap(MvcEvent $event)
    {
        $application = $event->getApplication();
        $serviceManager = $application->getServiceManager();

        $eventManager = $event->getApplication()->getEventManager();
        $sharedEventManager = $eventManager->getSharedManager();
        $sharedEventManager->attach(AbstractActionController::class, MvcEvent::EVENT_DISPATCH, [
            $this,
            'initLayouts'
        ], 101);
        $sharedEventManager->attach(AbstractActionController::class, MvcEvent::EVENT_DISPATCH, [
            $this,
            'initGeoIp'
        ], 102);
        $sharedEventManager->attach(AbstractActionController::class, MvcEvent::EVENT_DISPATCH, [
            $this,
            'initMaintenance'
        ], 55);

        $sharedEventManager->attach(AbstractActionController::class, 'dispatch', array(
            $this,
            'handleControllerCannotDispatchRequest'
        ), 101);

        $eventManager->attach(MvcEvent::EVENT_DISPATCH, array(
            $this,
            'initLocale'
        ), 95);

        $eventManager->attach(MvcEvent::EVENT_DISPATCH_ERROR, array(
            $this,
            'initLocale'
        ), 94);

        // Register a render event
        // $app = $event->getParam('application');
        // $app->getEventManager()->attach('render', array($this, 'setLayoutTitle'));

        $eventManager->attach('dispatch.error', function ($event) {
            $logger = new \Zend\Log\Logger();
            $writer = new \Zend\Log\Writer\Stream('data/exception.log');
            $logger->addWriter($writer);

            // Log PHP errors
            \Zend\Log\Logger::registerErrorHandler($logger);
            // Log exceptions
            \Zend\Log\Logger::registerExceptionHandler($logger);

            $exception = $event->getResult()->exception;
            if ($exception) {
                $request = $event->getApplication()
                    ->getRequest();
                $response = $event->getApplication()
                    ->getResponse();

                $logger->info([
                    'status' => $response->getStatusCode(),
                    'method' => $request->getMethod(),
                    'uri' => (string) $request->getUri(),
                    'exception' => $exception->getMessage()
                ]);
            }
        });

        $moduleRouteListener = new ModuleRouteListener();
        $moduleRouteListener->attach($eventManager);

        $sessionManager = $serviceManager->get(SessionManager::class);

        $this->forgetInvalidSession($sessionManager);
    }

    protected function forgetInvalidSession($sessionManager)
    {
        try {
            $sessionManager->start();
            return;
        } catch (\Exception $e) {}
        /**
         * Session validation failed: toast it and carry on.
         */
        // @codeCoverageIgnoreStart
        session_unset();
        // @codeCoverageIgnoreEnd
    }

    public function handleControllerCannotDispatchRequest(MvcEvent $e)
    {
        $action = $e->getRouteMatch()->getParam('action');
        $controller = get_class($e->getTarget());
        $moduleNamespace = substr($controller, 0, strpos($controller, '\\'));

        $filter = new \Zend\Filter\Word\DashToCamelCase();
        $action = $filter->filter($action);

        // error-controller-cannot-dispatch
        if (! method_exists($e->getTarget(), $action . 'Action')) {
            $viewModel = $e->getViewModel();
            if ($moduleNamespace == 'Application') {
                $viewModel->setTemplate('layout/error');
            } elseif ($moduleNamespace == 'Mobile') {
                $viewModel->setTemplate('layout/mobile-error');
            }
        }
    }

    public function initGeoIp(MvcEvent $event)
    {
        $sm = $event->getApplication()->getServiceManager();
        $request = $event->getApplication()->getRequest();
        $ip = $request->getServer('REMOTE_ADDR');
        $neutrino = $sm->get('neutrino.api');

        $session = new Container('geolocation');
        if (! isset($session->country_code) || ! isset($session->city)) {
            if ($ip == '127.0.0.1')
                $ip = '206.40.115.2';

            $geoLocation = $neutrino->getGeoLocation($ip);
            if ($geoLocation) {
                $session->country_code = $geoLocation['country-code'];
                $session->country = $geoLocation['country'];
                $session->city = $geoLocation['city'];
                $session->longitude = $geoLocation['longitude'];
                $session->latitude = $geoLocation['latitude'];
            }
        }
    }

    public function initLayouts(MvcEvent $event)
    {
        // Get controller and action to which the HTTP request was dispatched.
        $controller = $event->getTarget();
        $controllerClass = get_class($controller);

        $controllerName = $event->getRouteMatch()->getParam('controller', null);
        $actionName = $event->getRouteMatch()->getParam('action', null);

        $moduleNamespace = substr($controllerClass, 0, strpos($controllerClass, '\\'));
        $viewModel = $event->getViewModel();
        switch ($moduleNamespace) {
            case 'Backend':
                $viewModel->setTemplate('layout/backend');
                break;
            case 'Mobile':
                $viewModel->setTemplate('layout/mobile');
                break;
            default:
                $viewModel->setTemplate('layout/layout');
                break;
        }
    }

    public function initMaintenance(MvcEvent $e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $config = $sm->get('config');

        if (isset($config['site']) && isset($config['site']['maintenance']) && $config['site']['maintenance'] == 1) {
            $auth = $e->getApplication()
                ->getServiceManager()
                ->get(AuthenticationService::class);
            $controller = $e->getTarget();
            $controllerClass = get_class($controller);
            $controllerName = $e->getRouteMatch()->getParam('controller', null);
            $moduleNamespace = substr($controllerClass, 0, strpos($controllerClass, '\\'));

            if ($moduleNamespace != "Backend") {
                if (! $auth->hasIdentity() && stripos($controllerName, 'checkout') === false) {
                    $viewModel = $e->getViewModel();
                    $e->getApplication()
                        ->getResponse()
                        ->setStatusCode(503);
                    $viewModel->setTemplate('layout/layout-maintenance');
                    $viewModel->setTerminal(true);
                }
            }
        }
    }

    public function initLocale(MvcEvent $e)
    {
        $sm = $e->getApplication()->getServiceManager();
        $em = $sm->get('doctrine.entitymanager.orm_default');
        $doctrineEventManager = $em->getEventManager();
        $config = $sm->get('config');
        $translateLocale = 'en_US';
        $defaultLocale = 'en_US';
        // $translator = $sm->get('translator');

        $viewModel = $e->getApplication()
            ->getMvcEvent()
            ->getViewModel();

        if (isset($config['site'])) {
            foreach ($config['site'] as $key => $element) {
                $viewModel->$key = $element;
            }
        }
        if (isset($config['site']['default_locale'])) {
            $defaultLocale = $config['site']['default_locale'];
        }

        try {
            $routeLang = ($e->getRouteMatch()) ? $e->getRouteMatch()->getParam('lang') : null;

            /*
             * var_dump($routeLang, $e->getRouteMatch()->getParams(), $e->getRouteMatch()->getMatchedRouteName());
             * die();
             */
            if (count($config['site']['languages']) > 1) {
                $viewModel->lang = ($routeLang) ? $routeLang : $config['site']['default_language'];
            }

            $viewModel->routeParams = $e->getRouteMatch()->getParams();
            $viewModel->routeName = $e->getRouteMatch()->getMatchedRouteName();
            if ($routeLang !== null && isset($config['site']['languages'])) {
                foreach ($config['site']['languages'] as $lEntry) {
                    if ($lEntry['code'] == $routeLang) {
                        $translateLocale = $lEntry['locale'];
                    }
                }
            } else {
                $session = new Container('backend');
                $translateLocale = (isset($session->language)) ? $session->language : $translateLocale;
            }

            $viewModel->locale = $translateLocale;

            $translatableListener = new \Gedmo\Translatable\TranslatableListener();
            $translatableListener->setTranslatableLocale($translateLocale);
            $translatableListener->setDefaultLocale($defaultLocale);
            $translatableListener->setTranslationFallback(true);
            $doctrineEventManager->addEventSubscriber($translatableListener);

            $translator = $sm->get('translator');
            $translator->setLocale($translateLocale);
            $translator->setFallbackLocale($defaultLocale);

            $viewHelperManager = $sm->get('ViewHelperManager');
            $dateFormatHelper = $viewHelperManager->get('dateFormat')->setLocale($translateLocale);
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }

    public function setLayoutTitle(MvcEvent $e)
    {
        $matches    = $e->getRouteMatch();
        $action     = $matches->getParam('action');
        $controller = $matches->getParam('controller');
        $module     = __NAMESPACE__;
        $siteName   = 'Wowfare.com';

        // Getting the view helper manager from the application service manager
        $viewHelperManager = $e->getApplication()->getServiceManager()->get('ViewHelperManager');

        // Getting the headTitle helper from the view helper manager
        $headTitleHelper   = $viewHelperManager->get('headTitle');

        // Setting a separator string for segments
        $headTitleHelper->setSeparator(' - ');

        // Setting the action, controller, module and site name as title segments
        $headTitleHelper->append($action);
        $headTitleHelper->append($controller);
        $headTitleHelper->append($module);
        $headTitleHelper->append($siteName);
    }
}
