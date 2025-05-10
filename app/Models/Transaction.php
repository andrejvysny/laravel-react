<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'amount',
        'currency',
        'booked_date',
        'processed_date',
        'description',
        'target_iban',
        'source_iban',
        'partner',
        'type',
        'metadata',
        'balance_after_transaction',
        'account_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'booked_date' => 'datetime',
        'processed_date' => 'datetime',
        'amount' => 'decimal:2',
        'balance_after_transaction' => 'decimal:2',
        'metadata' => 'json',
        'currency' => 'string',
        'type' => 'string',
    ];

    /**
     * Transaction type constants
     */
    public const TYPE_TRANSFER = 'TRANSFER';

    public const TYPE_CARD_PAYMENT = 'CARD_PAYMENT';

    public const TYPE_EXCHANGE = 'EXCHANGE';

    public const TYPE_WITHDRAWAL = 'WITHDRAWAL';

    public const TYPE_DEPOSIT = 'DEPOSIT';

    /**
     * Currency constants
     */
    public const CURRENCY_EUR = 'EUR';

    public const CURRENCY_USD = 'USD';

    public const CURRENCY_GBP = 'GBP';

    /**
     * Get the account that owns the transaction.
     */
    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }
}
