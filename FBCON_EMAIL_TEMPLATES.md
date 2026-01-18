# FBCon Email Templates Configuration

This document contains the custom email templates for FBCon that should be configured in your Supabase Dashboard.

## Configuration Steps

1. **Go to Supabase Dashboard** → Your Project
2. Navigate to **Authentication** → **Providers** → **Email**
3. Enable **"Confirm email"** checkbox
4. Navigate to **Authentication** → **Email Templates**
5. Update the templates below

## Sender Configuration

- **From Email**: noreply@fbcon.com (or your configured domain)
- **From Name**: Fingerboard Con (FBCon)
- **Reply To**: support@fbcon.com (optional)

---

## 1. Confirm Signup Email Template

**Subject:** Welcome to FBCon 2025 - Please Confirm Your Email

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header with FBCon Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #1A1A1A; font-size: 36px; font-weight: 900; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">2025</h1>
              <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">Fingerboard Con - Spring Edition</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1A1A1A; font-size: 24px; font-weight: 700;">Welcome to FBCon!</h2>

              <p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for registering for Fingerboard Con 2025! We're excited to have you join us for the ultimate fingerboarding experience.
              </p>

              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                To complete your registration and access your account, please confirm your email address by clicking the button below:
              </p>

              <!-- Confirmation Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #FFD700; color: #2E7D32; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);">
                      Confirm Your Email
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>

              <p style="margin: 0 0 24px 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #4CAF50; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <p style="margin: 0 0 16px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                This link will expire in 24 hours for security reasons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; text-align: center;">
                If you didn't create this account, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                © 2025 Fingerboard Con. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 2. Magic Link Email Template (Optional)

**Subject:** Your FBCon Sign-In Link

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header with FBCon Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #1A1A1A; font-size: 36px; font-weight: 900;">2025</h1>
              <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">Fingerboard Con</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1A1A1A; font-size: 24px; font-weight: 700;">Sign In to FBCon</h2>

              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Click the button below to securely sign in to your FBCon account:
              </p>

              <!-- Sign In Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #FFD700; color: #2E7D32; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700;">
                      Sign In to FBCon
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link:
              </p>

              <p style="margin: 0 0 16px 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #4CAF50; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                This link expires in 1 hour.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; text-align: center;">
                If you didn't request this link, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                © 2025 Fingerboard Con. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## 3. Password Recovery Email Template

**Subject:** Reset Your FBCon Password

### Option A: Full Styled Template (Recommended)

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

          <!-- Header with FBCon Branding -->
          <tr>
            <td style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #1A1A1A; font-size: 36px; font-weight: 900;">2025</h1>
              <p style="margin: 8px 0 0 0; color: #FFFFFF; font-size: 18px; font-weight: 600;">Fingerboard Con</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1A1A1A; font-size: 24px; font-weight: 700;">Reset Your Password</h2>

              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your FBCon account. Click the button below to create a new password:
              </p>

              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background-color: #FFD700; color: #2E7D32; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 700;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 16px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link:
              </p>

              <p style="margin: 0 0 16px 0; word-break: break-all;">
                <a href="{{ .ConfirmationURL }}" style="color: #4CAF50; text-decoration: underline; font-size: 14px;">{{ .ConfirmationURL }}</a>
              </p>

              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                This link expires in 1 hour for security reasons.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; text-align: center;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                © 2025 Fingerboard Con. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Option B: Simple Template (For Custom Redirect URL)

Use this if you need to manually specify the redirect URL. This is useful when you need explicit control over where users are sent after clicking the reset link.

**Body (HTML):**

```html
<h2>Reset Your Fingerboard Con Password</h2>

<p>Hi there,</p>

<p>You requested a password reset for your Fingerboard Con Boston 2026 account.</p>

<p>Click the button below to set a new password:</p>

<p><a href="https://fingerboardcon.com/reset-password?token_hash={{ .TokenHash }}&type=recovery" style="display: inline-block; padding: 12px 24px; background-color: #FFD700; color: #2E7D32; text-decoration: none; font-weight: bold; border-radius: 8px;">Reset Password</a></p>

<p>Or copy and paste this link into your browser:</p>
<p>https://fingerboardcon.com/reset-password?token_hash={{ .TokenHash }}&type=recovery</p>

<p><strong>This link will expire in 1 hour.</strong></p>

<p>If you didn't request this password reset, you can safely ignore this email.</p>

<p>See you at Fingerboard Con Boston 2026!<br>
April 24-26, 2026 • Tewksbury, MA</p>

<hr>
<p style="font-size: 12px; color: #666;">This email was sent to {{ .Email }}</p>
```

---

## Testing Emails

After configuring the templates:

1. Create a test account to verify email delivery
2. Check spam/junk folders if emails don't appear
3. Verify that all links work correctly
4. Test on multiple email clients (Gmail, Outlook, Apple Mail)

## Custom Domain (Optional)

To send emails from your own domain (e.g., noreply@fbcon.com):

1. Go to **Project Settings** → **Authentication** → **SMTP Settings**
2. Configure your SMTP provider (SendGrid, AWS SES, etc.)
3. Verify your domain with proper SPF and DKIM records
4. Update the "From" email address

## Support

For questions about email configuration, contact Supabase support or check the documentation at:
https://supabase.com/docs/guides/auth/auth-email-templates
