<?php

namespace App\Services;

use App\Models\Subscriber;
use App\Models\SubscriptionList;

class NewsletterService
{
    public function subscribe(string $name, string $email)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Please enter a valid email address.', 'status' => 422];
        }

        if (!$this->isBusinessEmail($email)) {
            return ['error' => 'Only business emails are allowed.', 'status' => 403];
        }

        if ($this->isTemporaryEmail($email)) {
            return ['error' => 'Temporary emails are not allowed.', 'status' => 403];
        }


        $allowedDomains = ['system.in', 'systems.in'];
        $domain = substr(strrchr($email, "@"), 1);

        if (!in_array($domain, $allowedDomains) && !checkdnsrr($domain, 'MX')) {
            return ['error' => 'Email domain is invalid or does not exist.', 'status' => 422];
        }

        $newsLetter = SubscriptionList::where('name', 'News letter')->first();
        $welcomeMail = SubscriptionList::where('name', 'Welcome mail')->first();

        if (!$newsLetter || !$welcomeMail) {
            return ['error' => 'Subscription lists not found.', 'status' => 404];
        }

        $subscriberExistsInNewsLetter = Subscriber::where('email', $email)
            ->where('list_id', $newsLetter->id)
            ->exists();
        $subscriberExistsInWelcomeMail = Subscriber::where('email', $email)
            ->where('list_id', $welcomeMail->id)
            ->exists();

        if ($subscriberExistsInNewsLetter && $subscriberExistsInWelcomeMail) {
            return ['error' => 'You are already subscribed to these lists.', 'status' => 409];
        }

        if (!$subscriberExistsInNewsLetter) {
            Subscriber::create([
                'list_id' => $newsLetter->id,
                'name' => $name,
                'email' => $email,
                'status' => 'active'
            ]);
        }

        if (!$subscriberExistsInWelcomeMail) {
            Subscriber::create([
                'list_id' => $welcomeMail->id,
                'name' => $name,
                'email' => $email,
                'status' => 'active'
            ]);
        }

        return [
            'success' => true,
            'message' => 'Subscription successful.',
            'subscriber' => [
                'name' => $name,
                'email' => $email,
                'status' => 'active',
                'lists' => [$newsLetter->name, $welcomeMail->name]
            ]
        ];
    }

    public function isBusinessEmail(string $email): bool
    {
        $personalDomains = [
            'gmail.com',
            'yahoo.co.in',
            'outlook.com',
            'hotmail.com',
            'yahoo.co.uk',
            'yahoo.com',
            'aol.com',
            'icloud.com',
            'protonmail.com',
            'live.com'
        ];

        $domain = strtolower(substr(strrchr($email, "@"), 1));
        if (in_array($domain, $personalDomains)) {
            return false;
        }
        // Block domains less than 5 characters before the TLD
        $parts = explode('.', $domain);
        if (count($parts) < 2 || strlen($parts[0]) < 5) {
            return false;
        }
        return true;
    }

    public function isTemporaryEmail(string $email): bool
    {
        $tempDomains = [
            'temp.com',
            'tempmail.net',
            'temp-mail.com',
            'tempmail.com',
            'mailinator.com',
            'guerrillamail.com',
            '10minutemail.com',
            'temp-mail.org',
            'throwawaymail.com',
            'abcde.com'
        ];

        $domain = substr(strrchr($email, "@"), 1);
        return in_array(strtolower($domain), $tempDomains);
    }
}
