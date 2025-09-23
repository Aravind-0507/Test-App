<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Payment;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        Payment::create([
            'user_id' => 1, // change to a valid user_id if you have users
            'receipt' => 'rcpt_test1234',
            'order_id' => 'order_test_ABC123',
            'payment_id' => null, // will be filled after verification
            'amount' => 50000, // in paise (₹500)
            'status' => 'created',
            'meta' => json_encode(['test' => 'sample meta data']),
        ]);
    }
}