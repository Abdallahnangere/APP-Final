# 📐 Homepage Architecture & Layout Guide

## Visual Hierarchy Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    STICKY HEADER (backdrop-blur)                │
│  [LOGO] Sauki Mart  [Features] [App] [Privacy] [Contact]  │ [Get App] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│         HERO SECTION (Vertical Rhythm)                         │
│                                                                 │
│  Heading: "Instant Data."                                      │
│           "Premium Commerce" (gradient)                        │
│                                                                 │
│  Subtext: Clear value proposition (80 chars max)             │
│                                                                 │
│  [Get on Google Play]  [Try Web App →]                        │
│                                                                 │
│  ✓ Secure Payments · ✓ Instant Delivery · ✓ 24/7 Support    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 SMARTPHONE MOCKUP SHOWCASE                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │      │
│  │ │      │ │ │      │ │ │      │ │ │      │ │ │      │ │      │
│  │ │      │ │ │      │ │ │      │ │ │      │ │ │      │ │      │
│  │ │ HOME │ │ │STORE │ │ │ DATA │ │ │AGENT │ │ │SUPPORT      │      │
│  │ │      │ │ │      │ │ │      │ │ │      │ │ │      │ │      │
│  │ │      │ │ │      │ │ │      │ │ │      │ │ │      │ │      │
│  │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │      │
│  │ Home    │ │ Premium │ │ Instant│ │ Agent  │ │ Support│      │
│  │ Hub     │ │ Store   │ │ Data   │ │ Portal │ │        │      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
│  (Horizontal scroll on mobile, auto-grid on desktop)           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FEATURES SECTION (ID: features)              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Features                                                  │  │
│  │ Why Choose Sauki Mart?                                   │  │
│  │ Built for performance, security, and UX                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ ⚡       │  │ 👥       │  │ 🔐       │                     │
│  │ Instant  │  │ Agent    │  │ Bcrypt   │                     │
│  │ Data     │  │ System   │  │ Security │                     │
│  │ MTN,Air… │  │ Partner  │  │ PIN hash…│                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ 💰       │  │ 📱       │  │ 🛒       │                     │
│  │ 2%       │  │ PWA      │  │ Premium  │                     │
│  │ Cashback │  │ Support  │  │ Store    │                     │
│  │ Instant  │  │ Offline… │  │ Gadgets… │                     │
│  └──────────┘  └──────────┘  └──────────┘                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               DEEP-DIVE FEATURES (3 Sections)                  │
│                                                                 │
│  ┌─ Enterprise Security ──────────────────────────────────┐    │
│  │ [✓✓✓ Content] ←→ [Gradient Card]                      │    │
│  │ • Bcrypt PIN Hashing                                  │    │
│  │ • Rate Limiting (5/15min login)                       │    │
│  │ • Zod Input Validation                                │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ 2% Cashback Rewards ──────────────────────────────────┐   │
│  │ [Gradient Card] ←→ [✓✓✓ Content]                      │    │
│  │ • Instant 2% Credit                                   │    │
│  │ • Real-Time Dashboard                                 │    │
│  │ • Atomic Transfers                                    │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─ Progressive Web App ──────────────────────────────────┐   │
│  │ [✓✓✓ Content] ←→ [Gradient Card]                      │    │
│  │ • Installable (Android/iOS)                           │    │
│  │ • Push Notifications                                  │    │
│  │ • Offline Support                                     │    │
│  └──────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STATS SECTION (dark background)              │
│  50K+              2M+              99.9%            24/7       │
│  Active Users      Transactions     Uptime           Support    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              MAIN CTA SECTION (Gradient bg)                    │
│                                                                 │
│         Ready to Get Started?                                  │
│    Join thousands enjoying instant data...                    │
│                                                                 │
│    [Get on Google Play ↓]  [Try Web App →]                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    FOOTER (5 Columns)                          │
│                                                                 │
│ [LOGO] Sauki   │ App        │ Company    │ Support     │Download  │
│ Mart Premium   │ • Open App │ • Features │ • Tel 1    │ • Play   │
│ Platform...    │ • Play     │ • Email    │ • Tel 2    │  Badge   │
│                │ • Privacy  │ • Support  │ • Email    │ • "Apps" │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│ © 2026 Sauki Data Links  │  Privacy • Terms  │  Premium Standards │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Primary Colors
- **Blue**: `bg-blue-600`, `text-blue-600`, `bg-blue-700` (hover)
- **Indigo**: `to-indigo-700`, `via-indigo-700` (gradients)

### Neutral Colors
- **Slate-50**: Light backgrounds
- **Slate-600**: Secondary text
- **Slate-900**: Primary headlines
- **White**: Main backgrounds

### Accent Colors
- **Green/Emerald**: Rewards section
- **Purple/Pink**: PWA section
- **Blue/Indigo**: Security section
- **Slate**: Default sections

---

## 📏 Spacing System

```
Section Padding:    py-20 (desktop), py-16 (mobile)
Container Padding:  px-6 (responsive)
Column Gap:         gap-8 (desktop), gap-6 (mobile)
Row Gap:            gap-12 (sections), gap-4 (features)

Card Padding:       p-8 (desktop), p-4 (mobile)
Header Height:      py-3 (compact sticky header)
Footer Height:      py-16 (main), pt-8 (bottom)
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
- Single column layouts
- Horizontal mockup scroll
- Hidden desktop navigation
- Compact spacing
- Stack all elements vertically

### Tablet (640px - 768px)
- 2-column layouts where applicable
- Mockups begin grid layout
- Navigation hints appear
- Medium spacing adjustments

### Desktop (≥ 768px)
- Full multi-column layouts
- Auto-grid mockups (5 columns)
- Full navigation visible
- Generous spacing
- Side-by-side features with images

---

## 🎭 Interactive Elements

### Hover States
- **Buttons**: Scale up, color deepens, shadow expands
- **Links**: Color changes to blue-600
- **Cards**: Shadow increases, slight upward movement
- **Phone Frames**: Shine effect appears, glow intensifies
- **Icons**: Scale 110%

### Transitions
- Duration: 300ms standard
- Easing: Smooth (CSS default)
- Properties: color, shadow, transform, opacity

### Animations
- **On Load**: Fade in + slide up (Framer Motion capable)
- **On Hover**: Smooth color/shadow/scale transitions
- **On Scroll**: Fade effects (CSS optional)

---

## 📊 Component Breakdown

| Component | Type | Coverage |
|-----------|------|----------|
| Header | Sticky Nav | Full width |
| Hero | Text + CTA | Container width |
| Mockups | Carousel/Grid | Full width horizontal scroll |
| Features | Card Grid | 3 columns (desktop) |
| Deep Dives | Text + Image | 2 columns alternate |
| Stats | Text Grid | 4 columns |
| CTA | Full Section | Full width gradient |
| Footer | Multi-column | 5 columns (desktop) |

---

## 🔗 Link Density Map

```
Google Play Accessibility:
├─ Header: 1 link (navigation "Get App" button)
├─ Hero: 1 link (primary CTA "Get on Google Play")
├─ Mockups: Visual showcase (no direct links)
├─ Features: Educational content (no links)
├─ Stats: Metrics only (no links)
├─ CTA Section: 1 link (download button)
└─ Footer: 2 links (App column + Download section)
Total: 5 prominent Google Play links

Other Important Links:
├─ Internal: /app, /privacy, #features, #mockup
├─ Phone: +234806193_4056, +234704464_7081 (2 links)
└─ Email: saukidatalinks@gmail.com (2 links)
```

---

## 🎯 Layout Grid System

```
Max Width: 7xl (80rem / 1280px)
Padding: Always 6 (1.5rem) on sides
Columns: 1 (mobile) → 2 (tablet) → 3+ (desktop)
Aspect Ratios: 
  - Phone mockup: 1:1.65 (portrait)
  - Hero image card: Square (1:1)
  - Feature cards: Auto height
  - Footer: 5-equal columns
```

---

## 🚀 Performance Optimizations

1. **CSS-Only**: Tailwind for styling, no external frameworks
2. **Image Format**: PNG (screenshots), auto scaling
3. **Font**: System fonts (no web fonts required)
4. **JavaScript**: Minimal (Next.js Link component only)
5. **Responsive**: Mobile-first CSS approach
6. **Lazy Loading**: Compatible with Next.js Image optimization

---

## 📋 File Structure

```
/app/
├─ page.tsx (Main homepage - 330 lines)
└─ app/
   └─ page.tsx (Client app wrapper - 10 lines)

/public/
├─ logo.png (Brand logo)
└─ screenshots/
   ├─ mobile-home.png
   ├─ mobile-store.png
   ├─ mobile-data.png
   ├─ mobile-agent.png
   └─ mobile-support.png
```

---

## ✨ Premium Design Features

1. **Backdrop Blur**: Modern glass-morphism on header
2. **Gradient Text**: Premium styling for headlines
3. **Shadow Layers**: Depth perception through elevation
4. **Hover Effects**: Subtle, professional interactions
5. **Typography**: Bold, clean, hierarchical
6. **Whitespace**: Generous padding for breathing room
7. **Color Harmony**: Cohesive blue/indigo theme
8. **Responsive**: Seamless on all devices
9. **Accessibility**: Proper contrast and semantics
10. **Performance**: Lightweight and fast

---

*This architecture ensures a professional, Apple-level premium experience across all devices and screen sizes.*
