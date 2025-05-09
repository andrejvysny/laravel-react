<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_id')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3);
            $table->dateTime('booked_date');
            $table->dateTime('processed_date');
            $table->text('description');
            $table->string('target_iban', 34)->nullable();
            $table->string('source_iban', 34)->nullable();
            $table->string('partner');
            $table->string('type');
            $table->json('metadata')->nullable();
            $table->decimal('balance_after_transaction', 10, 2);
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
}; 