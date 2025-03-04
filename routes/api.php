<?php

use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::post('/password-reset', [PasswordResetController::class, 'sendResetLink']);
Route::post('/password-reset/confirm', [PasswordResetController::class, 'resetPassword']);
