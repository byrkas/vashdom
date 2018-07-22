<?php
namespace Backend;

use Zend\ModuleManager\ModuleManager;
use Zend\Mvc\MvcEvent;
use Backend\Service\AuthManager;
use Zend\Authentication\AuthenticationService;
use Backend\Controller\IndexController;
use Gedmo\Loggable\LoggableListener;

class Module
{
    public function getConfig()
    {
        return include __DIR__ . '/../config/module.config.php';
    }

    public function init(ModuleManager $manager)
    {
        // Get event manager.
        $eventManager = $manager->getEventManager();
        $sharedEventManager = $eventManager->getSharedManager();
        // Register the event listener method.
        $sharedEventManager->attach(__NAMESPACE__, 'dispatch',[$this, 'onDispatch'], 100);
    }

    // Event listener method.
    public function onDispatch(MvcEvent $event)
    {
        // Get controller to which the HTTP request was dispatched.
        $controller = $event->getTarget();
        // Get fully qualified class name of the controller.
        $controllerClass = get_class($controller);

        $controllerName = $event->getRouteMatch()->getParam('controller', null);
        $actionName = $event->getRouteMatch()->getParam('action', null);

        // Convert dash-style action name to camel-case.
        $actionName = str_replace('-', '', lcfirst(ucwords($actionName, '-')));
        $authManager = $event->getApplication()->getServiceManager()->get(AuthManager::class);
        $auth = $event->getApplication()->getServiceManager()->get(AuthenticationService::class);

        // Get module name of the controller.
        $moduleNamespace = substr($controllerClass, 0, strpos($controllerClass, '\\'));

        // Switch layout only for controllers belonging to our module.
        if ($moduleNamespace == __NAMESPACE__) {
            if (($controllerName!=IndexController::class ||  ($controllerName == IndexController::class && $actionName != 'login')) &&
                !$auth->getIdentity() ) {

                    // Remember the URL of the page the user tried to access. We will
                    // redirect the user to that URL after successful login.
                    $uri = $event->getApplication()->getRequest()->getUri();
                    // Make the URL relative (remove scheme, user info, host name and port)
                    // to avoid redirecting to other domain by a malicious user.
                    $uri->setScheme(null)
                    ->setHost(null)
                    ->setPort(null)
                    ->setUserInfo(null);
                    $redirectUrl = $uri->toString();

                    // Redirect the user to the "Login" page.
                    return $controller->redirect()->toRoute('backend/default', ['action' => 'login'],
                        ['query'=>['redirectUrl'=>$redirectUrl]]);
                }else{
                    $em = $event->getApplication()->getServiceManager()->get('doctrine.entitymanager.orm_default');
                    $doctrineEventManager = $em->getEventManager();
                    if($auth->getIdentity()){
                        $user = $em->find('Application\Entity\Admin',$auth->getIdentity()->id);
                        $loggable = new LoggableListener();
                        $loggable->setUsername($auth->getIdentity()->getNickname());
                        $doctrineEventManager->addEventSubscriber($loggable);
                    }
                }
        }
    }
}
