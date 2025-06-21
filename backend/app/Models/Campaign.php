<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'subject',
        'body',
        'template_id', 
        'subscription_list_ids',
        'schedule_time',
        'status',
    ];

    protected $casts = [
        'subscription_list_ids' => 'array',
        'schedule_time' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function campaignSubscribers()
    {
        return $this->hasMany(CampaignSubscriber::class);
    }

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }
}
