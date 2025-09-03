<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CustomEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $subjectText;
    public $bodyText;
    public $fromEmail;

    public function __construct($subjectText, $bodyText, $fromEmail)
    {
        $this->subjectText = $subjectText;
        $this->bodyText = $bodyText;
        $this->fromEmail = $fromEmail;
    }

    public function build()
    {
        return $this
            ->from($this->fromEmail)
            ->subject($this->subjectText)
            ->html($this->bodyText); 
    }
}
