<?php

namespace App\Http\Controllers;

use App\Jobs\SendCampaignEmails;
use App\Models\Campaign;
use App\Models\CampaignSubscriber;
use App\Models\EmailTemplate;
use App\Models\Subscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class CampaignController extends Controller
{
    /**
     * Create a new campaign
     */
    public function store(Request $request)
    {
        $rules = [
            'template_id' => 'nullable|exists:email_templates,id',
            'subscription_list_ids' => 'required|array|min:1',
            'schedule_time' => 'nullable|date|after_or_equal:now',
        ];

        // Add title/subject/body only if no template is selected
        if (!$request->template_id) {
            $rules['title'] = 'required|string|max:255';
            $rules['subject'] = 'required|string|max:255';
            $rules['body'] = 'required|string';
        }

       
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
          
            $template = $request->template_id
                ? EmailTemplate::findOrFail($request->template_id)
                : null;

            // Use template data or user input
            $title = $template ? $template->name : $request->title;
            $subject = $template ? $template->subject : $request->subject;
            $body = $template ? $template->body : $request->body;

            
            $campaign = Campaign::create([
                'user_id' => Auth::id(),
                'title' => $title,
                'subject' => $subject,
                'body' => $body,
                'template_id' => $request->template_id,
                'subscription_list_ids' => $request->subscription_list_ids,
                'schedule_time' => $request->schedule_time ? Carbon::parse($request->schedule_time) : null,
                'status' => $request->schedule_time ? 'scheduled' : 'draft',
            ]);

            //Link Subscribers
            $subscribers = Subscriber::whereIn('list_id', $request->subscription_list_ids)->get();

            foreach ($subscribers as $subscriber) {
                CampaignSubscriber::create([
                    'campaign_id' => $campaign->id,
                    'subscriber_id' => $subscriber->id,
                    'status' => 'pending',
                ]);
            }

            DB::commit();

            //Dispatch email sending job if immediate
            if (!$campaign->schedule_time) {
                dispatch(new SendCampaignEmails($campaign));
                $campaign->update(['status' => 'sending']);
            }

            return response()->json([
                'message' => 'Campaign created successfully.',
                'campaign' => $campaign->fresh(),
                'total_recipients' => $subscribers->count(),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create campaign.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
