<?php

namespace App\Jobs;

use App\Mail\CampaignEmail;
use App\Models\Campaign;
use App\Models\CampaignSubscriber;
use App\Models\EmailTemplate;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class SendCampaignEmails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Campaign $campaign;

    /**
     * Create a new job instance.
     */
    public function __construct(Campaign $campaign)
    {
        $this->campaign = $campaign;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $campaign = $this->campaign->fresh(['campaignSubscribers.subscriber']);

        // Get email template if assigned
        $template = $campaign->template_id
            ? EmailTemplate::find($campaign->template_id)
            : null;

        $baseSubject = $campaign->subject;

        foreach ($campaign->campaignSubscribers->where('status', 'pending') as $recipient) {
            try {
                $subscriber = $recipient->subscriber;

                // 🔐 Ensure unsubscribe token exists
                if (!$subscriber->unsubscribe_token) {
                    $subscriber->unsubscribe_token = Str::random(32);
                    $subscriber->save();
                }

                // 🧩 Merge content
                $rawBody = $template ? $template->body : $campaign->body;
                $htmlContent = $this->mergeTemplateContent($rawBody, $subscriber, $campaign);

                // 📧 Send mail
                Mail::to($subscriber->email)->send(
                    new CampaignEmail($baseSubject, $htmlContent)
                );

                // ✅ Update status
                $recipient->update([
                    'status' => 'sent',
                    'sent_at' => Carbon::now(),
                    'error_message' => null,
                ]);
            } catch (\Exception $e) {
                // ❌ Log error
                $recipient->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        // ✅ Final status update
        $campaign->update(['status' => 'completed']);
    }

    /**
     * Replace placeholders with real values.
     */
    private function mergeTemplateContent(string $body, $subscriber, Campaign $campaign): string
    {
        // Ensure unsubscribe token exists
        if (!$subscriber->unsubscribe_token) {
            $subscriber->unsubscribe_token = Str::random(32);
            $subscriber->save();
        }

        $unsubscribeLink = url("/unsubscribe/{$subscriber->id}/{$subscriber->unsubscribe_token}");

        $replacements = [
            '{{name}}' => $subscriber->name ?? 'Subscriber',
            '{{email}}' => $subscriber->email,
            '{{campaign_title}}' => $campaign->title,
            '{{unsubscribe_link}}' => $unsubscribeLink,
        ];

        return strtr($body, $replacements); // ✅ Safely replaces all placeholders
    }
}
