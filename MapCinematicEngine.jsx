import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Lock, Award, Scroll, Trophy, Zap, Map as MapIcon, Target, X, ChevronUp } from 'lucide-react';
import { STORY_BEATS } from './data/Stories';

// === Odyssey 2.0 Asset Constants ===
const HERO_ASSETS = {
    1: '/assets/hero_1_cole.png',
    2: '/assets/hero_2_jay.png',
    3: '/assets/hero_3_kai.png',
    4: '/assets/hero_4_zane.png',
    5: '/assets/hero_5_lloyd.png'
};

const MAP_ASSETS = {
    SCYTHE: '/assets/reward_scythe.png',
    NUNCHUCKS: '/assets/reward_nunchucks.png',
    BOSS_PALACE: '/assets/boss_palace.png'
};

const LEVEL_PRESETS = Array.from({ length: 55 }, (_, i) => {
    const chapter = Math.floor(i / 11) + 1;
    const isBoss = (i + 1) % 11 === 0;
    
    return {
        id: i,
        name: `第 ${i + 1} 關`,
        isBoss,
        chapter,
        story: STORY_BEATS[i] || "修行中...",
        briefing: isBoss ? "BOSS MISSION" : "RECOVER WEAPON",
        reward: chapter === 1 ? MAP_ASSETS.SCYTHE : MAP_ASSETS.NUNCHUCKS
    };
});

const BIOME_STYLING = [
    { bg: 'radial-gradient(circle at center, #064e3b 0%, #020617 100%)', color: '#22c55e', name: 'EARTH REALM' },
    { bg: 'radial-gradient(circle at center, #1e3a8a 0%, #020617 100%)', color: '#3b82f6', name: 'STORM DESERT' },
    { bg: 'radial-gradient(circle at center, #7f1d1d 0%, #020617 100%)', color: '#ef4444', name: 'FIRE PEAK' },
    { bg: 'radial-gradient(circle at center, #4c1d95 0%, #020617 100%)', color: '#a855f7', name: 'GHOST MARSH' },
    { bg: 'radial-gradient(circle at center, #713f12 0%, #020617 100%)', color: '#fbbf24', name: 'GOLDEN TEMPLE' }
];

const MapCinematicEngine = () => {
    const [activeIdx, setActiveIdx] = useState(0);
    const [showDojo, setShowDojo] = useState(false);
    const [isBriefOpen, setIsBriefOpen] = useState(true);
    const [completedLevels, setCompletedLevels] = useState([0, 1, 2]); 
    const [isFlying, setIsFlying] = useState(false);

    const activeLevel = LEVEL_PRESETS[activeIdx];
    const currentBiome = BIOME_STYLING[activeLevel.chapter - 1];
    const currentHero = HERO_ASSETS[activeLevel.chapter];
    const bossCloseness = (activeIdx % 11) / 10; // 0 to 1 as we approach boss level

    // Flight Trigger
    const handleNodeClick = (idx) => {
        if (idx === activeIdx) return;
        setIsFlying(true);
        setActiveIdx(idx);
        setTimeout(() => setIsFlying(false), 800);
    };

    return (
        <div className="w-full h-screen bg-slate-950 text-white font-['Noto_Sans_TC'] overflow-hidden relative selection:bg-yellow-500/30">
            
            {/* Dynamic Background & Shadow Incursion */}
            <motion.div 
                animate={{ background: currentBiome.bg }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 z-0"
            />
            <motion.div 
                animate={{ opacity: bossCloseness * 0.6 }}
                className="absolute inset-0 z-[5] bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none"
            />
            
            {/* HUD: TOP STATUS BAR (RESPONSIVE) */}
            <div className="absolute top-4 md:top-10 left-1/2 -translate-x-1/2 z-[100] w-[90vw] md:w-auto pointer-events-none">
                <motion.div 
                    initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between md:justify-start gap-4 md:gap-12 px-6 md:px-12 py-3 md:py-4 bg-slate-900/60 backdrop-blur-xl rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto"
                >
                    <div className="flex flex-col items-center border-r border-white/10 pr-4 md:pr-12">
                        <span className="text-[8px] md:text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Chap</span>
                        <span className="text-xl md:text-3xl font-['Bangers'] text-white italic">{activeLevel.chapter}</span>
                    </div>
                    
                    <div className="flex flex-col items-center px-2 md:px-12 truncate">
                        <span className="text-[8px] md:text-[10px] font-black text-yellow-500/60 tracking-[0.4em] uppercase">Realm</span>
                        <span className="text-sm md:text-2xl font-['Bangers'] text-yellow-500 italic truncate max-w-[100px] md:max-w-none">{currentBiome.name}</span>
                    </div>

                    <div className="flex flex-col items-center border-l border-white/10 pl-4 md:pl-12">
                        <span className="text-[8px] md:text-[10px] font-black text-white/40 tracking-[0.4em] uppercase">Progress</span>
                        <div className="flex items-center gap-2 md:gap-3">
                            <span className="text-xl md:text-3xl font-['Bangers'] text-white italic">{completedLevels.length}</span>
                            <span className="hidden md:inline text-sm font-bold text-white/20">/ 55</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowDojo(true)}
                        className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-yellow-500 hover:text-black transition-all"
                    >
                        <Trophy size={18} />
                    </button>
                </motion.div>
            </div>

            {/* MAIN 3D ODYSSEY SPACE (TAP-TO-NAVIGATE) */}
            <div className={`absolute inset-0 flex items-center justify-center z-20 transition-all duration-700 ${isFlying ? 'scale-110 blur-[2px]' : ''}`}>
                <AnimatePresence mode="popLayout">
                    {LEVEL_PRESETS.map((level, idx) => {
                        const distance = idx - activeIdx;
                        if (distance < -4 || distance > 4) return null;

                        const scale = Math.pow(0.4, Math.abs(distance));
                        const opacity = Math.pow(0.5, Math.abs(distance));
                        const yOffset = distance * -200 * (1 - Math.abs(distance) * 0.1);
                        const blur = Math.abs(distance) * 5;
                        const isActive = idx === activeIdx;

                        return (
                            <motion.div
                                key={idx}
                                initial={undefined}
                                animate={{ 
                                    scale: isActive ? 1.2 : scale,
                                    y: isActive ? 100 : yOffset,
                                    opacity: isActive ? 1 : opacity,
                                    filter: `blur(${isActive ? 0 : blur}px)`,
                                    zIndex: 100 - Math.abs(distance)
                                }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                                className="absolute flex flex-col items-center"
                                onClick={() => handleNodeClick(idx)}
                            >
                                <div className={`relative cursor-pointer group p-2 transition-all duration-500 ${isActive ? '' : 'hover:scale-125'}`}>
                                    
                                    {/* CLEAN NODE PLATFORM */}
                                    <div className={`relative w-48 h-48 rounded-full border-[2px] flex items-center justify-center transition-all duration-700 ${isActive ? 'border-yellow-500/50 bg-white/5 shadow-[0_0_80px_rgba(234,179,8,0.2)]' : 'border-white/5 bg-black/40'}`}>
                                        
                                        {/* INTEGRATED LANDMARK/ITEM */}
                                        <div className="w-full h-full p-6 overflow-hidden rounded-full relative">
                                            {level.isBoss ? (
                                                <img src={MAP_ASSETS.BOSS_PALACE} className="w-full h-full object-cover rounded-full mix-blend-lighten opacity-80" />
                                            ) : completedLevels.includes(idx) ? (
                                                <img src={level.reward} className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(234,179,8,0.4)]" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Lock className="text-slate-800" size={32} />
                                                </div>
                                            )}
                                        </div>

                                        {/* CHAPTER HERO (MOUNTED WITHOUT LABELS) */}
                                        {isActive && (
                                            <motion.div 
                                                initial={{ scale: 0, y: 100 }} 
                                                animate={{ scale: 1, y: 0 }}
                                                className="absolute -top-[180px] md:-top-[200px] w-[260px] md:w-[350px] h-[260px] md:h-[350px] pointer-events-none"
                                            >
                                                <img 
                                                    src={currentHero} 
                                                    className="w-full h-full object-contain mix-blend-screen filter drop-shadow-[0_40px_60px_rgba(0,0,0,1)]" 
                                                    style={{ maskImage: 'radial-gradient(circle, black 55%, transparent 95%)', WebkitMaskImage: 'radial-gradient(circle, black 55%, transparent 95%)' }}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* HUD: RESPONSIVE MISSION BRIEF (SIDE OR BOTTOM) */}
            <AnimatePresence>
                {!isFlying && (
                    <motion.div 
                        key={activeIdx}
                        initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                        className={`absolute z-[100] transition-all duration-500 
                            ${isBriefOpen ? 'left-4 right-4 bottom-10 md:left-10 md:top-1/2 md:-translate-y-1/2 md:w-[380px] md:bottom-auto' : 'left-10 bottom-10 w-auto'} 
                        `}
                    >
                        {isBriefOpen ? (
                            <div className="p-6 md:p-10 bg-black/40 backdrop-blur-3xl rounded-[30px] md:rounded-[40px] border border-white/10 shadow-2xl flex flex-col gap-4 md:gap-6 relative overflow-hidden group">
                                <button 
                                    onClick={() => setIsBriefOpen(false)}
                                    className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-yellow-500 tracking-[0.4em] uppercase mb-1">{activeLevel.briefing}</span>
                                        <h2 className="text-3xl md:text-5xl font-['Bangers'] italic text-white tracking-widest leading-none">{activeLevel.name}</h2>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl hidden md:block">
                                        <Scroll size={24} className="text-yellow-500/50" />
                                    </div>
                                </div>
                                
                                <motion.p 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-lg md:text-xl font-medium italic leading-relaxed text-white/90 border-l-2 border-yellow-500/30 pl-4 md:pl-6 py-2"
                                >
                                    {activeLevel.story.split("").map((char, i) => (
                                        <motion.span
                                            key={i}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </motion.p>
                                
                                <div className="mt-2 px-4 md:px-6 py-2 md:py-3 bg-white/5 rounded-2xl flex items-center gap-3">
                                    <MapIcon size={14} className="text-white/30" />
                                    <span className="text-[8px] md:text-[10px] font-bold text-white/40 tracking-widest uppercase">Tap nodes to fast travel</span>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsBriefOpen(true)}
                                className="p-5 bg-yellow-500 text-black rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-3"
                            >
                                <Scroll size={24} />
                                <span className="font-['Bangers'] italic text-xl pr-2">MISSION LOG</span>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HUD: RESPONSIVE BOTTOM CONTROL DOCK */}
            <div className="absolute bottom-4 md:bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 md:gap-10 z-[100] w-full px-4 md:px-0">
                
                <div className="flex items-center gap-4 md:gap-8 pointer-events-auto w-full md:w-auto justify-center">
                    <button 
                         aria-label="Previous Mission"
                         onClick={() => setActiveIdx(p => Math.max(0, p - 1))}
                         disabled={activeIdx === 0}
                         className="w-12 h-12 md:w-16 md:h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-5"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button className="flex-1 md:flex-none px-6 md:px-20 py-4 md:py-8 bg-yellow-500 rounded-full shadow-[0_20px_60px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95 transition-all text-black font-['Bangers'] text-2xl md:text-4xl italic tracking-widest flex items-center justify-center gap-4 group">
                        <Play size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" /> 
                        <span className="hidden md:inline">START TRAINING</span>
                        <span className="md:hidden">START</span>
                    </button>

                    <button 
                         aria-label="Next Mission"
                         onClick={() => setActiveIdx(p => Math.min(54, p + 1))}
                         disabled={activeIdx === 54}
                         className="w-12 h-12 md:w-16 md:h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-5"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* ADAPTIVE SCRUBBER */}
                <div className="w-full md:w-[600px] pointer-events-auto">
                    <div className="relative h-2 md:h-1 bg-white/10 rounded-full cursor-pointer group"
                         onClick={(e) => {
                             const rect = e.currentTarget.getBoundingClientRect();
                             const p = (e.clientX - rect.left) / rect.width;
                             setActiveIdx(Math.floor(p * 55));
                         }}
                    >
                        <motion.div 
                            animate={{ width: `${(activeIdx / 54) * 100}%` }}
                            className="h-full bg-yellow-500/50 rounded-full relative"
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 md:w-3 md:h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
                        </motion.div>
                        {/* Biome Markings */}
                        {[11, 22, 33, 44].map(v => (
                            <div key={v} className="absolute top-0 h-full w-[2px] md:w-[1px] bg-white/20" style={{ left: `${(v / 54) * 100}%` }} />
                        ))}
                    </div>
                </div>
            </div>

            {/* DOJO OVERLAY */}
            <AnimatePresence>
                {showDojo && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-[200] bg-black/95 flex items-center justify-center backdrop-blur-xl"
                    >
                        <div className="flex flex-col items-center max-w-7xl">
                            <h2 className="text-8xl font-['Bangers'] italic text-yellow-500 mb-20 tracking-widest uppercase">The Grand Dojo</h2>
                            <div className="grid grid-cols-5 gap-8">
                                {[
                                    { name: 'COLE', img: HERO_ASSETS[1], status: 'ACTIVE' },
                                    { name: 'JAY', img: HERO_ASSETS[2], status: 'LOCKED' },
                                    { name: 'KAI', img: HERO_ASSETS[3], status: 'LOCKED' },
                                    { name: 'ZANE', img: HERO_ASSETS[4], status: 'LOCKED' },
                                    { name: 'LLOYD', img: HERO_ASSETS[5], status: 'LOCKED' }
                                ].map((h, i) => (
                                    <div key={i} className={`p-10 rounded-[60px] border-8 flex flex-col items-center gap-6 ${h.status === 'ACTIVE' ? 'border-yellow-500 bg-slate-900' : 'border-slate-800 opacity-30 grayscale'}`}>
                                        <div className="w-56 h-56 flex items-center justify-center">
                                            <img src={h.img} className="w-full h-full object-contain mix-blend-screen" />
                                        </div>
                                        <span className="text-3xl font-['Bangers'] italic tracking-wider">{h.name}</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => setShowDojo(false)}
                                className="mt-20 px-16 py-6 bg-white text-black font-['Bangers'] text-4xl italic rounded-full hover:bg-yellow-500 transition-colors"
                            >
                                BACK TO WORLD
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default MapCinematicEngine;
