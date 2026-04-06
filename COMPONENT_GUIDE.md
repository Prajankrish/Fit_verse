# Component Usage Guide

## 🚀 Quick Reference

All new components are production-ready and follow React best practices.

---

## Components Reference

### 1. FloatingAvatarPanel

**Location**: `src/components/FloatingAvatarPanel.tsx`

**Purpose**: Interactive floating panel for hero section displaying avatar preview and outfit switcher

**Usage**:
```tsx
import { FloatingAvatarPanel } from "@/components/FloatingAvatarPanel";

export function MyComponent() {
  return <FloatingAvatarPanel />;
}
```

**Features**:
- Auto-rotating avatar
- Animated pulsing glow
- Outfit switcher buttons
- Upload CTA button
- Floating animation loop

**Props**: None (self-contained)

**Customization**:
- Change outfit types: Edit `[{ name: "Casual", ... }]` array
- Modify floating duration: Edit `animation: float 6s ease-in-out infinite;`
- Change avatar emoji: Edit `<div className="text-5xl">👤</div>`

---

### 2. InteractiveBodyFilter

**Location**: `src/components/InteractiveBodyFilter.tsx`

**Purpose**: Interactive filter chips for body type selection

**Usage**:
```tsx
import { InteractiveBodyFilter } from "@/components/InteractiveBodyFilter";

export function MyPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  return <InteractiveBodyFilter />;
}
```

**Features**:
- 8 body type options with emojis
- Click to select/deselect
- Visual feedback with glow effect
- Responsive layout
- Feedback text when selected

**Props**: None (self-managed state)

**State Management**:
Currently manages its own state internally. To integrate with parent:
```tsx
// Future: Add props for external state management
interface InteractiveBodyFilterProps {
  selected?: string | null;
  onSelect?: (type: string) => void;
}
```

**Customization**:
- Edit body types: Modify `const bodyTypes = [...]`
- Change emoji map: Edit emoji prop in array
- Adjust colors: Update gradient class names

---

### 3. HowItWorksSection

**Location**: `src/components/HowItWorksSection.tsx`

**Purpose**: 3-step visual flow section with glassmorphic cards

**Usage**:
```tsx
import { HowItWorksSection } from "@/components/HowItWorksSection";

export function HomePage() {
  return (
    <>
      {/* Other sections */}
      <HowItWorksSection />
    </>
  );
}
```

**Features**:
- 3 glass panel cards
- Automated step badges (01, 02, 03)
- Connecting lines (desktop)
- Timeline dots (mobile)
- Hover animations
- CTA button integration

**Props**: None (self-contained)

**Customization**:
- Edit steps: Modify `const steps = [...]` array
- Change step content: Edit `title`, `description` properties
- Modify colors: Update `color` gradient property for each step
- Change icons: Swap LucideIcon imports

---

### 4. FeatureCard

**Location**: `src/components/FeatureCard.tsx`

**Purpose**: Reusable card component with primary/secondary variants

**Usage**:
```tsx
import { FeatureCard } from "@/components/FeatureCard";
import { Zap, Users } from "lucide-react";

export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Primary featured card */}
      <FeatureCard
        icon={Zap}
        title="Smart Fit Prediction"
        description="AI-powered recommendations"
        isPrimary={true}
        gradient="from-primary to-secondary"
        animationDelay="0s"
      />
      
      {/* Secondary cards */}
      <FeatureCard
        icon={Users}
        title="Inclusive Avatars"
        description="8+ body types"
        isPrimary={false}
        gradient="from-pink-400 to-primary"
        animationDelay="0.1s"
      />
    </div>
  );
}
```

**Props**:
```tsx
interface FeatureCardProps {
  icon: LucideIcon;              // Any lucide-react icon
  title: string;                 // Card title
  description: string;           // Card description
  isPrimary?: boolean;          // Larger, featured card (default: false)
  gradient?: string;            // Gradient class: "from-X to-Y"
  animationDelay?: string;      // CSS animation delay: "0s", "0.1s", etc
}
```

**Variants**:
- **Primary** (`isPrimary={true}`): 2x larger, gradient overlay, floating shapes
- **Secondary** (`isPrimary={false}`): Smaller, clean, subtle animations

**Customization**:
- Change gradient: `gradient="from-purple-400 to-pink-400"`
- Adjust animation: `animationDelay="0.2s"`
- Swap icon: Any lucide-react icon works

---

## Updated Components

### AppNavbar

**Changes**:
- ✅ Added scroll detection state
- ✅ Gradient underline on nav links (appears on hover)
- ✅ Blur background only when scrolled
- ✅ Icon scale/color on hover
- ✅ "How It Works" menu item added

**No changes to props** - fully backward compatible

**New Features**:
```tsx
// Scroll blur effect
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const handleScroll = () => setScrolled(window.scrollY > 10);
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

// Conditional class
className={`... ${scrolled ? "glass shadow-lg" : "..."}`}
```

---

### HomePage

**Major Changes**:
- Split hero layout with floating panel
- Interactive body type filter instead of static text
- Primary + secondary feature cards
- New HowItWorksSection integration
- Enhanced CTA with social proof
- Restructured footer with proper sections

**Imports Added**:
```tsx
import { FloatingAvatarPanel } from "@/components/FloatingAvatarPanel";
import { InteractiveBodyFilter } from "@/components/InteractiveBodyFilter";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeatureCard } from "@/components/FeatureCard";
```

---

### index.css

**Additions**:
- Enhanced hover utility classes
- New animation keyframes (`float`, `iconPulse`, `gradientShift`)
- Mobile-first transition defaults
- Improved shadow and glow effects

---

## 🎨 Tailwind Classes Quick Reference

### Glassmorphism
```tsx
className="glass"          // Light glass effect
className="glass-panel"    // Premium glass panel (backdrop blur 20px)
```

### Gradients
```tsx
className="gradient-coral-teal"   // Primary → Secondary
className="gradient-warm"         // Primary → Accent
className="text-gradient"         // Text gradient fill
```

### Animations
```tsx
className="animate-fade-in"       // Fade in on load (500ms)
className="animate-slide-in-right" // Slide in from right (400ms)
className="animate-bounce"        // Native bounce (1s)
className="animate-pulse"         // Native pulse
```

### Custom Animations
```tsx
style={{ animationDelay: "0.2s" }}  // Stagger animations
animate-fade-in, animate-scale-in, animate-pulse-soft
```

---

## ✅ Integration Checklist

When adding new sections/components:

- [ ] Import all required icons from lucide-react
- [ ] Set proper animation delays for staggered entrance
- [ ] Test hover states on desktop
- [ ] Test touch states on mobile
- [ ] Verify layout responsiveness (375px, 768px, 1400px)
- [ ] Check color contrast (WCAG AA)
- [ ] Ensure alt text on images
- [ ] Test keyboard navigation (Tab, Enter)
- [ ] Validate HTML structure
- [ ] Check console for errors

---

## 🔄 State Management Pattern (if needed)

For future enhancement with state management:

```tsx
// Example: Connect InteractiveBodyFilter to parent
export function HomePage() {
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);
  
  return (
    <>
      {/* Pass state down */}
      <InteractiveBodyFilter 
        selected={selectedBodyType}
        onSelect={setSelectedBodyType}
      />
      
      {/* Use selected value */}
      {selectedBodyType && (
        <p>You selected: {selectedBodyType}</p>
      )}
    </>
  );
}
```

---

## 📈 Performance Tips

1. **Use `animationDelay`** for staggered visibility (reduces layout thrashing)
2. **Prefer `transform` + `opacity`** over other properties
3. **Lazy load** images below the fold
4. **Memoize** components if they receive complex props
5. **Monitor** animations with DevTools Performance tab

---

## 🐛 Troubleshooting

### Animations not showing
- Check if Tailwind classes are in `content` array in `tailwind.config.ts`
- Verify animation names in `keyframes` config
- Look for conflicting CSS rules

### Floating panel not visible
- Ensure parent container has `relative` positioning
- Check z-index stacking context
- Verify height constraint on parent

### Body filter not interactive
- Check event handlers are properly bound
- Verify state updates are working (use React DevTools)
- Ensure className conditions are correct

### Colors don't match
- Verify CSS variables are defined in `:root`
- Check for dark mode overrides
- Confirm gradient classes use correct color names

---

## 🎓 Best Practices Applied

✅ **Component Composition**: Breaking UI into reusable pieces
✅ **Prop Drilling**: Minimal, intentional prop passing
✅ **Performance**: GPU-accelerated animations only
✅ **Accessibility**: Semantic HTML, ARIA labels where needed
✅ **Responsive Design**: Mobile-first approach
✅ **Clean Code**: Clear naming, proper spacing, no unused code
✅ **Type Safety**: TypeScript interfaces for all props
✅ **Maintainability**: Comments where logic is complex

---

**Need help? Check the component files directly for detailed implementation!** 🚀
