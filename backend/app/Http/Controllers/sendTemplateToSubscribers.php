<?php

namespace App\Http\Controllers;

use App\Mail\CustomEmail;
use App\Models\EmailTemplate;
use App\Models\SubscriptionList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class sendTemplateToSubscribers extends Controller
{
    public function sendTemplateToSubscribers(Request $request)
    {
        $request->validate([
            'subscription_list_id' => 'required|exists:subscription_lists,id',
            'template_id' => 'required|exists:email_templates,id',
        ]);

        $user = Auth::user();

        $template = EmailTemplate::where('id', $request->template_id)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            })->firstOrFail();

        $subscriptionList = SubscriptionList::where('id', $request->subscription_list_id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $subscribers = $subscriptionList->subscribers()->where('status', 'active')->get();

        foreach ($subscribers as $subscriber) {
            // Create unsubscribe token if not exists
            if (!$subscriber->unsubscribe_token) {
                $subscriber->unsubscribe_token = Str::random(32);
                $subscriber->save();
            }

            $unsubscribeLink = url("/unsubscribe/{$subscriber->id}/{$subscriber->unsubscribe_token}");

            $personalizedBody = str_replace(
                ['{{name}}', '{{email}}', '{{unsubscribe_link}}'],
                [$subscriber->name ?? '', $subscriber->email, $unsubscribeLink],
                $template->body
            );

            Mail::to($subscriber->email)->send(new CustomEmail(
                $template->subject,
                $personalizedBody,
                $user->email
            ));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Emails sent to all active subscribers.'
        ]);
    }
}
