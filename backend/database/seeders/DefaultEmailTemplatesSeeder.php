<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmailTemplate;

class DefaultEmailTemplatesSeeder extends Seeder
{
    public function run(): void
    {
        $footer = '
            <p style="font-size: 12px; text-align: center; color: #888; margin-top: 40px;">
                You’re receiving this email because you subscribed to our updates.<br>
                <a href="{{unsubscribe_link}}" style="color: #e74c3c; text-decoration: underline;">Unsubscribe</a>
            </p>
        ';

        $templates = [
            [
                'name' => 'Welcome Email',
                'subject' => '🎉 Welcome to Our Service!',
                'body' => '
                    <div style="font-family: Arial, sans-serif; background: #f0fdf4; padding: 20px;">
                        <div style="background: #ffffff; border-radius: 10px; padding: 30px; max-width: 600px; margin: auto; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                            <h2 style="color: #10b981;">Welcome, {{name}}! 🎉</h2>
                            <p style="font-size: 16px;">We’re excited to have you on board! Start exploring your new account and enjoy all the features we’ve crafted just for you.</p>
                            <p style="font-size: 14px; color: #666;">If you ever need help, feel free to reach out to us anytime.</p>
                            <hr style="margin: 30px 0;">
                            <p style="font-size: 13px; color: #999;">Cheers,<br>The Team</p>
                            ' . $footer . '
                        </div>
                    </div>
                ',
            ],
            [
                'name' => 'Discount Offer',
                'subject' => '💸 Limited-Time Offer: Get 30% Off Now!',
                'body' => '
                    <div style="font-family: Arial, sans-serif; background: #fff7ed; padding: 20px;">
                        <div style="background: #ffffff; border-radius: 10px; padding: 30px; max-width: 600px; margin: auto; border: 1px solid #fcd34d;">
                            <h2 style="color: #f59e0b;">Special Deal for You, {{name}}!</h2>
                            <p style="font-size: 16px;">We’re offering you a <strong>limited-time 30% discount</strong> on our premium plans.</p>
                            <p style="font-size: 15px;">Use the code <code style="background: #fef3c7; padding: 3px 6px; border-radius: 4px;">SAVE30</code> at checkout to claim your discount.</p>
                            <a href="https://yourapp.com/pricing" style="display: inline-block; background: #f97316; color: white; padding: 12px 20px; margin: 20px 0; text-decoration: none; border-radius: 6px;">Upgrade Now</a>
                            <p style="font-size: 13px; color: #999;">Hurry, this offer expires in 48 hours!</p>
                            ' . $footer . '
                        </div>
                    </div>
                ',
            ],
            [
                'name' => 'Weekly Newsletter',
                'subject' => '📰 Your Weekly Digest is Here!',
                'body' => '
                    <div style="font-family: Arial, sans-serif; background-color: #ecf4ff; padding: 20px;">
                        <div style="background: #ffffff; border-radius: 10px; padding: 30px; max-width: 600px; margin: auto;">
                            <h2 style="color: #2563eb;">Hello {{name}}, here’s your weekly update:</h2>
                            <ul style="font-size: 15px; line-height: 1.6; color: #334155;">
                                <li>🆕 New feature: Smart Subscriber Insights</li>
                                <li>🔒 Security update: 2FA now available</li>
                                <li>📈 Blog: Growing your email audience in 2025</li>
                            </ul>
                            <p style="font-size: 14px; color: #64748b;">We hope you enjoy this week’s roundup. See you next week!</p>
                            ' . $footer . '
                        </div>
                    </div>
                ',
            ],
            [
                'name' => 'Account Reminder',
                'subject' => '🔔 Don’t Miss Out! Update Your Preferences',
                'body' => '
                    <div style="font-family: Arial, sans-serif; background: #f0f9ff; padding: 20px;">
                        <div style="background: #ffffff; border-radius: 10px; padding: 30px; max-width: 600px; margin: auto;">
                            <h2 style="color: #0ea5e9;">Hey {{name}}, let’s stay connected</h2>
                            <p style="font-size: 16px;">It’s been a while! We’d love to know what kind of content you’re interested in.</p>
                            <a href="https://yourapp.com/preferences" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 20px; margin: 20px 0; text-decoration: none; border-radius: 6px;">Update Preferences</a>
                            <p style="font-size: 14px; color: #6b7280;">You’re in control. Tailor your emails the way you want.</p>
                            ' . $footer . '
                        </div>
                    </div>
                ',
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::create(array_merge($template, ['user_id' => null]));
        }
    }
}
