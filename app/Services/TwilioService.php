<?php
namespace App\Services;

use Twilio\Rest\Client;

class TwilioService
{
    protected $client;
    protected $from;

    public function __construct()
    {
        $this->client = new Client(env('TWILIO_SID'), env('TWILIO_AUTH_TOKEN'));
        $this->from = 'whatsapp:' . env('TWILIO_WHATSAPP_FROM');
    }

    public function sendWhatsApp($to, $message)
    {
        if (strpos($to, 'whatsapp:') !== 0) {
            $to = 'whatsapp:' . $to;
        }
        return $this->client->messages->create($to, [
            'from' => $this->from,
            'body' => $message,
        ]);
    }
}