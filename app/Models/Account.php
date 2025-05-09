<?php

namespace App\Models;

use App\Enums\Currency;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'name',
        'iban',
        'currency',
        'balance',
        'account_id',
        'bank_name',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'currency' => Currency::class,
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
} 