import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MarqueeBar from "@/components/MarqueeBar";
import Footer from "@/components/Footer";
import { useData } from "@/hooks/useData";
import { City } from "@/lib/data";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const createEmptyData = (): Record<string, string[]> => {
  const data: Record<string, string[]> = {};
  months.forEach(m => { data[m] = Array.from({length: 31}, () => ""); });
  return data;
};

const normalizeSlug = (s: string): string => {
  const lower = s.toLowerCase().trim();
  if (lower === "bahadurgarh") return "bhadurghad";
  if (lower === "mirzapur") return "mirjapur";
  return lower;
};

const CityChart = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cities } = useData();
  const [cityData, setCityData] = useState<City | null>(null);
  const [data, setData] = useState<Record<string, string[]>>(createEmptyData());
  const [loading, setLoading] = useState(true);

  // Dynamic IST year
  const currentYear = (() => {
    const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    return new Date(now).getFullYear();
  })();

  useEffect(() => {
    if (!slug) return;
    const targetSlug = normalizeSlug(slug);

    const applyChartData = (cd: any) => {
      if (!cd) return;
      const parsed = typeof cd === "string" ? JSON.parse(cd) : cd;
      const merged = createEmptyData();
      months.forEach(m => {
        if (parsed[m] && Array.isArray(parsed[m])) {
          merged[m] = parsed[m].map((v: string) => v || "");
          while (merged[m].length < 31) merged[m].push("");
        }
      });
      setData(merged);
    };

    // 1. Try finding in context cities first
    const found = cities.find(
      (c) => c.slug.toLowerCase() === targetSlug || c.slug.toLowerCase() === slug.toLowerCase()
    );
    if (found) {
      setCityData(found);
      if (found.chart_data && Object.keys(found.chart_data).length > 0) {
        applyChartData(found.chart_data);
        setLoading(false);
        return;
      }
    }

    // 2. Fallback: fetch from single Supabase `cities` table
    const fetchCityFromDb = async () => {
      setLoading(true);
      try {
        if (!supabase) return;
        const { data: cRow, error } = await supabase
          .from("cities")
          .select("*")
          .or(`slug.eq.${targetSlug},slug.eq.${slug.toLowerCase()}`)
          .limit(1)
          .maybeSingle();

        if (cRow && !error) {
          setCityData(cRow as City);
          if (cRow.chart_data) {
            applyChartData(cRow.chart_data);
          }
        }
      } catch (err) {
        console.error("Error fetching city from cities table:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCityFromDb();
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
          {cityName} YEARLY CHART {currentYear}
        </h2>
      </div>

      {/* Monthly results table */}
      <div className="px-2 pb-6 overflow-x-auto">
        <table className="w-full max-w-6xl mx-auto border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-primary">
              <th className="border border-border px-2 py-2 text-primary-foreground font-bold text-xs">
                {currentYear}
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
                  const val = data[m] ? data[m][day - 1] || "" : "";
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
