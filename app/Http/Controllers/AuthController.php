<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\LoginUserRequest;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Undocumented function
     *
     * @param LoginUserRequest $request
     * @return void
     */
    public function login(LoginUserRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user->tokens()->delete(); // Revoke previous tokens before issuing a new one

        $token = $user->createToken('auth_token')->plainTextToken; // Generate a new token

        $user->update(['api_token' => $token]); //store token in users table

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'token' => $token
        ], 200);
    }
}
