import { useEffect, useState } from "react";
import WhatsAppIcon from "./WhatsAppIcon";
import { Khaiwal } from "@/lib/data";
import { useData } from "@/hooks/useData";

const WhatsAppButton = ({ url }: { url: string }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-[#25D366] mx-auto flex items-center gap-3 pl-1 pr-6 py-1 rounded-full shadow-md hover:opacity-90 transition-opacity active:scale-95 w-fit min-w-[200px]"
  >
    <div className="bg-white rounded-full flex items-center justify-center w-10 h-10 shadow-sm overflow-hidden">
      <WhatsAppIcon className="text-[#25D366] mt-0.5 ml-0.5" size={32} />
    </div>
    <div className="flex flex-col text-white text-left leading-[1.1]">
      <span className="font-bold text-lg leading-none">WhatsApp</span>
      <span className="text-[10px] font-bold leading-none">Click to chat</span>
    </div>
  </a>
);

const TimingSection = () => {
  const { khaiwals } = useData();

  return (
    <div className="w-full flex flex-col md:flex-row flex-wrap justify-center gap-6 px-4 md:px-0 py-8 bg-background max-w-7xl mx-auto">
      {khaiwals.map((khaiwal) => (
        <div key={khaiwal.id} className="w-full md:w-[calc(50%-1.5rem)] max-w-xl mx-auto flex flex-col mb-4">
          
          {/* Khaiwal Schedule Block */}
          <div className="w-full bg-[#f6d000] rounded-[30px] border-[2px] border-dotted border-red-600 px-4 py-8 text-center text-black shadow-md z-10 relative">
            <p className="font-bold text-lg mb-2">⚕️💠🕉️💠🕉️💠🕉️⚕️</p>
            <p className="font-bold text-lg mb-1">➡️ सीधे सट्टा कंपनी का No1 खाईवाल-- ⬅️</p>
            <p className="font-black text-2xl mb-4">♕♕ {khaiwal.name} ♕♕</p>
            
            <p className="font-bold text-xl mb-4">👉🏻👉🏻𝗥𝗔𝗧𝗘 𝟵𝟲𝟬 𝗥𝗔𝗧𝗘 𝟵𝟲𝟬</p>
            
            <div className="flex flex-col items-center justify-center gap-1 font-bold text-lg mb-6">
              {khaiwal.cities.map((city, idx) => (
                <p key={idx}>⏰ {city.name} ----------- {city.time}</p>
              ))}
            </div>

            <p className="font-bold text-lg mb-4">⚕️=================⚕️</p>
            
            <div className="my-6">
              <WhatsAppButton url={`https://wa.me/${khaiwal.whatsappNumber}`} />
            </div>
          </div>

        </div>
      ))}
    </div>
  );
};

export default TimingSection;
