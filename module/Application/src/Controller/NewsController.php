<?php
namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Doctrine\ORM\EntityManager;

class NewsController extends AbstractActionController
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

        $data = $this->em->getRepository('Application\Entity\News')->getLatesNews(6, $this->locale);
        $this->layout()->mainClass = 'news-page';

        return new ViewModel([
            'data' => $data
        ]);
    }

    public function viewAction()
    {
        $this->locale = $this->layout()->locale;
        $this->layout()->footerDisclaimer = '';
        $slug = $this->params()->fromRoute('slug');
        if (! $slug)
            return $this->redirect()->toRoute('home/news_archive', [
                'lang' => $this->layout()->lang
            ]);

        $news = $this->em->getRepository('Application\Entity\News')->getNews($slug, $this->locale);
        $news['content'] = $this->replaceSetting()->replace($news['content']);
        if (! $news) {
            return $this->redirect()->toRoute('home/news_archive', [
                'lang' => $this->layout()->lang
            ]);
        }

        $this->layout()->mainClass = 'news-article-page';
        return new ViewModel([
            'news' => $news,
        ]);
    }
}
