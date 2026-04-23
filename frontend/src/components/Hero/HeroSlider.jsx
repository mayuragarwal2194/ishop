"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import SubscribeForm from "./SubscribeForm";
import { quicksand } from "@/fonts";
import { lato } from "@/fonts";
import { heroSlides } from "./heroData/heroData";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const slide = heroSlides[index]; // 👈 current slide

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % heroSlides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-75 md:h-full rounded-2xl overflow-hidden">
      <Image src={slide.bg} alt="hero" fill className="object-cover" priority />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 flex items-center">
        <div className="flex flex-col justify-center px-6 md:px-12 text-white gap-6 md:gap-10">
          {/* Logo (Apple etc.) */}
          {slide.logo && (
            <Image src={slide.logo} alt="logo" width={40} height={40} />
          )}

          {/* Small Text */}
          {slide.smallText && (
            <p className={`text-sm text-gray-300 ${lato.className}`}>
              {slide.smallText}
            </p>
          )}

          {/* Title */}
          <h1
            className={`text-2xl md:text-4xl lg:text-7xl font-bold w-[75%] ${quicksand.className}`}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          {slide.subtitle && (
            <p
              className={`text-sm md:text-[30px] font-normal text-gray-200 ${lato.className}`}
            >
              {slide.subtitle}
            </p>
          )}

          {/* Newsletter */}
          {slide.showInput && (
            <div className="mt-3">
              <SubscribeForm />
            </div>
          )}

          {/* CTA */}
          {slide.cta && (
            <button className="mt-4 bg-primary px-6 py-3 rounded-full w-fit">
              {slide.cta}
            </button>
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              index === i ? "bg-primary" : "bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
