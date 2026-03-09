import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MarqueeBar from "@/components/MarqueeBar";
import Footer from "@/components/Footer";
import { useData } from "@/hooks/useData";
import { City } from "@/lib/data";
import { useState, useEffect } from "react";
import { historicalChartData } from "@/lib/chartData";

const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function getCityData(slug: string): Record<string, string[]> {
  if (historicalChartData[slug]) return historicalChartData[slug];

  // Deterministic seed-based number generation to keep results fixed on refresh
  const getStaticValue = (month: string, day: number) => {
    const seed = `${slug}-${month}-${day}-2026`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    return String(Math.abs(hash) % 100).padStart(2, "0");
  };

  return {
    JAN: Array.from({length: 31}, (_, i) => getStaticValue("JAN", i + 1)),
    FEB: Array.from({length: 31}, (_, i) => i < 28 ? getStaticValue("FEB", i + 1) : ""),
    MAR: Array.from({length: 31}, (_, i) => i < 7 ? getStaticValue("MAR", i + 1) : ""),
  };
}

const CityChart = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cities } = useData();
  const [cityData, setCityData] = useState<City | null>(null);

  useEffect(() => {
    const found = cities.find((c) => c.slug === slug);
    if (found) setCityData(found);
  }, [slug, cities]);

  const cityName = cityData ? cityData.name : (slug ? slug.replace(/-/g, " ") : "Unknown");
  const data = getCityData(slug || "");
  
  // Real-time injection logic
  const now = new Date();
  const currentMonthIdx = now.getMonth(); // 0-11
  const currentDay = now.getDate(); // 1-31
  const currentMonthName = months[currentMonthIdx];
  
  let yesterdayMonthIdx = currentMonthIdx;
  let yesterdayDay = currentDay - 1;
  if (yesterdayDay === 0) {
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    yesterdayMonthIdx = yesterdayDate.getMonth();
    yesterdayDay = yesterdayDate.getDate();
  }
  const yesterdayMonthName = months[yesterdayMonthIdx];

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

      {/* City chart heading */}
      <div className="bg-background py-6 text-center">
        <h2 className="text-foreground text-2xl font-black uppercase tracking-wide">
          {cityName} YEARLY CHART 2026
        </h2>
      </div>

      {/* Monthly results table */}
      <div className="px-2 pb-6 overflow-x-auto">
        <table className="w-full max-w-6xl mx-auto border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-primary">
              <th className="border border-border px-2 py-2 text-primary-foreground font-bold text-xs">
                2026
              </th>
              {months.map((m) => (
                <th
                  key={m}
                  className="border border-border px-2 py-2 text-primary-foreground font-bold text-xs"
                >
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <tr key={day} className="bg-background hover:bg-muted/20 transition-colors">
                <td className="border border-border px-2 py-1.5 text-center text-primary font-bold text-sm">
                  {day}
                </td>
                {months.map((m) => {
                  let val = data[m] ? data[m][day - 1] || "" : "";
                  
                  // Inject real-time data from admin panel
                  if (cityData) {
                    if (m === currentMonthName && day === currentDay) {
                      if (cityData.todayResult) val = cityData.todayResult;
                    } else if (m === yesterdayMonthName && day === yesterdayDay) {
                      if (cityData.yesterdayResult !== "--") val = cityData.yesterdayResult;
                    }
                  }

                  // Replace empty string or "--" with wait text
                  const displayVal = val === "" || val === "--" ? <span className="text-muted-foreground">-</span> : val;
                  
                  return (
                    <td
                      key={m}
                      className="border border-border px-2 py-1.5 text-center text-foreground font-bold text-sm"
                    >
                      {displayVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Footer />
    </div>
  );
};

export default CityChart;
