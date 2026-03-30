import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Home, Play, Lock, Unlock, Volume2 } from 'lucide-react';

// === Mock Data (extracted from main app) ===
const CHARACTERS = [
    { id: 'lloyd', name: '勞埃德', url: '/assets/medal_lloyd.png', skin: 'lloyd' },
    { id: 'jay', name: '阿光', url: '/assets/medal_jay.png', skin: 'jay' },
    { id: 'kai', name: '赤地', url: '/assets/medal_kai.png', skin: 'kai' },
    { id: 'cole', name: '阿剛', url: '/assets/medal_cole.png', skin: 'cole' },
    { id: 'nya', name: '赤蘭', url: '/assets/medal_nya.png', skin: 'nya' }
];

const LEVEL_3_PRESETS = Array.from({ length: 55 }, (_, i) => ({
    name: `第${i + 1}關`,
    words: ["人", "口", "大", "中", "小"]
}));

const MAP_WORLDS = [
    {
        id: 0, name: '忍者啟程', subtitle: '第 1-11 關', emoji: '🌱', 
        description: '在山中神廟接受基礎訓練，掌握忍者的基本本領。', heroId: 'lloyd',
        bg: '/assets/world_bg_1.png', medal: '/assets/medal_lloyd.png',
        overlayColor: 'from-green-600/30 to-slate-950/90',
        borderColor: 'border-green-500', glowColor: 'shadow-green-500/30',
        levels: LEVEL_3_PRESETS.slice(0, 11)
    },
    {
        id: 1, name: '隱密訓練', subtitle: '第 12-22 關', emoji: '⛰️',
        description: '進入高峻的山脈，學會在極端環境下隱藏行蹤與作戰。', heroId: 'jay',
        bg: '/assets/world_bg_2.png', medal: '/assets/medal_jay.png',
        overlayColor: 'from-blue-600/30 to-slate-950/90',
        borderColor: 'border-blue-500', glowColor: 'shadow-blue-500/30',
        levels: LEVEL_3_PRESETS.slice(11, 22)
    },
    {
        id: 2, name: '黑暗崛起', subtitle: '第 23-33 關', emoji: '🔥',
        description: '黑暗要塞的勢力正在擴張，忍者必須深入虎虎穴迎接挑戰。', heroId: 'kai',
        bg: '/assets/world_bg_3.png', medal: '/assets/medal_kai.png',
        overlayColor: 'from-red-600/30 to-slate-950/90',
        borderColor: 'border-red-500', glowColor: 'shadow-red-500/30',
        levels: LEVEL_3_PRESETS.slice(22, 33)
    }
];

// === Horizontal Node Generator ===
const generateHorizontalChapterNodes = (levels, worldIdx = 0) => {
    const colWidth = 400;         
    const startX = 200;           
    const centerY = 450;          
    const amplitude = 180;        
    const frequency = 0.5;        
    
    let baseIdx = 0;
    for (let i = 0; i < worldIdx; i++) {
        baseIdx += (MAP_WORLDS[i]?.levels?.length || 0);
    }
    
    return levels.map((level, idx) => {
        const x = startX + idx * colWidth;
        const y = centerY + Math.sin(idx * frequency) * amplitude;
        return { ...level, x, y, id: baseIdx + idx, localId: idx };
    });
};

const MapPrototype = () => {
    const [selectedWorld, setSelectedWorld] = useState(null);
    const [completedLevels, setCompletedLevels] = useState({ subLevels: ["第1關", "第2關"] });
    const [nodes, setNodes] = useState([]);
    const [heroSkin, setHeroSkin] = useState('kai');
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (selectedWorld) {
            const worldIdx = MAP_WORLDS.findIndex(w => w.id === selectedWorld.id);
            setNodes(generateHorizontalChapterNodes(selectedWorld.levels, worldIdx));
        }
    }, [selectedWorld]);

    // Auto-scroll to active node
    useEffect(() => {
        if (nodes.length > 0 && scrollContainerRef.current) {
            const firstUncompleted = nodes.find(n => !completedLevels.subLevels.includes(n.name)) || nodes[nodes.length - 1];
            const targetX = firstUncompleted.x - window.innerWidth / 2;
            
            setTimeout(() => {
                scrollContainerRef.current.scrollTo({
                    left: targetX,
                    behavior: 'smooth'
                });
            }, 500);
        }
    }, [nodes, completedLevels]);

    const activeNode = nodes.find(n => !completedLevels.subLevels.includes(n.name)) || nodes[nodes.length - 1];

    return (
        <div className="w-full h-screen bg-slate-950 text-white font-['Noto_Sans_TC'] overflow-hidden relative">
            <AnimatePresence mode="wait">
                {selectedWorld === null ? (
                    <motion.div 
                        key="world-select"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col h-full items-center justify-center p-10 space-y-12"
                    >
                        <h1 className="text-8xl font-['Bangers'] tracking-widest text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]">
                            NINJA WORLDS
                        </h1>
                        <div className="flex gap-10 overflow-x-auto p-10 no-scrollbar items-center">
                            {MAP_WORLDS.map((world, idx) => (
                                <motion.div
                                    key={world.name}
                                    whileHover={{ scale: 1.05, y: -20 }}
                                    onClick={() => setSelectedWorld(world)}
                                    className="relative flex-shrink-0 w-[400px] h-[550px] rounded-[40px] border-4 border-white/10 overflow-hidden cursor-pointer shadow-2xl group"
                                >
                                    <img src={world.bg} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    <div className={`absolute inset-0 bg-gradient-to-t ${world.overlayColor} to-transparent opacity-80`} />
                                    <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                                        <div className="font-['Bangers'] text-2xl text-yellow-400">CHAPTER 0{idx + 1}</div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-black italic">{world.name}</h2>
                                            <p className="text-sm text-slate-300 leading-relaxed font-bold">{world.description}</p>
                                            <button className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 group-hover:bg-yellow-400 transition-colors uppercase font-['Bangers'] tracking-wider">
                                                <Play size={20} fill="currentColor" /> ENTER MISSION
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="chapter-map"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full bg-slate-900 relative h-full"
                    >
                        {/* Header */}
                        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-50 pointer-events-none">
                            <motion.button 
                                initial={{ x: -50 }}
                                animate={{ x: 0 }}
                                onClick={() => setSelectedWorld(null)}
                                className="p-4 rounded-full bg-slate-800/80 backdrop-blur-md border border-white/10 pointer-events-auto flex items-center gap-3 group transition-all hover:bg-yellow-500 hover:text-black"
                            >
                                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                                <span className="font-['Bangers'] text-xl tracking-wider">BACK TO WORLDS</span>
                            </motion.button>
                            <div className="text-right">
                                <h1 className="text-5xl font-['Bangers'] text-yellow-500 tracking-wider drop-shadow-md">{selectedWorld.name}</h1>
                                <p className="text-lg font-bold text-slate-400 tracking-[0.3em] uppercase">{selectedWorld.subtitle}</p>
                            </div>
                        </div>

                        {/* Horizontal Map */}
                        <div 
                            ref={scrollContainerRef}
                            className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-950 relative scroll-smooth no-scrollbar"
                        >
                            {/* Parallax Background Layers */}
                            <div className="absolute inset-0 w-[50000px] h-full opacity-20 pointer-events-none">
                                <div className="absolute top-20 left-40 text-9xl">🌄</div>
                                <div className="absolute top-60 left-[1200px] text-9xl">🏔️</div>
                                <div className="absolute top-40 left-[2500px] text-9xl">🏯</div>
                                <div className="absolute top-80 left-[3800px] text-9xl">🐉</div>
                                <div className="absolute top-30 left-[5000px] text-9xl">☯️</div>
                            </div>

                            <div 
                                className="relative h-full py-20 px-[20vw]" 
                                style={{ width: `${nodes.length * 400 + 1000}px` }}
                            >
                                {/* SVG Paths */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <defs>
                                        <filter id="ink-glow">
                                            <feGaussianBlur stdDeviation="5" result="blur" />
                                            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.92  0 0 0 0 0.8  0 0 0 0 0.08  0 0 0 1 0" />
                                            <feMerge>
                                                <feMergeNode />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    {nodes.slice(0, -1).map((node, i) => {
                                        const next = nodes[i + 1];
                                        const cp1x = node.x + (next.x - node.x) * 0.4;
                                        const cp2x = node.x + (next.x - node.x) * 0.6;
                                        return (
                                            <motion.path
                                                key={`path-${i}`}
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.5, delay: i * 0.1 }}
                                                d={`M ${node.x} ${node.y} C ${cp1x} ${node.y}, ${cp2x} ${next.y}, ${next.x} ${next.y}`}
                                                stroke="rgba(234, 179, 8, 0.2)"
                                                strokeWidth="12"
                                                strokeLinecap="round"
                                                fill="none"
                                            />
                                        );
                                    })}
                                </svg>

                                {/* Level Nodes */}
                                {nodes.map((node, idx) => {
                                    const isLocked = idx > 0 && !completedLevels.subLevels.includes(nodes[idx - 1].name);
                                    const isCompleted = completedLevels.subLevels.includes(node.name);
                                    const isActive = activeNode?.name === node.name;

                                    return (
                                        <motion.div
                                            key={node.name}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.05 + 0.5, type: 'spring' }}
                                            className="absolute"
                                            style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
                                        >
                                            <div className="relative flex flex-col items-center">
                                                <motion.div
                                                    whileHover={!isLocked ? { scale: 1.1, rotate: 90 } : {}}
                                                    className={`w-32 h-32 flex items-center justify-center transition-all ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    {/* Shuriken Node UI */}
                                                    <div className={`relative w-24 h-24 flex items-center justify-center ${isActive ? 'animate-spin-[10s]' : ''}`}>
                                                        <svg viewBox="0 0 100 100" className={`w-full h-full drop-shadow-2xl ${isActive ? 'text-yellow-400' : isCompleted ? 'text-amber-500' : 'text-slate-600'}`}>
                                                            <path fill="currentColor" d="M50 0 L58 35 L95 42 L65 58 L75 95 L50 75 L25 95 L35 58 L5 42 L42 35 Z" />
                                                            <circle cx="50" cy="50" r="15" fill="rgba(0,0,0,0.5)" stroke="white" strokeWidth="2" />
                                                        </svg>
                                                        {isActive && (
                                                            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse" />
                                                        )}
                                                    </div>
                                                </motion.div>
                                                
                                                {/* Node Label */}
                                                <div className={`mt-4 px-4 py-1 rounded-full font-['Bangers'] text-lg tracking-widest ${isActive ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.6)]' : 'bg-slate-800 text-slate-400'}`}>
                                                    {node.name}
                                                </div>

                                                {/* Hero Animation */}
                                                {isActive && (
                                                    <motion.div 
                                                        layoutId="hero-token"
                                                        className="absolute -top-40 flex flex-col items-center"
                                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                                    >
                                                        <div className="relative group">
                                                            <div className="absolute inset-0 bg-yellow-400/40 blur-3xl scale-125 animate-pulse" />
                                                            <motion.img 
                                                                animate={{ y: [0, -10, 0] }}
                                                                transition={{ repeat: Infinity, duration: 2 }}
                                                                src={CHARACTERS.find(c => c.skin === heroSkin)?.url} 
                                                                className="w-40 h-40 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter contrast-125"
                                                            />
                                                        </div>
                                                        <div className="bg-yellow-500 text-black px-4 py-1 rounded-full font-['Bangers'] text-sm -mt-4 shadow-xl border-4 border-slate-900 z-10 animate-bounce">
                                                            CURRENT QUEST
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer / Info */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-10 py-4 rounded-full border border-white/10 flex gap-10 items-center">
                           <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,1)]" />
                               <span className="font-['Bangers'] text-slate-400 tracking-widest uppercase text-sm">Active Quest</span>
                           </div>
                           <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-amber-600 rounded-full" />
                               <span className="font-['Bangers'] text-slate-400 tracking-widest uppercase text-sm">Mastered</span>
                           </div>
                           <div className="flex items-center gap-3">
                               <div className="w-4 h-4 bg-slate-700 rounded-full" />
                               <span className="font-['Bangers'] text-slate-400 tracking-widest uppercase text-sm">Locked</span>
                           </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default MapPrototype;
