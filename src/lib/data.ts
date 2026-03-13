export type City = {
  id: string;
  name: string;
  nameHindi?: string;
  timing: string;
  yesterdayResult: string;
  todayResult: string;
  slug: string;
  group: "main" | "secondary";
  order: number;
};

// Added helper to compute minutes for time sorting
export const parseTime = (timeStr: string) => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM|am|pm)/i);
  if (!match) return 0;
  let [_, h, m, ampm] = match;
  let hours = parseInt(h);
  let minutes = parseInt(m);
  if (ampm.toLowerCase() === 'pm' && hours < 12) hours += 12;
  if (ampm.toLowerCase() === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export type TopResult = {
  id: string;
  cityName: string;
  result: string;
  isWaiting: boolean;
};

export type MonthlyRecord = {
  date: string;
  results: Record<string, string>;
};

export type KhaiwalCityParams = {
  name: string;
  time: string;
};

export type Khaiwal = {
  id: string;
  name: string;
  whatsappNumber: string;
  cities: KhaiwalCityParams[];
};

export const defaultKhaiwals: Khaiwal[] = [
  {
    id: "1",
    name: "MOHAN BHAI KHAIWAL",
    whatsappNumber: "919991968836",
    cities: [
      { name: "फरुखनगर", time: "12:20pm" },
      { name: "सुल्तानपुर", time: "1:20pm" },
      { name: "उदयपुर", time: "2:20pm" },
      { name: "दिल्ली बाजार", time: "3:00pm" },
      { name: "श्री गणेश", time: "4:20pm" },
      { name: "मिर्जापुर", time: "5:20pm" },
      { name: "फरीदाबाद", time: "6:00pm" },
      { name: "बहादुरगढ़", time: "7:20pm" },
      { name: "गाज़ियाबाद", time: "9:20pm" },
      { name: "डीएलएफ सिटी", time: "10:20pm" },
      { name: "गली", time: "11:20pm" },
      { name: "दिसावर", time: "1:30Am" },
    ]
  },
  {
    id: "2",
    name: "LUCKY BHAI KHAIWAL",
    whatsappNumber: "919991779501",
    cities: [
      { name: "फरुखनगर", time: "12:20pm" },
      { name: "सुल्तानपुर", time: "1:20pm" },
      { name: "उदयपुर", time: "2:20pm" },
      { name: "दिल्ली बाजार", time: "3:00pm" },
      { name: "श्री गणेश", time: "4:20pm" },
      { name: "मिर्जापुर", time: "5:20pm" },
      { name: "फरीदाबाद", time: "6:00pm" },
      { name: "बहादुरगढ़", time: "7:20pm" },
      { name: "गाज़ियाबाद", time: "9:20pm" },
      { name: "डीएलएफ सिटी", time: "10:20pm" },
      { name: "गली", time: "11:20pm" },
      { name: "दिसावर", time: "1:30Am" },
    ]
  }
];

export const defaultCities: City[] = [
  { id: "1", name: "Sadar Bazar", timing: "1:40 PM", yesterdayResult: "94", todayResult: "", slug: "sadar-bazar", group: "main", order: 1 },
  { id: "2", name: "Gwalior", timing: "2:40 PM", yesterdayResult: "31", todayResult: "", slug: "gwalior", group: "main", order: 2 },
  { id: "3", name: "Delhi Bazar", timing: "3:15 PM", yesterdayResult: "70", todayResult: "", slug: "delhi-bazar", group: "main", order: 3 },
  { id: "4", name: "Delhi Matka", timing: "3:40 PM", yesterdayResult: "28", todayResult: "", slug: "delhi-matka", group: "main", order: 4 },
  { id: "5", name: "Shri Ganesh", timing: "4:40 PM", yesterdayResult: "14", todayResult: "", slug: "shri-ganesh", group: "main", order: 5 },
  { id: "6", name: "Agra", timing: "5:30 PM", yesterdayResult: "73", todayResult: "", slug: "agra", group: "main", order: 6 },
  { id: "7", name: "Faridabad", timing: "6:10 PM", yesterdayResult: "07", todayResult: "", slug: "faridabad", group: "main", order: 7 },
  { id: "8", name: "Alwar", timing: "7:35 PM", yesterdayResult: "82", todayResult: "", slug: "alwar", group: "main", order: 8 },
  { id: "9", name: "Ghaziabad", timing: "9:30 PM", yesterdayResult: "46", todayResult: "", slug: "ghaziabad", group: "main", order: 9 },
  { id: "10", name: "Dwarka", timing: "10:35 PM", yesterdayResult: "86", todayResult: "", slug: "dwarka", group: "main", order: 10 },
  { id: "11", name: "Gali", timing: "11:30 PM", yesterdayResult: "74", todayResult: "", slug: "gali", group: "main", order: 11 },
  { id: "12", name: "Disawer", timing: "5:15 AM", yesterdayResult: "54", todayResult: "", slug: "disawer", group: "main", order: 0 },
  { id: "13", name: "HR Satta", timing: "12:15 PM", yesterdayResult: "88", todayResult: "", slug: "hr-satta", group: "secondary", order: 1 },
  { id: "14", name: "Madhupuri", timing: "12:30 PM", yesterdayResult: "92", todayResult: "", slug: "madhupuri", group: "secondary", order: 2 },
  { id: "15", name: "KKR City", timing: "12:30 PM", yesterdayResult: "34", todayResult: "", slug: "kkr-city", group: "secondary", order: 3 },
  { id: "16", name: "Ujjala Super", timing: "12:30 PM", yesterdayResult: "--", todayResult: "", slug: "ujjala-super", group: "secondary", order: 4 },
  { id: "17", name: "Karol Bagh", timing: "1:45 PM", yesterdayResult: "16", todayResult: "", slug: "karol-bagh", group: "secondary", order: 5 },
  { id: "18", name: "Delhi Darbar", timing: "2:10 PM", yesterdayResult: "68", todayResult: "", slug: "delhi-darbar", group: "secondary", order: 6 },
  { id: "19", name: "New Ganga", timing: "3:30 PM", yesterdayResult: "52", todayResult: "", slug: "new-ganga", group: "secondary", order: 7 },
  { id: "20", name: "Fatehabad", timing: "7:00 PM", yesterdayResult: "03", todayResult: "", slug: "fatehabad", group: "secondary", order: 8 },
  { id: "21", name: "Raj Shree", timing: "7:20 PM", yesterdayResult: "65", todayResult: "", slug: "raj-shree", group: "secondary", order: 9 },
  { id: "22", name: "Mandi Bazar", timing: "8:10 PM", yesterdayResult: "84", todayResult: "", slug: "mandi-bazar", group: "secondary", order: 10 },
  { id: "23", name: "Lion Bazar", timing: "8:30 PM", yesterdayResult: "87", todayResult: "", slug: "lion-bazar", group: "secondary", order: 11 },
  { id: "24", name: "Dehradun City", timing: "9:40 PM", yesterdayResult: "70", todayResult: "", slug: "dehradun-city", group: "secondary", order: 12 },
  { id: "25", name: "Daman", timing: "9:50 PM", yesterdayResult: "45", todayResult: "", slug: "daman", group: "secondary", order: 13 },
  { id: "system-date-tracker", name: "System Date Tracker", timing: new Date().toDateString(), yesterdayResult: "", todayResult: "", slug: "system-date-tracker", group: "main", order: 999 },
];

export async function clearTodayResults() {
  const currentCities = JSON.parse(localStorage.getItem("satta_cities") || "[]");
  const cleared = currentCities.map((c: City) => ({ ...c, todayResult: "" }));
  localStorage.setItem("satta_cities", JSON.stringify(cleared));

  if (supabase) {
    const { error } = await supabase
      .from("cities")
      .update({ todayResult: "" })
      .neq("id", "");
    if (error) throw error;
  }
}

export const defaultTopResults: TopResult[] = [
  { id: "1", cityName: "Dwarka", result: "", isWaiting: true },
  { id: "2", cityName: "Ghaziabad", result: "", isWaiting: true },
  { id: "3", cityName: "Dehradun City", result: "", isWaiting: true },
];

export async function syncDailyReset(cities: City[]) {
  const currentDate = new Date().toDateString();

  const storedDate = localStorage.getItem("satta_last_date");
  
  // Find the tracker
  const tracker = cities.find(c => c.id === "system-date-tracker");
  const globalLastDate = tracker ? tracker.timing : storedDate;

  if (globalLastDate !== currentDate) {
    console.log("Date changed globally, performing daily reset...");
    const updatedCities = cities.map(city => {
      if (city.id === "system-date-tracker") {
        return { ...city, timing: currentDate };
      }
      return {
        ...city,
        yesterdayResult: city.todayResult || city.yesterdayResult,
        todayResult: "",
      };
    });

    // Update Local Storage
    localStorage.setItem("satta_cities", JSON.stringify(updatedCities));
    localStorage.setItem("satta_last_date", currentDate);

    // Update Supabase
    if (supabase) {
      const upsertData = updatedCities.map(c => ({
        id: c.id,
        name: c.name,
        timing: c.timing,
        "yesterdayResult": c.yesterdayResult,
        "todayResult": c.id === "system-date-tracker" ? "" : "", // Explicitly clear today's result
        slug: c.slug,
        "group": c.group,
        "order": c.order
      }));
      
      try {
        const { error } = await supabase.from("cities").upsert(upsertData, { onConflict: "id" });
        if (error) console.error("Error syncing daily reset to Supabase:", error);
      } catch (err) {
        console.error("Failed to sync daily reset:", err);
      }
    }
    return updatedCities;
  } else {
    // Global already shifted. Just sync local storage date if needed
    const storedDate = localStorage.getItem("satta_last_date");
    if (storedDate !== currentDate) {
      localStorage.setItem("satta_cities", JSON.stringify(cities));
      localStorage.setItem("satta_last_date", currentDate);
    }
    return cities;
  }
}

export function getCities(): City[] {
  const stored = localStorage.getItem("satta_cities");
  const storedDate = localStorage.getItem("satta_last_date");
  const currentDate = new Date().toDateString();

  let cities = defaultCities;
  if (stored) {
    try {
      cities = JSON.parse(stored);
    } catch (e) {
      cities = defaultCities;
    }
  } else {
    localStorage.setItem("satta_cities", JSON.stringify(defaultCities));
  }

  // Local reset logic (backup)
  const tracker = cities.find(c => c.id === "system-date-tracker");
  const globalLastDate = tracker ? tracker.timing : storedDate;

  if (globalLastDate !== currentDate && storedDate !== currentDate) {
    cities = cities.map(city => {
      if (city.id === "system-date-tracker") {
        return { ...city, timing: currentDate };
      }
      return {
        ...city,
        yesterdayResult: city.todayResult || city.yesterdayResult,
        todayResult: "",
      };
    });
    localStorage.setItem("satta_cities", JSON.stringify(cities));
    localStorage.setItem("satta_last_date", currentDate);
  } else if (storedDate !== currentDate) {
    localStorage.setItem("satta_cities", JSON.stringify(cities));
    localStorage.setItem("satta_last_date", currentDate);
  }

  return cities;
}

export async function saveCities(cities: City[]) {
  localStorage.setItem("satta_cities", JSON.stringify(cities));
  localStorage.setItem("satta_last_date", new Date().toDateString());
  
  if (supabase) {
    const upsertData = cities.map(c => ({
      id: c.id,
      name: c.name,
      timing: c.timing,
      "yesterdayResult": c.yesterdayResult,
      "todayResult": c.todayResult,
      slug: c.slug,
      "group": c.group,
      "order": c.order
    }));
    await supabase.from("cities").upsert(upsertData, { onConflict: "id" });
  }
}

export async function resetCitiesToDefaults() {
  localStorage.setItem("satta_cities", JSON.stringify(defaultCities));
  localStorage.setItem("satta_last_date", new Date().toDateString());
  
  if (supabase) {
    // Delete all existing records to ensure perfect cleanup
    // We use a safe comparison to delete all - checking if id is not null/empty
    const { error: deleteError } = await supabase.from("cities").delete().neq("id", "");
    
    if (deleteError) {
      console.error("Error clearing cities table:", deleteError);
      throw deleteError;
    }
    
    const insertData = defaultCities.map(c => ({
      id: c.id,
      name: c.name,
      timing: c.timing,
      "yesterdayResult": c.yesterdayResult,
      "todayResult": c.todayResult,
      slug: c.slug,
      "group": c.group,
      "order": c.order
    }));
    
    const { error: insertError } = await supabase.from("cities").insert(insertData);
    if (insertError) {
      console.error("Error inserting default cities:", insertError);
      throw insertError;
    }
  }
}

export async function deleteCity(id: string) {
  if (supabase) {
    const { error } = await supabase.from("cities").delete().eq("id", id);
    if (error) console.error("Error deleting city:", error);
  }
}

export function getKhaiwals(): Khaiwal[] {
  const stored = localStorage.getItem("satta_khaiwals");
  if (stored) {
    return JSON.parse(stored);
  } else {
    localStorage.setItem("satta_khaiwals", JSON.stringify(defaultKhaiwals));
    return defaultKhaiwals;
  }
}

import { supabase } from "./supabase";

export async function saveKhaiwals(khaiwals: Khaiwal[]) {
  localStorage.setItem("satta_khaiwals", JSON.stringify(khaiwals));
  if (supabase) {
    const upsertData = khaiwals.map(k => ({
      id: k.id,
      name: k.name,
      "whatsappNumber": k.whatsappNumber,
      cities: k.cities
    }));
    await supabase.from("khaiwals").upsert(upsertData, { onConflict: "id" });
  }
}

export async function deleteKhaiwal(id: string) {
  if (supabase) {
    const { error } = await supabase.from("khaiwals").delete().eq("id", id);
    if (error) console.error("Error deleting khaiwal:", error);
  }
}

export function getTopResults(citiesParam?: City[]): TopResult[] {
  const cities = (citiesParam || getCities()).filter(c => c.id !== "system-date-tracker");
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const sortedCities = [...cities].sort((a, b) => parseTime(a.timing) - parseTime(b.timing));
  
  // Find past cities (time passed) and future cities
  const pastCities = sortedCities.filter(c => parseTime(c.timing) <= currentMinutes).sort((a, b) => parseTime(b.timing) - parseTime(a.timing));
  let futureCities = sortedCities.filter(c => parseTime(c.timing) > currentMinutes);
  
  // If no future cities today, wrap around to tomorrow morning
  if (futureCities.length === 0) {
    futureCities = [...sortedCities];
  }

  const nextCity = futureCities.find(c => !c.todayResult) || futureCities[0];
  
  const results: TopResult[] = [];
  
  if (nextCity) {
    results.push({
      id: "top-1",
      cityName: nextCity.name,
      result: "",
      isWaiting: true // Next city is waiting
    });
  }
  
  // Add 2 most recently announced (or past) cities
  const announced = pastCities.filter(c => c.todayResult && c.todayResult !== "--");
  if (announced.length > 0) {
    results.push({
      id: "top-2",
      cityName: announced[0].name,
      result: announced[0].todayResult,
      isWaiting: false
    });
  }
  if (announced.length > 1) {
    results.push({
      id: "top-3",
      cityName: announced[1].name,
      result: announced[1].todayResult,
      isWaiting: false
    });
  }
  
  return results;
}

export function saveTopResults(results: TopResult[]) {
  // Not used anymore as getTopResults is dynamic, but kept for compatibility
  localStorage.setItem("satta_top_results", JSON.stringify(results));
}

export function isAdminLoggedIn(): boolean {
  return sessionStorage.getItem("admin_logged_in") === "true";
}

export function adminLogin(password: string): boolean {
  // Default admin password
  const adminPass = localStorage.getItem("admin_password") || "admin123";
  if (password === adminPass) {
    sessionStorage.setItem("admin_logged_in", "true");
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem("admin_logged_in");
}
