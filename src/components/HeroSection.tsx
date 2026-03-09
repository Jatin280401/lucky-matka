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
    setDisawerCity(cities.find(c => c.slug === 'disawer') || null);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setTopResults(getTopResults(cities));
      setDisawerCity(cities.find(c => c.slug === 'disawer') || null);
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
        <p className="text-foreground text-lg mb-6">
          हा भाई यही आती हे सबसे पहले खबर रूको और देखो
        </p>

        {topResults.map((item) => (
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

      {/* Disawer result bar */}
      {disawerCity && (
        <div className="bg-primary py-4">
          <h3 className="text-primary-foreground text-xl font-bold uppercase">{disawerCity.name}</h3>
          <p className="text-primary-foreground text-sm">{disawerCity.timing}</p>
          <p className="text-primary-foreground text-xl font-bold mt-1">
            {disawerCity.yesterdayResult} ➜ {disawerCity.todayResult || "WAIT"}
          </p>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
