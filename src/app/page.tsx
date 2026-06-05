'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Music, 
  Heart, 
  Zap, 
  Disc, 
  Search, 
  Play, 
  Compass, 
  Volume2, 
  Layers, 
  Tv, 
  Sliders, 
  Radio
} from 'lucide-react';

// Coords & Math Helpers for 3D projection
interface Particle3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  speed: number;
  angle: number;
  distance: number;
}

const albumCovers = [
  { name: 'Aashiqui 2', url: 'https://yt3.googleusercontent.com/3q33amH9hzn1dO8IeAX7TMb1QtEVfvVbqd2eSCaelOXNVmfMjbpDYdqD2HSiXtNP6i5Es7oynkWU2NfOXA=w544-h544-l90-rj' },
  { name: 'Brahmastra', url: 'https://yt3.googleusercontent.com/eLoQKzskAIeNPego41FH2sz5uFy-A3Ynf1rcNdQ4eKv4J10atKk_RKbZDnQ3Ja-UNM8mKSu_-8gNeVYp4g=w544-h544-l90-rj' },
  { name: 'Kabir Singh', url: 'https://yt3.googleusercontent.com/loAKTa9XpvZzV-TORspRPC978Kk_u2l6tYlHTHm-sYfwjmKsJdShoxbmLoPKoq9eZgq-uzpoRPtqEWX09w=w544-h544-l90-rj' },
  { name: 'Rockstar', url: 'https://yt3.googleusercontent.com/KYw74XSQwtKPbZTrHMNEBAnEMg1P1gNGwymnZwBSjstbqSE-MpigGlTIy6IZvC-ERlRkeP0c7VTiZObS=w544-h544-l90-rj' },
  { name: 'Dilwale', url: 'https://yt3.googleusercontent.com/7FxbxKIussM0Pu0YJa9eXy2eN9-f8g82NFoKpeepDQavqn_Auja9TzR_9b1wgMrfHQrGDLOtQymO-PfZ=w544-h544-l90-rj' },
  { name: 'Animal', url: 'https://yt3.googleusercontent.com/tM7On61s7pbU8DsHeusopX-HRQerc4Xyv2Pc5Nveb3F932QuadCwslZEP_yeU7iQk2XX9w-r63nZgZk=w544-h544-l90-rj' }
];

export default function LandingPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll details for global 3D animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative bg-[#050505] text-white overflow-x-hidden">
      {/* Background stars / grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60 z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#080312]/30 to-[#050505] pointer-events-none z-0" />
      
      {/* Floating global dynamic glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-pink-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      {/* Floating Header Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 bg-zinc-950/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm select-none">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white to-zinc-400">
            Sonique
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push('/app')}
            className="text-sm font-semibold text-zinc-400 hover:text-white transition duration-200"
          >
            Web App
          </button>
          <button 
            onClick={() => router.push('/app')}
            className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white px-4 py-2 rounded-full transition duration-300 shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95"
          >
            Launch Sonique
          </button>
        </div>
      </nav>

      {/* SECTION 1 & 2 - HERO AND PARTICLE ORB */}
      <HeroSection scrollYProgress={scrollYProgress} router={router} />

      {/* SECTION 3 - INTERACTIVE PHONE SHOWCASE */}
      <PhoneShowcaseSection />

      {/* SECTION 4 - WHY SONIQUE GRID */}
      <WhySoniqueSection />

      {/* SECTION 5 - MUSIC GALAXY */}
      <MusicGalaxySection scrollYProgress={scrollYProgress} />

      {/* SECTION 6 - APP SCREENSHOTS */}
      <AppScreenshotsSection />

      {/* SECTION 7 - FINAL CTA & FOOTER */}
      <CTASection router={router} />
    </div>
  );
}

// ----------------------------------------------------
// SECTION 1 & 2: HERO & ORB COMPONENT
// ----------------------------------------------------
function HeroSection({ scrollYProgress, router }: { scrollYProgress: any, router: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map scroll progress to Orb position and scale
  // Hero is 0.0 to 0.2 of overall container scroll
  const orbScale = useTransform(scrollYProgress, [0, 0.25], [1.0, 0.35]);
  const orbY = useTransform(scrollYProgress, [0, 0.25], ["0%", "-35%"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coords (-1 to 1)
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 3D Canvas Orb Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.clientWidth);
    let height = (canvas.height = canvas.clientHeight);

    // Dynamic sizing helper
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate particles in a 3D Sphere shape
    const particlesCount = 450;
    const particles: Particle3D[] = [];
    const colorChoices = [
      'rgba(147, 51, 234, ',  // Purple
      'rgba(236, 72, 153, ',  // Pink
      'rgba(59, 130, 246, ',  // Blue
    ];

    for (let i = 0; i < particlesCount; i++) {
      // Spherical coordinate distribution
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;
      const radius = 130 + Math.random() * 30; // sphere thickness

      particles.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        color: colorChoices[i % colorChoices.length],
        size: 1 + Math.random() * 2,
        speed: 0.003 + Math.random() * 0.005,
        angle: Math.random() * Math.PI,
        distance: radius
      });
    }

    // Floating outer orbits
    const orbitCount = 4;
    const orbits = Array.from({ length: orbitCount }).map((_, idx) => {
      return {
        angle: (idx * Math.PI * 2) / orbitCount,
        radius: 260 + idx * 30,
        speed: 0.002 + idx * 0.001,
        color: idx % 2 === 0 ? '#a855f7' : '#ec4899',
        coverUrl: albumCovers[idx % albumCovers.length].url,
        title: albumCovers[idx % albumCovers.length].name,
        phase: Math.random() * Math.PI
      };
    });

    let rotationY = 0;
    let rotationX = 0;

    const render = () => {
      if (!ctx || !canvas) return;

      // Clear with slight trailing opacity for motion blur
      ctx.fillStyle = 'rgba(5, 5, 5, 0.18)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Mouse interactive rotation offsets
      const targetRotationY = mousePos.x * 0.4;
      const targetRotationX = mousePos.y * 0.4;
      rotationY += (targetRotationY - rotationY) * 0.05;
      rotationX += (targetRotationX - rotationX) * 0.05;

      // Auto-rotation over time
      const autoAngle = Date.now() * 0.0004;

      // Perspective variables
      const fov = 400;

      // Render glowing central ambient light
      const radialGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140);
      radialGlow.addColorStop(0, 'rgba(124, 58, 237, 0.15)');
      radialGlow.addColorStop(0.5, 'rgba(236, 72, 153, 0.08)');
      radialGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(cx - 250, cy - 250, 500, 500);

      // Sort particles by depth Z (painters algorithm for 3D simulation)
      const sortedParticles = particles.map(p => {
        // Rotate around Y-axis
        let x1 = p.x * Math.cos(rotationY + autoAngle) - p.z * Math.sin(rotationY + autoAngle);
        let z1 = p.x * Math.sin(rotationY + autoAngle) + p.z * Math.cos(rotationY + autoAngle);

        // Rotate around X-axis
        let y2 = p.y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        let z2 = p.y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

        // Slow wave oscillation
        const wave = Math.sin(autoAngle * 2 + p.angle) * 8;
        y2 += wave;

        return { ...p, rx: x1, ry: y2, rz: z2 };
      });

      sortedParticles.sort((a, b) => b.rz - a.rz);

      // Render particles
      sortedParticles.forEach(p => {
        const scale = fov / (fov + p.rz);
        const px = cx + p.rx * scale;
        const py = cy + p.ry * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          // Glow intensity based on depth
          const alpha = Math.max(0.1, Math.min(1.0, (fov - p.rz) / (fov * 0.8)));
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${alpha})`;
          ctx.fill();

          // Sparkle halo for close particles
          if (p.rz < -50 && Math.random() > 0.98) {
            ctx.beginPath();
            ctx.arc(px, py, p.size * scale * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
            ctx.fill();
          }
        }
      });

      // Render orbiting album cover planets
      orbits.forEach(orb => {
        orb.angle += orb.speed;
        
        // Circular orbit formula with inclination
        const ox = orb.radius * Math.cos(orb.angle);
        const oy = orb.radius * Math.sin(orb.angle) * 0.3; // inclined flat ring projection
        const oz = orb.radius * Math.sin(orb.angle) * 0.9;

        // Apply mouse rotation to orbits
        let rx = ox * Math.cos(rotationY) - oz * Math.sin(rotationY);
        let rz = ox * Math.sin(rotationY) + oz * Math.cos(rotationY);
        let ry = oy * Math.cos(rotationX) - rz * Math.sin(rotationX);
        let finalZ = oy * Math.sin(rotationX) + rz * Math.cos(rotationX);

        const scale = fov / (fov + finalZ);
        const px = cx + rx * scale;
        const py = cy + ry * scale;

        // Draw orbit paths (faint lines behind the orb)
        if (finalZ > 0) {
          ctx.beginPath();
          ctx.arc(px, py, 6 * scale, 0, Math.PI * 2);
          ctx.fillStyle = orb.color;
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Project album shape
        const cardSize = 40 * scale;
        
        // Draw a miniature neon glass box around orbits
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.2, scale * 0.5)})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(px - cardSize / 2, py - cardSize / 2, cardSize, cardSize);

        // Dynamic light ring
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 15;
        
        // Quick CD record graphic inside
        ctx.beginPath();
        ctx.arc(px, py, cardSize * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#111';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, cardSize * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.fill();
        
        ctx.shadowBlur = 0; // reset
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mousePos]);

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-[200vh] flex flex-col items-center justify-start z-10 pt-24"
    >
      {/* PERSISTENT CANVASES & ORB WIDGET */}
      <motion.div 
        style={{ scale: orbScale, y: orbY }}
        className="fixed inset-0 w-full h-screen pointer-events-none z-10 flex items-center justify-center"
      >
        <canvas ref={canvasRef} className="w-full h-full max-w-[900px] max-h-[900px] opacity-90 transition-all duration-300" />
      </motion.div>

      {/* HERO HERO TITLE SECTION (0vh - 100vh) */}
      <div className="h-screen w-full flex flex-col justify-center items-center relative z-20 text-center px-4">
        
        {/* Glowing badge */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-6 shadow-2xl"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold tracking-wider text-purple-200 uppercase">Version 2.0 Streaming Engine</span>
        </motion.div>

        {/* Big brand name */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-7xl md:text-9xl font-black tracking-tighter text-white uppercase select-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          Sonique
        </motion.h1>

        {/* Headline */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-3xl md:text-5xl font-extrabold tracking-tight mt-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500"
        >
          Music Reimagined
        </motion.h2>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-zinc-400 max-w-md mt-4 text-sm md:text-base"
        >
          Discover, Stream and Feel Every Beat. A futuristic universe of sound with zero latency, syncing across all your screens.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-wrap gap-4 mt-8 justify-center"
        >
          <button 
            onClick={() => router.push('/app')}
            className="flex items-center gap-2 font-bold bg-white text-black px-8 py-3.5 rounded-full hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl"
          >
            <span>Start Listening</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const features = document.getElementById('why-sonique');
              if (features) features.scrollIntoView({ behavior: 'smooth' });
            }}
            className="font-bold bg-white/5 border border-white/10 px-8 py-3.5 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
          >
            Explore Features
          </button>
        </motion.div>
      </div>

      {/* SECTION 2: SCROLL REVEAL FEATURE CARDS */}
      <div id="features" className="w-full max-w-5xl mx-auto px-6 py-20 relative z-20 mt-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
            Next-Gen Features
          </h2>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Experience audio playback designed for high-fidelity devices, rendering crystal-clear vocals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Music className="w-6 h-6 text-purple-400" />} 
            title="Unlimited Music" 
            desc="Millions of tracks and music albums available in high definition."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Sliders className="w-6 h-6 text-pink-400" />} 
            title="Synced Lyrics" 
            desc="Live synchronized lyrics scrolling line by line in real-time."
            delay={0.25}
          />
          <FeatureCard 
            icon={<Heart className="w-6 h-6 text-red-400" />} 
            title="Favorites" 
            desc="Curate your personal library, custom playlists and profiles."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-blue-400" />} 
            title="Lightning Fast" 
            desc="Optimized playback, instant queries, and light-speed response."
            delay={0.55}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 60 }}
      whileHover={{ y: -8 }}
      className="group relative rounded-2xl bg-zinc-900/40 border border-white/5 p-6 backdrop-blur-xl transition duration-300 hover:border-purple-500/30 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner group-hover:bg-purple-500/10 group-hover:border-purple-500/20 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-purple-300 transition duration-300">
        {title}
      </h3>
      <p className="text-zinc-400 text-sm leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}

// ----------------------------------------------------
// SECTION 3: INTERACTIVE PHONE SHOWCASE
// ----------------------------------------------------
const phoneScreens = [
  {
    id: 'home',
    name: 'Home Dashboard',
    layout: (
      <div className="w-full h-full bg-[#09090b] p-4 text-left font-sans text-[10px] select-none flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-purple-500 flex items-center justify-center text-[8px] font-black">S</div>
            <span className="font-extrabold text-[9px] text-white">Sonique</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
        </div>
        <div className="rounded-lg bg-gradient-to-r from-purple-600/30 to-pink-500/20 border border-white/5 p-3 flex flex-col gap-1">
          <span className="text-[7px] text-zinc-400 tracking-wider uppercase font-semibold">AI recommendation engine active</span>
          <span className="text-xs font-bold text-white">Good Evening</span>
          <span className="text-[8px] text-zinc-400">Discover handpicked recommendation shelves.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-[9px] text-zinc-300">Popular Music Albums</span>
          <div className="flex gap-2 overflow-x-hidden">
            <div className="w-14 shrink-0 flex flex-col gap-1 bg-zinc-900/50 p-1.5 rounded-lg border border-white/5">
              <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden bg-cover" style={{ backgroundImage: `url(${albumCovers[0].url})` }} />
              <span className="text-[7px] font-bold text-white truncate">{albumCovers[0].name}</span>
            </div>
            <div className="w-14 shrink-0 flex flex-col gap-1 bg-zinc-900/50 p-1.5 rounded-lg border border-white/5">
              <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden bg-cover" style={{ backgroundImage: `url(${albumCovers[1].url})` }} />
              <span className="text-[7px] font-bold text-white truncate">{albumCovers[1].name}</span>
            </div>
            <div className="w-14 shrink-0 flex flex-col gap-1 bg-zinc-900/50 p-1.5 rounded-lg border border-white/5">
              <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden bg-cover" style={{ backgroundImage: `url(${albumCovers[2].url})` }} />
              <span className="text-[7px] font-bold text-white truncate">{albumCovers[2].name}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-[9px] text-zinc-300">Trending Now</span>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between bg-white/5 p-1.5 rounded-lg border border-white/5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-zinc-800" />
                <div className="flex flex-col">
                  <span className="font-bold text-[8px] text-white">Channa Mereya</span>
                  <span className="text-[6px] text-zinc-500">Pritam</span>
                </div>
              </div>
              <Play className="w-2.5 h-2.5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'search',
    name: 'Advanced Search',
    layout: (
      <div className="w-full h-full bg-[#09090b] p-4 text-left font-sans text-[10px] select-none flex flex-col gap-3">
        <span className="font-black text-sm text-white">Search</span>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search songs, artists..." 
            disabled
            value="Pritam Hits"
            className="w-full bg-zinc-900 border border-white/5 rounded-full py-1 px-6 text-[8px] text-zinc-200 outline-none"
          />
          <Search className="w-2.5 h-2.5 text-purple-400 absolute left-2 top-1.5" />
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/20 text-[6px] text-purple-300">Audios</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[6px] text-zinc-400">Videos</span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[6px] text-zinc-400">Playlists</span>
        </div>
        <div className="flex flex-col gap-1.5 mt-2">
          <span className="font-bold text-[9px] text-zinc-300">Search Results</span>
          <div className="flex flex-col gap-1">
            {[
              { title: 'Channa Mereya', desc: 'Ae Dil Hai Mushkil' },
              { title: 'Kesariya', desc: 'Brahmastra' },
              { title: 'Tum Kya Mile', desc: 'Rocky Aur Rani Ki Prem Kahaani' }
            ].map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-900/40 border border-white/5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded bg-cover" style={{ backgroundImage: `url(${albumCovers[idx % albumCovers.length].url})` }} />
                  <div className="flex flex-col">
                    <span className="font-bold text-[8px] text-white">{s.title}</span>
                    <span className="text-[6px] text-zinc-500">{s.desc}</span>
                  </div>
                </div>
                <Play className="w-2 h-2 text-zinc-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'lyrics',
    name: 'Synced Lyrics',
    layout: (
      <div className="w-full h-full bg-gradient-to-b from-[#180828] to-[#09090b] p-4 text-left font-sans text-[10px] select-none flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-cover" style={{ backgroundImage: `url(${albumCovers[1].url})` }} />
          <div className="flex flex-col">
            <span className="font-bold text-[8px] text-white">Kesariya</span>
            <span className="text-[6px] text-zinc-400">Arijit Singh</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-3 py-2 justify-center font-bold text-[11px] leading-relaxed text-zinc-500/80">
          <p className="text-zinc-500/40">Mujhse itna door na jaa</p>
          <p className="text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Kesariya tera ishq hai piya</p>
          <p className="text-zinc-300">Rang jaaun jo main haath lagaaun</p>
          <p className="text-zinc-500">Din beete saara teri fikr mein</p>
        </div>
        <div className="flex items-center gap-2 border-t border-white/5 pt-2">
          <Play className="w-3.5 h-3.5 text-white" />
          <div className="flex-1 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div className="w-[45%] h-full bg-purple-500" />
          </div>
          <span className="text-[6px] text-zinc-500">1:42 / 3:15</span>
        </div>
      </div>
    )
  },
  {
    id: 'player',
    name: 'Interactive Player',
    layout: (
      <div className="w-full h-full bg-[#050505] p-4 text-center font-sans text-[10px] select-none flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[7px] text-zinc-500 uppercase tracking-widest font-bold">Now Playing</span>
          <Volume2 className="w-3 h-3 text-purple-400 animate-pulse" />
        </div>
        
        {/* Rotating record */}
        <div className="my-auto flex flex-col items-center gap-4 py-2">
          <div className="relative w-28 h-28 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl animate-spin-slow">
            <div className="w-26 h-26 rounded-full border border-zinc-800 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-cover" style={{ backgroundImage: `url(${albumCovers[2].url})` }} />
            </div>
            {/* Center vinyl pinhole */}
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-950 border border-white/20 absolute" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-black text-white">Channa Mereya</span>
            <span className="text-[8px] text-zinc-400 font-semibold">Pritam • Ae Dil Hai Mushkil</span>
          </div>
        </div>

        {/* Media Controls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[7px] text-zinc-500 px-1">
            <span>2:15</span>
            <span>4:49</span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full relative">
            <div className="w-[48%] h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-white absolute top-[-2px] left-[48%] shadow-md" />
          </div>
          <div className="flex items-center justify-center gap-4 py-1">
            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400">⏮</div>
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black font-bold shadow-lg shadow-white/10 hover:scale-105 active:scale-95 transition">
              ⏸
            </div>
            <div className="w-5 h-5 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400">⏭</div>
          </div>
        </div>
      </div>
    )
  }
];

function PhoneShowcaseSection() {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // Auto transition every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTabIdx((prev) => (prev + 1) % phoneScreens.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 py-32 z-20 flex flex-col lg:flex-row items-center justify-between gap-16">
      
      {/* LEFT: TEXT DESCRIPTION */}
      <div className="flex-1 space-y-6 text-center lg:text-left">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold uppercase tracking-wider text-xs"
        >
          <Compass className="w-3.5 h-3.5" />
          Seamless Integration
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight"
        >
          Everything You Love <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            About Music
          </span>
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-zinc-400 text-sm md:text-base max-w-lg leading-relaxed"
        >
          Switch between fully interactive views dynamically. Search songs instantly, review live synchronized lyrics, control tracks with custom album visualizers, and view personalized shelves designed for the ultimate audiophile.
        </motion.p>

        {/* Tab triggers */}
        <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
          {phoneScreens.map((s, idx) => {
            const isActive = activeTabIdx === idx;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTabIdx(idx)}
                className={`px-4 py-2 rounded-full border text-xs font-bold transition-all duration-300
                  ${isActive 
                    ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                    : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
                  }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: SMARTPHONE 3D FLOATING MOCKUP */}
      <div className="flex-1 flex items-center justify-center relative w-full max-w-[340px] aspect-[9/19] h-[580px]">
        {/* Background neon glow ring */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-[40px] blur-3xl scale-110 animate-pulse pointer-events-none" />

        {/* 3D Rotating Frame */}
        <motion.div 
          animate={{
            y: [-12, 12, -12],
            rotateY: [10, -10, 10],
            rotateX: [6, -6, 6]
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
          className="relative w-full h-full rounded-[42px] border-[6px] border-zinc-800 bg-[#09090b] shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] p-[8px] flex flex-col overflow-hidden"
          style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
        >
          {/* Glass reflections overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none z-30 rounded-[36px]" />
          
          {/* Bezel Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-800 rounded-b-2xl z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-zinc-950 rounded-full" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-950 ml-2" />
          </div>

          {/* Active Layout */}
          <div className="w-full h-full rounded-[30px] overflow-hidden relative z-10 border border-white/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabIdx}
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                {phoneScreens[activeTabIdx].layout}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

    </section>
  );
}

// ----------------------------------------------------
// SECTION 4: WHY SONIQUE TILT PANELS
// ----------------------------------------------------
interface TiltCardProps {
  title: string;
  desc: string;
  badge: string;
  glow: string;
}

function WhySoniqueSection() {
  return (
    <section id="why-sonique" className="relative w-full max-w-5xl mx-auto px-6 py-24 z-20">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Why Sonique?
        </h2>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          We combine minimalist elegance with robust engineering to provide an audio environment built for modern music listeners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TiltGlassPanel 
          title="Discover Music" 
          desc="Find songs instantly. Our search delivers high-precision matches separated into audios and video layers, letting you choose how you listen." 
          badge="High Fidelity"
          glow="rgba(168, 85, 247, 0.15)"
        />
        <TiltGlassPanel 
          title="Dynamic Colors" 
          desc="The entire streaming page automatically shifts its ambient shadows and accent colors to match the loaded track album art, creating total visual immersion." 
          badge="Visual adaptation"
          glow="rgba(236, 72, 153, 0.15)"
        />
        <TiltGlassPanel 
          title="Synced Lyrics" 
          desc="Follow every word in real-time. Sing along with precision synced lyrics scrolling at perfect 60fps alongside active tracks." 
          badge="Karaoke Mode"
          glow="rgba(59, 130, 246, 0.15)"
        />
        <TiltGlassPanel 
          title="Smart Experience" 
          desc="Equipped with quick keyboard controls, custom sleep timers, responsive queue drawers, and mobile compatibility, Sonique fits your lifestyle." 
          badge="Tailored UX"
          glow="rgba(16, 185, 129, 0.15)"
        />
      </div>
    </section>
  );
}

function TiltGlassPanel({ title, desc, badge, glow }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 20, y: y * -20 }); // Degrees of rotation
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX: tilt.y, rotateY: tilt.x }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: 600 }}
      className="group relative rounded-2xl bg-zinc-950/40 border border-white/5 p-8 backdrop-blur-xl cursor-default overflow-hidden flex flex-col justify-between min-h-[260px] hover:border-white/10 transition-all duration-300"
    >
      {/* Background shadow glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glow} 0%, rgba(0,0,0,0) 70%)`
        }}
      />

      <div className="space-y-4" style={{ transform: "translateZ(30px)" }}>
        <div className="inline-flex text-[10px] font-bold tracking-widest text-zinc-500 uppercase px-2 py-1 rounded bg-white/5 border border-white/5">
          {badge}
        </div>
        <h3 className="text-2xl font-extrabold text-white tracking-tight group-hover:text-purple-300 transition duration-300">
          {title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
          {desc}
        </p>
      </div>

      <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-between" style={{ transform: "translateZ(15px)" }}>
        <span className="text-xs font-semibold text-zinc-500 group-hover:text-white transition duration-300">Learn more</span>
        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition duration-300" />
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------
// SECTION 5: MUSIC GALAXY 3D ORBITS
// ----------------------------------------------------
function MusicGalaxySection({ scrollYProgress }: { scrollYProgress: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Section ranges from 0.45 to 0.70 of global page scroll
  const galaxyZoom = useTransform(scrollYProgress, [0.45, 0.75], [1.0, 2.8]);
  const galaxyOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.70, 0.75], [0, 1, 1, 0]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Build particles for galaxy arms
    const particlesCount = 800;
    const particles: any[] = [];
    const colors = ['#8b5cf6', '#d946ef', '#3b82f6', '#ec4899'];

    for (let i = 0; i < particlesCount; i++) {
      // Golden spiral ratio for double arm galaxy
      const arm = i % 2;
      const angle = (i * 0.04) + (arm * Math.PI);
      const distance = Math.pow(Math.random(), 1.5) * 280 + 10;
      
      particles.push({
        x: Math.cos(angle) * distance + (Math.random() - 0.5) * 15,
        y: (Math.random() - 0.5) * 12,
        z: Math.sin(angle) * distance + (Math.random() - 0.5) * 15,
        color: colors[i % colors.length],
        size: 0.8 + Math.random() * 1.5,
        angle: angle,
        distance: distance,
        speed: 0.005 + (20 / (distance + 20)) * 0.01 // faster in center
      });
    }

    // Planetary Album orbits
    const planetaryCovers = albumCovers.map((album, idx) => {
      return {
        ...album,
        angle: (idx * Math.PI * 2) / albumCovers.length,
        distance: 140 + idx * 28,
        speed: 0.003 + (albumCovers.length - idx) * 0.001,
        yOffset: (idx % 2 === 0 ? 1 : -1) * 15
      };
    });

    let angleOffset = 0;

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      angleOffset += 0.002;

      // Perspective variables
      const fov = 500;

      // Draw large ambient glowing portal core
      const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180);
      coreGlow.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      coreGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.06)');
      coreGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(cx - 300, cy - 300, 600, 600);

      // Render Sonique text in center
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#d946ef';
      ctx.shadowBlur = 20;
      ctx.fillText('S', cx, cy);
      ctx.shadowBlur = 0;

      // Draw faint rings
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let r = 80; r < 300; r += 50) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw and project background galaxy stars
      particles.forEach(p => {
        p.angle += p.speed;
        const x = Math.cos(p.angle) * p.distance;
        const z = Math.sin(p.angle) * p.distance;

        // Perspective projections
        // Pitch/roll projection over time
        const pitch = 0.65; // slant angle
        const finalX = x;
        const finalY = p.y * Math.cos(pitch) - z * Math.sin(pitch);
        const finalZ = p.y * Math.sin(pitch) + z * Math.cos(pitch);

        const scale = fov / (fov + finalZ);
        const px = cx + finalX * scale;
        const py = cy + finalY * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      });

      // Draw orbiting albums
      planetaryCovers.forEach(album => {
        album.angle += album.speed;
        const ax = Math.cos(album.angle) * album.distance;
        const az = Math.sin(album.angle) * album.distance;

        const pitch = 0.65;
        const finalX = ax;
        const finalY = album.yOffset * Math.cos(pitch) - az * Math.sin(pitch);
        const finalZ = album.yOffset * Math.sin(pitch) + az * Math.cos(pitch);

        const scale = fov / (fov + finalZ);
        const px = cx + finalX * scale;
        const py = cy + finalY * scale;

        const imgSize = 25 * scale;

        // Glass sphere wrapper around albums
        ctx.beginPath();
        ctx.arc(px, py, imgSize * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // draw miniature text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = `${Math.max(6, 7 * scale)}px sans-serif`;
        ctx.fillText(album.name, px, py + imgSize + 6);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative h-[250vh] w-full z-20 flex flex-col justify-start">
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Title overlay */}
        <div className="absolute top-16 z-30 text-center px-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 font-semibold uppercase tracking-wider text-xs mb-3"
          >
            <Radio className="w-3.5 h-3.5" />
            Vibrant Ecosystem
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase">
            Music Galaxy
          </h2>
          <p className="text-zinc-500 text-xs mt-2 max-w-sm">
            Scroll down to zoom deep into the Sonique orbit center.
          </p>
        </div>

        {/* 3D Galaxy Canvas container */}
        <motion.div 
          style={{ 
            scale: galaxyZoom, 
            opacity: galaxyOpacity 
          }}
          className="w-full h-full max-w-[800px] max-h-[800px] flex items-center justify-center"
        >
          <canvas ref={canvasRef} className="w-full h-full" />
        </motion.div>
      </div>
    </section>
  );
}

// ----------------------------------------------------
// SECTION 6: APP SCREENSHOTS DEPTH LAYERS
// ----------------------------------------------------
function AppScreenshotsSection() {
  return (
    <section className="relative w-full max-w-6xl mx-auto px-6 py-32 z-20 overflow-hidden">
      <div className="text-center mb-20 space-y-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 font-semibold uppercase tracking-wider text-xs"
        >
          <Layers className="w-3.5 h-3.5" />
          Depth layers layout
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
          Visualized Streaming Canvas
        </h2>
        <p className="text-zinc-500 text-sm max-w-md mx-auto">
          Take a sneak peek inside the high-performance Sonique interface controls.
        </p>
      </div>

      {/* Depth Layers container */}
      <div className="relative h-[650px] w-full flex items-center justify-center">
        
        {/* Layer 1: Left background (Home shelf) */}
        <motion.div 
          initial={{ opacity: 0, x: -150, y: 50, rotate: -8, scale: 0.9 }}
          whileInView={{ opacity: 1, x: -160, y: 20, rotate: -10, scale: 0.95 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02, rotate: -6, zIndex: 40 }}
          className="absolute w-[280px] md:w-[360px] aspect-[16/10] bg-zinc-900 border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 text-left flex flex-col gap-2 z-10 cursor-pointer"
        >
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-extrabold text-[9px] text-zinc-300">Discover Mix</span>
          </div>
          <div className="aspect-[16/7] bg-gradient-to-tr from-purple-900 to-indigo-950 rounded-lg p-3 flex flex-col justify-end">
            <span className="text-xs font-bold text-white leading-tight">Daily Fresh Tracks</span>
            <span className="text-[8px] text-zinc-400">Tailored to your mood.</span>
          </div>
          <div className="flex items-center justify-between py-1 bg-white/5 px-2 rounded border border-white/5 text-[8px] text-white font-medium">
            <span>1. Rockstar - A.R. Rahman</span>
            <Play className="w-2.5 h-2.5 fill-white text-white" />
          </div>
        </motion.div>

        {/* Layer 2: Right background (Queue / Playlist) */}
        <motion.div 
          initial={{ opacity: 0, x: 150, y: -50, rotate: 8, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 160, y: -20, rotate: 10, scale: 0.95 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{ scale: 1.02, rotate: 6, zIndex: 40 }}
          className="absolute w-[280px] md:w-[340px] aspect-[16/11] bg-zinc-900 border border-white/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-4 text-left flex flex-col gap-3 z-15 cursor-pointer"
        >
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="font-extrabold text-[9px] text-zinc-300">Play Queue</span>
            <span className="text-[7px] text-purple-400 font-bold uppercase">5 Songs Remaining</span>
          </div>
          <div className="flex flex-col gap-1.5 flex-1 justify-center">
            {[
              { t: 'Kesariya', a: 'Arijit Singh', length: '3:15' },
              { t: 'Dilwale', a: 'Pritam', length: '4:10' },
              { t: 'Channa Mereya', a: 'Pritam', length: '4:49' }
            ].map((song, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded bg-zinc-950/60 border border-white/5 text-[8px]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-cover" style={{ backgroundImage: `url(${albumCovers[i % albumCovers.length].url})` }} />
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{song.t}</span>
                    <span className="text-zinc-500 text-[6px]">{song.a}</span>
                  </div>
                </div>
                <span className="text-zinc-500">{song.length}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Layer 3: CENTER FOREGROUND (Interactive player overlay) */}
        <motion.div 
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
          whileHover={{ scale: 1.04, zIndex: 50 }}
          className="absolute w-[310px] md:w-[380px] aspect-[16/12] bg-[#0c0c0e] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.9)] p-6 text-left flex flex-col justify-between z-30 cursor-default"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-[10px] text-zinc-300 font-extrabold tracking-wider uppercase">Sonique Live Stream</span>
            </div>
            <Volume2 className="w-4 h-4 text-purple-400" />
          </div>

          {/* Main Track row */}
          <div className="flex items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-xl bg-cover border border-white/10 shadow-lg animate-spin-slow" style={{ backgroundImage: `url(${albumCovers[1].url})` }} />
            <div className="flex-1 space-y-1">
              <h4 className="text-base font-extrabold text-white leading-tight">Brahmastra (Album)</h4>
              <p className="text-xs text-zinc-400">Pritam • Arijit Singh • Sid Sriram</p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/10">320kbps AAC</span>
                <span className="text-[9px] bg-white/5 text-zinc-400 px-1.5 py-0.5 rounded">Stereo</span>
              </div>
            </div>
          </div>

          {/* Player controls bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[9px] text-zinc-400">
              <span>1:34</span>
              <span>3:42</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full relative">
              <div className="w-[42%] h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" />
              <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-[-3px] left-[42%] shadow-lg border border-purple-500" />
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-[9px] text-zinc-500">Shuffle On</span>
              <div className="flex items-center gap-3">
                <button className="text-zinc-400 hover:text-white transition">⏮</button>
                <button className="w-8 h-8 rounded-full bg-white text-zinc-950 flex items-center justify-center font-extrabold hover:scale-105 active:scale-95 transition shadow-lg shadow-white/10">⏸</button>
                <button className="text-zinc-400 hover:text-white transition">⏭</button>
              </div>
              <span className="text-[9px] text-zinc-500">Repeat Off</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ----------------------------------------------------
// SECTION 7: FINAL CTA CINEMATIC ENDING & PORTAL
// ----------------------------------------------------
function CTASection({ router }: { router: any }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Dynamic Swirl portal particles
    const particles: any[] = [];
    const particlesCount = 280;

    for (let i = 0; i < particlesCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 320 + 30,
        speed: 0.015 + Math.random() * 0.01,
        color: i % 2 === 0 ? 'rgba(168, 85, 247, ' : 'rgba(236, 72, 153, ',
        size: 0.8 + Math.random() * 1.5
      });
    }

    const render = () => {
      if (!ctx || !canvas) return;

      // Draw dark background with trail
      ctx.fillStyle = 'rgba(5, 5, 5, 0.16)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Render glowing portal center
      const portalGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, hovered ? 180 : 130);
      portalGlow.addColorStop(0, hovered ? 'rgba(168, 85, 247, 0.25)' : 'rgba(168, 85, 247, 0.15)');
      portalGlow.addColorStop(0.6, hovered ? 'rgba(236, 72, 153, 0.12)' : 'rgba(236, 72, 153, 0.06)');
      portalGlow.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = portalGlow;
      ctx.fillRect(cx - 250, cy - 250, 500, 500);

      // Portal vortex path
      particles.forEach(p => {
        // Spiral inwards
        const baseSpeed = hovered ? p.speed * 2.2 : p.speed;
        p.angle -= baseSpeed;
        p.distance -= hovered ? 1.8 : 0.8;

        // Reset if too close to center
        if (p.distance < 15) {
          p.distance = 280 + Math.random() * 40;
          p.angle = Math.random() * Math.PI * 2;
        }

        const px = cx + Math.cos(p.angle) * p.distance;
        const py = cy + Math.sin(p.angle) * p.distance;

        // Glow opacity
        const alpha = Math.max(0.1, Math.min(0.8, p.distance / 200));

        ctx.beginPath();
        ctx.arc(px, py, p.size * (hovered ? 1.4 : 1.0), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [hovered]);

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center z-20 text-center px-4 overflow-hidden border-t border-white/5">
      
      {/* VORTEX CANVAS BACKGROUND */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10 flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full max-w-[800px] max-h-[800px] opacity-90" />
      </div>

      {/* CTA INTERACTIVE CONTENT */}
      <div className="relative z-20 max-w-2xl space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2 shadow-2xl"
        >
          <Tv className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[10px] font-bold tracking-widest text-purple-200 uppercase">Interactive music node active</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-7xl font-black tracking-tight text-white uppercase drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          Ready To Experience <br />
          Music Differently?
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-zinc-400 text-sm md:text-base max-w-md mx-auto"
        >
          Join the next generation of music discovery. Stream high-definition tracks, enjoy synchronized lyrics, and structure customized playlists in seconds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="pt-6"
        >
          <button 
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push('/app')}
            className="group relative inline-flex items-center gap-3 px-10 py-4.5 rounded-full font-black text-black bg-white overflow-hidden hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {/* Hover slide gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 group-hover:text-white transition duration-300">Launch Sonique</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
          </button>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-6 w-full text-center text-[10px] text-zinc-600 font-bold tracking-wider z-20">
        © 2026 SONIQUE MUSIC. ALL RIGHTS RESERVED. POWERED BY NEXT.JS.
      </footer>
    </section>
  );
}
