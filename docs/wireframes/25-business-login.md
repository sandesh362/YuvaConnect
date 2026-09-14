# 25 · Business Login / Signup

Routes: same `/(auth)/login`+`signup` with role=BUSINESS (screen 07 chrome, business skin).

## 1. What the wireframe shows

- **White hero card** (rounded-24 BOTTOM corners, on light ground): 84dp blue-100 rounded-20
  tile w/ blue BRIEFCASE glyph; title1 32-extrabold "YuvaConnect Business"; body "Find
  verified student talent for your local business".
- **MINT segmented control, 3 segments**: Login (ACTIVE mint pill, dark slate bold) ·
  "Create Account" · "Reports".
- Label "Business Email" + field mail glyph "owner@business.com".
- Label "Password" + field lock glyph + dots + eye-off right.
- Right blue link "Forgot Password?".
- Primary lg "Login to Dashboard".
- Divider caption "or continue with"; two outline half buttons: Google G "Google" · phone
  glyph "Phone".
- **Washed slate card** "Why hire on YuvaConnect?" (title3) + 3 rows TEAL glyphs:
  shield-check "Verified college students from local institutions" · wallet "Secure,
  transparent micro-gig payments" · gauge "Post a gig and get applicants in minutes".
- Footer row centred: "Are you a student?" + blue bold "Switch to Student App".

## 2. Mapping = 07 (login/signup ✅). "Reports" segment = no route → flag/hide.
   Google/Phone OAuth absent → flag.
## 3. Flags: Reports tab, OAuth.
## 4–5. At build time.
