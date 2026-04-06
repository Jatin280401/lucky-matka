import { supabase } from "./supabase";

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
  chart_data?: Record<string, string[]>;
};

export function getISTDateParts(): { year: number, month: string, dayIdx: number, yesterdayMonth: string, yesterdayDayIdx: number } {
  // Use Intl to get IST date to avoid client timezone inconsistencies
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const istDate = new Date(now);
  const currentYear = istDate.getFullYear();
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const currentMonth = months[istDate.getMonth()];
  const currentDayIdx = istDate.getDate() - 1;

  const yesterday = new Date(istDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayMonth = months[yesterday.getMonth()];
  const yesterdayDayIdx = yesterday.getDate() - 1;

  return { year: currentYear, month: currentMonth, dayIdx: currentDayIdx, yesterdayMonth, yesterdayDayIdx };
}

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

export const getISTDate = () => {
  const d = new Date();
  // Add 5 hours 30 mins (19,800,000 ms) to UTC to align UTC time with IST time
  return new Date(d.getTime() + 19800000);
};

export const getISTDateString = () => {
  const ist = getISTDate();
  // Subtract 15 minutes (900,000 ms) to delay the date shift until 12:15 AM IST
  const shiftTime = new Date(ist.getTime() - 900000);
  return `${shiftTime.getUTCFullYear()}-${String(shiftTime.getUTCMonth() + 1).padStart(2, '0')}-${String(shiftTime.getUTCDate()).padStart(2, '0')}`;
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
  { id: "1", name: "DELHI BAZAR", timing: "3:00 PM", yesterdayResult: "75", todayResult: "74", slug: "delhi-bazar", group: "main", order: 1 },
  { id: "2", name: "SADAR BAZAR", timing: "4:40 PM", yesterdayResult: "42", todayResult: "27", slug: "sadar-bazar", group: "main", order: 2 },
  { id: "3", name: "FARIDABAD", timing: "6:10 PM", yesterdayResult: "43", todayResult: "", slug: "faridabad", group: "main", order: 3 },
  { id: "4", name: "GAJIYABAD", timing: "9:30 PM", yesterdayResult: "34", todayResult: "", slug: "gajiyabad", group: "main", order: 4 },
  { id: "5", name: "GALI", timing: "11:30 PM", yesterdayResult: "68", todayResult: "", slug: "gali", group: "main", order: 5 },
  { id: "6", name: "DISAWAR", timing: "5:15 AM", yesterdayResult: "92", todayResult: "26", slug: "disawar", group: "main", order: 6 },
  
  { id: "7", name: "FARUKH NAGAR", timing: "12:30 PM", yesterdayResult: "24", todayResult: "84", slug: "farukh-nagar", group: "secondary", order: 1 },
  { id: "8", name: "SUNTANPUR", timing: "1:20 PM", yesterdayResult: "91", todayResult: "", slug: "suntanpur", group: "secondary", order: 2 },
  { id: "9", name: "SADAR BAZAR", timing: "1:40 PM", yesterdayResult: "82", todayResult: "59", slug: "sadar-bazar-day", group: "secondary", order: 3 },
  { id: "10", name: "URYAPUR", timing: "2:30 PM", yesterdayResult: "58", todayResult: "35", slug: "uryapur", group: "secondary", order: 4 },
  { id: "11", name: "GWALIOR", timing: "2:40 PM", yesterdayResult: "62", todayResult: "02", slug: "gwalior", group: "secondary", order: 5 },
  { id: "12", name: "DELHI MATKA", timing: "3:40 PM", yesterdayResult: "24", todayResult: "18", slug: "delhi-matka", group: "secondary", order: 6 },
  { id: "13", name: "MIRJAPUR", timing: "5:30 PM", yesterdayResult: "94", todayResult: "14", slug: "mirjapur", group: "secondary", order: 7 },
  { id: "14", name: "AGRA", timing: "5:30 PM", yesterdayResult: "29", todayResult: "89", slug: "agra", group: "secondary", order: 8 },
  { id: "15", name: "BHADURGHAD", timing: "7:30 PM", yesterdayResult: "82", todayResult: "", slug: "bhadurghad", group: "secondary", order: 9 },
  { id: "16", name: "ALWAR", timing: "7:35 PM", yesterdayResult: "83", todayResult: "", slug: "alwar", group: "secondary", order: 10 },
  { id: "17", name: "DLF CITY", timing: "10:30 PM", yesterdayResult: "61", todayResult: "", slug: "dlf-city", group: "secondary", order: 11 },
  { id: "18", name: "DWARIKA", timing: "10:35 PM", yesterdayResult: "62", todayResult: "", slug: "dwarika", group: "secondary", order: 12 },
  { 
    id: "system-date-tracker", 
    name: "System Date Tracker", 
    timing: (() => {
      // Inline execution just for init if defaultCities is hoisted before getISTDateString
      const d = new Date();
      // Add 5h30m (19,800,000 ms) to align with IST, then subtract 15 mins (900,000 ms) for delayed shift = +18,900,000 ms
      const ist = new Date(d.getTime() + 18900000);
      return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
    })(), 
    yesterdayResult: "", 
    todayResult: "", 
    slug: "system-date-tracker", 
    group: "main", 
    order: 999 
  }
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
  const currentDate = getISTDateString();
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

    // Update Local Storage early
    localStorage.setItem("satta_cities", JSON.stringify(updatedCities));
    localStorage.setItem("satta_last_date", currentDate);

    // Update Supabase ONLY if the user is an admin or no tracker existed (bootstrapping)
    const canAttemptGlobalWipe = isAdminLoggedIn() || !tracker;

    if (supabase && canAttemptGlobalWipe) {
      const upsertData = updatedCities.map(c => ({
        id: c.id,
        name: c.name,
        timing: c.timing,
        "yesterdayResult": c.yesterdayResult,
        "todayResult": c.id === "system-date-tracker" ? "" : "", // Explicitly clear today's result
        slug: c.slug,
        "group": c.group,
        "order": c.order,
        chart_data: c.chart_data || {}
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

  const currentDate = getISTDateString();

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
  const currentDate = getISTDateString();
  
  localStorage.setItem("satta_cities", JSON.stringify(cities));
  localStorage.setItem("satta_last_date", currentDate);
  
  if (supabase) {
    const upsertData = cities.map(c => ({
      id: c.id,
      name: c.name,
      timing: c.timing,
      "yesterdayResult": c.yesterdayResult,
      "todayResult": c.todayResult,
      slug: c.slug,
      "group": c.group,
      "order": c.order,
      chart_data: c.chart_data || {}
    }));
    const { error } = await supabase.from("cities").upsert(upsertData, { onConflict: "id" });
    if (error) {
       console.error("CRITICAL SUPABASE UPSERT ERROR:", error.message, error.details);
       // Throw error to alert the calling component rather than silently failing
       throw error;
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
  const ist = getISTDate();
  const currentMinutes = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  
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
