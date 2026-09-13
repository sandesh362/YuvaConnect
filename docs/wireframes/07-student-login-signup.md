# 07 · Student Login / Signup

Routes: `/(auth)/login`, `/(auth)/signup` (rebuild in place; shared with business until 25).
Signup MUST start reading the `?role=` param that /role passes (carried from screen 1).

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
`login()` / `signup()` in `src/lib/auth-api.ts` ✅. Google button = NO OAuth in live API →
flag (render disabled or hide — never fake). Forgot Password = no endpoint → flag.

## 3. Flags: Google OAuth, forgot-password flow absent from backend.
## 4–5. At build time.
