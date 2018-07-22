<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Doctrine\ORM\EntityManager;
use Application\Entity\Language;
use Backend\Form\LanguageForm;
use Gettext\Translations;
use Gettext\Merge;
use Application\Entity\Translation\RegionTranslation;
use Application\Entity\Translation\CountryTranslation;
use Application\Entity\Translation\CityTranslation;

class LanguageController extends AbstractActionController
{

    private $em;

    private $config;

    private $langFolder;

    private $dataFolder;

    public function __construct(EntityManager $em, array $config)
    {
        $this->em = $em;
        $this->config = $config;
        $this->langFolder = $config['translator']['translation_file_patterns'][0]['base_dir'].'/';
        $this->dataFolder = __DIR__ . '/../../../../module/';
    }

    public function getEntityManager()
    {
        return $this->em;
    }

    public function start($page, $limit)
    {
        return ($page - 1) * $limit;
    }

    public function indexAction()
    {
        return new ViewModel([]);
    }

    public function addAction()
    {
        $form = new LanguageForm($this->em);
        $request = $this->getRequest();
        $language = new Language();
        $form->bind($language);
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data['cancel'])) {
                return $this->redirect()->toRoute('backend/language');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->persist($language);
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/language');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form' => $form
        ]);
    }

    public function editAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);

        if (! $id) {
            $this->flashMessenger()->addErrorMessage('Id doesn\'t set');
            return $this->redirect()->toRoute('backend/language');
        }
        $language = $this->em->find('Application\Entity\Language', $id);
        if (! $language) {
            $this->flashMessenger()->addErrorMessage('language doesn\'t exist');
            return $this->redirect()->toRoute('backend/language');
        }

        $form = new LanguageForm($this->em);
        $request = $this->getRequest();
        $form->bind($language);
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data['cancel'])) {
                return $this->redirect()->toRoute('backend/language');
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/language');
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'form' => $form
        ]);
    }

    public function deleteAction()
    {
        $result = [
            'success' => false,
            'message' => ''
        ];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data->ids)) {
                $removed = $this->em->getRepository('Application\Entity\Language')->removeByIds($data->ids);
                if (count($removed)) {
                    $message = sprintf('Deleted %d languages', $removed);
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
        $result = [
            'meta' => [],
            'data' => []
        ];

        if ($request->isPost()) {
            $data = $request->getPost();

            $page = $data->datatable['pagination']['page'];
            $limit = $data->datatable['pagination']['perpage'];
            $sortOrder = ($data->datatable['sort']['sort']) ?: 'asc';
            $sortBy = $data->datatable['sort']['field'] ?: 'name';
            $search = (isset($data->datatable['query'])) ? $data->datatable['query']['generalSearch'] : '';

            $total = $this->em->getRepository('Application\Entity\Language')->getTotal($search);

            $start = $this->start($page, $limit);
            while ($start > $total) {
                $start = $this->start(-- $page, $limit);
            }

            $result['meta'] = [
                'page' => $page,
                'perpage' => $limit,
                'total' => $total,
                'pages' => ($total > 0) ? intval($total / $limit) : 0
            ];

            $data = $this->em->getRepository('Application\Entity\Language')->getList($start, $limit, $sortBy, $sortOrder, $search);
            foreach ($data as $key => $entry) {
                $data[$key]['progress'] = (! empty($entry['info']) && $entry['info']['lines'] > 0) ? round($entry['info']['translated'] * 100 / $entry['info']['lines']) : 0;
            }
            $result['data'] = $data;
        }

        return new JsonModel($result);
    }

    public function generatePo($locale, $name = null)
    {
        $filePath = $this->langFolder . $locale . '.po';
        $moFilePath = $this->langFolder . $locale . '.mo';
        if ($name !== null) {
            $filePath = $this->langFolder . $name . '.po';
            $moFilePath = $this->langFolder . $name . '.mo';
        }
        $defFile = $this->langFolder . 'default.po.dist';

        if (! file_exists($filePath)) {
            $date = new \DateTime();
            $formatDate = $date->format('Y-m-d H:i');
            $content = file_get_contents($defFile);
            $content = str_replace("{date}", $formatDate, $content);
            $content = str_replace("{locale}", $locale, $content);
            file_put_contents($filePath, $content);
            chmod($filePath, 0777);

            $gettext = new \Backend\Service\Gettext();
            $gettext->setFileExtensions([
                'phtml',
                'php'
            ])
                ->setOutputFormat(\Backend\Service\Gettext::OUT_PO)
                ->setDirectory($this->dataFolder)
                ->setFileName($filePath)
                ->setMethodPrefixes([
                '_',
                '-\>translate',
                '-\>translatePlural'
            ]); // TODO::check _
            $lines = $gettext->generate();

            file_put_contents($moFilePath, '');
            chmod($moFilePath, 0777);
        }
    }

    public function translationAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);

        if (! $id) {
            $this->flashMessenger()->addErrorMessage('Id doesn\'t set');
            return $this->redirect()->toRoute('backend/language');
        }
        $language = $this->em->find('Application\Entity\Language', $id);
        if (! $language) {
            $this->flashMessenger()->addErrorMessage('language doesn\'t exist');
            return $this->redirect()->toRoute('backend/language');
        }

        $locale = $language->getLocale();
        $this->generatePo($locale);
        $filePath = $this->langFolder . $locale . '.po';
        $filePathMo = $this->langFolder . $locale . '.mo';

        $translations = Translations::fromPoFile($filePath);

        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            foreach ($translations as $trEntry) {
                if (isset($data['translate'][$trEntry->getOriginal()])) {
                    $translate = $data['translate'][$trEntry->getOriginal()];
                    $trEntry->setTranslation($translate);
                }
                if (isset($data['comment'][$trEntry->getOriginal()])) {
                    $comment = $data['comment'][$trEntry->getOriginal()];
                    if ($comment) {
                        $trEntry->deleteComments();
                        $trEntry->addComment($comment);
                    }
                }
                if ($trEntry->hasPlural() && isset($data['translatePlural'][$trEntry->getOriginal()])) {
                    $plural = $data['translatePlural'][$trEntry->getOriginal()];
                    $trEntry->setPluralTranslations($plural);
                }
            }
            $translations->toPoFile($filePath);
            $translations->toMoFile($filePathMo);
            $translated = $translations->countTranslated();

            $info = $language->getInfo();
            $info['translated'] = $translated;
            $language->setInfo($info);
            $this->em->flush($language);

            try {
                $this->flashMessenger()->addMessage('Data successfully saved!');
            } catch (\Exception $e) {
                $this->flashMessenger()->addErrorMessage($e->getMessage());
            }
        }

        return new ViewModel([
            'id' => $id,
            'translations' => $translations,
            'language' => $language->getName()
        ]);
    }

    public function updateTranslationAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);
        if (! $id) {
            $this->flashMessenger()->addErrorMessage('Id doesn\'t set');
            return $this->redirect()->toRoute('backend/language');
        }
        $language = $this->em->find('Application\Entity\Language', $id);
        if (! $language) {
            $this->flashMessenger()->addErrorMessage('language doesn\'t exist');
            return $this->redirect()->toRoute('backend/language');
        }

        $locale = $language->getLocale();
        $this->generatePo($locale);

        $filePath = $this->langFolder . $locale . '.po';
        $tempPath = $this->langFolder . 'temp' . '.po';
        unlink($tempPath);

        try {
            $gettext = new \Backend\Service\Gettext();
            $gettext->setFileExtensions([
                'phtml',
                'php'
            ])
                ->setOutputFormat(\Backend\Service\Gettext::OUT_PO)
                ->setDirectory($this->dataFolder)
                ->setFileName($tempPath)
                ->setMethodPrefixes([
                '_',
                '-\>translate',
                '-\>translatePlural'
            ]); // TODO::check _
            $lines = $gettext->generate();

            $translations = Translations::fromPoFile($filePath);
            $updatedTranslations = Translations::fromPoFile($tempPath);
            $translations->mergeWith($updatedTranslations, Merge::ADD);
            $translations->mergeWith($updatedTranslations, Merge::REMOVE);
            $translations->toPoFile($filePath);

            $info = $language->getInfo();
            $info['lines'] = $lines;
            $translations = Translations::fromPoFile($filePath);
            $translated = $translations->countTranslated();
            $info['translated'] = $translated;

            $language->setInfo($info);
            $this->em->flush($language);
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
        return $this->redirect()->toRoute('backend/language', [
            'action' => 'translation',
            'id' => $id
        ]);
    }

    public function googleTranslate($text, $langTo, $langFrom = 'en')
    {
        $trans = new \Statickidz\GoogleTranslate();
        $result = $trans->translate($langFrom, $langTo, $text);
        return $result;
    }

    public function translateRegionAction()
    {
        $locale = $this->params()->fromRoute('id', '');
        $localeStrip = explode('_', $locale);
        $lang = $localeStrip[0];

        if(!empty($locale)){
            $regions = $this->em->getRepository('Application\Entity\Region')->findAll();
            foreach ($regions as $region){
                $translations = $region->getTranslations();
                $flgTranslate = true;
                foreach ($translations as $trEntry){
                    if($trEntry->getLocale() == $locale && $trEntry->getField() == 'name'){
                        $flgTranslate = false;
                        break;
                    }
                }
                if($flgTranslate){
                    $name = $this->googleTranslate($region->getName(), $lang);
                    if(!empty($name) && $name != $region->getName()){
                        $translation = new RegionTranslation($locale, 'name', $name);
                        $region->addTranslation($translation);
                        $this->em->flush($region);
                        echo $region->getName().' -> '.$name.'<br/>';
                    }
                }
            }
        }

        exit;
    }

    public function translateCountryAction()
    {
        $locale = $this->params()->fromRoute('id', '');
        $localeStrip = explode('_', $locale);
        $lang = $localeStrip[0];

        if(!empty($locale)){
            $countries = $this->em->getRepository('Application\Entity\Country')->findAll();
            foreach ($countries as $entry){
                $translations = $entry->getTranslations();
                $flgTranslate = true;
                foreach ($translations as $trEntry){
                    if($trEntry->getLocale() == $locale && $trEntry->getField() == 'name'){
                        $flgTranslate = false;
                        break;
                    }
                }
                if($flgTranslate){
                    $name = $this->googleTranslate($entry->getName(), $lang);
                    if(!empty($name) && $name != $entry->getName()){
                        $translation = new CountryTranslation($locale, 'name', $name);
                        $entry->addTranslation($translation);
                        $this->em->flush($entry);
                        echo $entry->getName().' -> '.$name.'<br/>';
                    }
                }
            }
        }

        exit;
    }


    public function translateCityAction()
    {
        $locale = $this->params()->fromRoute('id', '');
        $localeStrip = explode('_', $locale);
        $lang = $localeStrip[0];

        if(!empty($locale)){
            $cities = $this->em->getRepository('Application\Entity\City')->findAll();
            foreach ($cities as $entry){
                $translations = $entry->getTranslations();
                $flgTranslate = true;
                foreach ($translations as $trEntry){
                    if($trEntry->getLocale() == $locale && $trEntry->getField() == 'name'){
                        $flgTranslate = false;
                        break;
                    }
                }
                if($flgTranslate){
                    $name = $this->googleTranslate($entry->getName(), $lang);
                    if(!empty($name) && $name != $entry->getName()){
                        $translation = new CityTranslation($locale, 'name', $name);
                        $entry->addTranslation($translation);
                        $this->em->flush($entry);
                        echo $entry->getName().' -> '.$name.'<br/>';
                    }
                }
            }
        }

        exit;
    }
}
