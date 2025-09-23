<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;
use Illuminate\Support\Str;
use App\Models\Payment;

class PaymentController extends Controller
{
    protected $api;

    public function __construct()
    {
        $this->api = new Api(env('RAZORPAY_KEY'), env('RAZORPAY_SECRET'));
    }

    public function createOrder(Request $request)
    {
        $request->validate(['amount' => 'required|numeric|min:1']);
        $amountInPaise = (int) round($request->amount * 100);
        $receipt = 'rcpt_' . Str::random(8);
        $order = $this->api->order->create([
            'receipt' => $receipt,
            'amount' => $amountInPaise,
            'currency' => 'INR',
            'payment_capture' => 1
        ]);
        $payment = Payment::create([
            'user_id' => $request->user()?->id,
            'receipt' => $receipt,
            'order_id' => $order['id'],
            'amount' => $amountInPaise,
            'status' => 'created',
            'meta' => json_encode([
            'order' => $order,
            'upi_option' => $request->upi_option ?? null,
            'card_option' => $request->card_option ?? null
        ])
        ]);
        return response()->json([
            'order' => $order,
            'payment_db_id' => $payment->id,
            'key' => env('RAZORPAY_KEY')
        ]);
    }

    public function verifyPayment(Request $request)
    {   
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
            'payment_db_id' => 'nullable|integer'
        ]);
        $attributes = [
            'razorpay_order_id' => $request->razorpay_order_id,
            'razorpay_payment_id' => $request->razorpay_payment_id,
            'razorpay_signature' => $request->razorpay_signature
        ];
        try {   
            $this->api->utility->verifyPaymentSignature($attributes);
            $paymentObj = $this->api->payment->fetch($request->razorpay_payment_id);
            if ($request->payment_db_id) {
                $p = Payment::find($request->payment_db_id);
                if ($p) {
                    $p->payment_id = $request->razorpay_payment_id;
                    $p->status = $paymentObj['status'] ?? 'captured';
                    $p->meta = json_encode($paymentObj);
                    $p->save();
                }
            }   
            return response()->json(['success' => true, 'payment' => $paymentObj]);
        } catch (SignatureVerificationError $e) {
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 400);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}