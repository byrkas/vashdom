<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Doctrine\ORM\EntityManager;
use Backend\Form\SiteForm;
use Backend\Form\NavigationForm;

class SiteController extends AbstractActionController
{
    private $em;
    private $config;
    private $configPath = 'config/autoload/site.local.php';
    private $navigationPath = 'config/autoload/navigation.global.php';

    public function __construct(EntityManager $em, array $config)
    {
        $this->em = $em;
        $this->config = $config;
    }

    public function getEntityManager()
    {
        return $this->em;
    }

    public function start($page, $limit)
    {
        return ($page - 1)*$limit;
    }

    public function navigationAction()
    {
        $type =  $this->params()->fromRoute('id', 'default');

        $form = new NavigationForm();
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $dataFromConfig = \Zend\Config\Factory::fromFile($this->navigationPath);
                $config = new \Zend\Config\Config($dataFromConfig, true);
                unset($data->submit);

                $config->navigation->$type = (array)$data['pages'];

                $writer = new \Zend\Config\Writer\PhpArray();
                $writer->toFile($this->navigationPath, $config);

                $this->flashMessenger()->addMessage('Data successfully saved!');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }else{
            $data = \Zend\Config\Factory::fromFile($this->navigationPath);
            if(isset($data['navigation']))
                $form->setData(['pages' => $data['navigation'][$type]]);
        }

        return new ViewModel([
            'form'  =>  $form,
            'data'  =>  $data,
        ]);
    }

    public function indexAction()
    {
        $form = new SiteForm($this->em,  $this->layout()->locales);

        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $config = new \Zend\Config\Config([], true);
                unset($data->submit);
                $defLanguage = $this->em->getRepository('Application\Entity\Language')->findOneBy(['locale' => $data->default_locale]);
                $data->default_language = $defLanguage->getCode();
                $data->languages = $this->em->getRepository('Application\Entity\Language')->getLanguagesByLocale($data->locales);
                $config->site = (array)$data;

                $writer = new \Zend\Config\Writer\PhpArray();
                $writer->toFile($this->configPath, $config);

                $this->flashMessenger()->addMessage('Data successfully saved!');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }else{
            $data = \Zend\Config\Factory::fromFile($this->configPath);
            if(isset($data['site']))
                $form->setData($data['site']);
        }

        return new ViewModel([
            'form'  =>  $form,
        ]);
    }
}
