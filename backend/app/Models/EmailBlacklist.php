<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailBlacklist extends Model
{
    use HasFactory;

    protected $fillable = ['email', 'reason', 'blacklisted_by', 'subscription_list_id'];

    // Relationship with User (Who blacklisted)
    public function blacklistedBy()
    {
        return $this->belongsTo(\App\Models\User::class, 'blacklisted_by');
    }

    // Relationship with SubscriptionList
    public function subscriptionList(): BelongsTo
    {
        return $this->belongsTo(\App\Models\SubscriptionList::class, 'subscription_list_id');
    }
    public function subscriber()
    {
        return $this->belongsTo(Subscriber::class);
    }
}
