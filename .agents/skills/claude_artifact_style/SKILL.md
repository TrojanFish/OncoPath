---
name: "Claude Artifact Style"
description: "Applies the signature 'Claude Artifact' UI/UX styling to generated code. Uses clean cards, refined typography, and precise minimalist data presentation."
---

# Claude Artifact UI/UX Style Guidelines

When tasked with generating or modifying user interfaces (specifically document, code, or report blocks) in this project, you MUST strictly adhere to the following Claude Artifact design principles:

## 1. Container & Layout (The "Artifact" Window)
Claude artifacts appear as focused, self-contained windows inside the chat flow.
- **Card Styling**: Use `.bg-white` (or a very clean light gray/off-white) and a delicate border (`border border-gray-200` or `border-slate-200`) instead of heavy shadows or glow effects.
- **Corner Radius**: Use large rounded corners (`rounded-xl` or `rounded-2xl`).
- **Header/Toolbar**: If it's a major document or tool, include a subtle top bar. For example, a slightly darker gray header (`bg-gray-50`) with a title and small icon, separated by a bottom border (`border-b border-gray-200`).

## 2. Typography & Readability (Paramount Importance)
- **Hierarchy**: Clear distinction between headings and body text. 
  - Main titles (H1/H2): `text-gray-900`, `font-semibold` or `font-bold`.
  - Body text: `text-gray-700` or `text-gray-600`.
- **Line Height**: Relaxed line height for reading (`leading-relaxed` or `leading-7/8`).
- **Spacing**: Generous padding (`p-6` or `p-8`) inside the artifact container. Use `space-y-4` or `space-y-6` for vertical rhythm between paragraphs/sections.
- **Fonts**: Rely on clean sans-serif system fonts (Inter, default Tailwind sans) or crisp serifs for long-form reading.

## 3. Colors & Accents
- **No Neon/Glow**: Absolutely no neon glowing borders (`box-shadow` glows), no space/cyberpunk themes unless explicitly requested.
- **Accents**: Use muted, elegant accent colors. Claude typically uses subtle oranges/ambers (`text-amber-600`, `bg-amber-50`) or soft blues/indigos for highlights, buttons, and alerts.
- **Data Presentation**: Tables and lists should have minimal visual noise. Very faint borders (`border-gray-100`), no alternating zebra stripes unless necessary, and ample cell padding.

## 4. Alerts & Callouts
- Format warnings or notes as clean, left-bordered blocks (similar to GitHub alerts but more refined).
- Example: `<div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r-lg text-amber-900">...</div>`

## 5. Interaction
- Keep hover effects subtle: slight background color shifts (e.g., `hover:bg-gray-50`) or very minor shadow increases (`hover:shadow-sm`). Do not use exaggerated transform/scale animations.

Always enforce these constraints when outputting React components or CSS.
