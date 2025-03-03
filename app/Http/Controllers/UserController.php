<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UserRegistrationRequest;



class UserController extends Controller
{
    /**
     * Undocumented function
     *
     * @param UserRegistrationRequest $request
     * @return void
     */
    public function register(UserRegistrationRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(),
            'is_owner' => filter_var($request->is_owner, FILTER_VALIDATE_BOOLEAN) // Force Boolean 


        ]);


        $token = $user->createToken('auth_token')->plainTextToken; // Generate and store API token

        $user->update(['api_token' => $token]); //store token in users table

        return response()->json([
            'status' => 'success',
            'message' => 'User successfully created',
            'token' => $token,
            'is_owner' => $user->is_owner,
            'user' => $user
        ], 201);
    }
}
