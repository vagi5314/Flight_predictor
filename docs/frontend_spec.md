# ✈️ Flight Ops Intelligence Dashboard - Frontend Specification
**Design System: 21st.dev Inspired / Modern SaaS / Aviation Dark Mode**

## 🎨 Visual Identity
- **Primary Palette**:
  - Background: `bg-slate-950` (Deep space black/blue)
  - Surface: `bg-slate-900/50` with `backdrop-blur-xl` (Glassmorphism)
  - Accents: `text-blue-400` (Electric Blue), `text-emerald-400` (Safe), `text-rose-500` (Critical)
  - Borders: `border-slate-800` (Subtle separation)
- **Typography**: Inter or Geist Sans (Modern, high-readability, geometric)

## 🏗️ Component Architecture (Bento Grid)

### 1. The Navigation Header (Fixed Top)
- **Element**: Minimalist top bar.
- **Animation**: Slide-down from top on load.
- **Content**: Logo (✈️ FlightOps AI) + System Status indicator (🟢 API Online).

### 2. The Input Command Center (Left Column - 40% width)
- **Container**: Glassmorphism card with a subtle outer glow.
- **Interaction Design**:
  - **Chip-Selection**: Instead of boring dropdowns, use a grid of `motion.button` chips for Airlines and Airports.
  - **Hover State**: Scale up slightly (`whileHover={{ scale: 1.05 }}`) and increase border brightness.
  - **Sliders**: Custom styled range sliders with real-time value updates.
- **Action Button**: "Run Prediction Analytics"
  - **Effect**: `whileTap={{ scale: 0.95 }}`.
  - **Loading State**: Replace text with a spinning "Radar" icon and a "Scanning Flight Data..." label.

### 3. The Intelligence Hub (Right Column - 60% width)
- **State A: Idle (Empty State)**
  - **Visual**: A blurred, holographic airplane silhouette with text: "Awaiting flight parameters for analysis..."
- **State B: Predicting (Loading)**
  - **Animation**: A centered, pulsing circular wave (The "Radar Pulse") expanding from the center of the screen.
- **State C: Result (The "Wow" Moment)**
  - **Probability Gauge**: A semi-circular SVG gauge that animates from 0% to the predicted value.
  - **Risk Badge**: A glowing badge that flashes `Red` (High), `Yellow` (Mod), or `Green` (Low) based on the probability.
  - **Advisory Box**: A sliding panel that emerges from the bottom with a "⚠️ Gate Agent Advisory" header.

### 4. The Root Cause Diagnostic (Bottom Section)
- **Visualization**: Horizontal bar chart for SHAP values.
- **Animation**: Bars animate their width from 0 to final value using `staggerChildren` in Framer Motion.
- **Tooltip**: Hovering over a bar shows exactly how many minutes that feature added/subtracted from the delay.

## ⚡ Framer Motion Orchestration

```typescript
// Global Page Transition
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

// Result Card Animation
const resultVariants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
}
```

## 🛠️ Technical Stack Implementation
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide-React
- **API Client**: Axios / TanStack Query (for caching and loading states)
