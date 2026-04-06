import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to automatically shift results exactly at IST Midnight
export default async function handler(req: any, res: any) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ylbncdiafamdrzipokob.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsYm5jZGlhZmFtZHJ6aXBva29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MjgxNDQsImV4cCI6MjA4ODUwNDE0NH0.39weartN-1nZ_YPyi7TOHOe_kedgG6H5WaDtqkVCGSU';
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delay the execution by 5 seconds to ensure Vercel Cron is strictly past the exactly 12:00:00 AM IST threshold
    // This perfectly solves the problem of Crons firing a few milliseconds early, without ever calculating the shift before midnight.
    await new Promise(resolve => setTimeout(resolve, 5000));

    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    const currentIST = formatter.format(new Date()); 

    const { data: cities, error: fetchError } = await supabase.from('cities').select('*');
    
    if (fetchError) throw fetchError;

    const tracker = cities.find((c: any) => c.id === 'system-date-tracker');
    
    // Safety check: Avoid shifting twice if the tracker date matches today's IST Date
    if (tracker && tracker.timing === currentIST) {
      return res.status(200).json({ message: "Already shifted for today", date: currentIST });
    }

    // Prepare shift payload
    const upsertData = cities.map((city: any) => {
       if (city.id === "system-date-tracker") {
         return {
           id: city.id,
           name: city.name,
           timing: currentIST,
           yesterdayResult: city.yesterdayResult,
           todayResult: city.todayResult,
           slug: city.slug,
           group: city.group,
           order: city.order
         };
       }
       return {
         id: city.id,
         name: city.name,
         timing: city.timing,
         yesterdayResult: city.todayResult || city.yesterdayResult,
         todayResult: "",
         slug: city.slug,
         group: city.group,
         order: city.order
       };
    });

    const { error: upsertError } = await supabase.from('cities').upsert(upsertData, { onConflict: 'id' });
    
    if (upsertError) throw upsertError;

    return res.status(200).json({ success: true, message: `Successfully shifted results for IST date: ${currentIST}` });
    
  } catch (error: any) {
    console.error("Cron shift error:", error);
    return res.status(500).json({ error: error.message });
  }
}
