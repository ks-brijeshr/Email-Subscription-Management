<?php

namespace App\Http\Controllers;

use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmailTemplateController extends Controller
{
    //List all templates for the logged-in user
    public function index()
    {
        $userId = Auth::id();

        $templates = EmailTemplate::whereNull('user_id')
            ->orWhere('user_id', $userId)
            ->get();

        return response()->json([
            'status' => 'success',
            'templates' => $templates
        ]);
    }

    //View a specific template
    public function show($id)
    {
        $template = EmailTemplate::where('id', $id)
            ->where(function ($query) {
                $query->whereNull('user_id')
                      ->orWhere('user_id', Auth::id());
            })
            ->firstOrFail();

        return response()->json([
            'status' => 'success',
            'template' => $template
        ]);
    }

    // Update template (only user’s own templates)
    public function update(Request $request, $id)
    {
        $template = EmailTemplate::where('id', $id)
            ->where('user_id', Auth::id()) // only allow updating user's own templates
            ->firstOrFail();

        $template->update($request->only(['name', 'subject', 'body']));

        return response()->json([
            'status' => 'success',
            'message' => 'Template updated successfully.',
            'template' => $template
        ]);
    }
}
