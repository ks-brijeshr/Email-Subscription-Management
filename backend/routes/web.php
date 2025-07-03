<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UnsubscribeController;

Route::get('/', function () {
    return view('welcome');
});



// Since this is a UI feature, it should be in web.php instead of api.php
Route::get('/unsubscribe/{subscriberId}/{token}', [UnsubscribeController::class, 'showUnsubscribePage'])
    ->name('unsubscribe.confirm');

Route::post('/unsubscribe/{subscriberId}/{token}/confirm', [UnsubscribeController::class, 'confirmUnsubscribe'])
    ->name('unsubscribe.confirm.post');

Route::get('/unsubscribe/success', [UnsubscribeController::class, 'unsubscribeSuccess'])
    ->name('unsubscribe.success');

Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');





Route::get('/run-artisan', function () {
    // Just to be safe
    if (!Schema::hasTable('cache')) {
        Artisan::call('cache:table');
        Artisan::call('migrate', ['--force' => true]);
    }

    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('config:cache');

    // Check for duplicate column
    if (!Schema::hasColumn('subscribers', 'unsubscribe_token')) {
        Artisan::call('migrate', ['--force' => true]);
    }

    return 'All artisan commands ran successfully!';
});
