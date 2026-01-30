# Implementation Plan - OTP Email Verification

The user requested to manually enter a verification code instead of using an email link.

## Goal Description
Switch the email verification mechanism from a "Magic Link" to a "6-digit OTP Code".
- **Backend**: Generate 6-digit random code, send via email, verify via API.
- **Frontend**: Update post-registration UI to allow inputting the code directly.

## User Review Required
> [!IMPORTANT]
> This change impacts the verification flow. The "VerifyEmail" page (link handling) will basically become obsolete for registration, although we can keep it for backward compatibility or direct links if needed. For now, the primary flow will be **Manual Entry**.

## Proposed Changes

### Backend (`server/routes/auth.js`)
#### [MODIFY] [auth.js](file:///c:/Users/Adonis/Downloads/App/server/routes/auth.js)
- Change `verificationToken` generation to 6-digit number.
- Update `nodemailer` template to display the code prominently.
- Update `/verify` endpoint to accept `{ email, code }` instead of `{ token }`.

### Frontend (`src/pages/Auth.tsx`)
#### [MODIFY] [Auth.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/Auth.tsx)
- Add state for `verificationCode` input.
- Replace the "Check your inbox" static success view with a new **Verification Form**.
- Add `handleVerify` function to call the modified API.
- On success, log the user in automatically or redirect to login.

## Verification Plan

### Manual Verification
1.  **Register**: Create a new account `otp_user`.
2.  **Check UI**: Ensure "Enter Verification Code" screen appears immediately.
3.  **Check Terminal/Email**: Get the 6-digit code from Docker logs or real email.
4.  **Enter Code**: Input the code and submit.
5.  **Result**: Should verify successfully and allow login.
