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
    // Step 1: Create cache table if missing
    if (!Schema::hasTable('cache')) {
        Artisan::call('cache:table');
        Artisan::call('migrate', ['--force' => true]);
    }

    // Step 2: Clear and cache config
    Artisan::call('config:clear');
    Artisan::call('cache:clear');
    Artisan::call('config:cache');

    // Step 3: Run migration safely
    if (!Schema::hasColumn('subscribers', 'unsubscribe_token')) {
        Artisan::call('migrate', ['--force' => true]);
    }

    // Step 4: Run one job from queue
    Artisan::call('queue:work', [
        '--once' => true
    ]);

    return 'All artisan + queue worker (once) ran successfully!';
});
