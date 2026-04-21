<?php

namespace App\Http\Controllers;

use App\Models\MailAccount;
use Illuminate\Http\Request;

class MailAccountController extends Controller
{
    public function index()
    {
        return response()->json(MailAccount::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|unique:mail_accounts',
            'host' => 'required|string',
            'port' => 'required|integer',
            'encryption' => 'required|string',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'from_address' => 'required|email',
            'from_name' => 'required|string',
        ]);

        $account = MailAccount::create($validated);
        return response()->json($account, 201);
    }

    public function update(Request $request, MailAccount $mailAccount)
    {
        $validated = $request->validate([
            'category' => 'required|string|unique:mail_accounts,category,' . $mailAccount->id,
            'host' => 'required|string',
            'port' => 'required|integer',
            'encryption' => 'required|string',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'from_address' => 'required|email',
            'from_name' => 'required|string',
            'is_active' => 'boolean',
        ]);

        // Only update password if provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $mailAccount->update($validated);
        return response()->json($mailAccount);
    }

    public function destroy(MailAccount $mailAccount)
    {
        $mailAccount->delete();
        return response()->json(null, 204);
    }
}
