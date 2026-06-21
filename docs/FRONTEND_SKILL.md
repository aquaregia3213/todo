# FRONTEND_SKILL.md — Design & UI Guidance for Agents

Use this whenever building or redesigning UI. Goal: avoid generic,
templated-looking AI output. Aim for something with a clear point of view.

## Before building
1. Identify the subject precisely (what is this product, who's it for,
   what's the one thing this page/screen needs to do).
2. Pick a small token system upfront and stick to it:
   - **Colors**: 4-6 named hex values (background, surface, text, accent,
     secondary accent, border)
   - **Typography**: 1 display/heading font + 1 body font (pair them
     deliberately — don't default to the same generic sans-serif pairing
     every time)
   - **Layout**: sketch the structure in words before coding (hero,
     sections, nav pattern)
   - **Signature element**: one memorable visual/interaction detail tied
     to the subject (e.g. for an air-quality dashboard, an AQI-colored
     gradient ring; not a generic icon)

## Avoid these AI-generic defaults (unless the brief specifically wants them)
- Cream background + serif headline + terracotta accent
- Near-black background + single neon green/red accent
- Numbered "01 / 02 / 03" markers used as decoration when content
  isn't actually a sequence

## Build quality floor (always)
- Mobile-first, responsive down to ~360px width
- Visible keyboard focus states on all interactive elements
- Respect `prefers-reduced-motion`
- Loading / empty / error states for any data-driven UI
- Consistent spacing scale (use Tailwind's default scale unless overridden)

## Copy / microcopy
- Write from the user's perspective: name controls by what they do
  ("Refresh data", not "Sync")
- Active voice, plain language, no filler
- Error messages explain what happened and how to fix it
- Empty states should invite action ("No cities added yet — search to add one")

## Process
1. Brainstorm 2-3 sentence design plan (colors, type, layout, signature)
2. Check it against the "avoid" list above — revise if it matches a default
3. Build to the plan
4. Self-review: does it look distinct, does it work on mobile, does the
   signature element land?
