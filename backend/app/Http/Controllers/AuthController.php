<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\DailySignup;
use Illuminate\Http\Request;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Log;
use App\Models\EmailVerificationLog;
use App\Services\ActivityLogService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use App\Http\Requests\RegisterRequest;


class AuthController extends Controller
{
    protected ActivityLogService $activityLogService;
    protected AuthService $authService;


    public function __construct(AuthService $authService, ActivityLogService $activityLogService)
    {
        $this->authService = $authService;
        $this->activityLogService = $activityLogService;
    }

    /**
     * Handle user registration
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['is_owner'] = filter_var($request->input('is_owner', false), FILTER_VALIDATE_BOOLEAN);

        // Register user and clone default email templates
        $user = $this->authService->register($data);

        // Log the user in
        Auth::login($user);

        // Log registration activity
        $this->activityLogService->logActivity('User registered', $request);

        // Return JSON response
        return response()->json([
            'status' => 'success',
            'message' => 'User registered successfully. Please verify your email.',
            'is_owner' => $user->is_owner,
            'user' => $user
        ], 201);
    }





    /**
     * Handle user login
     */
    // public function login(LoginRequest $request): JsonResponse
    // {
    //     // Get the response from the AuthService
    //     $response = $this->authService->login($request->validated());

    //     // Decode the response to check if it was successful
    //     if ($response->getStatusCode() === 200) {
    //         // Log login activity now that the user is authenticated
    //         $user = auth('sanctum')->user(); // Optional: fallback to request()->user()
    //         if ($user) {
    //             $this->activityLogService->logActivity('logged in');
    //         }
    //     }

    //     return $response;
    // }


    public function login(LoginRequest $request): JsonResponse
    {
        // $response = $this->authService->login($request);
        // return response()->json($response, $response['status']);

        return $this->authService->login($request);
        // return $this->authService->login($request->validated());
    }




    /**
     * Handle email verification when user clicks the verify email link
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Invalid verification link.'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 200);
        }

        $user->markEmailAsVerified();
        event(new Verified($user));

        // Log email verification as "passed"
        EmailVerificationLog::updateOrCreate(
            ['user_id' => $user->id],
            ['status' => 'passed', 'attempted_at' => now()]
        );

        $this->activityLogService->logActivity('Email verified', $request);

        // Redirect to frontend after successful verification
        return redirect('http://localhost:5173/email/verified');
    }


    /**
     * Resend email verification link
     */
    public function resendVerificationEmail(Request $request): JsonResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified.'], 400);
        }

        $request->user()->sendEmailVerificationNotification();

        $this->activityLogService->logActivity('Resent verification email', $request);

        return response()->json(['message' => 'Verification email resent.'], 200);
    }

    /**
     * Logout removes the personal access token from databse
     *
     * @param Request $request
     * @return json response
     */
    // public function logout(Request $request)
    // {
    //     $user = $request->user();

    //     $user->tokens()->delete();

    //     $this->activityLogService->logActivity('logged out', $request);

    //     return response()->json([
    //         'status' => 200,
    //         'message' => 'Logout successful',
    //     ]);
    // }
    // app/Http/Controllers/AuthController.php

    public function logout(Request $request)
    {
        $user = $request->user();

        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'logout',
            'description' => 'User logged out',
            'subscription_list_id' => null, // ya pass karo if required
        ]);

        return response()->json(['message' => 'Logged out successfully']);
    }
}
