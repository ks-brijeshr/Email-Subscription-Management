<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CampaignEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $htmlContent;
    public $subject; // ❌ remove type declaration here

    /**
     * Create a new message instance.
     */
    public function __construct($subject, $htmlContent)
    {
        $this->subject = $subject;
        $this->htmlContent = $htmlContent;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject($this->subject)
            ->html($this->htmlContent);
    }
}
