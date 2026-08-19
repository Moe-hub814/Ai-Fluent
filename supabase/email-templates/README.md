# Lumicamp auth email templates

The app signs users in with a 6-digit email OTP (`supabase.auth.signInWithOtp` → `verifyOtp`).
Supabase only puts the code in the email if the template contains `{{ .Token }}`; the default
template only has a confirmation button, which is why testers saw "Confirm & Start Learning" and no code.

Apply in **Supabase Dashboard → Authentication → Email Templates**:

| Template        | Subject                                   | Body                    |
|-----------------|-------------------------------------------|-------------------------|
| Magic Link      | `Your Lumicamp sign-in code: {{ .Token }}` | `magic-link.html`       |
| Confirm signup  | `Your Lumicamp sign-in code: {{ .Token }}` | `magic-link.html`       |

Also check **Authentication → URL Configuration**: Site URL and Redirect URLs must include the
production Lumicamp domain so the "Open Lumicamp" button lands in the app, and
**Authentication → Providers → Email**: "Confirm email" may stay on; "Secure email change" unaffected.

Both templates are set to the same HTML so new *and* returning users get the code.
