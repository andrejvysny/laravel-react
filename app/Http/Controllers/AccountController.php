<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function index()
    {
        $accounts = Account::all();

        return Inertia::render('accounts', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'account_id' => 'required|string|max:255', 
            'bank_name' => 'required|string|max:255',
            'iban' => 'required|string|max:255',
            'currency' => 'required|string|max:3',
            'balance' => 'required|numeric',
        ]);

            $account = Account::create($validated);

        return redirect()->back();
    }

    public function show($id)
    {

        $account = Account::all()->find($id);

        if (!$account) {
            return redirect()->route('accounts.index')->with('error', 'Account not found');
        }

        // Get the transactions for this account
        $transactions = $account->transactions()->get();


        // Calculate monthly summaries for this account
        $monthlySummaries = [];


        return Inertia::render('account-detail', [
            'account' => $account,
            'transactions' => $transactions,
            'monthlySummaries' => $monthlySummaries,
        ]);
    }

}
