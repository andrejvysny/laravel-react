<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TransactionRuleController;
use App\Http\Controllers\GoCardlessController;

Route::get('/', function () {

    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');

    Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');

    Route::get('/accounts/{id}', [AccountController::class, 'show'])->name('accounts.show');

    // Transaction Rules
    Route::get('/transaction-rules', [TransactionRuleController::class, 'index'])->name('transaction-rules.index');
    Route::post('/transaction-rules', [TransactionRuleController::class, 'store'])->name('transaction-rules.store');
    Route::put('/transaction-rules/{rule}', [TransactionRuleController::class, 'update'])->name('transaction-rules.update');
    Route::delete('/transaction-rules/{rule}', [TransactionRuleController::class, 'destroy'])->name('transaction-rules.destroy');
    Route::post('/transaction-rules/reorder', [TransactionRuleController::class, 'reorder'])->name('transaction-rules.reorder');
});

// GoCardless routes
Route::middleware(['auth'])->group(function () {
    Route::get('/api/gocardless/institutions', [GoCardlessController::class, 'getInstitutions']);
    Route::post('/api/gocardless/import', [GoCardlessController::class, 'importAccount']);
    Route::get('/api/gocardless/callback', [GoCardlessController::class, 'handleCallback'])->name('gocardless.callback');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
