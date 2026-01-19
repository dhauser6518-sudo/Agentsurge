"use client";

import { logos } from "./logoData";

export default function LogoSlider() {
  return (
    <section className="py-12 overflow-hidden bg-gradient-to-r from-sky-500 to-cyan-500">
      <p className="text-center text-xs text-slate-900 uppercase tracking-widest mb-8">
        Trusted by Top Agencies
      </p>
      <div className="relative">
        <div className="flex logo-track">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex items-center gap-16 px-8 shrink-0">
              {logos.map((logo, index) => (
                <div
                  key={`${setIndex}-${index}`}
                  className="shrink-0 h-16 flex items-center opacity-60 hover:opacity-100 transition-opacity"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className={`${logo.height || "h-12"} w-auto max-w-[180px] object-contain`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .logo-track {
          animation: scroll 15s linear infinite;
          width: max-content;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
