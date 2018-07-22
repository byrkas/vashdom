<?php
namespace Backend\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use Zend\View\Model\JsonModel;
use Zend\Session\Container;
use Doctrine\ORM\EntityManager;
use Zend\Authentication\Result;
use Backend\Form\LoginForm;
use Backend\Form\ForgetForm;
use Backend\Form\ResetPasswordForm;
use Zend\Uri\Uri;
use Backend\Form\ProfileForm;
use Backend\Form\UserForm;
use Application\Entity\Admin;
use Backend\Form\QuoteForm;
use Doctrine\Common\Collections\ArrayCollection;
use Application\Entity\QuoteFlight;
use Application\Form\CheckoutForm;

class IndexController extends AbstractActionController
{

    protected $session;

    private $em;

    private $config;

    private $userManager;

    private $authManager;

    protected $quoteManager;

    public function __construct($entityManager, $config, $authManager, $userManager, $quoteManager)
    {
        $this->em = $entityManager;
        $this->config = $config;
        $this->authManager = $authManager;
        $this->userManager = $userManager;
        $this->quoteManager = $quoteManager;
    }

    public function getEntityManager()
    {
        return $this->em;
    }

    public function start($page, $limit)
    {
        return ($page - 1) * $limit;
    }


    public function changeLanguageAction()
    {
        $session = new Container('backend');
        $queryParams = $this->params()->fromQuery();
        $defLang = $this->params()->fromRoute('locale');
        $session->language = $defLang;

        if(isset($queryParams['redirectTo'])){
            return $this->redirect()->toUrl($queryParams['redirectTo']);
        }
        exit;
    }

    public function indexAction()
    {
        return new ViewModel([]);
    }

    public function userInfoAction()
    {
        $discountId = (int) $this->params()->fromRoute('id', 0);
        $userInfo = $this->em->getRepository('Application\Entity\UserInfo')->getInfo($discountId);
        $id = ($userInfo) ? $userInfo['id'] : 0;

        return new ViewModel([
            'id' => $id,
            'userInfo' => $userInfo
        ]);
    }

    public function getUserInfoActionsAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);
        $request = $this->getRequest();
        $result = [
            'meta' => [],
            'data' => []
        ];

        if ($request->isPost()) {
            $data = $request->getPost();

            $page = $data->datatable['pagination']['page'];
            $limit = $data->datatable['pagination']['perpage'];
            $sortOrder = ($data->datatable['sort']['sort']) ?: 'desc';
            $sortBy = $data->datatable['sort']['field'] ?: 'created';
            $search = (isset($data->datatable['query'])) ? $data->datatable['query']['generalSearch'] : '';

            $total = $this->em->getRepository('Application\Entity\UserInfo')->getTotal($id, $search);

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

            $quotes = $this->em->getRepository('Application\Entity\UserInfo')->getList($id, $start, $limit, $sortBy, $sortOrder, $search);
            foreach ($quotes as $key => $quote) {
                $quotes[$key]['created'] = $quote['created']->format('Y-m-d H:i');
            }
            $result['data'] = $quotes;
        }

        return new JsonModel($result);
    }

    public function subscriptionsAction()
    {
        return new ViewModel([]);
    }

    public function getSubscriptionsAction()
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
            $sortOrder = ($data->datatable['sort']['sort']) ?: 'desc';
            $sortBy = $data->datatable['sort']['field'] ?: 'created';
            $search = (isset($data->datatable['query'])) ? $data->datatable['query']['generalSearch'] : '';

            $total = $this->em->getRepository('Application\Entity\Subscribe')->getTotal($search);

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

            $quotes = $this->em->getRepository('Application\Entity\Subscribe')->getList($start, $limit, $sortBy, $sortOrder, $search);
            foreach ($quotes as $key => $quote) {
                $quotes[$key]['created'] = $quote['created']->format('Y-m-d H:i');
            }
            $result['data'] = $quotes;
        }

        return new JsonModel($result);
    }

    public function checkoutAction()
    {
        return new ViewModel([]);
    }

    public function getCheckoutAction()
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
            $sortOrder = ($data->datatable['sort']['sort']) ?: 'desc';
            $sortBy = $data->datatable['sort']['field'] ?: 'created';
            $search = (isset($data->datatable['query'])) ? $data->datatable['query']['generalSearch'] : '';

            $total = $this->em->getRepository('Application\Entity\Checkout')->getTotal($search);

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

            $list = $this->em->getRepository('Application\Entity\Checkout')->getList($start, $limit, $sortBy, $sortOrder, $search);
            foreach ($list as $key => $entry) {
                $list[$key]['created'] = $entry['created']->format('Y-m-d H:i');
            }
            $result['data'] = $list;
        }

        return new JsonModel($result);
    }

    public function quotesAction()
    {
        return new ViewModel([]);
    }

    public function viewQuoteAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);
        if (! $id) {
            $this->flashMessenger()->addErrorMessage('Id doesn\'t set');
            return $this->redirect()->toRoute('backend/default', [
                'action' => 'quotes'
            ]);
        }
        $quote = $this->em->find('Application\Entity\Quote', $id);

        if (! $quote) {
            $this->flashMessenger()->addErrorMessage('Quote doesn\'t exist');
            return $this->redirect()->toRoute('backend/default', [
                'action' => 'quotes'
            ]);
        }

        if (count($quote->getQuoteFlights()) == 0) {
            $leadInfo = $this->quoteManager->generateLeadInfo($id);
            if (isset($leadInfo['LeadFlights'])) {
                $flights = new ArrayCollection();
                foreach ($leadInfo['LeadFlights'] as $flEntry) {
                    $qFlight = new QuoteFlight();
                    $depArr = explode('/', $flEntry['departure']);
                    if(count($depArr) == 2){
                        $flEntry['departure'] = str_replace(' / ', '/', $flEntry['departure']).'/'.date('Y');
                    }
                    $flEntry['departure'] = new \DateTime($flEntry['departure']);
                    $qFlight->exchangeArray($flEntry);
                    $flights->add($qFlight);
                }
                $quote->addQuoteFlights($flights);
            }
            if (isset($leadInfo['Lead'])) {
                if (isset($leadInfo['Lead']['trip_type']))
                    $quote->setTripType(strtolower($leadInfo['Lead']['trip_type']));
                if (isset($leadInfo['Lead']['adults']))
                    $quote->setAdults($leadInfo['Lead']['adults']);
                if (isset($leadInfo['Lead']['children']))
                    $quote->setChildren($leadInfo['Lead']['children']);
            }
            $this->em->flush();
        }

        $paxCnt = $quote->getPaxCnt();
        $form = new QuoteForm($this->em, $paxCnt);
        $request = $this->getRequest();
        $form->bind($quote);
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data['cancel'])) {
                return $this->redirect()->toRoute('backend/default', [
                    'action' => 'quotes'
                ]);
            }
            $form->setData($data);
            if ($form->isValid()) {
                $this->em->flush();
                $this->flashMessenger()->addMessage('Data successfully saved!');
                return $this->redirect()->toRoute('backend/default', [
                    'action' => 'quotes'
                ]);
            } else {
                $errors = $form->getMessages();
                $this->flashMessenger()->addErrorMessage('Error while saving data');
            }
        }

        return new ViewModel([
            'id' => $id,
            'form' => $form,
            'hasCheckout' => count($quote->getCheckouts()),
            'created' => $quote->getCreated()->format('Y-m-d H:i')
        ]);
    }

    public function checkoutInfoAction()
    {
        $id = $this->params()->fromRoute('id');
        $data = [];

        $checkout = $this->em->getRepository('Application\Entity\Checkout')->findOneBy(['id' => $id]);
        if (! $checkout) {
            $this->flashMessenger()->addErrorMessage('Checkout doesn\'t exist');
            return $this->redirect()->toRoute('backend/default', [
                'action' => 'checkout'
            ]);
        }
        $data = $checkout->getArrayCopy();

        return new ViewModel([
            'data' => $data
        ]);
    }

    public function viewCheckoutAction()
    {
        $id = (int) $this->params()->fromRoute('id', 0);
        $data = [];

        $quote = $this->em->find('Application\Entity\Quote', $id);

        if (! $quote) {
            $this->flashMessenger()->addErrorMessage('Quote doesn\'t exist');
            return $this->redirect()->toRoute('backend/default', [
                'action' => 'quotes'
            ]);
        }

        $checkout = $this->em->getRepository('Application\Entity\Checkout')->findOneBy(['Quote' => $quote],['created'=>'DESC']);
        if (! $checkout) {
            $this->flashMessenger()->addErrorMessage('Checkout doesn\'t exist');
            return $this->redirect()->toRoute('backend/default', [
                'action' => 'quotes'
            ]);
        }
        $data = $checkout->getArrayCopy();
        $priceQuote = $checkout->getPriceQuote();
        $data['priceQuote'] = $priceQuote->getArrayCopy();

        return new ViewModel([
            'quoteId' => $id,
            'data' => $data
        ]);
    }

    public function sendQuotesAction()
    {
        $result = [
            'success' => false,
            'message' => ''
        ];
        $id = (int) $this->params()->fromRoute('id', 0);
        if (! $id) {
            $result['message'] = 'Id doesn\'t set';
            return new JsonModel($result);
        }

        $quote = $this->em->find('Application\Entity\Quote', $id);
        if (! $quote) {
            $result['message'] = 'Quote doesn\'t exist';
            return new JsonModel($result);
        }

        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data->ids)) {
                $agentEmail = $this->config['smtp']['username'];
                $agentName = $quote->getAgent();
                $clientEmail = $quote->getEmail();
                $flights = $quote->getQuoteFlights();
                $iatas = [];
                $origin = null;
                $destination = null;
                if (count($flights)) {
                    $origin = $flights[0]->origin;
                    $destination = $flights[0]->destination;
                    $iatas[] = $origin;
                    $iatas[] = $destination;
                }
                $airports = $this->em->getRepository('Application\Entity\Airport')->getAirportsByCodes($iatas);
                if (isset($airports[$origin])) {
                    $origin = $airports[$origin];
                }
                if (isset($airports[$destination])) {
                    $destination = $airports[$destination];
                }
                $offers = [];
                $priceQuotes = $this->em->getRepository('Application\Entity\PriceQuote')->findBy([
                    'id' => $data->ids
                ]);
                foreach ($priceQuotes as $pqEntry) {
                    $dump = $pqEntry->getDump();
                    $itinerary = $this->dumpParser()->parseItinerary($dump);
                    $segments = $this->dumpParser()->itineraryToSegments($itinerary, $pqEntry->getDestination());

                    $itCodes = [
                        $pqEntry->getDestination()
                    ];
                    foreach ($itinerary as $itEntry) {
                        if (! in_array($itEntry['departureAirport'], $itCodes)) {
                            $itCodes[] = $itEntry['departureAirport'];
                        }
                        if (! in_array($itEntry['arrivalAirport'], $itCodes)) {
                            $itCodes[] = $itEntry['arrivalAirport'];
                        }
                    }
                    $airportsQ = $this->em->getRepository('Application\Entity\Airport')->getAirportsByCodes($itCodes);
                    $segmTrips = [];
                    foreach ($segments as $sEntry) {
                        $first = $sEntry[0];
                        $last = $sEntry[count($sEntry) - 1];
                        $segmTrips[] = [
                            'origin' => (isset($airportsQ[$first['departureAirport']])) ? $airportsQ[$first['departureAirport']] : $first['departureAirport'],
                            'destination' => (isset($airportsQ[$last['arrivalAirport']])) ? $airportsQ[$last['arrivalAirport']] : $last['arrivalAirport'],
                            'departureDate' => $first['departureDateTime'],
                            'arrivalDate' => $last['arrivalDateTime']
                        ];
                    }
                    $offers[] = [
                        'id' => $pqEntry->getId(),
                        'carrier' => $pqEntry->getCarrier(),
                        'total' => $pqEntry->getTicketFare() + $pqEntry->getServiceFee(),
                        'segments' => $segmTrips
                    ];
                }

                $mailData = [
                    'title' => ($quote->getTripType() == 'rt') ? $origin . ' - ' . $destination . ' - ' . $origin : $origin . ' - ' . $destination,
                    'quoteId' => $quote->getId(),
                    'phone' => $this->setting()->getValue('phone'),
                    'origin' => $origin,
                    'destination' => $destination,
                    'offers' => $offers,
                    'checkoutUrl' => $this->url()->fromRoute('home/checkout', [], [
                        'force_canonical' => true
                    ])
                ];
                $sendMail = $this->mailSender()->sendQuotesToClient($agentEmail, $agentName, $clientEmail, $mailData);
                if($sendMail){
                    $result['success'] = true;
                }
            }
        }

        return new JsonModel($result);
    }

    public function testMailAction()
    {
        $subject = "New Quote from Client - ".$this->config['site']['siteTitle'];
        $text = "New Quote from Client.<br/> Go to <a href=\"".$this->url()->fromRoute('backend/default',['action'=>'view-quote','id' => 127],['force_canonical'=>true])."\">Link to view quote</a>";
        $this->mailSender()->sendInfoToAgent($subject, $text);
        exit;
    }

    public function getQuotesAction()
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
            $sortOrder = ($data->datatable['sort']['sort']) ?: 'desc';
            $sortBy = $data->datatable['sort']['field'] ?: 'created';
            $search = (isset($data->datatable['query'])) ? $data->datatable['query']['generalSearch'] : '';

            $total = $this->em->getRepository('Application\Entity\Quote')->getTotal($search);

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

            $quotes = $this->em->getRepository('Application\Entity\Quote')->getList($start, $limit, $sortBy, $sortOrder, $search);
            foreach ($quotes as $key => $quote) {
                $quotes[$key]['created'] = $quote['created']->format('Y-m-d H:i');
                $flight = '';
                if ($quote['searchId']) {
                    $quote['from'] = $quote['fromC'];
                    $flight = $this->formatResultFlight($quote);
                } elseif ($quote['info']) {
                    if (isset($quote['info']['flight'])) {
                        $data = $quote['info']['flight'];
                        if (isset($quote['info']['tripType'])) {
                            $data['tripType'] = $quote['info']['tripType'];
                        }
                        if (isset($quote['info']['cabin'])) {
                            $data['cabin'] = $quote['info']['cabin'];
                        }
                        if (isset($quote['info']['adults'])) {
                            $data['adults'] = $quote['info']['adults'];
                        }
                        if (isset($quote['info']['children'])) {
                            $data['children'] = $quote['info']['children'];
                        }
                        $flight = $this->formatResultFlight($data);
                    } elseif (isset($quote['info']['Flights'])) {
                        foreach ($quote['info']['Flights'] as $flEntry) {
                            $flight .= $this->formatResultFlight($flEntry);
                        }
                        $data = [];
                        if (isset($quote['info']['tripType'])) {
                            $data['tripType'] = $quote['info']['tripType'];
                        }
                        if (isset($quote['info']['cabin'])) {
                            $data['cabin'] = $quote['info']['cabin'];
                        }
                        if (isset($quote['info']['adults'])) {
                            $data['adults'] = $quote['info']['adults'];
                        }
                        if (isset($quote['info']['children'])) {
                            $data['children'] = $quote['info']['children'];
                        }
                        $flight .= $this->formatResultFlight($data);
                    }
                }
                $quotes[$key]['flight'] = $flight;
            }
            $result['data'] = $quotes;
        }

        return new JsonModel($result);
    }

    public function formatResultFlight($data)
    {
        $flight = '';

        if (isset($data['from']) && isset($data['to'])) {
            $flight .= '<div class="m--font-boldest">' . $data['from'] . '-' . $data['to'] . '</div>';
        }
        if (isset($data['departureDate'])) {
            if (is_object($data['departureDate']))
                $data['departureDate'] = $data['departureDate']->format('Y-m-d');
            $flight .= '<div>' . $data['departureDate'];
            if (isset($data['arrivalDate'])) {
                if (is_object($data['arrivalDate']))
                    $data['arrivalDate'] = $data['arrivalDate']->format('Y-m-d');
                $flight .= ' / ' . $data['arrivalDate'] . '</div>';
            }
        }

        if (isset($data['tripType']) || isset($data['cabin'])) {
            $flight .= '<div>';
            if (isset($data['tripType']) && $data['tripType'] != null) {
                $flight .= '<span class="m-badge m-badge--brand m-badge--wide">' . $data['tripType'] . '</span>';
            }
            if (isset($data['cabin']) && $data['cabin'] != null) {
                $flight .= ' <span class="m-badge m-badge--primary m-badge--wide">' . $data['cabin'] . '</span>';
            }
            $flight .= '</div>';
        }

        if (isset($data['adults']) || isset($data['children'])) {
            $flight .= '<div>';
            if (isset($data['adults'])) {
                $flight .= ' Adults: ' . $data['adults'];
            }
            if (isset($data['children'])) {
                $flight .= ' Children: ' . $data['children'];
            }
            $flight .= '</div>';
        }
        if (isset($data['price']) && $data['price'] != null) {
            $flight .= '<div class="m--font-primary">' . $data['price'] . '$</div>';
        }

        return $flight;
    }

    public function deleteQuotesAction()
    {
        $result = [
            'success' => false,
            'message' => ''
        ];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data->ids)) {
                $removed = $this->em->getRepository('Application\Entity\Quote')->removeByIds($data->ids);
                if ($removed && count($removed)) {
                    $message = sprintf('Deleted %d quotes', $removed);
                    $result['message'] = $message;
                    $result['success'] = true;
                }
            }
        }

        return new JsonModel($result);
    }

    public function doneQuotesAction()
    {
        $result = [
            'success' => false,
            'message' => ''
        ];
        $request = $this->getRequest();
        if ($request->isPost()) {
            $data = $request->getPost();
            if (isset($data->ids)) {
                $removed = $this->em->getRepository('Application\Entity\Quote')->doneByIds($data->ids);
                if (count($removed)) {
                    $message = sprintf('Done %d quotes', $removed);
                    $result['message'] = $message;
                    $result['success'] = true;
                }
            }
        }

        return new JsonModel($result);
    }

    public function createUserAction()
    {
        $request = $this->getRequest();
        $form = new UserForm($this->em);
        $form->bind(new Admin());

        if ($request->isPost()) {
            $data = $request->getPost();
            $form->setData($data);
            if (isset($data->cancel)) {
                return $this->redirect()->toRoute('backend');
            }
            if ($form->isValid()) {
                $user = $this->userManager->addUser($data);
                if ($user) {
                    $this->flashMessenger()->addSuccessMessage('User was successfully created!');
                    return $this->redirect()->toRoute('backend');
                }
            }
        }

        return new ViewModel([
            'form' => $form
        ]);
    }

    public function profileAction()
    {
        $request = $this->getRequest();
        $form = new ProfileForm($this->em);
        $form->bind($this->identity());

        if ($request->isPost()) {
            $data = $request->getPost();
            $form->setData($data);
            if (isset($data->cancel)) {
                return $this->redirect()->toRoute('backend');
            }
            if ($form->isValid()) {
                if ($data['new_password']){
                    $result = $this->userManager->changePassword($this->identity(), $data);
                }
                else
                    $result = true;
                if ($result) {
                    $this->em->flush();
                    return $this->redirect()->toRoute('backend');
                }
            }
        }

        return new ViewModel([
            'form' => $form
        ]);
    }

    public function forgetAction()
    {
        $this->layout('layout/login');
        $form = new ForgetForm($this->em);

        $request = $this->getRequest();

        if ($request->isPost()) {
            $form->setData($request->getPost());
            if (isset($request->getPost()->cancel)) {
                return $this->redirect()->toRoute('backend');
            }
            if ($form->isValid()) {
                $data = $form->getData();

                $user = $this->em->getRepository('Application\Entity\Admin')->findOneByEmail($data['email']);
                if ($user) {
                    $message = $this->userManager->generatePasswordResetToken($user);
                    $this->flashMessenger()->addMessage($message);
                }
            }
        }

        return new ViewModel([
            'form' => $form
        ]);
    }

    public function resetPasswordAction()
    {
        $queryParams = $this->params()->fromQuery();
        if (isset($queryParams['token'])) {}

        $this->layout('layout/login');
        $form = new ResetPasswordForm($this->em);

        $request = $this->getRequest();

        if ($request->isPost()) {
            $form->setData($request->getPost());
            if (isset($request->getPost()->cancel)) {
                return $this->redirect()->toRoute('backend');
            }
            if ($form->isValid()) {
                $data = $form->getData();
            }
        }

        return new ViewModel([
            'form' => $form
        ]);
    }

    public function loginAction()
    {
        $redirectUrl = (string) $this->params()->fromQuery('redirectUrl', '');
        if (strlen($redirectUrl) > 2048) {
            throw new \Exception("Too long redirectUrl argument passed");
        }

        // Check if we do not have users in database at all. If so, create
        // the 'Admin' user.
        $this->userManager->createAdminUserIfNotExists();

        $sessionRedirect = new Container('redirect');
        $queryParams = $this->params()->fromQuery();
        if (isset($queryParams['redirectTo'])) {
            $sessionRedirect->redirect = $queryParams['redirectTo'];
        }

        $this->layout('layout/login');
        $form = new LoginForm($this->em);
        $form->get('redirect_url')->setValue($redirectUrl);
        $request = $this->getRequest();

        if ($request->isPost()) {
            $form->setData($request->getPost());
            if ($form->isValid()) {
                $data = $form->getData();
                $result = $this->authManager->login($data['email'], $data['password'], $data['remember_me']);

                // Check result.
                if ($result->getCode() == Result::SUCCESS) {
                    $sessionUser = new Container('backend');
                    $sessionUser->language = $this->config['site']['default_locale'];

                    // Get redirect URL.
                    $redirectUrl = $this->params()->fromPost('redirect_url', '');

                    if (! empty($redirectUrl)) {
                        // The below check is to prevent possible redirect attack
                        // (if someone tries to redirect user to another domain).
                        $uri = new Uri($redirectUrl);
                        if (! $uri->isValid() || $uri->getHost() != null)
                            throw new \Exception('Incorrect redirect URL: ' . $redirectUrl);
                    }
                    // If redirect URL is provided, redirect the user to that URL;
                    // otherwise redirect to Home page.
                    if (empty($redirectUrl)) {
                        return $this->redirect()->toRoute('backend');
                    } else {
                        $this->redirect()->toUrl($redirectUrl);
                    }
                }
            }
        }

        return new ViewModel([
            'form' => $form,
            'redirectUrl' => $redirectUrl
        ]);
    }

    public function logoutAction()
    {
        $this->authManager->logout();

        $sessionUser = new Container('backend');
        $sessionUser->getManager()->getStorage()->clear('backend');

        return $this->redirect()->toRoute('backend/default', [
            'action' => 'login'
        ]);
    }
}
