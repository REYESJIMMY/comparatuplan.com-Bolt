'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ParallaxSectionProps {
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  buttonText: string;
  reverse?: boolean; // Permite alternar el orden de imagen y texto
}

export default function ParallaxSection({
  imageSrc,
  imageAlt,
  tag,
  title,
  description,
  buttonText,
  reverse = false
}: ParallaxSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de la Imagen (Parallax + Expansión continua al scroll)
      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        scale: 1.25,
        yPercent: 12,
        ease: 'none',
      });

      // Animación del Texto (Fade-in + Slide-up secuencial)
      if (textRef.current) {
        gsap.to(textRef.current.children, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="min-h-screen py-20 px-4 max-w-6xl mx-auto flex flex-col justify-center overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Contenedor de la Imagen */}
        <div className={`relative overflow-hidden rounded-2xl aspect-[4/3] shadow-2xl bg-slate-800 border border-slate-700/50 ${reverse ? 'md:order-last' : ''}`}>
          <div ref={imageRef} className="w-full h-full relative will-change-transform scale-[1.05]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(max-w-768px) 100vw, 50vw"
              className="object-cover opacity-85"
              priority={false}
            />
          </div>
        </div>

        {/* Bloque de Contenido */}
        <div ref={textRef} className="space-y-6">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/60 opacity-0 translate-y-4 will-change-transform">
            {tag}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight opacity-0 translate-y-6 will-change-transform">
            {title}
          </h2>
          <p className="text-slate-400 leading-relaxed text-base md:text-lg opacity-0 translate-y-6 will-change-transform">
            {description}
          </p>
          <div className="opacity-0 translate-y-6 will-change-transform">
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.02]">
              {buttonText}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
