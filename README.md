# TapeKids 3D orbital slider

An interactive 3D hero section for TapeKids, featuring cards that orbit a transparent WebGL Earth.

## Included files

- `TapeKidsOrbitSlider.vue`: Vue 3 component using `<script setup lang="ts">` and scoped styles.
- `TapeKidsOrbitSlider.tsx`: React component in TypeScript (`React.FC<TapeKidsOrbitSliderProps>`).
- `earth-texture.png`: 4K map texture with transparent oceans.
- `index.html`: Standalone HTML, CSS, and JavaScript version for local testing or embedding.

## Vue 3 setup

1. Install Three.js:
```bash
npm install three
npm install -D @types/three
```

2. Add component files:
Copy `TapeKidsOrbitSlider.vue` into your `src/components/` directory, and place `earth-texture.png` in your `public/` directory.

3. Use the component:
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

## React setup

1. Install Three.js:
```bash
npm install three
npm install -D @types/three
```

2. Add component files:
Copy `TapeKidsOrbitSlider.tsx` into your `src/components/` directory, and place `earth-texture.png` in your `public/` directory.

3. Use the component:
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

## Features

- Three.js WebGL globe with transparent oceans and atmospheric back-glow
- Active card scales to 1.3x at the center of the orbit
- Inactive cards remain fully opaque, with contrast dropping slightly by distance
- Subtle cursor pull on desktop mouseover
- Touch and mouse dragging with snap-to-center positioning
- Layout adjustments across mobile, tablet, and desktop viewports
