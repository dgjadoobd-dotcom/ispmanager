# ISP Manager Design System & Principles

This document outlines the core design skills and principles applied to the ISP Manager platform to ensure a premium, SaaS-grade user experience.

## 1. Aesthetic Philosophy: "Modern Precision"
The design focuses on clarity, depth, and responsiveness. We aim for a "Clean Tech" look that feels reliable for enterprise management while remaining visually engaging.

### Key Pillars:
- **Clarity over Clutter**: Prioritize information hierarchy. Important metrics (Revenue, Active Customers) are always prominent.
- **Depth via Glassmorphism**: Use of subtle transparencies and blurs to create a sense of layering.
- **Micro-interactions**: Every action should have a visual response (hover lifts, smooth transitions).

## 2. Visual Language

### Typography
- **Primary Font**: [Inter](https://fonts.google.com/specimen/Inter) or [Outfit](https://fonts.google.com/specimen/Outfit) for a modern, geometric feel.
- **Hierarchy**:
  - `H1`: Bold, tight letter spacing (tracking-tight).
  - `Body`: Optimized for readability (antialiased).
  - `Monospace`: Used for technical data (IP addresses, MAC addresses).

### Color Palette
- **Primary**: Sleek Blue (`#3B82F6`) representing trust and connectivity.
- **Success**: Emerald Green for active status and paid bills.
- **Destructive**: Rose Red for suspended accounts or due invoices.
- **Dark Mode**: Deep Navy/Charcoal backgrounds with high-contrast text.

## 3. Component Architecture

### Glassmorphic Cards
Cards should feel like they are floating above the background.
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}
```

### Interactive Elements
- **Hover Lifts**: Components like `metric-card` use `hover-lift` to provide tactile feedback.
- **Smooth Transitions**: Use `transition-all duration-200 ease-out` for all state changes.

## 4. Animation Strategy (Framer Motion)
Animations are used to guide the user's eye and reduce cognitive load during page transitions.
- **Page Transitions**: Subtle fade-in and slide-up.
- **List Items**: Staggered entry for long lists (e.g., Customer table).
- **Layout Changes**: Smooth expansion of sidebar and modal entries.

## 5. Responsive Optimization
- **Mobile First**: All dashboards must be functional on mobile for on-the-go ISP admins.
- **Safe Areas**: Implementation of `env(safe-area-inset-*)` for PWA support on modern smartphones.
- **Touch Targets**: Minimum 44x44px for all interactive elements.

## 6. Iconography
- **Library**: [Lucide React](https://lucide.dev/) for consistent, stroke-based icons.
- **Usage**: Icons should always accompany text in navigation to aid scanning.

---
*Created and maintained by Antigravity AI.*
