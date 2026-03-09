import { City } from "@/lib/data";

interface ResultsTableProps {
  cities: City[];
  title?: string;
}

const ResultsTable = ({ cities, title }: ResultsTableProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto my-4">
      {title && (
        <h3 className="text-foreground text-center text-lg font-bold mb-2">{title}</h3>
      )}
      <table className="w-full border-collapse border border-border">
        <thead>
          <tr className="bg-black">
            <th className="border border-gray-400 px-3 py-2 text-white font-bold text-xs">
              सट्टा का नाम
            </th>
            <th className="border border-gray-400 px-3 py-2 text-white font-bold text-xs uppercase">
              कल आया था
            </th>
            <th className="border border-gray-400 px-3 py-2 text-white font-bold text-xs uppercase">
              आज का रिज़ल्ट
            </th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => (
            <tr key={city.id} className="transition-colors border-b border-gray-400">
              <td className="border border-gray-400 px-3 py-4 text-center bg-primary w-1/3">
                <a href={`/chart/${city.slug}`} className="text-black font-black uppercase text-xl md:text-2xl leading-tight hover:underline block">
                  {city.name}
                </a>
                <span className="text-black font-bold text-base md:text-lg">{city.timing}</span>
              </td>
              <td className="border border-gray-400 px-3 py-4 text-center text-black font-black text-3xl md:text-4xl bg-white w-1/3">
                {city.yesterdayResult}
              </td>
              <td className="border border-gray-400 px-3 py-4 text-center bg-white w-1/3">
                {city.todayResult ? (
                  <span className="text-black font-black text-3xl md:text-4xl">{city.todayResult}</span>
                ) : (
                  <div className="flex justify-center items-center">
                    <img src="/wait.png" alt="WAIT" className="w-10 h-10 animate-blink" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <span className="text-destructive font-black text-2xl animate-blink">WAIT</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
