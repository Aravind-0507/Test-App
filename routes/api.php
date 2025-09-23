<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaymentController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/google-login', [AuthController::class, 'googleLogin']);
Route::apiResource('users', AuthController::class);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/payments/create-order', [PaymentController::class, 'createOrder']);
Route::post('/payments/verify', [PaymentController::class, 'verifyPayment']);