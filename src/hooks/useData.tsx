import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { City, Khaiwal, defaultCities, defaultKhaiwals } from '@/lib/data';

type DataContextType = {
  cities: City[];
  khaiwals: Khaiwal[];
  loading: boolean;
};

const DataContext = createContext<DataContextType>({
  cities: defaultCities,
  khaiwals: defaultKhaiwals,
  loading: true,
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const [khaiwals, setKhaiwals] = useState<Khaiwal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setCities(JSON.parse(localStorage.getItem("satta_cities") || JSON.stringify(defaultCities)));
        setKhaiwals(JSON.parse(localStorage.getItem("satta_khaiwals") || JSON.stringify(defaultKhaiwals)));
        setLoading(false);
        return;
      }

      const { data: citiesData, error: citiesError } = await supabase
        .from('cities')
        .select('*')
        .order('order');

      const { data: khaiwalsData, error: khaiwalsError } = await supabase
        .from('khaiwals')
        .select('*');

      if (!citiesError && citiesData && citiesData.length > 0) {
        setCities(citiesData as City[]);
      } else {
        setCities(JSON.parse(localStorage.getItem("satta_cities") || JSON.stringify(defaultCities)));
      }

      if (!khaiwalsError && khaiwalsData && khaiwalsData.length > 0) {
        setKhaiwals(khaiwalsData as Khaiwal[]);
      } else {
        setKhaiwals(JSON.parse(localStorage.getItem("satta_khaiwals") || JSON.stringify(defaultKhaiwals)));
      }
      setLoading(false);
    };

    fetchData();

    if (supabase) {
      const citiesSub = supabase.channel('public:cities')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cities' }, fetchData)
        .subscribe();

      const khaiwalsSub = supabase.channel('public:khaiwals')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'khaiwals' }, fetchData)
        .subscribe();

      return () => {
        supabase.removeChannel(citiesSub);
        supabase.removeChannel(khaiwalsSub);
      };
    }
  }, []);

  return (
    <DataContext.Provider value={{ cities, khaiwals, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
