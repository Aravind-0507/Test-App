<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('receipt')->nullable();
            $table->string('order_id')->nullable();   
            $table->string('payment_id')->nullable(); 
            $table->integer('amount')->nullable();   
            $table->string('currency')->default('INR');
            $table->string('status')->default('created'); 
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};