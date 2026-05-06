"use client";

import { useState } from "react";

interface WeatherRecord {
  id: number;
  location: string;
  temperature_c: number;
  description: string;
  forecast_data?: string;
  lat?: number;
  lon?: number;
}

export default function Home() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState<WeatherRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!location.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "An unexpected error occurred.");
      }
      const data = await res.json();
      setWeather(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadExport = (format: string) => {
    window.open(`http://localhost:8000/api/export/${format}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">Weather Forecast</h1>
          <p className="text-slate-300 font-bold">By Lam Ngoc Dao for PM Accelerator (
            <a href="https://www.linkedin.com/company/pm-accelerator"
              className="underline text-blue-300 hover:text-blue-400"
              target="_blank"
              rel="noopener noreferrer">
              linkedin link
            </a>)
          </p>
        </header>

        <main className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Enter location (City, Zip Code)..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
            />
            <button
              onClick={fetchWeather}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-xl px-8 py-4 font-semibold text-lg disabled:opacity-50"
            >
              {loading ? "Searching..." : "Get Weather"}
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-8">
              {error}
            </div>
          )}

          {weather && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold">{weather.location}</h2>
                  <p className="text-xl text-slate-300 mt-2">{weather.description}</p>
                </div>
                <div className="text-7xl font-bold text-blue-300">
                  {weather.temperature_c}°C
                </div>
              </div>

              {weather.forecast_data && (
                <div className="space-y-4 mt-8">
                  <h3 className="text-2xl font-semibold border-b border-white/20 pb-2">5-Day Forecast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {JSON.parse(weather.forecast_data || '{}').time?.slice(0, 5).map((date: string, i: number) => (
                      <div key={date} className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                        <p className="text-sm text-slate-400 mb-2">{new Date(date).toLocaleDateString()}</p>
                        <p className="text-xl font-bold text-blue-200">
                          {JSON.parse(weather.forecast_data || '{}').temperature_2m_max?.[i]}°
                        </p>
                        <p className="text-sm text-slate-400">
                          {JSON.parse(weather.forecast_data || '{}').temperature_2m_min?.[i]}°
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {weather.lat && weather.lon && (
                <div className="mt-8 rounded-xl overflow-hidden shadow-lg border border-white/20">
                  <iframe
                    width="100%"
                    height="400"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${weather.lon - 0.05}%2C${weather.lat - 0.05}%2C${weather.lon + 0.05}%2C${weather.lat + 0.05}&layer=mapnik&marker=${weather.lat}%2C${weather.lon}`}
                  ></iframe>
                </div>
              )}
            </div>
          )}
        </main>

        <section className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <h3 className="text-xl font-semibold mb-6">Export Database</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['csv', 'json', 'xml', 'markdown', 'pdf'].map(fmt => (
              <button
                key={fmt}
                onClick={() => downloadExport(fmt)}
                className="bg-white/5 hover:bg-white/20 border border-white/10 rounded-lg px-6 py-2 uppercase tracking-wider text-sm font-medium transition-colors"
              >
                {fmt}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
