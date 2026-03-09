import Navbar from "@/components/Navbar";
import MarqueeBar from "@/components/MarqueeBar";
import Footer from "@/components/Footer";
import { useData } from "@/hooks/useData";
import { useState, useEffect } from "react";

const Chart = () => {
  const { cities } = useData();

  const allCities = [...cities].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarqueeBar />

      {/* LUCKY-MATKA Title Bar */}
      <div className="bg-primary py-3">
        <h1 className="text-primary-foreground text-4xl font-bold tracking-wider opacity-60 text-center">
          LUCKY-MATKA
        </h1>
      </div>

      {/* Subtitle */}
      <div className="bg-background py-4 text-center">
        <p className="text-foreground font-bold text-lg">
          Lucky-matka provides all kind of satta king results everyday.
        </p>
      </div>

      {/* SATTA KING CHART 2026 heading */}
      <div className="bg-primary py-4 text-center">
        <h2 className="text-primary-foreground text-2xl font-black tracking-wide">
          SATTA KING CHART 2026
        </h2>
      </div>

      {/* City chart links grid */}
      <div className="bg-primary px-4 py-2">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2">
          {allCities.map((city) => (
            <a
              key={city.id}
              href={`/chart/${city.slug}`}
              className="bg-yellow-dark hover:bg-yellow text-primary-foreground font-bold text-sm uppercase text-center py-3 px-4 border border-primary-foreground/20 transition-colors"
            >
              {city.name} SATTA KING CHART 2026
            </a>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Chart;
