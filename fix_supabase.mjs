import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ylbncdiafamdrzipokob.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsYm5jZGlhZmFtZHJ6aXBva29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MjgxNDQsImV4cCI6MjA4ODUwNDE0NH0.39weartN-1nZ_YPyi7TOHOe_kedgG6H5WaDtqkVCGSU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixData() {
  // Step 1: Fetch current data from Supabase
  const { data: cities, error } = await supabase.from('cities').select('*').order('order');
  
  if (error) {
    console.error('Error fetching cities:', error);
    return;
  }

  console.log('\n=== CURRENT STATE IN SUPABASE ===');
  for (const city of cities) {
    if (city.id === 'system-date-tracker') {
      console.log(`TRACKER: timing="${city.timing}"`);
    } else {
      console.log(`${city.name}: yesterday="${city.yesterdayResult}" today="${city.todayResult}"`);
    }
  }

  // Step 2: Update system-date-tracker to today's date (IST)
  const now = new Date();
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const todayIST = `${istDate.getUTCFullYear()}-${String(istDate.getUTCMonth() + 1).padStart(2, '0')}-${String(istDate.getUTCDate()).padStart(2, '0')}`;
  
  console.log(`\nToday's date (IST): ${todayIST}`);
  
  // Update the tracker to today's date so the OLD production code won't trigger a shift
  const { error: trackerError } = await supabase
    .from('cities')
    .update({ timing: todayIST })
    .eq('id', 'system-date-tracker');
  
  if (trackerError) {
    console.error('Error updating tracker:', trackerError);
  } else {
    console.log('✅ System date tracker updated to today');
  }

  // Step 3: Check if data looks shifted (today is empty, yesterday has values)
  const shiftedCities = cities.filter(c => 
    c.id !== 'system-date-tracker' && 
    !c.todayResult && 
    c.yesterdayResult && 
    c.yesterdayResult !== '--'
  );

  console.log(`\nFound ${shiftedCities.length} cities that appear shifted (yesterday has value, today is empty)`);
  
  if (shiftedCities.length > 0) {
    console.log('\nWould you like to move yesterday results back to today?');
    console.log('Moving yesterday → today for all shifted cities...');
    
    for (const city of shiftedCities) {
      const { error: updateError } = await supabase
        .from('cities')
        .update({ 
          todayResult: city.yesterdayResult,
          yesterdayResult: '--'
        })
        .eq('id', city.id);
      
      if (updateError) {
        console.error(`Error updating ${city.name}:`, updateError);
      } else {
        console.log(`  ✅ ${city.name}: moved "${city.yesterdayResult}" from yesterday → today`);
      }
    }
  }

  // Step 4: Verify final state
  const { data: finalCities } = await supabase.from('cities').select('*').order('order');
  console.log('\n=== FINAL STATE IN SUPABASE ===');
  for (const city of finalCities) {
    if (city.id === 'system-date-tracker') {
      console.log(`TRACKER: timing="${city.timing}"`);
    } else {
      console.log(`${city.name}: yesterday="${city.yesterdayResult}" today="${city.todayResult}"`);
    }
  }
  
  console.log('\n✅ DONE. The production site will no longer trigger shifts because the tracker date matches today.');
}

fixData();
