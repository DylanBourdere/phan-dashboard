<?php

namespace App\Controller;

use App\Entity\GretaPole;
use App\Entity\IncomingCall;
use App\Entity\User;
use App\Entity\UserDailyStatus;
use App\Entity\PurchaseRequest;
use App\Entity\Enum\PurchaseRequestStatus;
use App\Kernel as GretaPortalApp;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

abstract class AbstractPortalController extends AbstractController
{
    public function __construct(protected EntityManagerInterface $entityManager)
    {
    }

    protected function render(string $view, array $parameters = [], ?Response $response = null): Response
    {
        $callBadge = $this->entityManager->getRepository(IncomingCall::class)->countToBeHandledByUser($this->getUser());

if (empty($callBadge)) {
$callBadge = '';
}

$parameters['portal'] = [
'appName' => GretaPortalApp::NAME,
'appVersion' => GretaPortalApp::VERSION,
'menuElements' => [
[
'label' => 'Accueil',
'icon' => 'house',
'href' => $this->generateUrl('homepage'),
],
[
'label' => 'Base documentaire',
'icon' => 'folder-open',
'href' => $this->generateUrl('ecm_tree'),
],
[
'label' => 'Annuaire',
'icon' => 'address-book',
'href' => $this->generateUrl('user_public_list'),
],
[
'label' => 'Demandes entrantes',
'icon' => 'phone-volume',
'href' => $this->generateUrl('incoming_call_list'),
'badge' => $callBadge,
],
/*
[
'label' => 'Hello, world!',
'icon' => 'list',
'href' => '/',
'subelements' => [
[
'icon' => 'list',
'label' => 'World 1',
'href' => '/',
],
[
'separator_before' => true,
'icon' => 'list',
'label' => 'World 2',
'href' => '/',
],
],
],
*/
],
];

if ($this->isGranted(User::ROLE_ACCESS_PURCHASE_REQUESTS) || $this->isGranted(User::ROLE_PURCHASE_REQUEST_VALIDATOR)) {
$requestsBadge = '';

if ($this->isGranted(User::ROLE_PURCHASE_REQUEST_VALIDATOR)) {
$requestsToValidate = $this->entityManager->getRepository(PurchaseRequest::class)->count([
'validator' => $this->getUser(),
'status' => PurchaseRequestStatus::TO_BE_VALIDATED,
]);

if ($requestsToValidate > 0) {
$requestsBadge = $requestsToValidate;
}
}

$parameters['portal']['menuElements'][] = [
'label' => 'Achats',
'icon' => 'cart-shopping',
'href' => $this->generateUrl('purchase_request_list'),
'badge' => $requestsBadge,
];
}

if (null !== $this->getUser()->getZulipId()) {
$parameters['portal']['menuElements'][] = [
'id' => 'inbox',
'label' => 'Messagerie',
'icon' => 'comments',
'href' => $this->generateUrl('zulip'),
];
}

$poles = $this->entityManager->getRepository(GretaPole::class)->findByEnabled(true, [ 'name' => 'ASC' ]);

// Put the user pole on top of the list
$polesById = array_combine(
array_map(fn (GretaPole $pole): int => $pole->getId(), $poles),
$poles
);

unset($polesById[$this->getUser()->getGretaPole()->getId()]);
array_unshift($poles, $this->getUser()->getGretaPole());

$parameters['portal']['gretaPoles'] = array_values($poles);

$dailyStatuses = UserDailyStatus::STATUSES;
unset($dailyStatuses[UserDailyStatus::STATUS_ON_SITE]); // Handled by site
unset($dailyStatuses[UserDailyStatus::STATUS_ABSENT]); // Forbidden in this menu

$parameters['portal']['dailyStatuses'] = $dailyStatuses;

return parent::render($view, $parameters, $response);
}
}
