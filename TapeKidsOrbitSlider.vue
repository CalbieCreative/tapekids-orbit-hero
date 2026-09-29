<template>
  <section
    class="hero-orbit-section"
    ref="sectionRef"
    @pointermove="onSectionPointerMove"
    @pointerleave="onSectionPointerLeave"
  >
    <div class="hero-atmosphere"></div>

    <!-- Earth & Slides Container: max-width 90vw, centered in viewport -->
    <div class="orbit-component-container">
      <div
        class="orbit-viewport"
        :class="{ 'is-dragging': isDragging }"
        ref="viewportRef"
        @pointerdown="onPointerDown"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <!-- 3D Orbit Stage where Earth & Cards reside as direct siblings -->
        <div class="orbit-stage">
          <!-- Guide ring -->
          <div class="orbit-ring-guide" :style="guideRingStyle"></div>

          <!-- Earth in the Middle (Hardware WebGL with Transparent Oceans) -->
          <div class="earth-container">
            <canvas
              ref="earthCanvasRef"
              class="earth-canvas"
            ></canvas>
            <div class="earth-atmosphere-glow"></div>
          </div>

          <!-- Cards as direct siblings of the earth -->
          <div
            v-for="(card, index) in items"
            :key="card.id || index"
            class="orbit-card"
            :class="{ 'is-active': activeIndex === index }"
            :style="cardStyles[index]"
            @click="onCardClick(index)"
          >
            <div class="card-inner">
              <img class="card-image" :src="card.image" :alt="card.title" loading="lazy" />
              <div class="card-scrim"></div>
              <div v-if="card.category" class="card-badge">{{ card.category }}</div>
              <h3 class="card-title">{{ card.title }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Chevrons -->
      <button class="nav-arrow prev" @click="stepPrev" aria-label="Previous card">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button class="nav-arrow next" @click="stepNext" aria-label="Next card">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- Bottom Contrasting Half-Circle Pedestal (comes up 4-6rem from bottom edge) -->
    <div class="bottom-half-circle-pedestal">
      <!-- Bullets / Dots -->
      <div class="orbit-dots">
        <button
          v-for="(card, index) in items"
          :key="'dot-' + index"
          class="orbit-dot"
          :class="{ 'is-active': activeIndex === index }"
          :aria-label="`Go to ${card.title}`"
          @click="rotateToIndex(index)"
        ></button>
      </div>

      <!-- All Updates Button -->
      <router-link v-if="allUpdatesLink" :to="allUpdatesLink" class="all-updates-btn">
        All Updates
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

export interface OrbitCardItem {
  id: string | number;
  title: string;
  category?: string;
  image: string;
  url?: string;
}

const props = withDefaults(
  defineProps<{
    items?: OrbitCardItem[];
    globeMode?: 'webgl' | 'video';
    globeTextureSrc?: string;
    globeVideoSrc?: string;
    globePosterSrc?: string;
    allUpdatesLink?: string;
    autoRotateSpeed?: number;
  }>(),
  {
    globeMode: 'webgl',
    globeTextureSrc: '/earth-texture.png',
    items: () => [
      {
        id: "its-in-you",
        title: "It's In You",
        category: "Creations",
        image: "https://content.branham.org/assets/1/1207762fc30598f35e7262400dfc2b8528b032c5d89cccd6fd33581fa77e6623d8a701e8a2c0f9b9d6fde6e9b00c6d72d5ae2b9a8147676a928b055b5529ee36.jpg"
      },
      {
        id: "god-rich-mercy",
        title: "The God Who Is Rich In Mercy",
        category: "Updates",
        image: "https://content.branham.org/assets/1/ab15cb9a63ce0bf60b33e90bc7d110578b1dcadcf36db9ba72019aa644056842c9ae8c67f3861c462b1f51158636ced1362d45c9a0d24f44274fd5d899a4fe66.jpg"
      },
      {
        id: "coloring-book-stats",
        title: "Coloring Book Stats",
        category: "Creations",
        image: "https://content.branham.org/assets/1/a8cd614bf399629ea9aecf455a8a243064d1529900aba8957946759940433587d12a30ee73ae5894f207cd561b924cc7cf997facd0eda45aa7e61915692485db.jpg"
      },
      {
        id: "wesley-birthplace",
        title: "John Wesley's Birthplace",
        category: "History",
        image: "https://content.branham.org/assets/1/77a4cd54ab94035f9912126356f7466c0d8c8df36ca18e28cdb0f26fddb75a9aa2b37b226aa009b4339d202ef6d2ab437da82dca9558441d130ef7067c02ac89.png"
      },
      {
        id: "save-tapekids-app",
        title: "Save TapeKids.org to your smartphone home screen",
        category: "Tips",
        image: "https://content.branham.org/assets/1/e0a22d013c3842d1d6ef52771f53bba97f6c290ce55036199e76993615d007109d22d56d801e1b44ebe5605be1e0c2e9aed9c01638c0671e670e5f42bdf0f3b7.jpg"
      },
      {
        id: "laodicean-age",
        title: "The Laodicean Church Age",
        category: "Church Ages",
        image: "https://content.branham.org/assets/1/9eaee6098b2c9e9eaceeb142b61a576389ba617f330e9ebeabc2cf68ffc69ba9b558edd23a895c5983c7c6a0f8a4f883fb46ec5f6e34177186dded38e92b0145.jpg"
      }
    ],
    allUpdatesLink: "/updates",
    autoRotateSpeed: 0.0016
  }
);

const emit = defineEmits<{
  (e: 'cardClick', card: OrbitCardItem, index: number): void;
  (e: 'activeChange', index: number): void;
}>();

const sectionRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);
const earthCanvasRef = ref<HTMLCanvasElement | null>(null);

let threeScene: any = null;
let threeCamera: any = null;
let threeRenderer: any = null;
let threeGlobe: any = null;
let lastAngle = 0;

const N = computed(() => props.items.length);
const stepAngle = computed(() => (2 * Math.PI) / N.value);

const currentAngle = ref(0);
const targetAngle = ref(0);
const velocity = ref(0);
const isDragging = ref(false);
const isHovered = ref(false);
const activeIndex = ref(0);

// Subtle Mouseover Parallax State
const targetMouseX = ref(0);
const targetMouseY = ref(0);
let smoothMouseX = 0;
let smoothMouseY = 0;

let startX = 0;
let lastX = 0;
let lastTime = 0;
let hasMoved = false;
let animFrameId: number | null = null;
let lastTickTime = performance.now();

const cardStyles = ref<Record<string, string>[]>([]);
const guideRingStyle = ref<Record<string, string>>({});

function getOrbitParams() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
  let earthSize: number, cardW: number, tiltDeg: number, cardScaleMin: number;

  if (w <= 640) {
    earthSize = Math.min(w * 0.80, 390);
    cardW = Math.min(w * 0.46, 205);
    tiltDeg = 7;
    cardScaleMin = 0.62;
  } else if (w <= 1024) {
    earthSize = Math.min(w * 0.66, 530);
    cardW = Math.min(w * 0.22, 220);
    tiltDeg = 8;
    cardScaleMin = 0.68;
  } else {
    // 72vw max on large screens
    earthSize = Math.min(w * 0.72, 840);
    cardW = Math.min(w * 0.14, 240);
    tiltDeg = 9;
    cardScaleMin = 0.70;
  }

  const rGlobe = earthSize / 2;
  const minClearanceRx = rGlobe + (cardW / 2) + 18;
  const rx = Math.max(minClearanceRx, w * 0.38);
  const rz = Math.round(rx * 0.56);

  return { rx, rz, tiltDeg, cardScaleMin, earthSize };
}

function updatePositions() {
  const { rx, rz, tiltDeg, cardScaleMin } = getOrbitParams();
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const count = N.value;
  const step = stepAngle.value;

  guideRingStyle.value = {
    width: `${(rx * 2 + 80).toFixed(0)}px`,
    height: `${(rz * 2 + 50).toFixed(0)}px`,
    marginLeft: `-${(rx + 40).toFixed(0)}px`,
    marginTop: `-${(rz + 25).toFixed(0)}px`,
    transform: 'rotateX(74deg)'
  };

  let closestDist = Infinity;
  let newActive = activeIndex.value;
  const newStyles: Record<string, string>[] = [];

  for (let i = 0; i < count; i++) {
    const theta = currentAngle.value + i * step;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const x = sinT * rx;
    const z = cosT * rz;
    const y = -cosT * Math.sin(tiltRad) * 65;

    const normZ = (z + rz) / (2 * rz);

    // Active Card ~1.3x Larger Hero Scaling
    const baseScale = cardScaleMin + normZ * (1.0 - cardScaleMin);
    const focalBoost = Math.pow(normZ, 2.8) * 0.36;
    const scale = baseScale + focalBoost;

    const rotateY = -sinT * 25;
    const rotateZ = -sinT * 3;

    // Subtle mouseover animation pull:
    const pullFactor = 0.35 + 0.65 * Math.pow(normZ, 2.0);
    const pullX = smoothMouseX * 18 * pullFactor;
    const pullY = smoothMouseY * 6 * pullFactor;
    const pullRotY = smoothMouseX * 3.5 * pullFactor;
    const pullRotX = -smoothMouseY * 2.0 * pullFactor;

    // All inactive cards are FULLY OPAQUE - zero transparency at any point!
    // Lower contrast more and more the further away the cards are
    const contrast = 0.65 + normZ * 0.35;
    const brightness = 0.85 + normZ * 0.15;
    const blurPx = Math.max(0, (0.45 - normZ) * 2.2);

    let zIndex: number;
    let filter = 'none';

    if (z >= 0) {
      zIndex = 60 + Math.round(normZ * 35);
      if (normZ <= 0.88) {
        filter = `contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
      }
    } else {
      zIndex = 10 + Math.round(normZ * 35);
      filter = `contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)}) blur(${blurPx.toFixed(1)}px)`;
    }

    newStyles.push({
      transform: `perspective(1200px) translate3d(${(x + pullX).toFixed(1)}px, ${(y + pullY).toFixed(1)}px, 0) rotateX(${pullRotX.toFixed(1)}deg) rotateY(${(rotateY + pullRotY).toFixed(1)}deg) rotateZ(${rotateZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
      zIndex: String(zIndex),
      opacity: '1',
      filter
    });

    const normAngle = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const distToCenter = Math.min(normAngle, 2 * Math.PI - normAngle);
    if (distToCenter < closestDist) {
      closestDist = distToCenter;
      newActive = i;
    }
  }

  cardStyles.value = newStyles;

  if (newActive !== activeIndex.value) {
    activeIndex.value = newActive;
    emit('activeChange', newActive);
  }
}

function tick() {
  smoothMouseX += (targetMouseX.value - smoothMouseX) * 0.08;
  smoothMouseY += (targetMouseY.value - smoothMouseY) * 0.08;

  if (!isDragging.value) {
    if (Math.abs(velocity.value) > 0.0002) {
      currentAngle.value += velocity.value;
      velocity.value *= 0.92;
    } else {
      velocity.value = 0;
      const diff = targetAngle.value - currentAngle.value;
      if (Math.abs(diff) > 0.0002) {
        currentAngle.value += diff * 0.12;
      } else {
      }
    }
  }

  const sliderDelta = currentAngle.value - lastAngle;
  lastAngle = currentAngle.value;

  if (threeRenderer && threeScene && threeCamera && threeGlobe) {
    threeGlobe.rotation.y += 0.0028 + sliderDelta * 0.85;
    threeRenderer.render(threeScene, threeCamera);
  }

  updatePositions();
  animFrameId = requestAnimationFrame(tick);
}

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return;
  isDragging.value = true;
  hasMoved = false;
  startX = e.clientX;
  lastX = startX;
  lastTime = performance.now();
  velocity.value = 0;

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return;
  const clientX = e.clientX;
  const deltaX = clientX - lastX;
  if (Math.abs(clientX - startX) > 6) {
    hasMoved = true;
  }
  const now = performance.now();
  const dt = Math.max(1, now - lastTime);
  const angularDelta = deltaX * 0.0035;

  currentAngle.value += angularDelta;
  targetAngle.value = currentAngle.value;
  velocity.value = (angularDelta / dt) * 16.6;

  lastX = clientX;
  lastTime = now;
}

function onPointerUp() {
  if (!isDragging.value) return;
  isDragging.value = false;

  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerUp);

  if (Math.abs(velocity.value) > 0.005) {
    snapToNearest(currentAngle.value + velocity.value * 15);
  } else {
    snapToNearest(currentAngle.value);
  }
}

function snapToNearest(baseAngle: number) {
  const step = stepAngle.value;
  const snappedStep = Math.round(baseAngle / step);
  targetAngle.value = snappedStep * step;
}

function stepPrev() {
  // Step to previous card (centers previous card with exact mathematical alignment)
  const step = stepAngle.value;
  const currentStep = Math.round(targetAngle.value / step);
  targetAngle.value = (currentStep + 1) * step;
}

function stepNext() {
  // Step to next card (centers next card with exact mathematical alignment)
  const step = stepAngle.value;
  const currentStep = Math.round(targetAngle.value / step);
  targetAngle.value = (currentStep - 1) * step;
}

function rotateToIndex(targetIndex: number) {
  const step = stepAngle.value;
  const count = N.value;
  const currentTargetStep = Math.round(targetAngle.value / step);
  const currentNormalized = ((-currentTargetStep % count) + count) % count;

  let diff = targetIndex - currentNormalized;
  if (diff > count / 2) diff -= count;
  if (diff < -count / 2) diff += count;

  targetAngle.value = (currentTargetStep - diff) * step;
}

function onCardClick(index: number) {
  if (hasMoved) return;
  if (index === activeIndex.value) {
    emit('cardClick', props.items[index], index);
  } else {
    rotateToIndex(index);
  }
}

function onSectionPointerMove(e: PointerEvent) {
  if (!sectionRef.value) return;
  const rect = sectionRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  targetMouseX.value = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
  targetMouseY.value = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
}

function onSectionPointerLeave() {
  targetMouseX.value = 0;
  targetMouseY.value = 0;
}

function initThreeGlobe() {
  if (typeof window === 'undefined') return;
  const THREE = (window as any).THREE;
  if (!THREE || !earthCanvasRef.value) return;

  const container = earthCanvasRef.value.parentElement;
  const size = Math.max(300, container ? container.clientWidth : 720);

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(39.5, 1, 0.1, 100);
  threeCamera.position.z = 2.85;

  threeRenderer = new THREE.WebGLRenderer({
    canvas: earthCanvasRef.value,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  threeRenderer.setSize(size, size);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.12);
  threeScene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.42);
  dirLight.position.set(-2.5, 3.2, 4);
  threeScene.add(dirLight);

  threeGlobe = new THREE.Group();
  threeScene.add(threeGlobe);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    props.globeTextureSrc,
    (tex: any) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      if (threeRenderer) {
        tex.anisotropy = Math.min(16, threeRenderer.capabilities.getMaxAnisotropy());
      }
      const geometry = new THREE.SphereGeometry(1, 96, 96);

      // 1. Far side / back continents (faintly visible through transparent front ocean, like glass globe)
      const backMaterial = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
        depthWrite: false,
        roughness: 0.8,
        metalness: 0.02
      });
      const backMesh = new THREE.Mesh(geometry, backMaterial);
      backMesh.renderOrder = 1;
      threeGlobe.add(backMesh);

      // 2. Near side / front continents (crisp white with 100% transparent water)
      const frontMaterial = new THREE.MeshStandardMaterial({
        map: tex,
        transparent: true,
        opacity: 0.98,
        side: THREE.FrontSide,
        depthWrite: true,
        roughness: 0.65,
        metalness: 0.02
      });
      const frontMesh = new THREE.Mesh(geometry, frontMaterial);
      frontMesh.renderOrder = 2;
      threeGlobe.add(frontMesh);

      threeGlobe.rotation.y = 1.8;
      threeRenderer.render(threeScene, threeCamera);
    },
    undefined,
    (err: any) => {
      console.warn('Failed to load globe texture', err);
    }
  );
}

function onResize() {
  updatePositions();
  if (threeRenderer && threeCamera && earthCanvasRef.value?.parentElement) {
    const size = Math.max(300, earthCanvasRef.value.parentElement.clientWidth);
    threeRenderer.setSize(size, size);
    threeCamera.aspect = 1;
    threeCamera.updateProjectionMatrix();
    if (threeScene && threeGlobe) {
      threeRenderer.render(threeScene, threeCamera);
    }
  }
}

onMounted(() => {
  initThreeGlobe();
  window.addEventListener('resize', onResize);
  updatePositions();
  animFrameId = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (threeRenderer) {
    try { threeRenderer.dispose(); } catch (e) {}
  }
});
</script>

<style scoped>
:root {
  --primary-teal: #588289;
  --light-teal: #90bbc2;
  --sky-mist: #dae9eb;
  --bg-ice: #e1edef;
  --navy-text: #2c3e50;
  --card-w: clamp(200px, 14vw, 240px);
  --card-h: clamp(340px, 24vw, 410px);
  --earth-size: clamp(520px, 72vw, 840px);
  --earth-offset-y: 0px;
}

.hero-orbit-section {
  position: relative;
  width: 100%;
  min-height: 100svh;
  height: 100svh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #78a3aa 0%, #9fc1c7 40%, #cee0e3 75%, #e1edef 100%);
  user-select: none;
  -webkit-user-select: none;
}

.hero-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(circle at 50% 46%, rgba(255, 255, 255, 0.38) 0%, transparent 68%);
}

.orbit-component-container {
  position: relative;
  width: 100%;
  max-width: 90vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  z-index: 10;
}

.orbit-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: pan-y pinch-zoom;
}

.orbit-viewport.is-dragging {
  cursor: grabbing;
}

.orbit-stage {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  transform: translateY(-1.2rem);
}

.orbit-ring-guide {
  position: absolute;
  top: 0;
  left: 0;
  border-radius: 50%;
  border: 1.5px dashed rgba(255, 255, 255, 0.32);
  pointer-events: none;
  z-index: 48;
  transform-origin: center center;
}

.earth-container {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--earth-size, 720px);
  height: var(--earth-size, 720px);
  margin-left: calc(var(--earth-size, 720px) / -2);
  margin-top: calc(var(--earth-size, 720px) / -2 + var(--earth-offset-y, 0px));
  border-radius: 50%;
  z-index: 50; /* Base Earth z-index */
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow:
    0 20px 55px rgba(28, 62, 70, 0.38),
    inset 0 0 50px rgba(255, 255, 255, 0.4),
    0 0 75px rgba(144, 187, 194, 0.45);
  transition: margin-top 0.3s ease;
}

.earth-canvas {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

.earth-atmosphere-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.03) 45%, rgba(144, 187, 194, 0.20) 100%);
  pointer-events: none;
}

.orbit-card {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--card-w, 220px);
  height: var(--card-h, 380px);
  margin-left: calc(var(--card-w, 220px) / -2);
  margin-top: calc(var(--card-h, 380px) / -2);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  pointer-events: auto;
  transform-origin: center center;
  transition: box-shadow 0.25s ease;
  will-change: transform, filter, z-index;
  background: #111;
  opacity: 1;
}

.orbit-card:hover {
  box-shadow: 0 26px 55px rgba(0, 0, 0, 0.4);
}

.orbit-card.is-active {
  box-shadow:
    0 28px 60px rgba(0, 0, 0, 0.45),
    0 0 0 3px rgba(255, 255, 255, 0.95),
    0 0 35px rgba(255, 255, 255, 0.55);
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  transition: transform 0.4s ease;
}

.orbit-card:hover .card-image {
  transform: scale(1.04);
}

.card-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.02) 0%,
    rgba(0, 0, 0, 0.12) 40%,
    rgba(0, 0, 0, 0.78) 80%,
    rgba(0, 0, 0, 0.94) 100%
  );
  pointer-events: none;
}

.card-badge {
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(8px);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.card-title {
  position: relative;
  z-index: 2;
  padding: 1.15rem 1rem;
  font-size: 1.18rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.25;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
  font-family: 'Figtree', sans-serif;
  text-wrap: balance;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 250;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.nav-arrow:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
}

.nav-arrow.prev { left: 0.5rem; }
.nav-arrow.next { right: 0.5rem; }

/* Half-circle pedestal at bottom edge */
.bottom-half-circle-pedestal {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: clamp(340px, 40vw, 560px);
  height: 5.2rem;
  background: #ffffff;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
  box-shadow:
    0 -10px 35px rgba(28, 62, 70, 0.16),
    0 -2px 10px rgba(88, 130, 137, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  z-index: 150;
  padding-top: 0.6rem;
  padding-bottom: 0.2rem;
}

.orbit-dots {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.orbit-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: rgba(88, 130, 137, 0.35);
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.orbit-dot.is-active {
  width: 24px;
  border-radius: 999px;
  background: #588289;
  box-shadow: 0 2px 8px rgba(88, 130, 137, 0.45);
}

.all-updates-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: #588289;
  text-decoration: none;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  background: rgba(88, 130, 137, 0.1);
  transition: all 0.2s ease;
}

.all-updates-btn:hover {
  background: #588289;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(88, 130, 137, 0.25);
}

@media (max-width: 1024px) {
  :root {
    --card-w: clamp(185px, 22vw, 220px);
    --card-h: clamp(320px, 38vh, 380px);
    --earth-size: clamp(380px, 66vw, 530px);
    --earth-offset-y: -75px;
  }
  .orbit-component-container { max-width: 95vw; }
  .bottom-half-circle-pedestal { width: clamp(320px, 58vw, 440px); height: 4.8rem; }
  .orbit-stage { transform: translateY(0.5rem); }
}

@media (max-width: 640px) {
  :root {
    --card-w: clamp(165px, 46vw, 205px);
    --card-h: clamp(285px, 42vh, 345px);
    --earth-size: clamp(310px, 80vw, 390px);
    --earth-offset-y: -90px;
  }
  .bottom-half-circle-pedestal { width: 88vw; height: 4.5rem; }
  .card-title { font-size: 0.98rem; padding: 0.8rem; }
  .orbit-stage { transform: translateY(1.2rem); }
}
</style>
