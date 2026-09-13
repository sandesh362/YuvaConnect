# 09 · Student Skill Selection

Route: NEW additive (`/skills`). 5-segment step bar at very top (3 filled), NO header bar.

## 1. What the wireframe shows

- Title1 32-extrabold "What are your skills?"; body "Select at least 3 skills to help us
  match you with the right micro-gigs."
- Label "Search skills" + search input (magnifier + "e.g. Photoshop, Python...").
- Row: heading "Selected Skills" + right WASHED pill caption "4 Selected" (indigo-100, white
  text in export = artifact; render indigo-100 + primaryText).
- **Grouped chip catalogue**, group captions slate-600 bold:
  - "Design & Creative": selected solid blue = Graphic Design, Logo Design, Product
    Photography; idle outline = UI/UX Design, Illustration, Motion Graphics.
  - "Marketing & Social": selected = Social Media Management; idle = Content Writing, SEO,
    Ad Campaigns, Influencer Outreach.
  - "Development & IT": idle = Web Development, App Development, Data Entry, Python,
    Shopify/E-commerce.
- Washed card: teal shield-check + body "Skills are verified through your portfolio and
  business ratings."
- Sticky bar: text link "Back" left + primary "Continue" (flex ~3).

## 2. Mapping
skills → `StudentProfile.skills` update call ✅. Grouping/categories = static local taxonomy
(no skills endpoint) → flag as curated list. Min-3 rule enforced client-side.

## 3. Flags: no server skill taxonomy; "Selected" count pill colour artifact.
## 4–5. At build time.
