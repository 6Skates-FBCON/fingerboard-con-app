# Push Notifications Setup

Push notifications have been fully integrated into the Fingerboard Con app.

## Features

- **Automatic Token Management**: Users' push notification tokens are automatically registered when they log in
- **Admin Dashboard**: Admins can send push notifications to all attendees from the Staff Dashboard
- **Secure**: Only authenticated admins can send notifications
- **Database Storage**: Push tokens are securely stored in Supabase with Row Level Security

## How It Works

### For Users

1. When users log in, the app automatically requests notification permissions
2. If granted, their device token is saved to the database
3. Users will receive notifications when admins send them
4. Tokens are automatically updated when the app is opened

### For Admins

1. Navigate to the **Staff** tab
2. Tap **Send Notifications**
3. Enter a title and message
4. Tap **Send Notification**
5. All users with the app installed will receive the notification

## Database Schema

A new `push_tokens` table has been created with:
- `id`: Unique identifier
- `user_id`: Reference to the user
- `expo_push_token`: The Expo push token
- `device_id`: Device identifier
- `created_at`: When the token was first registered
- `updated_at`: Last time the token was updated

## Edge Function

A new edge function `send-notification` has been deployed that:
- Validates admin permissions
- Fetches push tokens from the database
- Sends notifications via Expo's push service
- Handles batching for large numbers of recipients

## Security

- Push tokens can only be read/written by the token owner
- Admins can view all tokens (required for sending notifications)
- Only admins with `role = 'admin'` can send notifications
- All endpoints require authentication

## Testing

To test notifications:

1. Build and run the app on a physical device (notifications don't work in simulators)
2. Log in with an admin account
3. Go to Staff → Send Notifications
4. Send a test notification
5. Check that you receive it on your device

## Platform Support

- **iOS**: Full support (requires physical device)
- **Android**: Full support (requires physical device)
- **Web**: Not supported (web push notifications use a different system)

## Important Notes

- Notifications only work on physical devices, not simulators/emulators
- Users must grant notification permissions
- The app must be built with EAS or Expo Dev Client for notifications to work
- Tokens are automatically cleaned up when users are deleted (CASCADE)
