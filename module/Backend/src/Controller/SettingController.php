<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Doctrine\ORM\EntityManager;
use Application\Entity\Setting;
use Backend\Form\SettingForm;

class SettingController extends AbstractActionController
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
        $form = new SettingForm($this->em,  $this->layout()->locales);
        $request = $this->getRequest();
        $category = new Setting();
        $form->bind($category);
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/setting');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->persist($category);
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/setting');
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
            return $this->redirect()->toRoute('backend/setting');
        }
        $category = $this->em->find('Application\Entity\Setting', $id);
        if (! $category) {
            $this->flashMessenger()->addErrorMessage('Category doesn\'t exist');
            return $this->redirect()->toRoute('backend/setting');
        }

        $form = new SettingForm($this->em,  $this->layout()->locales);
        $request = $this->getRequest();
        $form->bind($category);
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/setting');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->flush();
                $this->cache->clearByTags(['setting'],true);
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/setting');
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
                $removed = $this->em->getRepository('Application\Entity\Setting')->removeByIds($data->ids);
                if(count($removed)){
                    $message = sprintf('Deleted %d categories',$removed);
                    $result['message'] = $message;
                    $result['success'] = true;
                    $this->cache->clearByTags(['setting'],true);
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
            $sortBy = $data->datatable['sort']['field']?:'code';
            $search = (isset($data->datatable['query']))?$data->datatable['query']['generalSearch']:'';

            $total = $this->em->getRepository('Application\Entity\Setting')->getTotal($search);

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

            $result['data'] = $this->em->getRepository('Application\Entity\Setting')->getList($start, $limit, $sortBy, $sortOrder, $search);
        }

        return new JsonModel($result);
    }

}
