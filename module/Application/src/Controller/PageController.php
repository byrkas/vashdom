<?php
namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Doctrine\ORM\EntityManager;

class PageController extends AbstractActionController
{

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
        $slug = $this->params()->fromRoute('slug');
        if (! $slug)
            return $this->redirect()->toRoute('home/lang', [
                'lang' => $this->layout()->lang
            ]);

        $page = $this->em->getRepository('Application\Entity\Page')->getPage($slug, $this->locale);
        $page['content'] = $this->replaceSetting()->replace($page['content']);
        if (! $page) {
            $this->getResponse()->setStatusCode(404);
            $this->getResponse()->setContent($this->translator()
                ->translate('Page not found'));
            return;
        }

        $this->layout()->mainClass = $slug.'-page';
        $this->layout()->headerClass = 'header--xs-colored';

        return new ViewModel([
            'page' => $page,
            'slug' => $slug
        ]);
    }

    public function modalAction()
    {
        $this->locale = $this->layout()->locale;
        $slug = $this->params()->fromRoute('slug');
        if (! $slug)
            return $this->redirect()->toRoute('home/lang', [
                'lang' => $this->layout()->lang
            ]);

        $page = $this->em->getRepository('Application\Entity\Page')->getPage($slug, $this->locale);
        $page['content'] = $this->replaceSetting()->replace($page['content']);
        if (! $page) {
            $this->getResponse()->setStatusCode(404);
            $this->getResponse()->setContent($this->translator()
                ->translate('Page not found'));
            return;
        }

        $view = new ViewModel([
            'page' => $page
        ]);

        $view->setTerminal(true);
        return $view;
    }

    public function faqAction()
    {
        $this->locale = $this->layout()->locale;
        $data = $this->em->getRepository('Application\Entity\Faq')->getAllList($this->locale);
        $this->layout()->mainClass = 'faq-page';
        $this->layout()->headerClass = 'header--xs-colored';

        return new ViewModel([
            'data' => $data
        ]);
    }
}
