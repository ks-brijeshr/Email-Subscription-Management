<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'subject',
        'body',
    ];

    /**
     * The user who owns this template (null = default).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
