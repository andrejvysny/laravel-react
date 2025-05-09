<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $accounts = Account::where('user_id', $user->id)->get();

        $recentTransactions = Transaction::whereIn('account_id', $accounts->pluck('id'))
            ->orderBy('booked_date', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('dashboard', [
            'accounts' => $accounts,
            'recentTransactions' => $recentTransactions,
        ]);
    }
} 