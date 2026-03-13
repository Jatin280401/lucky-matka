import { useState, useEffect } from "react";
import { getTopResults, TopResult, getCities, City } from "@/lib/data";

import { useData } from "@/hooks/useData";

const HeroSection = () => {
  const { cities } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [topResults, setTopResults] = useState<TopResult[]>([]);
  const [disawerCity, setDisawerCity] = useState<City | null>(null);

  useEffect(() => {
    // Initial sync with context cities
    setTopResults(getTopResults(cities));
    setDisawerCity(cities.find(c => c.slug === 'disawer' || c.slug === 'disawar') || null);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTopResults(getTopResults(cities));
      setDisawerCity(cities.find(c => c.slug === 'disawer' || c.slug === 'disawar') || null);
    }, 1000);
    return () => clearInterval(timer);
  }, [cities]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) + " " + date.toLocaleTimeString("en-US");
  };

  return (
    <div className="bg-background text-center">
      {/* Title bar */}
      <div className="bg-primary py-3">
        <h1 className="text-primary-foreground text-4xl font-bold tracking-wider opacity-60">
          LUCKY-MATKA
        </h1>
      </div>

      {/* Black section with results */}
      <div className="bg-background py-6 px-4">
        <p className="text-primary font-bold text-lg mb-2">{formatDate(currentTime)}</p>
        <p className="text-foreground text-lg mb-6 font-medium">
          हा भाई यही आती हे सबसे पहले खबर रूको और देखो
        </p>

        {/* Exclusive Disawer result in black section if available */}
        {/* {disawerCity && (
          <div className="mb-8 border-b border-zinc-800 pb-6">
            <h2 className="text-foreground text-5xl font-black uppercase tracking-widest mb-2">
              {disawerCity.name}
            </h2>
            {disawerCity.todayResult ? (
              <p className="text-foreground text-6xl font-black tracking-tighter">
                {disawerCity.todayResult}
              </p>
            ) : (
              <div className="text-destructive text-6xl font-black tracking-tighter animate-blink">
                WAIT
              </div>
            )}
          </div>
        )} */}

        {topResults.filter(item => {
          const name = item.cityName.toLowerCase();
          return !name.includes('disawer') && !name.includes('disawar');
        }).map((item) => (
          <div key={item.id} className="mb-4">
            <h2 className="text-foreground text-2xl font-black uppercase tracking-wider">
              {item.cityName}
            </h2>
            {item.isWaiting ? (
              <div className="text-destructive text-2xl font-bold animate-blink mt-1">
                WAIT
              </div>
            ) : (
              <p className="text-foreground text-4xl font-black tracking-widest mt-1">
                {item.result}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Disawer result bar - Yellow Section */}
      {disawerCity && (
        <div className="bg-primary py-6 px-4 border-y-2 border-dashed border-destructive/30">
          <h3 className="text-primary-foreground text-3xl font-black uppercase tracking-widest">{disawerCity.name}</h3>
          <p className="text-primary-foreground text-xl font-bold mt-1">{disawerCity.timing}</p>
          
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-primary-foreground text-4xl font-black">
              {disawerCity.yesterdayResult}
            </span>
            <div className="bg-green-600 p-1 rounded-sm shadow-md">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
            {disawerCity.todayResult ? (
              <span className="text-primary-foreground text-4xl font-black">
                {disawerCity.todayResult}
              </span>
            ) : (
              <span className="text-destructive text-4xl font-black animate-blink">
                WAIT
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
