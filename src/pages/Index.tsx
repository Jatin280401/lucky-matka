import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MarqueeBar from "@/components/MarqueeBar";
import HeroSection from "@/components/HeroSection";
import ResultsTable from "@/components/ResultsTable";
import TimingSection from "@/components/TimingSection";
import SeoContent from "@/components/SeoContent";
import Footer from "@/components/Footer";
import SocialBanner from "@/components/SocialBanner";
import { useData } from "@/hooks/useData";

const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029VafVyGV1SWsynynlOO0W";
const TELEGRAM_CHANNEL_URL = "https://t.me/a7Resultupdates";

const Index = () => {
  const { cities } = useData();

  const mainCities = cities
    .filter((c) => c.group === "main" && c.id !== "system-date-tracker")
    .sort((a, b) => a.order - b.order);
  const secondaryCities = cities
    .filter((c) => c.group === "secondary" && c.id !== "system-date-tracker")
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <MarqueeBar />
      <HeroSection />

      <div className="w-full bg-primary py-3 px-4 text-center border-y-[1.5px] border-dashed border-[#e91e63] my-1">
        <a href="/chart/disawer" className="text-blue-700 font-bold uppercase underline text-xs md:text-sm">LUCKYMATKA DISAWER CHART</a>
        <span className="text-black font-bold uppercase text-xs md:text-sm"> FOR 2025 IS AVAILABLE</span>
      </div>

      <div className="w-full bg-primary py-3 px-4 text-center border-y-[1.5px] border-dashed border-[#e91e63] my-1">
        <a href="/chart/delhi-bazar" className="text-blue-700 font-bold uppercase underline text-xs md:text-sm">DELHI SATTA RECORD CHART</a>
        <span className="text-black font-bold uppercase text-xs md:text-sm"> AVAILABLE ON LUCKYMATKA</span>
      </div>

      <div className="w-full bg-primary py-3 px-4 text-center border-y-[1.5px] border-dashed border-[#e91e63] my-1">
        <span className="text-black font-bold uppercase text-xs md:text-sm">CHECK UPDATED SHREE GANESH SATTA KING CHART </span>
        <a href="/chart/shri-ganesh" className="text-blue-700 font-bold uppercase underline text-xs md:text-sm">HERE</a>
      </div>

      <TimingSection />

      <div className="px-4 py-6">
        <ResultsTable cities={mainCities} />
        <ResultsTable cities={secondaryCities} />
      </div>
      <SeoContent />
      <Footer />
    </div>
  );
};

export default Index;
