<?php
namespace Application\Controller\Plugin;

use Zend\Mvc\Controller\Plugin\AbstractPlugin;
use Zend\Mail\Transport\Smtp as SmtpTransport;
use Zend\Mail\Transport\SmtpOptions;
use Zend\Mail\Message;
use Zend\Mime\Message as MimeMessage;
use Zend\Mime\Mime;
use Zend\Mime\Part as MimePart;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use Zend\View\Resolver\TemplatePathStack;
use Application\Entity\QuoteEmail;

class MailSenderPlugin extends AbstractPlugin
{
    private $em;
    private $config;

    public function __construct($entityManager, $config)
    {
        $this->em = $entityManager;
        $this->config = $config;
    }

    public function sendQuotesToClient($agentEmail, $agentName, $clientEmail, $data)
    {
        try{
            $mail = new Message();
            $mail->setEncoding('UTF-8');
            $mail->addFrom($agentEmail, $agentName);
            $mail->addTo($clientEmail);
            $mail->setSubject("Flight to ".$data['destination']." details - ".$this->config['site']['domain']);

            $renderer = new PhpRenderer();
            $resolver = new TemplatePathStack();
            $resolver->addPath('module/Backend/view/layout/emails');
            $renderer->setResolver($resolver);

            $data['agentName'] = $agentName;
            $data['agentEmail'] = $agentEmail;
            $htmlViewPart = new ViewModel($data);
            $htmlViewPart->setTemplate('offers-for-client.phtml');

            $htmlOutput = $renderer->render($htmlViewPart);

            $html = new MimePart($htmlOutput);
            $html->type = Mime::TYPE_HTML;
            $html->charset = 'utf-8';
            $html->encoding = Mime::ENCODING_QUOTEDPRINTABLE;
            $body = new MimeMessage();
            $body->addPart($html);
            $mail->setBody($body);
            $this->getTransport()->send($mail);

            $this->saveQuoteEmail($clientEmail, $htmlOutput, $data['quoteId']);
            return true;
        }catch (\Exception $e){
            return false;
        }
    }

    public function saveQuoteEmail($email, $text, $quoteId)
    {
        try{
        $quote = $this->em->getReference('Application\Entity\Quote',$quoteId);
        $quoteEmail = new QuoteEmail();
        $quoteEmail->setEmail($email);
        $quoteEmail->setText($text);
        $quoteEmail->setQuote($quote);

        $this->em->persist($quoteEmail);
        $this->em->flush($quoteEmail);
        return true;
        }catch (\Exception $e){
            return false;
        }
    }

    public function sendInfoToAgent($subject, $text)
    {
        try{
            $emailTo = $this->config['smtp']['info_to'];
            $mail = new Message();
            $mail->setEncoding('UTF-8');
            $mail->addFrom($this->config['smtp']['username'], $this->config['site']['siteTitle']);
            $mail->addTo($emailTo);
            $mail->setSubject($subject);

            $renderer = new PhpRenderer();
            $resolver = new TemplatePathStack();
            $resolver->addPath('module/Backend/view/layout/emails');
            $renderer->setResolver($resolver);

            $htmlViewPart = new ViewModel(['text' => $text, 'siteName' => $this->config['site']['siteName']]);
            $htmlViewPart->setTemplate('info-for-agent.phtml');

            $htmlOutput = $renderer->render($htmlViewPart);

            $html = new MimePart($htmlOutput);
            $html->type = Mime::TYPE_HTML;
            $html->charset = 'utf-8';
            $html->encoding = Mime::ENCODING_QUOTEDPRINTABLE;
            $body = new MimeMessage();
            $body->addPart($html);
            $mail->setBody($body);
            $this->getTransport()->send($mail);
            return true;
        }catch (\Exception $e){
            echo $e->getMessage();
            return false;
        }
    }

    public function sendInfoToMe($subject, $text)
    {
        try{
            $emailTo = 'sb@zeit.style';
            $mail = new Message();
            $mail->setEncoding('UTF-8');
            $mail->addFrom($this->config['smtp']['username'], $this->config['site']['siteTitle']);
            $mail->addTo($emailTo);
            $mail->setSubject($subject);

            $renderer = new PhpRenderer();
            $resolver = new TemplatePathStack();
            $resolver->addPath('module/Backend/view/layout/emails');
            $renderer->setResolver($resolver);

            $htmlViewPart = new ViewModel(['text' => $text]);
            $htmlViewPart->setTemplate('info-for-agent.phtml');

            $htmlOutput = $renderer->render($htmlViewPart);

            $html = new MimePart($htmlOutput);
            $html->type = Mime::TYPE_HTML;
            $html->charset = 'utf-8';
            $html->encoding = Mime::ENCODING_QUOTEDPRINTABLE;
            $body = new MimeMessage();
            $body->addPart($html);
            $mail->setBody($body);
            $this->getTransport()->send($mail);
            return true;
        }catch (\Exception $e){
            return false;
        }
    }

    public function getTransport()
    {
        $transport = new SmtpTransport();
        $options   = new SmtpOptions([
            'name' => 'yandex',
            'host' => 'smtp.yandex.com',
            'port' => 465,
            'connection_class'  => 'login',
            'connection_config' => [
                'username' => $this->config['smtp']['username'],
                'password' => $this->config['smtp']['password'],
                'ssl'      => 'ssl',
            ],
        ]);
        $transport->setOptions($options);
        return $transport;
    }
}
