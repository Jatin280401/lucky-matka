import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCities,
  saveCities,
  deleteCity,
  getTopResults,
  getKhaiwals,
  saveKhaiwals,
  deleteKhaiwal,
  isAdminLoggedIn,
  adminLogout,
  City,
  Khaiwal,
  parseTime,
  defaultCities,
  getISTDateParts,
} from "@/lib/data";
import { useData } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

const createEmptyChartData = (): Record<string, string[]> => {
  const data: Record<string, string[]> = {};
  MONTHS.forEach(m => { data[m] = Array.from({length: 31}, () => ""); });
  return data;
};

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cities: contextCities, khaiwals: contextKhaiwals } = useData();
  const [cities, setCities] = useState<City[]>([]);
  const [khaiwals, setKhaiwals] = useState<Khaiwal[]>([]);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [editingKhaiwal, setEditingKhaiwal] = useState<Khaiwal | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCity, setNewCity] = useState<Partial<City>>({
    name: "",
    timing: "",
    yesterdayResult: "",
    todayResult: "",
    slug: "",
    group: "main",
    order: 0,
  });

  // ── Yearly Chart Editor State ──
  const [selectedChartCity, setSelectedChartCity] = useState<City | null>(null);
  const [chartData, setChartData] = useState<Record<string, string[]>>(createEmptyChartData());
  const [chartLoading, setChartLoading] = useState(false);
  const [chartSaving, setChartSaving] = useState(false);
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());

  const loadYearlyChart = useCallback(async (city: City, year: number) => {
    setSelectedChartCity(city);
    setChartYear(year);
    setChartLoading(true);
    setChartData(createEmptyChartData());

    try {
      let rawData = city.chart_data;

      // If city doesn't have chart_data in local state, fetch from Supabase cities table
      if (!rawData && supabase) {
        const { data, error } = await supabase
          .from("cities")
          .select("chart_data")
          .eq("id", city.id)
          .single();

        if (data && data.chart_data && !error) {
          rawData = data.chart_data;
        }
      }

      if (rawData) {
        const parsed = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
        const merged = createEmptyChartData();
        MONTHS.forEach(m => {
          if (parsed[m] && Array.isArray(parsed[m])) {
            merged[m] = parsed[m].map((v: string) => v || "");
            while (merged[m].length < 31) merged[m].push("");
          }
        });
        setChartData(merged);
      }
    } catch (e) {
      console.error("Failed to load yearly chart:", e);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const handleChartCellChange = useCallback((month: string, dayIdx: number, value: string) => {
    setChartData(prev => {
      const updated = { ...prev };
      updated[month] = [...(updated[month] || Array.from({length: 31}, () => ""))];
      updated[month][dayIdx] = value;
      return updated;
    });
  }, []);

  const handleSaveYearlyChart = useCallback(async () => {
    if (!selectedChartCity || !supabase) return;

    setChartSaving(true);
    try {
      // 1. Update chart_data in Supabase cities table directly
      const { error } = await supabase
        .from("cities")
        .update({ chart_data: chartData })
        .eq("id", selectedChartCity.id);

      if (error) throw error;

      // 2. Update local state
      const updatedCities = cities.map(c => 
        c.id === selectedChartCity.id ? { ...c, chart_data: chartData } : c
      );
      setCities(updatedCities);
      setSelectedChartCity(prev => prev ? { ...prev, chart_data: chartData } : null);
      localStorage.setItem("satta_cities", JSON.stringify(updatedCities));

      toast({
        title: "Chart Saved ✅",
        description: `${selectedChartCity.name} yearly chart updated successfully in cities table.`,
      });
    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setChartSaving(false);
    }
  }, [selectedChartCity, chartData, cities, toast]);

  useEffect(() => {
    const checkAuth = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
      } else {
        if (!isAdminLoggedIn()) {
          navigate("/login");
          return;
        }
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    setCities(contextCities);
  }, [contextCities]);

  useEffect(() => {
    setKhaiwals(contextKhaiwals);
  }, [contextKhaiwals]);

  const handleSaveCities = async (updated: City[]) => {
    setCities(updated);
    await saveCities(updated);
  };

  const handleDeleteCity = async (id: string) => {
    const updated = cities.filter((c) => c.id !== id);
    await deleteCity(id);
    handleSaveCities(updated);
  };

  const handleUpdateCity = async (city: City) => {
    // Generate static date representations for the exact moment of saving
    const { month: currentMonth, dayIdx: currentDayIdx, yesterdayMonth: yestMonth, yesterdayDayIdx: yestDayIdx } = getISTDateParts();

    // Ensure slug matches the name
    const updatedCity: City = {
      ...city,
      slug: city.name.toLowerCase().trim().replace(/\s+/g, "-"),
    };

    // Ensure chart_data is updated with today's and yesterday's results
    let cityChart: Record<string, string[]> = updatedCity.chart_data ? { ...updatedCity.chart_data } : {};
    if (typeof cityChart === 'string') {
      try { cityChart = JSON.parse(cityChart); } catch (e) { cityChart = {}; }
    }

    // 1. Map today's result into history in chart_data
    if (updatedCity.todayResult && updatedCity.todayResult !== "--") {
      if (!cityChart[currentMonth]) {
        cityChart[currentMonth] = Array.from({ length: 31 }, () => "");
      } else {
        cityChart[currentMonth] = [...cityChart[currentMonth]];
      }
      cityChart[currentMonth][currentDayIdx] = updatedCity.todayResult;
    }

    // 2. Map yesterday's result into history in chart_data
    if (updatedCity.yesterdayResult && updatedCity.yesterdayResult !== "--") {
      if (!cityChart[yestMonth]) {
        cityChart[yestMonth] = Array.from({ length: 31 }, () => "");
      } else {
        cityChart[yestMonth] = [...cityChart[yestMonth]];
      }
      cityChart[yestMonth][yestDayIdx] = updatedCity.yesterdayResult;
    }

    updatedCity.chart_data = cityChart;

    const updated = cities.map((c) => (c.id === city.id ? updatedCity : c));
    
    try {
      await handleSaveCities(updated);

      setEditingCity(null);
      toast({
        title: "City Updated",
        description: `${city.name} has been saved successfully.`
      });
    } catch (err: any) {
      toast({
        title: "Database Error",
        description: `Failed to save to Supabase: ${err.message || 'Unknown error. Did you run the SQL command?'}.`,
        variant: "destructive"
      });
    }
  };


  const handleSaveKhaiwals = async (updated: Khaiwal[]) => {
    setKhaiwals(updated);
    await saveKhaiwals(updated);
  };

  const handleUpdateKhaiwal = () => {
    if (!editingKhaiwal) return;
    const updated = khaiwals.map((k) => (k.id === editingKhaiwal.id ? editingKhaiwal : k));
    handleSaveKhaiwals(updated);
    setEditingKhaiwal(null);
  };

  const handleAddKhaiwal = () => {
    const newKhaiwal: Khaiwal = {
      id: Date.now().toString(),
      name: "NEW KHAIWAL CHART",
      whatsappNumber: "919990000000",
      cities: [
        { name: "दिल्ली बाजार", time: "3:00pm" }
      ]
    };
    handleSaveKhaiwals([...khaiwals, newKhaiwal]);
  };

  const handleDeleteKhaiwal = async (id: string) => {
    const updated = khaiwals.filter((k) => k.id !== id);
    await deleteKhaiwal(id);
    handleSaveKhaiwals(updated);
  };

  const handleAddCity = () => {
    if (!newCity.name || !newCity.timing) return;
    const city: City = {
      id: Date.now().toString(),
      name: newCity.name || "",
      timing: newCity.timing || "",
      yesterdayResult: newCity.yesterdayResult || "--",
      todayResult: newCity.todayResult || "",
      slug: (newCity.name || "").toLowerCase().replace(/\s+/g, "-"),
      group: (newCity.group as "main" | "secondary") || "main",
      order: newCity.order || cities.length,
    };
    handleSaveCities([...cities, city]);
    setNewCity({ name: "", timing: "", yesterdayResult: "", todayResult: "", slug: "", group: "main", order: 0 });
    setShowAddForm(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      adminLogout();
    }
    navigate("/login");
  };

  const mainCities = cities.filter((c) => c.group === "main" && c.id !== "system-date-tracker").sort((a, b) => a.order - b.order);
  const secondaryCities = cities.filter((c) => c.group === "secondary" && c.id !== "system-date-tracker").sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="bg-primary px-4 py-3 flex justify-between items-center">
        <h1 className="text-primary-foreground font-bold text-xl">LUCKY-MATKA Admin Panel</h1>
        <div className="flex gap-3">
          <a href="/" className="bg-background text-foreground px-4 py-1 rounded font-bold text-sm hover:opacity-80">
            View Site
          </a>
          <button
            onClick={handleLogout}
            className="bg-destructive text-destructive-foreground px-4 py-1 rounded font-bold text-sm hover:opacity-80"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8">
        {/* Cities Management */}
        <section>
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="text-foreground font-bold text-xl">Manage Cities</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold text-sm hover:bg-yellow-dark"
              >
                {showAddForm ? "Cancel" : "+ Add City"}
              </button>
            </div>
          </div>

          {/* Add City Form */}
          {showAddForm && (
            <div className="bg-secondary p-4 rounded border border-border mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <input
                value={newCity.name}
                onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                placeholder="City name"
                className="bg-background border border-border px-3 py-2 rounded text-foreground"
              />
              <input
                value={newCity.timing}
                onChange={(e) => setNewCity({ ...newCity, timing: e.target.value })}
                placeholder="Timing (e.g. 5:30 PM)"
                className="bg-background border border-border px-3 py-2 rounded text-foreground"
              />
              <input
                value={newCity.yesterdayResult}
                onChange={(e) => setNewCity({ ...newCity, yesterdayResult: e.target.value })}
                placeholder="Yesterday result"
                className="bg-background border border-border px-3 py-2 rounded text-foreground"
              />
              <input
                value={newCity.todayResult}
                onChange={(e) => setNewCity({ ...newCity, todayResult: e.target.value })}
                placeholder="Today result"
                className="bg-background border border-border px-3 py-2 rounded text-foreground"
              />
              <select
                value={newCity.group}
                onChange={(e) => setNewCity({ ...newCity, group: e.target.value as "main" | "secondary" })}
                className="bg-background border border-border px-3 py-2 rounded text-foreground"
              >
                <option value="main">Main Group</option>
                <option value="secondary">Secondary Group</option>
              </select>
              <button
                onClick={handleAddCity}
                className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold hover:bg-yellow-dark"
              >
                Add City
              </button>
            </div>
          )}

          {/* Main Cities */}
          <h3 className="text-primary font-bold mb-2">Main Group</h3>
          <CityList
            cities={mainCities}
            editingCity={editingCity}
            onEdit={setEditingCity}
            onUpdate={handleUpdateCity}
            onDelete={handleDeleteCity}
          />

          <h3 className="text-primary font-bold mb-2 mt-6">Secondary Group</h3>
          <CityList
            cities={secondaryCities}
            editingCity={editingCity}
            onEdit={setEditingCity}
            onUpdate={handleUpdateCity}
            onDelete={handleDeleteCity}
          />
        </section>

        {/* Khaiwals Management */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="text-foreground font-bold text-xl">Manage Khaiwal Charts (Home Page)</h2>
            <button
              onClick={handleAddKhaiwal}
              className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold text-sm hover:bg-yellow-dark"
            >
              + Add Khaiwal Chart
            </button>
          </div>

          <div className="space-y-4">
            {khaiwals.map((khaiwal) => (
              <div key={khaiwal.id} className="bg-secondary p-4 rounded border border-border">
                {editingKhaiwal?.id === khaiwal.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground ml-1">Khaiwal Name (e.g. MOHAN BHAI KHAIWAL)</label>
                        <input
                          value={editingKhaiwal.name}
                          onChange={(e) => setEditingKhaiwal({ ...editingKhaiwal, name: e.target.value })}
                          className="w-full bg-background border border-border px-3 py-2 rounded text-foreground"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground ml-1">WhatsApp Number (e.g. 919991234567)</label>
                        <input
                          value={editingKhaiwal.whatsappNumber}
                          onChange={(e) => setEditingKhaiwal({ ...editingKhaiwal, whatsappNumber: e.target.value })}
                          className="w-full bg-background border border-border px-3 py-2 rounded text-foreground"
                          placeholder="WhatsApp Number (include country code)"
                        />
                      </div>
                    </div>

                    <p className="text-sm font-bold text-foreground mt-4 mb-2">Edit Schedule Cities</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 bg-background/50 rounded">
                      {editingKhaiwal.cities.map((cityParam, idx) => (
                        <div key={idx} className="flex gap-2 p-2 bg-background border border-border rounded">
                          <input
                            value={cityParam.name}
                            onChange={(e) => {
                              const newCities = [...editingKhaiwal.cities];
                              newCities[idx].name = e.target.value;
                              setEditingKhaiwal({ ...editingKhaiwal, cities: newCities });
                            }}
                            className="w-1/2 bg-secondary border-none px-2 py-1 rounded text-foreground text-sm"
                            placeholder="City"
                          />
                          <input
                            value={cityParam.time}
                            onChange={(e) => {
                              const newCities = [...editingKhaiwal.cities];
                              newCities[idx].time = e.target.value;
                              setEditingKhaiwal({ ...editingKhaiwal, cities: newCities });
                            }}
                            className="w-1/2 bg-secondary border-none px-2 py-1 rounded text-foreground text-sm"
                            placeholder="Time"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newCities = [...editingKhaiwal.cities, { name: "New City", time: "12:00pm" }];
                          setEditingKhaiwal({ ...editingKhaiwal, cities: newCities });
                        }}
                        className="p-2 border border-dashed border-primary text-primary hover:bg-primary/10 rounded flex items-center justify-center font-bold text-sm"
                      >
                        + Add City
                      </button>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleUpdateKhaiwal}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded font-bold hover:bg-yellow-dark"
                      >
                        Save Configuration
                      </button>
                      <button
                        onClick={() => setEditingKhaiwal(null)}
                        className="bg-muted text-muted-foreground px-4 py-2 rounded font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-primary font-bold text-lg">♕♕ {khaiwal.name} ♕♕</h3>
                        <p className="text-muted-foreground text-sm mb-2">WhatsApp: <span className="text-foreground">{khaiwal.whatsappNumber}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingKhaiwal(khaiwal)}
                          className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-bold"
                        >
                          Edit Chart Details
                        </button>
                        <button
                          onClick={() => handleDeleteKhaiwal(khaiwal.id)}
                          className="bg-destructive text-destructive-foreground px-4 py-1.5 rounded text-sm font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {khaiwal.cities.map((city, idx) => (
                        <span key={idx} className="bg-background px-2 py-1 rounded border border-border text-foreground">
                          {city.name} - {city.time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Yearly Charts Management ── */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="text-foreground font-bold text-xl">Manage Yearly Charts</h2>
            {selectedChartCity && (
              <button
                onClick={() => setSelectedChartCity(null)}
                className="bg-muted text-muted-foreground px-4 py-2 rounded font-bold text-sm hover:opacity-80"
              >
                ← Back to Cities
              </button>
            )}
          </div>

          {!selectedChartCity ? (
            /* ── City Selection Grid ── */
            <div>
              <p className="text-muted-foreground text-sm mb-4">
                Click on a city to view and edit its yearly chart data.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {cities
                  .filter(c => c.id !== "system-date-tracker")
                  .sort((a, b) => a.order - b.order)
                  .map((city) => (
                    <button
                      key={city.id}
                      onClick={() => loadYearlyChart(city, chartYear)}
                      className="bg-secondary border border-border rounded-lg px-4 py-3 text-center hover:border-primary hover:bg-primary/10 transition-all duration-200 group"
                    >
                      <span className="text-primary font-bold text-sm uppercase group-hover:text-yellow-300 transition-colors">
                        {city.name}
                      </span>
                      <span className="block text-muted-foreground text-xs mt-1">{city.timing}</span>
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            /* ── Editable Yearly Chart ── */
            <div>
              {/* Chart Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-primary font-bold text-lg uppercase">
                    {selectedChartCity.name} — Yearly Chart
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadYearlyChart(selectedChartCity, chartYear - 1)}
                      className="bg-secondary border border-border text-foreground px-2 py-1 rounded text-sm font-bold hover:bg-muted"
                    >
                      ◀
                    </button>
                    <span className="text-foreground font-bold text-lg min-w-[50px] text-center">{chartYear}</span>
                    <button
                      onClick={() => loadYearlyChart(selectedChartCity, chartYear + 1)}
                      className="bg-secondary border border-border text-foreground px-2 py-1 rounded text-sm font-bold hover:bg-muted"
                    >
                      ▶
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSaveYearlyChart}
                  disabled={chartSaving || chartLoading}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded font-bold text-sm hover:bg-yellow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {chartSaving ? "Saving..." : "💾 Submit Changes"}
                </button>
              </div>

              {chartLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p>Loading chart data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-primary">
                        <th className="border border-border px-2 py-2 text-primary-foreground font-bold text-xs sticky left-0 bg-primary z-10">
                          {chartYear}
                        </th>
                        {MONTHS.map((m) => (
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
                      {Array.from({ length: 31 }, (_, i) => i).map((dayIdx) => (
                        <tr key={dayIdx} className="bg-background hover:bg-muted/20 transition-colors">
                          <td className="border border-border px-2 py-1 text-center text-primary font-bold text-sm sticky left-0 bg-background z-10">
                            {dayIdx + 1}
                          </td>
                          {MONTHS.map((m) => (
                            <td key={m} className="border border-border p-0">
                              <input
                                type="text"
                                value={chartData[m]?.[dayIdx] || ""}
                                onChange={(e) => handleChartCellChange(m, dayIdx, e.target.value)}
                                className="w-full bg-transparent text-center text-foreground font-bold text-sm px-1 py-1.5 outline-none focus:bg-primary/10 focus:ring-1 focus:ring-primary transition-colors"
                                style={{ minWidth: "44px" }}
                                placeholder="-"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Save Button */}
              {!chartLoading && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSaveYearlyChart}
                    disabled={chartSaving}
                    className="bg-primary text-primary-foreground px-8 py-2.5 rounded font-bold text-sm hover:bg-yellow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    {chartSaving ? "Saving..." : "💾 Submit Changes"}
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

interface CityListProps {
  cities: City[];
  editingCity: City | null;
  onEdit: (city: City | null) => void;
  onUpdate: (city: City) => void;
  onDelete: (id: string) => void;
}

const CityList = ({ cities, editingCity, onEdit, onUpdate, onDelete }: CityListProps) => {
  return (
    <div className="space-y-2">
      {cities.map((city) => (
        <div key={city.id} className="bg-secondary p-3 rounded border border-border">
          {editingCity?.id === city.id ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <input
                value={editingCity.name}
                onChange={(e) => onEdit({ ...editingCity, name: e.target.value })}
                className="bg-background border border-border px-2 py-1 rounded text-foreground text-sm"
                placeholder="Name"
              />
              <input
                value={editingCity.timing}
                onChange={(e) => onEdit({ ...editingCity, timing: e.target.value })}
                className="bg-background border border-border px-2 py-1 rounded text-foreground text-sm"
                placeholder="Timing"
              />
              <input
                value={editingCity.yesterdayResult}
                onChange={(e) => onEdit({ ...editingCity, yesterdayResult: e.target.value })}
                className="bg-background border border-border px-2 py-1 rounded text-foreground text-sm"
                placeholder="Yesterday Result"
              />
              <input
                value={editingCity.todayResult}
                onChange={(e) => onEdit({ ...editingCity, todayResult: e.target.value })}
                className="bg-background border border-border px-2 py-1 rounded text-foreground text-sm"
                placeholder="Today Result"
              />
              <div className="col-span-2 md:col-span-4 flex gap-2">
                <button
                  onClick={() => onUpdate(editingCity)}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-bold"
                >
                  Save
                </button>
                <button
                  onClick={() => onEdit(null)}
                  className="bg-muted text-muted-foreground px-3 py-1 rounded text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="text-primary font-bold uppercase text-sm">{city.name}</span>
                <span className="text-muted-foreground text-xs">{city.timing}</span>
                <span className="text-foreground text-sm">
                  Yesterday: <strong>{city.yesterdayResult}</strong>
                </span>
                <span className="text-foreground text-sm">
                  Today: <strong>{city.todayResult || "WAIT"}</strong>
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(city)}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(city.id)}
                  className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Admin;
