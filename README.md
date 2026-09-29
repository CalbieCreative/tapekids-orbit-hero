# TapeKids 3D Orbital Earth & Cards Hero Slider

Ready-to-use, high-performance 3D Earth Hero section featuring an interactive orbiting cards carousel and transparent-ocean WebGL Earth globe.

## Included Components

- `TapeKidsOrbitSlider.vue` - Single-file Vue 3 Component with `<script setup lang="ts">` and scoped styles.
- `TapeKidsOrbitSlider.tsx` - Standalone React TypeScript Component (`React.FC<TapeKidsOrbitSliderProps>`).
- `earth-texture.png` - 4K crisp continental texture with transparent oceans.
- `index.html` - Zero-dependency standalone HTML/CSS/JS version for quick prototyping or embedding.

---

## 🚀 Quick Start: Vue 3

1. **Install Three.js**:
```bash
npm install three
npm install -D @types/three
```

2. **Copy `TapeKidsOrbitSlider.vue` and `earth-texture.png`**:
Place `TapeKidsOrbitSlider.vue` in your `src/components/` directory, and place `earth-texture.png` in your `public/` directory.

3. **Use in your page / template**:
```vue
<template>
  <main>
    <TapeKidsOrbitSlider
      :items="cards"
      globeTextureSrc="/earth-texture.png"
      allUpdatesLink="/updates"
      @cardClick="handleCardClick"
    />
  </main>
</template>

<script setup lang="ts">
import TapeKidsOrbitSlider from '@/components/TapeKidsOrbitSlider.vue';

const cards = [
  {
    id: 'its-in-you',
    title: "It's In You",
    category: 'Creations',
    image: 'https://content.branham.org/assets/1/1207762fc30598f35e7262400dfc2b8528b032c5d89cccd6fd33581fa77e6623d8a701e8a2c0f9b9d6fde6e9b00c6d72d5ae2b9a8147676a928b055b5529ee36.jpg'
  },
  // ... more items
];

function handleCardClick(card, index) {
  console.log('Clicked card:', card);
}
</script>
```

---

## ⚛️ Quick Start: React

1. **Install Three.js**:
```bash
npm install three
npm install -D @types/three
```

2. **Copy `TapeKidsOrbitSlider.tsx` and `earth-texture.png`**:
Place `TapeKidsOrbitSlider.tsx` in your `src/components/` folder and `earth-texture.png` in your `public/` directory.

3. **Use in your page**:
```tsx
import React from 'react';
import { TapeKidsOrbitSlider } from './components/TapeKidsOrbitSlider';

export default function HomePage() {
  return (
    <TapeKidsOrbitSlider
      globeTextureSrc="/earth-texture.png"
      allUpdatesLink="https://tapekids.org/en/updates"
      onCardClick={(card, index) => {
        console.log('Selected card', card);
      }}
    />
  );
}
```

---

## ✨ Features Included

- **Transparent Water 3D Earth**: Double-pass WebGL sphere rendering giving transparent ocean look with atmospheric back-surface continent glow.
- **Dynamic 1.3x Focal Card Scaling**: Active center card is smoothly scaled up by ~1.3x for immediate visual prominence.
- **100% Opaque Cards**: Inactive cards maintain full opacity with realistic distance contrast and depth-of-field attenuation.
- **Subtle Parallax Pull**: Interactive mouseover pull reacting to cursor movement without distracting from readability.
- **Touch & Drag Controls**: Smooth pointer drag with velocity physics and mathematical snap-to-center.
- **Responsive**: Scales fluidly across mobile phones, tablets, and ultra-wide desktop monitors.
