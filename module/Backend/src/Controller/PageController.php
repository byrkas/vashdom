<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Doctrine\ORM\EntityManager;
use Application\Entity\Page;
use Backend\Form\PageForm;

class PageController extends AbstractActionController
{
    private $em;
    private $config;

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

    public function indexAction()
    {
        return new ViewModel([
        ]);
    }

    public function addAction()
    {
        $form = new PageForm($this->em,  $this->layout()->locales);
        $request = $this->getRequest();
        $page = new Page();
        $form->bind($page);
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/page');
            }
            $form->setData($data);
            if ($form->isValid()) {
                if($page->getSlug() == ""){
                    $page->setSlug(null);
                }
                $this->em->persist($page);
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/page');
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
            return $this->redirect()->toRoute('backend/page');
        }
        $page = $this->em->find('Application\Entity\Page', $id);
        if (! $page) {
            $this->flashMessenger()->addErrorMessage('Page doesn\'t exist');
            return $this->redirect()->toRoute('backend/page');
        }

        $form = new PageForm($this->em,  $this->layout()->locales);
        $request = $this->getRequest();
        $form->bind($page);
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/page');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/page');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form'  =>  $form,
        ]);
    }

    public function deleteAction()
    {
        $result = ['success' => false, 'message' => ''];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data->ids)){
                $removed = $this->em->getRepository('Application\Entity\Page')->removeByIds($data->ids);
                if(count($removed)){
                    $message = sprintf('Deleted %d cities',$removed);
                    $result['message'] = $message;
                    $result['success'] = true;
                }
            }
        }

        return new JsonModel($result);
    }

    public function getDataAction()
    {
        $request = $this->getRequest();
        $result = ['meta' => [], 'data' => []];

        if ($request->isPost()) {
            $data = $request->getPost();

            $page = $data->datatable['pagination']['page'];
            $limit = $data->datatable['pagination']['perpage'];
            $sortOrder = ($data->datatable['sort']['sort'])?:'asc';
            $sortBy = $data->datatable['sort']['field']?:'title';
            $search = (isset($data->datatable['query']))?$data->datatable['query']['generalSearch']:'';

            $total = $this->em->getRepository('Application\Entity\Page')->getTotal($search);

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

            $result['data'] = $this->em->getRepository('Application\Entity\Page')->getList($start, $limit, $sortBy, $sortOrder, $search);
        }

        return new JsonModel($result);
    }

}
