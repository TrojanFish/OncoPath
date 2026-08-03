# Frontend Architecture

## 1. 概述 (Overview)
The frontend is built with Next.js (App Router), React, and Tailwind CSS. It is designed to be highly responsive, accessible, and reassuring.

## 2. 设计系统 (Design System)
- **Theme:** "Dark Medical Theme". A sophisticated dark mode (deep blues and slate grays) to reduce eye strain and present a professional, data-centric feel.
- **Typography:** Clean sans-serif fonts (e.g., Inter or Roboto). High contrast for readability.
- **Color Palette:**
  - Background: Deep Slate `#0f172a`
  - Cards: Dark Blue/Gray `#1e293b`
  - Accents (Action): Teal `#0d9488`
  - Alerts/Warnings: Amber `#f59e0b`

## 3. 核心页面 (Next.js Pages)

### 3.1. `app/page.tsx` (Home)
- Landing page outlining the platform's mission.
- Call-to-action to start entering profile data.

### 3.2. `app/profile/page.tsx`
- Hosts the interactive `ProfileForm` component.
- Uses client-side state management (Zustand or React Context) to handle multi-step input.

### 3.3. `app/report/[id]/page.tsx`
- Server-Side Rendered (SSR) for fast loading and SEO (if applicable).
- Fetches report data from the backend using the provided ID.
- Lays out the comprehensive report.

## 4. 关键组件 (Key Components)

### 4.1. `ProfileForm`
- A multi-step wizard.
- Includes dynamic validation (e.g., if histology is 'Squamous', hide EGFR mutation options which are rare).

### 4.2. `EvidenceReport`
- The main container for the report data.
- Orchestrates layout between summary, charts, and detailed lists.

### 4.3. `RadarChart`
- Built using Recharts or Chart.js.
- Visualizes the relative risk weight of different extracted factors (e.g., STAS vs. LVI vs. Tumor Size).

### 4.4. `StudyCard`
- Displays individual piece of evidence.
- Includes a star-rating component for Evidence Level.
- Expandable section to show the original English abstract alongside the Chinese translation.

### 4.5. `FactorBadge`
- Small UI element indicating the presence of a factor.
- Hovering reveals a Tooltip with a brief, patient-friendly definition of the medical term.
