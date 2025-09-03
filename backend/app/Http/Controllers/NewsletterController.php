<?php

namespace App\Http\Controllers;

use App\Services\NewsletterService;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\UserSubscribeRequest;
use App\Http\Resources\UserSubscriberResource;
use App\Models\Notification;
use Illuminate\Support\Facades\Auth;

class NewsletterController extends Controller
{
    protected $newsletterService;

    public function __construct(NewsletterService $newsletterService)
    {
        $this->newsletterService = $newsletterService;
    }


    public function subscribe(UserSubscribeRequest $request)
    {
        try {
            if (!$this->newsletterService->isBusinessEmail($request->email)) {
                return response()->json(['message' => 'Only business emails are allowed.'], 403);
            }

            if ($this->newsletterService->isTemporaryEmail($request->email)) {
                return response()->json(['message' => 'Temporary emails are not allowed.'], 403);
            }

            // Subscribe User
            $result = $this->newsletterService->subscribe($request->name, $request->email);

            if (isset($result['error'])) {
                return response()->json(['message' => $result['error']], $result['status']);
            }

            // Create Notification
            Notification::create([
                'title' => 'New Subscriber',
                'message' => 'A new subscriber (' . $request->email . ') has joined.',
                'read' => false,
                'user_id' => Auth::id() ?? 1, // or the admin/owner id if available
            ]);

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => new UserSubscriberResource((object)$result['subscriber'])
            ], 200);
        } catch (\Exception $e) {
            Log::error('Newsletter Subscription Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to subscribe.'], 500);
        }
    }
}
