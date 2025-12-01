// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Quote, Sparkles, Wind, Flower2, Sun } from "lucide-react";
import { Ma_Shan_Zheng, Noto_Serif_SC } from 'next/font/google';

const maShanZheng = Ma_Shan_Zheng({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const notoSerif = Noto_Serif_SC({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const WISH_WORDS = [
  "岁岁平安", "颜值爆表", "财源广进", "发量王者", "吃不胖", "皮肤超好",
  "万事胜意", "拒绝内耗", "情绪稳定", "内心强大", "温柔且坚定", "爱自己",
  "学业有成", "逢考必过", "前程似锦", "C位出道", "步步高升", "被爱包围",
  "得偿所愿", "稳住能赢", "绝绝子", "人生赢家", "自由自在", "永远热灿",
  "平安喜乐", "百事无忌", "光芒万丈", "未来可期", "暴富", "好运连连"
];

const MovingBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden bg-[#F9F7F2]">
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#f2e6d9] via-[#F9F7F2] to-[#e8e0d0] opacity-50 blur-3xl"
    />
    <div className="absolute inset-0 opacity-30 mix-blend-multiply">
      <svg className="w-full h-full">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" fill="none" />
      </svg>
    </div>
  </div>
);

const Snowfall = () => {
  const flakes = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 10,
    size: Math.random() * 8 + 4
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {flakes.map((flake) => (
        <motion.div
          key={flake.id}
          initial={{ y: -20, x: `${flake.x}vw`, opacity: 0 }}
          animate={{
            y: "105vh",
            x: [`${flake.x}vw`, `${flake.x + (Math.random() * 10 - 5)}vw`],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            delay: flake.delay,
            ease: "linear",
          }}
          className="absolute text-[#dcdcdc] blur-[1px]"
          style={{ fontSize: flake.size }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
};

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [candleBlown, setCandleBlown] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isExtinguishing, setIsExtinguishing] = useState(false);

  // 关键修复：使用 <any> 绕过 TypeScript 检查
  const pressTimer = useRef<any>(null);
  const audioRef = useRef<any>(null);

  const staticWishes = useMemo(() => {
    return Array.from({ length: 45 }).map((_, i) => {
      const text = WISH_WORDS[i % WISH_WORDS.length];
      const angle = Math.random() * Math.PI * 2;

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const baseDistance = isMobile ? 15 : 18;
      const randomRange = isMobile ? 20 : 22;

      const distance = baseDistance + Math.random() * randomRange;

      const left = 50 + distance * Math.cos(angle) * 1.2;
      const top = 50 + distance * Math.sin(angle);

      const colors = ["text-[#2C2C2C]", "text-[#5A5A5A]", "text-[#C5A059]", "text-[#AA381E]"];

      return {
        id: i,
        text,
        left: `${left}%`,
        top: `${top}%`,
        scale: 0.7 + Math.random() * 0.8,
        rotate: Math.random() * 40 - 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1.5
      };
    });
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(() => {});
      }
    };
    window.addEventListener('click', playAudio, { once: true });
    window.addEventListener('touchstart', playAudio, { once: true });
    return () => {
      window.removeEventListener('click', playAudio);
      window.removeEventListener('touchstart', playAudio);
    };
  }, []);

  const startMicrophone = async () => {
    if (isMicActive) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      setIsMicActive(true);

      scriptProcessor.onaudioprocess = function () {
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        let values = 0;
        for (let i = 0; i < array.length; i++) values += array[i];
        const average = values / array.length;

        if (average > 30 && !candleBlown && !isExtinguishing) {
          triggerWishSequence();
          stream.getTracks().forEach(track => track.stop());
          scriptProcessor.disconnect();
          microphone.disconnect();
        }
      };
    } catch (err) {
      console.log("Mic access denied or error", err);
    }
  };

  const triggerWishSequence = async () => {
    if (candleBlown || isExtinguishing) return;

    setIsExtinguishing(true);

    setTimeout(async () => {
        setCandleBlown(true);
        const confettiModule = await import("canvas-confetti");
        const confetti = confettiModule.default;

        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const interval = setInterval(function () {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          confetti({
            startVelocity: 30, spread: 360, ticks: 60, zIndex: 50, particleCount: 40,
            colors:['#C5A059', '#AA381E', '#F9F7F2'], origin: { x: 0.5, y: 0.5 }
          });
        }, 250);
    }, 1200);
  };

  const handleTouchStart = () => {
    if (candleBlown) return;
    startMicrophone();
    pressTimer.current = setTimeout(triggerWishSequence, 800);
  };
  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  if (!isMounted) return null;

  return (
    <main className={`h-screen w-full relative overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[#F9F7F2] ${notoSerif.className} text-[#2C2C2C]`}>
      <MovingBackground />
      <Snowfall />
      <audio ref={audioRef} loop src="/bgm.mp3" className="hidden" />

      <section className="h-screen w-full snap-start flex flex-col justify-between items-center relative overflow-hidden py-20">

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] md:w-[60vh] md:h-[60vh] border border-[#C5A059]/20 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55vw] h-[55vw] md:w-[45vh] md:h-[45vh] border border-[#C5A059]/30 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none opacity-50"></div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10"
        >
           <div className="inline-block border border-[#AA381E]/60 px-5 py-1.5 rounded-sm bg-[#AA381E]/5 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-[#AA381E]">
                 <span className="text-xs md:text-sm tracking-[0.2em] font-bold">Dec. 03</span>
                 <span className="w-[1px] h-3 bg-[#AA381E]/50"></span>
                 <span className="text-xs md:text-sm tracking-[0.2em] font-bold">2004</span>
              </div>
           </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(5px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center relative z-10"
        >
          <h1 className={`${maShanZheng.className} text-7xl md:text-9xl text-[#1A1A1A] leading-tight drop-shadow-sm select-none`}>
            刘<span className="text-[#AA381E] mx-2">雅</span>贞
          </h1>
          <div className="flex items-center justify-center gap-3 mt-8 opacity-60">
             <span className="w-8 h-[1px] bg-[#C5A059]"></span>
             <p className="text-[#8A6D3B] text-sm md:text-base font-light tracking-[0.4em] uppercase">Happy Birthday</p>
             <span className="w-8 h-[1px] bg-[#C5A059]"></span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="flex flex-col items-center gap-3 z-10"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A059]/80">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown size={24} className="text-[#AA381E]/80" />
          </motion.div>
        </motion.div>
      </section>

      <section className="h-screen w-full snap-start flex justify-center items-center px-6 relative overflow-hidden">
         <div className="absolute left-[-10%] top-[10%] opacity-[0.05] pointer-events-none rotate-12">
            <Flower2 size={200} className="text-[#AA381E]" />
         </div>
         <motion.div
           initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }}
           variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, duration: 0.8 } }}}
           className="max-w-3xl w-full bg-[#FCFAF7]/60 backdrop-blur-md p-8 md:p-14 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50"
         >
            <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8">
               <motion.div
                 variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1 } }}
                 className="hidden md:flex writing-vertical-rl text-3xl text-[#AA381E] font-bold tracking-[0.4em] select-none items-center justify-center border-l border-[#AA381E]/20 pl-6"
               >
                 初冬 · 降临
               </motion.div>

               <div className="md:hidden text-2xl text-[#AA381E] font-bold tracking-[0.2em] mb-2 border-b border-[#AA381E]/20 pb-3 w-full text-center">
                 初冬 · 降临
               </div>

               <div className="flex-1 text-center md:text-left flex flex-col justify-center">
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                    <Quote size={24} className="text-[#C5A059] mb-6 opacity-60 mx-auto md:mx-0" />
                  </motion.div>
                  <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-lg md:text-xl text-[#5A5A5A] leading-[2.2em] tracking-wider">
                    二十一年前的冬月，<br/>
                    世界多了一抹温柔的底色。<br/>
                    你像是第一场初雪，清澈、安静，<br/>
                    却蕴含着覆盖一切喧嚣的力量。
                  </motion.p>
               </div>
            </div>
         </motion.div>
      </section>

      <section className="h-screen w-full snap-start flex justify-center items-center px-6 relative overflow-hidden">
        <div className="absolute right-[-10%] bottom-[10%] opacity-[0.05] pointer-events-none -rotate-12">
            <Sun size={200} className="text-[#C5A059]" />
        </div>
         <motion.div
           initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.5 }}
           variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, duration: 0.8 } }}}
           className="max-w-3xl w-full bg-[#FCFAF7]/60 backdrop-blur-md p-8 md:p-14 rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50"
         >
            <div className="flex flex-col md:flex-row-reverse items-center md:items-stretch gap-8">
               <motion.div
                 variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1 } }}
                 className="hidden md:flex writing-vertical-rl text-3xl text-[#C5A059] font-bold tracking-[0.4em] select-none items-center justify-center border-r border-[#C5A059]/20 pr-6"
               >
                 向阳 · 而生
               </motion.div>
               <div className="md:hidden text-2xl text-[#C5A059] font-bold tracking-[0.2em] mb-2 border-b border-[#C5A059]/20 pb-3 w-full text-center">
                 向阳 · 而生
               </div>
               <div className="flex-1 text-center md:text-right flex flex-col justify-center">
                  <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex justify-center md:justify-end">
                    <Sparkles size={24} className="text-[#AA381E] mb-6 opacity-60" />
                  </motion.div>
                  <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="text-lg md:text-xl text-[#5A5A5A] leading-[2.2em] tracking-wider">
                    愿你如冬日暖阳，<br/>
                    温柔而不刺眼，独立而不独行。<br/>
                    不求万事胜意，但愿在平凡日子里，<br/>
                    拥有仰望星空的勇气与自由。
                  </motion.p>
               </div>
            </div>
         </motion.div>
      </section>

      <section className="h-screen w-full snap-start flex flex-col justify-center items-center relative overflow-hidden p-6">
        <AnimatePresence>
          {!candleBlown && (
            <motion.div
              key="candle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 1 }}
              className="z-30 flex flex-col items-center cursor-pointer select-none"
              onClick={() => { startMicrophone(); triggerWishSequence(); }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
            >
              <motion.div
                className={`${maShanZheng.className} mb-16 text-5xl md:text-6xl tracking-[0.2em]`}
                animate={{
                    color: isExtinguishing ? "#C5A059" : "#AA381E",
                    textShadow: isExtinguishing ? "0 0 30px rgba(197, 160, 89, 0.8)" : "none",
                    scale: isExtinguishing ? 1.05 : 1
                }}
                transition={{ duration: 1.2 }}
              >
                {isExtinguishing ? "愿望成真" : "许个愿吧"}
              </motion.div>

              <div className="relative">
                <div className="w-6 h-32 md:w-8 md:h-40 rounded-sm shadow-lg transition-colors duration-1000"
                  style={{ background: "linear-gradient(to right, #e8e0d0, #fcfaf7, #d4c8b4)" }}></div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1 h-3 bg-black/40"></div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full">
                  <AnimatePresence>
                    {!isExtinguishing && (
                        <motion.div
                            exit={{ opacity: 0, scale: 0, y: -40, skewX: 20 }}
                            transition={{ duration: 0.8, ease: "circIn" }}
                            className="relative flex justify-center"
                        >
                            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [-1, 1, -1], filter: ["blur(2px)", "blur(3px)", "blur(2px)"] }} transition={{ repeat: Infinity, duration: 0.15 }} className="w-8 h-12 bg-orange-400/40 rounded-[50%] absolute top-2 blur-md" />
                            <motion.div animate={{ scaleY: [1, 1.15, 0.9], skewX: [-2, 2, -2] }} transition={{ repeat: Infinity, duration: 0.2 }} className="w-4 h-10 bg-gradient-to-t from-red-600 via-orange-500 to-yellow-200 rounded-[50%] opacity-90 shadow-[0_0_20px_rgba(255,165,0,0.6)]" />
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="mt-16 flex items-center gap-2 px-6 py-2 rounded-full border border-[#C5A059]/30 bg-white/40 backdrop-blur-sm relative">
                 <Wind size={16} className="text-[#C5A059]" />
                 <span className="text-xs text-[#8A6D3B] tracking-[0.1em]">
                   {isMicActive ? "对着麦克风吹气" : "点击 / 长按 / 吹气 熄灭烛火"}
                 </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {candleBlown && (
          <div className="absolute inset-0 w-full h-full flex justify-center items-center z-10 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="z-50 flex flex-col items-center justify-center bg-[#FDFBF5] border border-[#EADeb0] px-10 py-6 md:px-12 md:py-8 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_10px_30px_rgba(197,160,89,0.1)] mx-4"
            >
              <div className="text-xs md:text-sm text-[#C5A059] tracking-[0.3em] mb-3 uppercase font-serif">
                WISH YOU
              </div>
              <h2 className={`${maShanZheng.className} text-5xl md:text-7xl text-[#AA381E] whitespace-nowrap`}>
                平安 喜乐
              </h2>
            </motion.div>

            {staticWishes.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }} animate={{ opacity: 1, scale: item.scale }} transition={{ duration: 0.8, delay: item.delay, type: "spring", stiffness: 60 }} className={`absolute ${item.color} font-bold whitespace-nowrap select-none cursor-default`} style={{ left: item.left, top: item.top, rotate: `${item.rotate}deg`, fontSize: `${Math.max(0.9, Math.random() * 1.4)}rem`, fontFamily: 'var(--font-noto-serif-sc)', textShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                {item.text}
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}