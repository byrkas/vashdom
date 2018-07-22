<?php
namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
use Doctrine\ORM\EntityManager;

class IndexController extends AbstractActionController
{

    protected $session;

    private $em;

    private $config;

    private $locale;

    public function __construct(EntityManager $entityManager, array $config)
    {
        $this->em = $entityManager;
        $this->config = $config;
    }

    public function getEntityManager()
    {
        return $this->em;
    }

    public function indexAction()
    {
        $this->locale = $this->layout()->locale;
        $headingTitle = '';

        $this->layout()->mainClass = 'home-page';

        return new ViewModel([
            'headingTitle' => $headingTitle,
        ]);
    }
}
