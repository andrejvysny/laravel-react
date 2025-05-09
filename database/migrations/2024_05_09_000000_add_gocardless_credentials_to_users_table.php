<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('gocardless_secret_id')->nullable();
            $table->string('gocardless_secret_key')->nullable();
            $table->string('gocardless_access_token')->nullable();
            $table->string('gocardless_refresh_token')->nullable();
            $table->timestamp('gocardless_token_expires_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'gocardless_secret_id',
                'gocardless_secret_key',
                'gocardless_access_token',
                'gocardless_refresh_token',
                'gocardless_token_expires_at'
            ]);
        });
    }
}; 