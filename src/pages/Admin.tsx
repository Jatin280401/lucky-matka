import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCities,
  saveCities,
  deleteCity,
  getTopResults,
  saveTopResults,
  getKhaiwals,
  saveKhaiwals,
  deleteKhaiwal,
  isAdminLoggedIn,
  adminLogout,
  City,
  Khaiwal,
  parseTime,
  defaultCities,
  resetCitiesToDefaults,
} from "@/lib/data";
import { useData } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cities: contextCities, khaiwals: contextKhaiwals } = useData();
  const [cities, setCities] = useState<City[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
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

  const handleUpdateCity = (city: City) => {
    // Generate static date representations for the exact moment of saving
    const now = new Date();
    const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    const currentMonth = months[now.getMonth()];
    const currentDayIdx = now.getDate() - 1; // 0-indexed for array positions

    // Ensure slug matches the name
    const updatedCity = {
      ...city,
      slug: city.name.toLowerCase().trim().replace(/\s+/g, "-"),
      chart_data: city.chart_data ? JSON.parse(JSON.stringify(city.chart_data)) : {} // Deep copy to edit
    };

    // If there is an active result today, map it permanently into history
    if (updatedCity.todayResult && updatedCity.todayResult !== "--") {
      if (!updatedCity.chart_data[currentMonth]) {
        updatedCity.chart_data[currentMonth] = Array.from({length: 31}, () => "");
      }
      updatedCity.chart_data[currentMonth][currentDayIdx] = updatedCity.todayResult;
    }

    const updated = cities.map((c) => (c.id === city.id ? updatedCity : c));
    handleSaveCities(updated);
    setEditingCity(null);
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

  const mainCities = cities.filter((c) => c.group === "main").sort((a, b) => a.order - b.order);
  const secondaryCities = cities.filter((c) => c.group === "secondary").sort((a, b) => a.order - b.order);

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
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="bg-muted text-muted-foreground px-4 py-2 rounded font-bold text-sm hover:opacity-80 transition-all"
                >
                  Reset to Defaults
                </button>
              ) : (
                <div className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                  <button
                    disabled={isResetting}
                    onClick={async () => {
                      setIsResetting(true);
                      try {
                        await resetCitiesToDefaults();
                        toast({
                          title: "Reset Successful",
                          description: "All cities have been restored to default values.",
                        });
                        setShowResetConfirm(false);
                      } catch (error) {
                        toast({
                          title: "Reset Failed",
                          description: "There was an error resetting the database.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsResetting(false);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded font-bold text-sm hover:opacity-90"
                  >
                    {isResetting ? "Resetting..." : "Confirm Reset?"}
                  </button>
                  <button
                    disabled={isResetting}
                    onClick={() => setShowResetConfirm(false)}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded font-bold text-sm hover:opacity-80"
                  >
                    Cancel
                  </button>
                </div>
              )}
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
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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
                disabled
                className="bg-muted border border-border px-2 py-1 rounded text-muted-foreground text-sm cursor-not-allowed opacity-60"
                placeholder="Yesterday (Locked)"
                title="Yesterday's result cannot be changed"
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
