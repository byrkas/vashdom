<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;
use Zend\View\Model\ViewModel;
use Doctrine\ORM\EntityManager;
use Application\Entity\MetaTags;
use Backend\Form\MetaTagsForm;


class MetaTagsController extends AbstractActionController
{
    private $em;
    private $config;
    private $cache;

    public function __construct(EntityManager $em, array $config, $cache)
    {
        $this->em = $em;
        $this->config = $config;
    $this->cache = $cache;
    }

    public function getEntityManager()
    {
        return $this->em;
    }

    public function start($page, $limit)
    {
        return ($page - 1)*$limit;
    }

    public function indexAction()
    {
        return new ViewModel([
        ]);
    }

    public function addAction()
    {
        $form = new MetaTagsForm($this->em);
        $request = $this->getRequest();
        $metatags = new MetaTags;
        $form->bind($metatags);
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/meta_tags');
            }

            $form->setData($data);
            if ($form->isValid()) {
                $metatags->setRouteHash(md5($data['route']));
                $metatags->setEditedByUser($_SESSION['Zend_Auth']->__get("session")->getId());
                $metatags->setCreated(new \DateTime());

                $this->em->persist($metatags);
                $this->em->flush();
                $this->cache->clearByTags(['meta_tags'],true);
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/meta_tags');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form'  =>  $form,
        ]);
    }

    public function editAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);

        if (! $id) {
            $this->flashMessenger()->addErrorMessage('Id doesn\'t set');
            return $this->redirect()->toRoute('backend/meta_tags');
        }
        $metatags = $this->em->find('Application\Entity\MetaTags', $id);
        if (! $metatags) {
            $this->flashMessenger()->addErrorMessage('MetaTags doesn\'t exist');
            return $this->redirect()->toRoute('backend/meta_tags');
        }

        $form = new MetaTagsForm($this->em);
        $request = $this->getRequest();
        $form->bind($metatags);
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/meta_tags');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $metatags->setRouteHash(md5($data['route']));
                $metatags->setEditedByUser($_SESSION['Zend_Auth']->__get("session")->getId());
                $metatags->setUpdated(new \DateTime());

                $this->em->flush();
                $this->cache->clearByTags(['meta_tags'],true);
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/meta_tags');
            } else {
                $errors = $form->getMessages();
                var_dump($errors);
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form'  =>  $form,
        ]);
    }

    public function getDataAction() {
        $request = $this->getRequest();
        $result = ['meta' => [], 'data' => []];

        if ($request->isPost()) {
            $data = $request->getPost();

            $page = $data->datatable['pagination']['page'];
            $limit = $data->datatable['pagination']['perpage'];
            $sortOrder = ($data->datatable['sort']['sort'])?:'desc';
            $sortBy = $data->datatable['sort']['field']?:'f.created';
            $search = (isset($data->datatable['query']))?$data->datatable['query']['generalSearch']:'';

            $total = $this->em->getRepository('Application\Entity\MetaTags')->getTotal($search);

            $start = $this->start($page, $limit);
            while($start > $total){
                $start = $this->start(--$page, $limit);
            }

            $result['meta'] = [
                'page'  =>  $page,
                'perpage'   =>  $limit,
                'total' =>  $total,
                'pages' =>  ($total > 0)?intval($total/$limit):0,
            ];

            $result['data'] = $this->em->getRepository('Application\Entity\MetaTags')->getList($start, $limit, $sortBy, $sortOrder, $search);
        }

        return new JsonModel($result);
    }

    public function deleteAction() {
        $result = ['success' => false, 'message' => ''];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data->ids)){
                $removed = $this->em->getRepository('Application\Entity\MetaTags')->removeByIds($data->ids);
                if($removed > 0){
                    $this->cache->clearByTags(['meta_tags'],true);
                    $message = sprintf('Deleted %d meta tags',$removed);
                    $result['message'] = $message;
                    $result['success'] = true;
                }
            }
        }

        return new JsonModel($result);
    }
}