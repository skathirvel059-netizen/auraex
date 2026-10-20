# Auraex — Official Brand & Systems Website

> **Digital Engineering • App Creation • IoT Solutions • International Trade**

Auraex is a forward-looking technology and international commerce enterprise. This project delivers a high-impact, responsive web application uniting software craftsmanship, edge IoT hardware engineering, and sovereign cross-border trade into a cohesive digital experience.

---

## 🌟 Key Highlights & Features

### 1. First-Screen Welcoming Sign-In & Onboarding Portal
- **Brand Identity**: Features the custom geometric Auraex SVG emblem and brand statement (*"Engineering the Synergy of Bits, Atoms & Trade"*).
- **Authentication Forms**: Mode switcher between **Sign In** and **Create Account**, with email/password validation, password visibility toggle, and session persistence in `localStorage`.
- **Google OAuth Button**: Authentic Google-branded sign-in button configured in prototype mode with simulated OAuth callback.
- **Forgot Password**: Interactive recovery modal with simulated email dispatch.
- **Prototype Mode Transparency**: Transparent badges and callouts detailing that Google authentication and custom backends can be connected later.
- **Direct Guest Mode**: Allows visitors to immediately enter and explore the main website with a guest session.
- **Return Control**: The sticky navigation header includes an account pill (`Jordan Vance`, `Guest Explorer`, or `Sign In / Switch`) that allows users to return to the sign-in screen at any time.

---

### 2. Main Landing Page (14 Full-Screen Showcase Sections)

| # | Section | Core Features & Interactive Capabilities |
|---|---|---|
| **01** | **Hero** | Avant-garde typography, interactive HTML5 Canvas particle network responding to cursor movement, live operating metrics bar (4 disciplines, 99.98% uptime, 42+ trade corridors, <35ms latency), primary CTAs. |
| **02** | **About Auraex** | Company overview, core mission, and 3 cross-domain pillar cards (*Digital Foundation*, *Embedded Intelligence*, *Physical Commerce*) with glowing hover accents. |
| **03** | **Web Creation** | High-performance headless architectures, bespoke design systems, and an interactive **Simulated Code & Architecture Inspector** with tabbed code views (`React`, `GraphQL`, `Topology`). |
| **04** | **App Creation** | Mobile and progressive web app capabilities, offline-first sync, and an interactive **Simulated Smartphone UI** with switchable app screens (*Fleet Telemetry*, *IoT Mesh*, *Customs FastTrack*). |
| **05** | **IoT Solutions** | Connected hardware, sensors, and an **Interactive Live Telemetry Simulator** featuring a real-time waveform canvas, 4 selectable sensor nodes (*Thermal*, *Hydraulic*, *Vibration*, *LoRa RSSI*), anomaly pulse trigger, and node calibration. |
| **06** | **Import & Export** | International trade desk, supplier auditing, and an **Interactive Global Trade Corridor Explorer** with tabbed routes (*Trans-Pacific*, *Asia-Europe*, *Trans-Atlantic*, *Pan-American*), live transit metrics, and vector route mapping. |
| **07** | **Our Process** | 6-stage lifecycle (*Discovery*, *Blueprinting*, *UI/UX & Enclosures*, *Agile Engineering*, *QA Compliance*, *Global Deployment*) with an interactive step card selector and dynamic deliverables viewer. |
| **08** | **Featured Work** | Project showcase with filter tabs (*All*, *Web Platforms*, *Mobile Apps*, *IoT Hardware*, *Global Trade*) and 4 sample case studies clearly labeled for demonstration. |
| **09** | **Industries We Serve** | 6 specialized domain cards with glowing micro-interactions (*Manufacturing 4.0*, *Maritime Logistics*, *Cross-Border Retail*, *MedTech Diagnostics*, *Startups*, *CleanTech*). |
| **10** | **Why Auraex** | Value differentiators and an interactive **Side-by-Side Comparison Matrix** contrasting the Auraex unified model against conventional fragmented agencies. |
| **11** | **Testimonials** | Quotes from fictional leaders (*Marcus Koenig*, *Dr. Sophia Lin*, *Tariq Al-Hassan*), client avatars, and sample content labels for easy replacement. |
| **12** | **FAQ** | Searchable & expandable accordion covering cross-discipline workflows, project timelines, IP ownership, and enterprise ERP integrations. |
| **13** | **Contact & Briefing** | Interactive contact card with multi-service checkboxes, budget bracket dropdown, form validation, direct placeholder contact channels (*Tokyo*, *SF*, *London*), and simulated submission feedback. |
| **14** | **Footer** | Multi-column site map, live system status indicator (*All Subsystems Operational*), newsletter subscription form with validation, and back-to-top trigger. |

---

## 🚀 How to Run the Website Locally

This project uses modern Vanilla ES modules and Vite for rapid local development and hot module reloading.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Start the Dev Server
From the project root directory:
```bash
npm run dev
```
The server will boot instantly at:
```
http://localhost:5173/
```

### 2. Build for Production
To generate an optimized production bundle:
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

---

## 🔐 How and Where to Connect Google Authentication Later

The authentication flow is pre-architected in a dedicated configuration module: [`js/auth-config.js`](./js/auth-config.js).

### Configuration File: `js/auth-config.js`
```javascript
export const AUTH_CONFIG = {
  // Toggle from 'prototype' to 'production'
  mode: 'prototype', 

  // 1. Google OAuth 2.0 Client ID (from Google Cloud Console)
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',

  // 2. Google OAuth Scopes
  googleScopes: 'email profile openid',

  // 3. Real Backend Endpoints
  apiEndpoints: {
    signIn: 'https://api.auraex.io/v1/auth/login',
    signUp: 'https://api.auraex.io/v1/auth/register',
    googleAuthCallback: 'https://api.auraex.io/v1/auth/google',
    resetPassword: 'https://api.auraex.io/v1/auth/forgot-password',
    verifySession: 'https://api.auraex.io/v1/auth/verify',
  },

  sessionKey: 'auraex_authenticated_user'
};
```

### Steps to Connect Real Google Identity Services (GIS):
1. **Google Cloud Console**:
   - Create a project at [console.cloud.google.com](https://console.cloud.google.com/).
   - Navigate to **APIs & Services > Credentials** and create an **OAuth 2.0 Client ID** (Web application).
   - Add `http://localhost:5173` and your production domain to **Authorized JavaScript origins**.
2. **Include Google Client Library in `index.html`**:
   Add this script tag inside the `<head>` of [`index.html`](./index.html):
   ```html
   <script src="https://accounts.google.com/gsi/client" async defer></script>
   ```
3. **Switch Mode**:
   In [`js/auth-config.js`](./js/auth-config.js), change `mode: 'prototype'` to `mode: 'production'` and paste your `googleClientId`.
4. **Backend Verification**:
   The callback receives Google's ID token (JWT) to exchange or verify with your backend endpoint (or Supabase/Firebase Auth SDK).

---

## 📂 Project Architecture

```
company/
├── index.html               # Main semantic HTML structure & meta tags
├── package.json             # Vite dev dependencies and run scripts
├── README.md                # Comprehensive documentation & setup guide
├── css/
│   ├── variables.css        # Design tokens: color palette, fonts, spacing, radii
│   ├── base.css             # Resets, typography hierarchy, keyframe animations
│   ├── components.css       # Buttons, cards, badges, accordion, toasts, forms
│   ├── layout.css           # Containers, grids, sticky navigation, drawer, footer
│   ├── auth.css             # Full-screen first sign-in portal & recovery modal
│   └── sections.css         # Custom styling for each of the 14 sections
└── js/
    ├── main.js              # Application coordinator & scroll-spy controller
    ├── auth-config.js       # Google OAuth & backend provider configurations
    ├── auth.js              # First-screen sign-in, signup, and session controller
    ├── toast.js             # Notification toast utility
    ├── canvas-hero.js       # Interactive constellation & data-flow canvas
    ├── iot-simulator.js     # Real-time IoT waveform chart & telemetry widget
    ├── trade-explorer.js    # Interactive global trade corridor switcher
    ├── process-work.js      # 6-phase process explorer & portfolio category filter
    ├── faq.js               # Searchable accordion logic
    └── contact.js           # Multi-discipline form validation & simulated submission
```

---

## 🎨 Visual Identity & Design System

- **Primary Background**: Refined obsidian black (`#05070a`, `#080c14`, `#0f1624`).
- **Luminous Accents**:
  - **Electric Cyan** (`#00f0ff`): Core digital architecture and systems telemetry.
  - **Neon Violet** (`#8b5cf6`): Advanced software and mobile applications.
  - **Warm Amber/Gold** (`#f59e0b`): Cross-border sovereign trade and physical goods.
  - **Emerald** (`#10b981`): Status indicators and nominal operating conditions.
- **Typography**:
  - Display / Headings: `Syne` (Bold, geometric, avant-garde).
  - Body & UI: `Plus Jakarta Sans` (Clean, high-precision readability).
  - Monospace Data: `JetBrains Mono` (Telemetry values, code snippets, coordinates).
- **Aesthetic Direction**: High-contrast dark mode, subtle glassmorphism, micro-animations, and dynamic canvas particle networks.
