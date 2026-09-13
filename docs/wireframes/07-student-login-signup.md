# 07 · Student Login / Signup

Routes: `/(auth)/login`, `/(auth)/signup` (rebuilt in place; shared with business until 25).
Signup reads the `?role=` param from /role — the screen-1 handoff is now live.
Status: ✅ built — pending review.

## 1. What the wireframe shows (Login)

- **Full-bleed gradient hero**, ~1/3 of viewport, bottom corners rounded 24: blue-600 →
  teal/green wash. Centred 96dp WHITE rounded-24 tile with the blue hub glyph; below it
  "YuvaConnect" 32 extrabold DARK-NAVY (on gradient) + caption "Local skills. Real
  opportunities." (slate-700 on gradient).
- **White card overlapping the hero** (radius 24, top corners, shadow): title1 "Welcome
  Back"; body "Login to your verified account".
- Field "Email or Phone": person glyph left, placeholder "e.g. +91 98765 43210".
- Field "Password": lock glyph left, dots, eye-off toggle right.
- Right-aligned blue link "Forgot Password?".
- Primary lg "Login to YuvaConnect".
- Divider with centred caption "OR".
- Outline lg button: coloured Google "G" + "Continue with Google".
- **Below the card**, on gradient ground: centred row "Don't have an account?" + bold blue
  "Create Account".
- **Mint pill banner** at very bottom: dark shield-check + bold caption "Your data is
  protected with bank-grade security".

Signup variant (not shown separately): same chrome, fields Name/Email/Password + role from
param; footer row reversed.

## 2. Mapping
`login()` / `signup()` in `src/lib/auth-api.ts` ✅ unchanged. `setSession` → `/home` as before.

## 3. Flags (resolved at build)
- Google sign-in + Forgot Password: no live endpoints → both stay visible per wireframe and
  raise an explanatory InfoBanner on tap (approved flag pattern).
- Business skin (screen 25) will reuse this chrome with the mint segmented control.

## 4. Build
- `src/app/(auth)/login.tsx`, `src/app/(auth)/signup.tsx` rebuilt on the new system.
- New token: `gradient.auth` (blue-600 → emerald-400) for the hero; emerald ramp gained
  300/400 steps. New glyph `logoGoogle` (`logo-google`).
- Signup role chooser = two `SelectableChip`s seeded from `?role=`; copy adapts per role.
- Inline `InfoBanner` replaces the legacy `Alert.alert` error popups.

## 5. Deviations
1. Hero wordmark is dark navy ON the gradient exactly as exported (unusual but literal).
2. Signup's visuals are not in the wireframe set (only login is drawn), so signup mirrors
   the login chrome with the role chooser added — consistent, not invented chrome.
