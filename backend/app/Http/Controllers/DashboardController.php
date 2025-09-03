<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Subscriber;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Models\EmailBlacklist;
use App\Models\SubscriptionList;
use Illuminate\Support\Facades\Log;
use App\Models\EmailVerificationLog;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $ownerId = $request->user()->id;
            $listId = $request->query('subscription_list_id');

            $subscriptionListIds = SubscriptionList::where('user_id', $ownerId)
                ->when($listId, fn($q) => $q->where('id', $listId))
                ->pluck('id');

            // Filter blacklisted emails by subscription list
            $blacklistedEmails = EmailBlacklist::where('blacklisted_by', $ownerId)
                ->whereIn('subscription_list_id', $subscriptionListIds)
                ->count();

            return response()->json([
                'totalSubscribers' => Subscriber::whereIn('list_id', $subscriptionListIds)->count(),
                'totalBlacklisted' => $blacklistedEmails,
                'totalSubscriptionLists' => $subscriptionListIds->count(),
                'totalEmailVerifications' => EmailVerificationLog::where('user_id', $ownerId)->count(),
                'totalActivityLogs' => ActivityLog::where('user_id', $ownerId)->count(),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('getStats error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to fetch stats'], 500);
        }
    }


    public function dashboardStats(Request $request)
    {
        try {
            $ownerId = $request->user()->id;
            $listId = $request->query('subscription_list_id');

            $subscriptionListIds = SubscriptionList::where('user_id', $ownerId)
                ->when($listId, fn($q) => $q->where('id', $listId))
                ->pluck('id');

            // Filter blacklisted emails by subscription list
            $blacklistedEmails = EmailBlacklist::where('blacklisted_by', $ownerId)
                ->whereIn('subscription_list_id', $subscriptionListIds)
                ->count();

            return response()->json([
                'totalSubscribers' => Subscriber::whereIn('list_id', $subscriptionListIds)->count(),
                'subscriptionListsCount' => $subscriptionListIds->count(),
                'recentSubscriptions' => Subscriber::whereIn('list_id', $subscriptionListIds)
                    ->latest()->take(5)->get(),
                'emailVerificationStatus' => [
                    'verified' => Subscriber::whereIn('list_id', $subscriptionListIds)
                        ->whereNotNull('email_verified_at')->count(),
                    'pending' => Subscriber::whereIn('list_id', $subscriptionListIds)
                        ->whereNull('email_verified_at')->count(),
                ],
                'blacklistedEmails' => $blacklistedEmails,
                'adminActivityLogs' => ActivityLog::where('user_id', $ownerId)
                    ->when($listId, fn($q) => $q->where('list_id', $listId))
                    ->latest()->take(5)->get(),
                'graphData' => $this->getSubscriberGrowthData($ownerId, $subscriptionListIds),
            ], 200);
        } catch (\Throwable $e) {
            Log::error('dashboardStats error: ' . $e->getMessage());
            return response()->json(['error' => 'Unable to fetch dashboard stats'], 500);
        }
    }



    public function getSubscriberGrowthData($ownerId, $subscriptionListIds)
    {
        return Subscriber::whereIn('list_id', $subscriptionListIds)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getSubscriberGrowth(Request $request)
    {
        try {
            $ownerId = $request->user()->id;
            $listId = $request->query('subscription_list_id');

            $subscriptionListIds = SubscriptionList::where('user_id', $ownerId)
                ->when($listId, fn($q) => $q->where('id', $listId))
                ->pluck('id');

            $growthData = Subscriber::whereIn('list_id', $subscriptionListIds)
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json($growthData);
        } catch (\Exception $e) {
            Log::error('Subscriber growth error: ' . $e->getMessage());
            return response()->json(['error' => 'Server error while fetching subscriber growth.'], 500);
        }
    }

    public function getOwnerSubscriptionLists(Request $request)
    {
        $ownerId = $request->user()->id;

        $lists = SubscriptionList::where('user_id', $ownerId)
            ->select('id', 'name')
            ->get();

        return response()->json($lists, 200);
    }

    public function getActivityLogs(Request $request)
    {
        $userId = $request->user()->id;
        $listId = $request->input('list_id');
        $perPage = $request->query('per_page', 10); // Default = 10

        $logs = ActivityLog::where('user_id', $userId)
            ->when($listId, fn($q) => $q->where('list_id', $listId))
            ->latest()
            ->paginate($perPage); // Laravel pagination

        return response()->json($logs);
    }


    public function getSubscriptionLists()
    {
        return response()->json(SubscriptionList::all(['id', 'name']));
    }
}
