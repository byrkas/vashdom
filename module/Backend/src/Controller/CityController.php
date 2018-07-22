<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Doctrine\ORM\EntityManager;
use Application\Entity\City;
use Backend\Form\CityForm;

class CityController extends AbstractActionController
{
    private $em;
    private $config;
    public $tempFile = [];
    public $imgPreview = ['image' => null];

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
        $form = new CityForm($this->em,  $this->layout()->locales);
        $request = $this->getRequest();
        $city = new City();
        $form->bind($city);

        $request = $this->getRequest();

        if ($request->isPost()) {
            $data = $request->getPost();
            $form->setData($data);

            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/city');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->persist($city);
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/city');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form'  =>  $form,
            'tempFile' => $this->tempFile,
            'imgPreview'    =>  $this->imgPreview
        ]);
    }

    public function editAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);

        if (! $id) {
            $this->flashMessenger()->addErrorMessage('Id doesn\'t set');
            return $this->redirect()->toRoute('backend/city');
        }
        $city = $this->em->find('Application\Entity\City', $id);
        if (! $city) {
            $this->flashMessenger()->addErrorMessage('City doesn\'t exist');
            return $this->redirect()->toRoute('backend/city');
        }

        $form = new CityForm($this->em,  $this->layout()->locales);
        $request = $this->getRequest();
        $form->bind($city);

        $request = $this->getRequest();

        if ($request->isPost()) {
            $data = $request->getPost();
            $form->setData($data);

            if(isset($data['cancel'])){
                return $this->redirect()->toRoute('backend/city');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/city');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form'  =>  $form,
            'tempFile' => $this->tempFile,
            'imgPreview'    =>  $this->imgPreview
        ]);
    }

    public function deleteAction()
    {
        $result = ['success' => false, 'message' => ''];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if(isset($data->ids)){
                $removed = $this->em->getRepository('Application\Entity\City')->removeByIds($data->ids);
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
            $sortBy = $data->datatable['sort']['field']?:'name';
            $search = (isset($data->datatable['query']))?$data->datatable['query']['generalSearch']:'';

            $total = $this->em->getRepository('Application\Entity\City')->getTotal($search);

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

            $result['data'] = $this->em->getRepository('Application\Entity\City')->getList($start, $limit, $sortBy, $sortOrder, $search);
        }

        return new JsonModel($result);
    }

}
