import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MarqueeBar from "@/components/MarqueeBar";
import Footer from "@/components/Footer";
import { useData } from "@/hooks/useData";
import { City } from "@/lib/data";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const emptyData: Record<string, string[]> = {
  JAN: Array.from({length: 31}, () => ""),
  FEB: Array.from({length: 31}, () => ""),
  MAR: Array.from({length: 31}, () => ""),
  APR: Array.from({length: 31}, () => ""),
  MAY: Array.from({length: 31}, () => ""),
  JUN: Array.from({length: 31}, () => ""),
  JUL: Array.from({length: 31}, () => ""),
  AUG: Array.from({length: 31}, () => ""),
  SEP: Array.from({length: 31}, () => ""),
  OCT: Array.from({length: 31}, () => ""),
  NOV: Array.from({length: 31}, () => ""),
  DEC: Array.from({length: 31}, () => ""),
};

const CityChart = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cities } = useData();
  const [cityData, setCityData] = useState<City | null>(null);
  const [data, setData] = useState<Record<string, string[]>>(emptyData);
  const [loading, setLoading] = useState(true);

  // Fetch chart data dynamically from Supabase yearly_charts table
  useEffect(() => {
    const fetchYearlyData = async () => {
      setLoading(true);
      // Fallback empty data
      setData(emptyData);
      
      try {
        if (!slug || !supabase) return;
        
        const currentYear = 2026;
        const targetId = `${slug}-${currentYear}`;
        
        const { data: cData, error } = await supabase
          .from("yearly_charts")
          .select("chart_data")
          .eq("id", targetId)
          .single();

        if (cData && cData.chart_data && !error) {
           setData({ ...emptyData, ...(typeof cData.chart_data === 'string' ? JSON.parse(cData.chart_data) : cData.chart_data) });
        }
      } catch (e) {
        console.error("Failed to fetch yearly chart", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchYearlyData();
  }, [slug]);

  useEffect(() => {
    const found = cities.find((c) => c.slug === slug);
    if (found) setCityData(found);
  }, [slug, cities]);

  const cityName = cityData ? cityData.name : (slug ? slug.replace(/-/g, " ") : "Unknown");


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
                  
                  // Inject actual historical data from Supabase DB storage
                  if (cityData?.chart_data && cityData.chart_data[m]) {
                    const loadedVal = cityData.chart_data[m][day - 1];
                    if (loadedVal) {
                      val = loadedVal;
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
