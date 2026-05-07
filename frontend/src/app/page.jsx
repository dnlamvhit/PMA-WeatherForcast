"use client";

import { useState, useEffect } from "react";

// Custom style for date inputs to show YYYY-MM-DD format
const dateInputStyle = `
  .date-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }
  .date-input-wrapper input[type="date"] {
    width: 100%;
    background-color: white;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    padding: 0.5rem 0.75rem;
    color: #1f2937;
    cursor: pointer;
    font-family: monospace;
    font-size: 1rem;
  }
  .date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    border-radius: 4px;
    margin-right: 2px;
    opacity: 0.8;
    filter: invert(0.2);
  }
  .date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }
`;


// Custom DateInput Component
const CustomDateInput = ({ value, onChange }) => {
  return (
    <div className="date-input-wrapper">
      <input
        type="date"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

// Weather code to emoji/icon mapping
const WEATHER_ICONS = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️",
  51: "🌦️", 53: "🌦️", 55: "🌧️",
  56: "❄️", 57: "❄️",
  61: "🌧️", 63: "🌧️", 65: "⛈️",
  66: "🧊", 67: "🧊",
  71: "🌨️", 73: "🌨️", 75: "🌨️",
  77: "🌨️",
  80: "🌧️", 81: "⛈️", 82: "⛈️",
  85: "🌨️", 86: "🌨️",
  95: "⛈️", 96: "⛈️", 99: "⛈️"
};

const WEATHER_CONDITIONS = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Foggy", emoji: "🌫️" },
  48: { label: "Depositing rime fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Moderate drizzle", emoji: "🌦️" },
  55: { label: "Dense drizzle", emoji: "🌧️" },
  56: { label: "Light freezing drizzle", emoji: "❄️" },
  57: { label: "Dense freezing drizzle", emoji: "❄️" },
  61: { label: "Slight rain", emoji: "🌧️" },
  63: { label: "Moderate rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "⛈️" },
  66: { label: "Light freezing rain", emoji: "🧊" },
  67: { label: "Heavy freezing rain", emoji: "🧊" },
  71: { label: "Slight snow fall", emoji: "🌨️" },
  73: { label: "Moderate snow fall", emoji: "🌨️" },
  75: { label: "Heavy snow fall", emoji: "🌨️" },
  77: { label: "Snow grains", emoji: "🌨️" },
  80: { label: "Slight rain showers", emoji: "🌧️" },
  81: { label: "Moderate rain showers", emoji: "⛈️" },
  82: { label: "Violent rain showers", emoji: "⛈️" },
  85: { label: "Slight snow showers", emoji: "🌨️" },
  86: { label: "Heavy snow showers", emoji: "🌨️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm with slight hail", emoji: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", emoji: "⛈️" },
};

// Notification Component
const Notification = ({ message, type = "info" }) => {
  const bgColor = {
    info: "bg-blue-500/20 border-blue-500/50",
    loading: "bg-yellow-500/20 border-yellow-500/50",
    success: "bg-green-500/20 border-green-500/50",
    error: "bg-red-500/20 border-red-500/50",
  }[type];

  const textColor = {
    info: "text-blue-200",
    loading: "text-yellow-200",
    success: "text-green-200",
    error: "text-red-200",
  }[type];

  const icon = {
    info: "ℹ️",
    loading: "⏳",
    success: "✓",
    error: "✕",
  }[type];

  return (
    <div className={`fixed top-8 right-8 max-w-sm border ${bgColor} ${textColor} p-4 rounded-xl shadow-2xl flex gap-4 items-center z-40 animate-in fade-in slide-in-from-right-4`}>
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default function Home() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDbModal, setShowDbModal] = useState(false);
  const [dbRecords, setDbRecords] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState("");
  const [selectedRecords, setSelectedRecords] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [exportLocation, setExportLocation] = useState("");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [availableLocations, setAvailableLocations] = useState([]);
  const [notification, setNotification] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const fetchWeather = async (searchLocation) => {
    const loc = searchLocation || location;
    if (!loc || !loc.trim()) return;
    setLoading(true);
    setError("");
    setNotification({ message: `🌤️ Fetching weather for ${loc}...`, type: "loading" });
    try {
      const res = await fetch("http://localhost:8000/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ location: loc }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "An unexpected error occurred.");
      }
      const data = await res.json();
      setWeather(data);
      setNotification({ message: "✓ Weather data loaded successfully!", type: "success" });
      // Auto-dismiss success notification after 2 seconds
      setTimeout(() => setNotification(null), 2000);
    } catch (err) {
      setError(err.message);
      setNotification({ message: `✕ Error: ${err.message}`, type: "error" });
      // Auto-dismiss error notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run once on component mount
    let mounted = true;

    if ("geolocation" in navigator) {
      setGeoLoading(true);
      setNotification({ message: "🔍 Detecting your location...", type: "loading" });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (!mounted) return;
          const { latitude, longitude } = position.coords;
          try {
            // Reverse geocoding to get a city name via our backend to avoid CORS/UA issues
            setNotification({ message: "📍 Finding your city name...", type: "loading" });
            const res = await fetch(`http://localhost:8000/api/reverse-geocode?lat=${latitude}&lon=${longitude}`);
            if (!res.ok) throw new Error("Reverse geocoding failed");
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Your Location";
            if (mounted) {
              setLocation(city);
              // Fetch weather with the city name directly
              setLoading(true);
              setGeoLoading(false);
              setError("");
              setNotification({ message: `🌤️ Fetching weather data for ${city}...`, type: "loading" });
              try {
                const weatherRes = await fetch("http://localhost:8000/api/weather", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ location: city }),
                });
                if (!weatherRes.ok) {
                  const errorData = await weatherRes.json();
                  throw new Error(errorData.detail || "An unexpected error occurred.");
                }
                const weatherData = await weatherRes.json();
                if (mounted) {
                  setWeather(weatherData);
                  setNotification({ message: "✓ Weather data loaded successfully!", type: "success" });
                  // Auto-dismiss success notification after 2 seconds
                  setTimeout(() => {
                    if (mounted) setNotification(null);
                  }, 2000);
                }
              } catch (err) {
                if (mounted) {
                  setError(err.message);
                  setNotification({ message: `✕ Error: ${err.message}`, type: "error" });
                  // Auto-dismiss error notification after 3 seconds
                  setTimeout(() => {
                    if (mounted) setNotification(null);
                  }, 3000);
                }
              } finally {
                if (mounted) setLoading(false);
              }
            }
          } catch (err) {
            console.error("Error getting location or weather:", err);
            if (mounted) {
              setGeoLoading(false);
              setNotification({ message: `✕ Error: ${err.message}`, type: "error" });
              // Auto-dismiss error notification after 3 seconds
              setTimeout(() => {
                if (mounted) setNotification(null);
              }, 3000);
            }
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          if (mounted) {
            setGeoLoading(false);
            setNotification({ message: "✕ Unable to detect location. Please enter manually.", type: "error" });
            // Auto-dismiss error notification after 3 seconds
            setTimeout(() => {
              if (mounted) setNotification(null);
            }, 3000);
          }
        }
      );
    } else {
      if (mounted) {
        setNotification({ message: "✕ Geolocation is not supported by your browser.", type: "error" });
        // Auto-dismiss error notification after 3 seconds
        setTimeout(() => {
          if (mounted) setNotification(null);
        }, 3000);
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  const downloadExport = (format) => {
    const params = new URLSearchParams();
    if (exportLocation) params.append("location", exportLocation);
    if (exportStartDate) params.append("start_date", exportStartDate);
    if (exportEndDate) params.append("end_date", exportEndDate);

    const queryString = params.toString();
    const url = `http://localhost:8000/api/export/${format}${queryString ? '?' + queryString : ''}`;
    window.open(url);
  };

  const fetchDbRecords = async () => {
    setDbLoading(true);
    setDbError("");
    try {
      const res = await fetch("http://localhost:8000/api/weather", {
        method: "GET",
      });
      if (!res.ok) throw new Error("Failed to fetch records");
      const data = await res.json();
      setDbRecords(data);
      setSelectedRecords(new Set());

      // Fetch available locations
      const locRes = await fetch("http://localhost:8000/api/locations");
      if (locRes.ok) {
        const locData = await locRes.json();
        setAvailableLocations(locData.locations);
      }
    } catch (err) {
      setDbError(err.message);
    } finally {
      setDbLoading(false);
    }
  };

  const handleEditStart = (record) => {
    setEditingId(record.id);
    setEditData({
      location: record.location,
      min_temperature_k: record.min_temperature_k,
      max_temperature_k: record.max_temperature_k,
      description: record.description,
    });
  };

  const handleEditSave = async (recordId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/weather/${recordId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error("Failed to update record");
      await fetchDbRecords();
      setEditingId(null);
    } catch (err) {
      setDbError(err.message);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/weather/${recordId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete record");
      await fetchDbRecords();
    } catch (err) {
      setDbError(err.message);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRecords.size === 0) return;
    if (!window.confirm(`Delete ${selectedRecords.size} record(s)?`)) return;

    for (const id of selectedRecords) {
      await handleDelete(id);
    }
  };

  const toggleRecordSelection = (id) => {
    const newSet = new Set(selectedRecords);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedRecords(newSet);
  };

  const openDbModal = () => {
    fetchDbRecords();
    setShowDbModal(true);
  };

  return (
    <>
      <style>{dateInputStyle}</style>
      {notification && <Notification message={notification.message} type={notification.type} />}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-800 text-white p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">Weather Forecast</h1>
            <p className="text-slate-300 font-bold">
              By Lam Ngoc Dao for PM Accelerator
              <a
                href="https://www.linkedin.com/company/pm-accelerator"
                className="underline text-blue-300 hover:text-blue-400"
                target="_blank"
                rel="noopener noreferrer"
              >[LinkedIn link]
              </a>
            </p>
          </header>

          <main className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="Enter location (City, Zip Code...)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              />
              <button
                onClick={() => fetchWeather()}
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
                <h2 className="text-4xl font-bold">{weather.location}</h2>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold border-b border-white/20 pb-2">Today</h3>
                  <div className="bg-white/5 rounded-xl p-8 flex items-center gap-8">
                    <div className="text-8xl">
                      {WEATHER_ICONS[weather.weather_code] || "🌤️"}
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white mb-1">
                        {Math.round(weather.temperature_c * 1.8 + 32)}°F
                      </p>
                      <p className="text-3xl font-bold text-white/90 mb-3">
                        {weather.temperature_c}°C
                      </p>
                      <p className="text-2xl font-semibold text-blue-200">{weather.description}</p>
                    </div>
                  </div>
                </div>

                {weather.forecast_data && (
                  <div className="space-y-4 mt-8">
                    <h3 className="text-2xl font-semibold border-b border-white/20 pb-2">5-Day Forecast</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {(() => {
                        const forecast = JSON.parse(weather.forecast_data || '{}');
                        const formatDate = (dateString) => {
                          const [year, month, day] = dateString.split("-");
                          return new Date(`${year}-${month}-${day}T00:00:00`).toLocaleDateString();
                        };
                        return forecast.time?.slice(1, 6).map((date, i) => {
                          const dataIndex = i + 1;
                          const forecastCode = forecast.weather_code?.[dataIndex];
                          const forecastCondition = WEATHER_CONDITIONS[forecastCode] || {
                            label: "Unknown conditions",
                            emoji: "🌤️",
                          };
                          return (
                            <div key={date} className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                              <p className="text-base font-bold text-slate-300 mb-3">{formatDate(date)}</p>
                              <p className="text-base font-bold text-white/90 mb-1">
                                {Math.round(forecast.temperature_2m_min?.[dataIndex] * 1.8 + 32)}°F {" - "} {Math.round(forecast.temperature_2m_max?.[dataIndex] * 1.8 + 32)}°F
                              </p>
                              <p className="text-base font-bold text-white/90 mb-1">
                                {forecast.temperature_2m_min?.[dataIndex]}°C {" - "} {forecast.temperature_2m_max?.[dataIndex]}°C
                              </p>
                              <p className="text-sm font-semibold text-blue-200 mt-3">{forecastCondition.label}</p>
                              <p className="text-3xl leading-none mt-1">{forecastCondition.emoji}</p>
                            </div>
                          );
                        });
                      })()}
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

                <div className="mt-8 bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 flex justify-center">
                  <button
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(weather.location + ' travel guide')}`, '_blank')}
                    className="w-fit bg-red-600 hover:bg-red-700 transition-colors rounded-xl px-8 py-4 font-semibold text-lg flex items-center justify-center gap-3"
                  >
                    <span>▶️</span> Watch YouTube Videos About {weather.location.split(',')[0]}
                  </button>
                </div>
              </div>
            )}
          </main>

          <section className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 flex justify-center">
            <button
              onClick={openDbModal}
              className="w-fit bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl px-8 py-4 font-semibold text-lg"
            >
              📊 Database Management
            </button>
          </section>

          {showDbModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-3xl shadow-2xl border border-white/20 w-full max-h-[90vh] flex flex-col">
                <div className="p-8 border-b border-white/20 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-2xl font-bold text-white">Database Management</h2>
                  <button
                    onClick={() => setShowDbModal(false)}
                    className="text-2xl font-bold text-white hover:text-white/80 transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto flex-1">
                  {dbError && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl">
                      {dbError}
                    </div>
                  )}

                  <div className="bg-blue-600/20 border border-blue-500/50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-300">Export Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Location (Optional)</label>
                        <input
                          type="text"
                          list="locations-list"
                          value={exportLocation}
                          onChange={(e) => setExportLocation(e.target.value)}
                          placeholder="e.g., New York"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <datalist id="locations-list">
                          {availableLocations.map((loc) => (
                            <option key={loc} value={loc} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          From Date (Optional)
                          <span className="text-xs text-blue-300 ml-1">(DD-MMM-YYYY)</span>
                        </label>
                        <CustomDateInput
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                        />
                        {exportStartDate && (
                          <p className="text-xs text-blue-200 mt-1">Selected: {exportStartDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          To Date (Optional)
                          <span className="text-xs text-blue-300 ml-1">(DD-MMM-YYYY)</span>
                        </label>
                        <CustomDateInput
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                        />
                        {exportEndDate && (
                          <p className="text-xs text-blue-200 mt-1">Selected: {exportEndDate}</p>
                        )}
                      </div>
                    </div>
                    {(exportLocation || exportStartDate || exportEndDate) && (
                      <button
                        onClick={() => {
                          setExportLocation("");
                          setExportStartDate("");
                          setExportEndDate("");
                        }}
                        className="text-sm text-blue-300 hover:text-blue-200 underline"
                      >
                        Clear Filters
                      </button>
                    )}

                    <div className="border-t border-blue-500/30 pt-4 mt-4">
                      <p className="text-sm font-medium text-blue-200 mb-3">Export Format:</p>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => downloadExport('csv')}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => downloadExport('json')}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          JSON
                        </button>
                        <button
                          onClick={() => downloadExport('xml')}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          XML
                        </button>
                        <button
                          onClick={() => downloadExport('pdf')}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => downloadExport('markdown')}
                          className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          Markdown
                        </button>
                      </div>
                    </div>
                  </div>

                  {dbLoading ? (
                    <p className="text-center text-white/60">Loading records...</p>
                  ) : dbRecords.length === 0 ? (
                    <p className="text-center text-white/60">No records found</p>
                  ) : (
                    <>
                      <div className="flex gap-4 mb-6 flex-wrap">
                        <button
                          onClick={() => setSelectedRecords(new Set(dbRecords.map(r => r.id)))}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => setSelectedRecords(new Set())}
                          className="bg-slate-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-sm font-medium"
                        >
                          Clear Selection
                        </button>
                        {selectedRecords.size > 0 && (
                          <button
                            onClick={handleDeleteSelected}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm font-medium"
                          >
                            Delete Selected ({selectedRecords.size})
                          </button>
                        )}
                      </div>

                      <div className="overflow-x-auto border border-white/10 rounded-lg">
                        <table className="w-full text-sm text-white">
                          <thead>
                            <tr className="border-b border-white/20 bg-white/5 sticky top-0">
                              <th className="px-4 py-3 text-left whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedRecords.size === dbRecords.length && dbRecords.length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecords(new Set(dbRecords.map(r => r.id)));
                                    } else {
                                      setSelectedRecords(new Set());
                                    }
                                  }}
                                  className="rounded"
                                />
                              </th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">ID</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Date</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Min Temp (K)</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Max Temp (K)</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Description</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Timestamp</th>
                              <th className="px-4 py-3 text-left whitespace-nowrap">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dbRecords.map((record) => (
                              <tr key={record.id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={selectedRecords.has(record.id)}
                                    onChange={() => toggleRecordSelection(record.id)}
                                    className="rounded"
                                  />
                                </td>
                                <td className="px-4 py-3 text-white/70 whitespace-nowrap">{record.id}</td>
                                <td className="px-4 py-3 min-w-[150px]">
                                  {editingId === record.id ? (
                                    <input
                                      type="text"
                                      value={editData.location}
                                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                    />
                                  ) : (
                                    record.location
                                  )}
                                </td>
                                <td className="px-4 py-3 text-white/70 whitespace-nowrap">{record.date}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {editingId === record.id ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editData.min_temperature_k}
                                      onChange={(e) => setEditData({ ...editData, min_temperature_k: parseFloat(e.target.value) })}
                                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-24"
                                    />
                                  ) : (
                                    record.min_temperature_k
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {editingId === record.id ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editData.max_temperature_k}
                                      onChange={(e) => setEditData({ ...editData, max_temperature_k: parseFloat(e.target.value) })}
                                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-24"
                                    />
                                  ) : (
                                    record.max_temperature_k
                                  )}
                                </td>
                                <td className="px-4 py-3 min-w-[200px]">
                                  {editingId === record.id ? (
                                    <input
                                      type="text"
                                      value={editData.description}
                                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                      className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-full"
                                    />
                                  ) : (
                                    record.description
                                  )}
                                </td>
                                <td className="px-4 py-3 text-white/60 text-xs whitespace-nowrap">
                                  {new Date(record.timestamp).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                                  {editingId === record.id ? (
                                    <>
                                      <button
                                        onClick={() => handleEditSave(record.id)}
                                        className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-white text-xs font-medium"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="bg-slate-600 hover:bg-slate-700 px-2 py-1 rounded text-white text-xs font-medium"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleEditStart(record)}
                                        className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-white text-xs font-medium"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(record.id)}
                                        className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white text-xs font-medium"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
