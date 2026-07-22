"use client";

export default function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0b0813]">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_95%_95%_at_50%_40%,#000_70%,transparent_100%)] z-10" />

      <div className="absolute top-[-10%] left-[-10%] w-[45rem] h-[45rem] bg-gradient-to-br from-purple-600/30 via-indigo-600/20 to-transparent blur-[95px] animate-blob-1 opacity-80" />

      <div className="absolute top-[35%] right-[-15%] w-[50rem] h-[50rem] bg-gradient-to-tl from-pink-600/25 via-purple-700/20 to-transparent blur-[105px] animate-blob-2 opacity-75" />

      <div className="absolute bottom-[-10%] left-[20%] w-[42rem] h-[42rem] bg-gradient-to-tr from-purple-800/30 via-indigo-500/15 to-transparent blur-[90px] animate-blob-3 opacity-70" />

      <div className="absolute top-[22%] left-[50%] -translate-x-1/2 w-72 h-72 bg-purple-500/15 rounded-full blur-[70px] animate-pulse" />
      <div className="absolute top-[65%] right-[25%] w-80 h-80 bg-pink-500/15 rounded-full blur-[80px] animate-pulse" />

      <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_85%_85%_at_50%_50%,#000_70%,transparent_100%)] z-10" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0813]/40 via-transparent to-[#0b0813]/80 z-20 pointer-events-none" />
    </div>
  );
}
