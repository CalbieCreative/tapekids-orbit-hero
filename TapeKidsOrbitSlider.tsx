import React, { useState, useEffect, useRef } from 'react';

export interface OrbitCardItem {
  id: string | number;
  title: string;
  category?: string;
  image: string;
  url?: string;
}

export interface TapeKidsOrbitSliderProps {
  items?: OrbitCardItem[];
  globeMode?: 'webgl' | 'video';
  globeTextureSrc?: string;
  globeVideoSrc?: string;
  globePosterSrc?: string;
  allUpdatesLink?: string;
  autoRotateSpeed?: number;
  onCardClick?: (card: OrbitCardItem, index: number) => void;
  onActiveChange?: (index: number) => void;
}

const DEFAULT_CARDS: OrbitCardItem[] = [
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
];

export const TapeKidsOrbitSlider: React.FC<TapeKidsOrbitSliderProps> = ({
  items = DEFAULT_CARDS,
  globeMode = 'webgl',
  globeTextureSrc = '/earth-texture.png',
  allUpdatesLink = "https://tapekids.org/en/updates",
  autoRotateSpeed = 0.0016,
  onCardClick,
  onActiveChange
}) => {
  const [currentAngle, setCurrentAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<{ scene: any; camera: any; renderer: any; globe: any } | null>(null);
  const currentAngleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const lastAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);

  // Subtle Mouseover Parallax Refs
  const targetMouseXRef = useRef(0);
  const targetMouseYRef = useRef(0);
  const smoothMouseXRef = useRef(0);
  const smoothMouseYRef = useRef(0);

  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasMovedRef = useRef(false);

  const lastTickTimeRef = useRef(performance.now());

  const N = items.length;
  const stepAngle = (2 * Math.PI) / N;

  const getOrbitParams = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    let earthSize: number, cardW: number, tiltDeg: number, cardScaleMin: number, earthOffsetY: number, stageShiftY: string;

    if (w <= 640) {
      earthSize = Math.min(w * 0.80, 390);
      cardW = Math.min(w * 0.48, 205);
      tiltDeg = 7;
      cardScaleMin = 0.65;
      earthOffsetY = -90;
      stageShiftY = '1.2rem';
      const rx = w * 0.52;
      const rz = Math.round(rx * 0.50);
      return { rx, rz, tiltDeg, cardScaleMin, earthSize, earthOffsetY, stageShiftY, cardW };
    } else if (w <= 1024) {
      earthSize = Math.min(w * 0.66, 540);
      cardW = Math.min(w * 0.22, 220);
      tiltDeg = 8;
      cardScaleMin = 0.68;
      earthOffsetY = -75;
      stageShiftY = '0.5rem';
      const rGlobe = earthSize / 2;
      const minClearanceRx = (rGlobe + (cardW / 2) + 10) / 0.866;
      const maxRx = (w / 2) - (cardW / 2) - 18;
      const rx = Math.min(maxRx, Math.max(minClearanceRx, w * 0.40));
      const rz = Math.round(rx * 0.52);
      return { rx, rz, tiltDeg, cardScaleMin, earthSize, earthOffsetY, stageShiftY, cardW };
    } else {
      // 72vw max on large screens
      earthSize = Math.min(w * 0.72, 840);
      cardW = Math.min(w * 0.14, 230);
      tiltDeg = 9;
      cardScaleMin = 0.70;
      earthOffsetY = 0;
      stageShiftY = '-1.2rem';
      const rGlobe = earthSize / 2;
      const minClearanceRx = (rGlobe + (cardW / 2) + 16) / 0.866;
      const maxRx = (w / 2) - (cardW / 2) - 32;
      const rx = Math.min(maxRx, Math.max(minClearanceRx, w * 0.40));
      const rz = Math.round(rx * 0.54);
      return { rx, rz, tiltDeg, cardScaleMin, earthSize, earthOffsetY, stageShiftY, cardW };
    }
  };

  const stepPrev = () => {
    const currentStep = Math.round(targetAngleRef.current / stepAngle);
    const next = (currentStep + 1) * stepAngle;
    targetAngleRef.current = next;
    setTargetAngle(next);
  };

  const stepNext = () => {
    const currentStep = Math.round(targetAngleRef.current / stepAngle);
    const next = (currentStep - 1) * stepAngle;
    targetAngleRef.current = next;
    setTargetAngle(next);
  };

  const rotateToIndex = (targetIndex: number) => {
    const currentStep = Math.round(targetAngleRef.current / stepAngle);
    const normalized = ((-currentStep % N) + N) % N;
    let diff = targetIndex - normalized;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    const next = (currentStep - diff) * stepAngle;
    targetAngleRef.current = next;
    setTargetAngle(next);
  };

  const onSectionPointerMove = (e: React.PointerEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    targetMouseXRef.current = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
    targetMouseYRef.current = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));
  };

  const onSectionPointerLeave = () => {
    targetMouseXRef.current = 0;
    targetMouseYRef.current = 0;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX;
    const deltaX = clientX - lastXRef.current;
    if (Math.abs(clientX - startXRef.current) > 6) {
      hasMovedRef.current = true;
    }
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);
    const angularDelta = deltaX * 0.0035;

    currentAngleRef.current += angularDelta;
    targetAngleRef.current = currentAngleRef.current;
    velocityRef.current = (angularDelta / dt) * 16.6;

    lastXRef.current = clientX;
    lastTimeRef.current = now;
    setCurrentAngle(currentAngleRef.current);
  };

  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    const base = Math.abs(velocityRef.current) > 0.005
      ? currentAngleRef.current + velocityRef.current * 15
      : currentAngleRef.current;

    const snapped = Math.round(base / stepAngle) * stepAngle;
    targetAngleRef.current = snapped;
    setTargetAngle(snapped);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && canvasRef.current) {
      const THREE = (window as any).THREE;
      if (THREE) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const size = Math.max(300, container ? container.clientWidth : 720);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(39.5, 1, 0.1, 100);
        camera.position.z = 2.85;

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance'
        });
        renderer.setSize(size, size);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.12);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.42);
        dirLight.position.set(-2.5, 3.2, 4);
        scene.add(dirLight);

        const globe = new THREE.Group();
        scene.add(globe);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(globeTextureSrc, (tex: any) => {
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          if (renderer) {
            tex.anisotropy = Math.min(16, renderer.capabilities.getMaxAnisotropy());
          }
          const geometry = new THREE.SphereGeometry(1, 96, 96);

          // 1. Far side / back continents (faintly visible through transparent front ocean)
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
          globe.add(backMesh);

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
          globe.add(frontMesh);

          globe.rotation.y = 1.8;
          threeRef.current = { scene, camera, renderer, globe };
          renderer.render(scene, camera);
        });
      }
    }

    const tick = () => {
      smoothMouseXRef.current += (targetMouseXRef.current - smoothMouseXRef.current) * 0.08;
      smoothMouseYRef.current += (targetMouseYRef.current - smoothMouseYRef.current) * 0.08;

      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current) > 0.0002) {
          currentAngleRef.current += velocityRef.current;
          velocityRef.current *= 0.92;
          setCurrentAngle(currentAngleRef.current);
        } else {
          velocityRef.current = 0;
          const diff = targetAngleRef.current - currentAngleRef.current;
          if (Math.abs(diff) > 0.0002) {
            currentAngleRef.current += diff * 0.12;
            setCurrentAngle(currentAngleRef.current);
          } else {
            currentAngleRef.current = targetAngleRef.current;
            setCurrentAngle(currentAngleRef.current);
          }
        }
      }

      const sliderDelta = currentAngleRef.current - lastAngleRef.current;
      lastAngleRef.current = currentAngleRef.current;

      if (globeMode === 'webgl' && threeRef.current?.renderer && threeRef.current?.globe) {
        threeRef.current.globe.rotation.y += 0.0028 + sliderDelta * 0.85;
        threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
      }

      let closestDist = Infinity;
      let newActive = 0;
      for (let i = 0; i < N; i++) {
        const theta = currentAngleRef.current + i * stepAngle;
        const normAngle = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const dist = Math.min(normAngle, 2 * Math.PI - normAngle);
        if (dist < closestDist) {
          closestDist = dist;
          newActive = i;
        }
      }
      setActiveIndex(newActive);
      onActiveChange?.(newActive);

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (threeRef.current?.renderer) {
        try { threeRef.current.renderer.dispose(); } catch (e) {}
      }
    };
  }, [N, stepAngle, onActiveChange, globeMode, globeTextureSrc]);

  const { rx, rz, tiltDeg, cardScaleMin, earthSize, earthOffsetY, stageShiftY, cardW } = getOrbitParams();
  const tiltRad = (tiltDeg * Math.PI) / 180;

  return (
    <section
      ref={sectionRef}
      onPointerMove={onSectionPointerMove}
      onPointerLeave={onSectionPointerLeave}
      style={{
      position: 'relative',
      width: '100%',
      minHeight: '100svh',
      height: '100svh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #78a3aa 0%, #9fc1c7 40%, #cee0e3 75%, #e1edef 100%)',
      userSelect: 'none'
    }}>
      {/* Atmosphere subtle radiance */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        background: 'radial-gradient(circle at 50% 46%, rgba(255, 255, 255, 0.38) 0%, transparent 68%)'
      }} />

      {/* Earth and Slides Container: max-width 90vw, centered in viewport */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '90vw',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        zIndex: 10
      }}>
        {/* Orbit Viewport */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'pan-y pinch-zoom'
          }}
          onPointerDown={onPointerDown}
          onMouseEnter={() => { isHoveredRef.current = true; }}
          onMouseLeave={() => { isHoveredRef.current = false; }}
        >
          {/* Orbit Stage */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 0,
            height: 0,
            pointerEvents: 'none',
            transform: `translateY(${stageShiftY})`
          }}>
            {/* Guide Ring */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: rx * 2 + 80,
              height: rz * 2 + 50,
              marginLeft: -(rx + 40),
              marginTop: -(rz + 25),
              borderRadius: '50%',
              border: '1.5px dashed rgba(255, 255, 255, 0.32)',
              pointerEvents: 'none',
              zIndex: 48,
              transform: 'rotateX(74deg)'
            }} />

            {/* Earth in the Middle */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: earthSize,
              height: earthSize,
              marginLeft: -earthSize / 2,
              marginTop: -earthSize / 2 + earthOffsetY,
              borderRadius: '50%',
              zIndex: 50,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 20px 55px rgba(28, 62, 70, 0.38), inset 0 0 50px rgba(255, 255, 255, 0.4), 0 0 75px rgba(144, 187, 194, 0.45)',
              transition: 'margin-top 0.3s ease'
            }}>
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  display: 'block',
                  pointerEvents: 'none',
                  transform: 'translate3d(0, 0, 0)',
                  backfaceVisibility: 'hidden'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 28%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.03) 45%, rgba(144, 187, 194, 0.20) 100%)',
                pointerEvents: 'none'
              }} />
            </div>

            {/* Cards as direct siblings */}
            {items.map((card, i) => {
              const theta = currentAngle + i * stepAngle;
              const cosT = Math.cos(theta);
              const sinT = Math.sin(theta);
              const x = sinT * rx;
              const z = cosT * rz;
              const y = -cosT * Math.sin(tiltRad) * 65;
              const normZ = (z + rz) / (2 * rz);

              // Active Card Hero Scaling: blossoms to ~1.36x scale at front center
              const baseScale = cardScaleMin + normZ * (1.0 - cardScaleMin);
              const focalBoost = Math.pow(normZ, 2.8) * 0.36;
              const scale = baseScale + focalBoost;

              const rotateY = -sinT * 22;
              const rotateZ = -sinT * 2.5;

              // Subtle mouseover animation pull (active card pulls most noticeably, disabled during drag):
              const pullFactor = 0.35 + 0.65 * Math.pow(normZ, 2.0);
              const pullX = isDragging ? 0 : smoothMouseXRef.current * 16 * pullFactor;
              const pullY = isDragging ? 0 : smoothMouseYRef.current * 5 * pullFactor;
              const pullRotY = isDragging ? 0 : smoothMouseXRef.current * 2.5 * pullFactor;
              const pullRotX = isDragging ? 0 : -smoothMouseYRef.current * 1.5 * pullFactor;

              // Inactive cards: fully opaque with realistic contrast & depth attenuation
              const contrast = 0.72 + normZ * 0.28;
              const brightness = 0.88 + normZ * 0.12;

              let zIndex: number;
              let opacity: number;
              let pointerEvents: 'auto' | 'none';
              let visibility: 'visible' | 'hidden';
              let filter = 'none';

              if (normZ >= 0.55) {
                // Front hemisphere: 100% FULLY OPAQUE, crisp, interactive
                zIndex = 70 + Math.round(normZ * 30);
                opacity = 1;
                pointerEvents = 'auto';
                visibility = 'visible';
                if (normZ <= 0.88) {
                  filter = `contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
                }
              } else if (normZ >= 0.45) {
                // Horizon edge transition: smoothly fades in/out as cards round behind the globe
                const fade = (normZ - 0.45) / 0.1;
                zIndex = 55 + Math.round(normZ * 10);
                opacity = fade;
                pointerEvents = 'none';
                visibility = 'visible';
                filter = `contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`;
              } else {
                // Far side of the globe: strictly hidden to eliminate any overlapping or ghosting
                zIndex = 1;
                opacity = 0;
                pointerEvents = 'none';
                visibility = 'hidden';
              }

              const isActive = activeIndex === i;

              return (
                <div
                  key={card.id || i}
                  onClick={() => {
                    if (hasMovedRef.current) return;
                    if (isActive) {
                      onCardClick?.(card, i);
                    } else {
                      rotateToIndex(i);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: cardW,
                    height: Math.round(cardW * 1.7),
                    marginLeft: -cardW / 2,
                    marginTop: -Math.round(cardW * 1.7) / 2,
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    pointerEvents,
                    visibility,
                    transformOrigin: 'center center',
                    transform: `perspective(1200px) translate3d(${(x + pullX).toFixed(1)}px, ${(y + pullY).toFixed(1)}px, 0) rotateX(${pullRotX.toFixed(1)}deg) rotateY(${(rotateY + pullRotY).toFixed(1)}deg) rotateZ(${rotateZ.toFixed(1)}deg) scale(${scale.toFixed(3)})`,
                    zIndex,
                    opacity,
                    filter,
                    boxShadow: isActive
                      ? '0 28px 60px rgba(0, 0, 0, 0.45), 0 0 0 3px rgba(255, 255, 255, 0.95), 0 0 35px rgba(255, 255, 255, 0.55)'
                      : 'none',
                    transition: 'box-shadow 0.25s ease',
                    background: '#111'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      loading="lazy"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.78) 80%, rgba(0,0,0,0.94) 100%)'
                    }} />
                    {card.category && (
                      <div style={{
                        position: 'absolute',
                        top: '0.9rem',
                        left: '0.9rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: 999,
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        background: 'rgba(0, 0, 0, 0.45)',
                        backdropFilter: 'blur(8px)',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.25)'
                      }}>
                        {card.category}
                      </div>
                    )}
                    <h3 style={{
                      position: 'relative',
                      zIndex: 2,
                      padding: '1.15rem 1rem',
                      fontSize: '1.18rem',
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1.25,
                      fontFamily: 'Figtree, sans-serif',
                      textWrap: 'balance'
                    }}>
                      {card.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chevrons */}
        <button
          onClick={stepPrev}
          aria-label="Previous card"
          style={{
            position: 'absolute',
            top: '50%',
            left: '0.5rem',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 250,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          ◀
        </button>
        <button
          onClick={stepNext}
          aria-label="Next card"
          style={{
            position: 'absolute',
            top: '50%',
            right: '0.5rem',
            transform: 'translateY(-50%)',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 250,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
          }}
        >
          ▶
        </button>
      </div>

      {/* Bottom Contrasting Half-Circle Pedestal */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'clamp(340px, 40vw, 560px)',
        height: '5.2rem',
        background: '#ffffff',
        borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        boxShadow: '0 -10px 35px rgba(28, 62, 70, 0.16), 0 -2px 10px rgba(88, 130, 137, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        zIndex: 150,
        paddingTop: '0.6rem',
        paddingBottom: '0.2rem'
      }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => rotateToIndex(i)}
              style={{
                width: activeIndex === i ? 24 : 9,
                height: 9,
                borderRadius: 999,
                background: activeIndex === i ? '#588289' : 'rgba(88, 130, 137, 0.35)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            />
          ))}
        </div>
        {/* All Updates button */}
        <a
          href={allUpdatesLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#588289',
            textDecoration: 'none',
            padding: '0.3rem 0.9rem',
            borderRadius: 999,
            background: 'rgba(88, 130, 137, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          All Updates →
        </a>
      </div>
    </section>
  );
};

export default TapeKidsOrbitSlider;
