import { useState, useEffect, useMemo } from "react";
import "./App.css";
import "./css/flaps.css";
import { FlapDisplay } from "react-split-flap-effect";
import { intervalToDuration } from "date-fns";

const DEFAULT_DATE = new Date(2029, 2, 29, 16, 0, 0);

// scale: 1.0 = normal, <1.0 = breiterer Font (kleinere Darstellung)
const AVAILABLE_FONTS = [
  // Original
  { name: "Share", family: "'Share', sans-serif", url: "https://fonts.googleapis.com/css?family=Share&display=swap", scale: 1.0 },
  { name: "Roboto Mono", family: "'Roboto Mono', monospace", url: "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap", scale: 0.9 },
  { name: "Orbitron", family: "'Orbitron', sans-serif", url: "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap", scale: 0.85 },
  { name: "Digital-7", family: "'DSEG7 Classic', monospace", url: "https://fonts.googleapis.com/css2?family=DSEG7+Classic:wght@400&display=swap", scale: 0.9 },
  { name: "Courier Prime", family: "'Courier Prime', monospace", url: "https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap", scale: 0.9 },
  { name: "Press Start 2P", family: "'Press Start 2P', cursive", url: "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap", scale: 0.6 },
  // Retro/Vintage
  { name: "VT323", family: "'VT323', monospace", url: "https://fonts.googleapis.com/css2?family=VT323&display=swap", scale: 0.95 },
  { name: "Silkscreen", family: "'Silkscreen', cursive", url: "https://fonts.googleapis.com/css2?family=Silkscreen&display=swap", scale: 0.7 },
  { name: "DotGothic16", family: "'DotGothic16', sans-serif", url: "https://fonts.googleapis.com/css2?family=DotGothic16&display=swap", scale: 0.85 },
  // Futuristisch
  { name: "Audiowide", family: "'Audiowide', cursive", url: "https://fonts.googleapis.com/css2?family=Audiowide&display=swap", scale: 0.75 },
  { name: "Michroma", family: "'Michroma', sans-serif", url: "https://fonts.googleapis.com/css2?family=Michroma&display=swap", scale: 0.7 },
  { name: "Rajdhani", family: "'Rajdhani', sans-serif", url: "https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;700&display=swap", scale: 0.9 },
  // Klassisch/Elegant
  { name: "Oswald", family: "'Oswald', sans-serif", url: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap", scale: 0.95 },
  { name: "Bebas Neue", family: "'Bebas Neue', cursive", url: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap", scale: 0.95 },
  { name: "Anton", family: "'Anton', sans-serif", url: "https://fonts.googleapis.com/css2?family=Anton&display=swap", scale: 0.9 },
];

const STORAGE_KEY = "countdown-settings";

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(saved?.fontIndex) && AVAILABLE_FONTS[saved.fontIndex]) return saved;
  } catch (e) {}
  return { fontIndex: 0 };
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

function loadFont(font) {
  if (!document.querySelector(`link[href="${font.url}"]`)) {
    const link = document.createElement("link");
    link.href = font.url;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
}

function getDateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const dateParam = params.get("date");
  if (!dateParam) return DEFAULT_DATE;
  // "YYYY-MM-DD", "YYYY-MM-DDTHH:mm[:ss]" oder mit Leerzeichen statt T:
  // immer als lokale Zeit lesen (new Date() nimmt reine Datumsangaben als UTC)
  const m = dateParam.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  const parsed = m
    ? new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0))
    : new Date(dateParam);
  if (isNaN(parsed.getTime())) return DEFAULT_DATE;
  return parsed;
}

function getTitleFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("titel") || null;
}

const FONT_CATEGORIES = [
  { title: "Standard", start: 0, end: 6 },
  { title: "Retro / Vintage", start: 6, end: 9 },
  { title: "Futuristisch", start: 9, end: 12 },
  { title: "Klassisch / Elegant", start: 12, end: 15 },
];

function SettingsModal({ isOpen, onClose, settings, onSettingsChange }) {
  useEffect(() => {
    // Vorschau-Fonts erst laden, wenn die Einstellungen geöffnet werden
    if (isOpen) AVAILABLE_FONTS.forEach(loadFont);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFontChange = (index) => {
    const newSettings = { ...settings, fontIndex: index };
    onSettingsChange(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Einstellungen</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {FONT_CATEGORIES.map((category) => (
            <div key={category.title} className="font-category">
              <h3>{category.title}</h3>
              <div className="font-options">
                {AVAILABLE_FONTS.slice(category.start, category.end).map((font, idx) => {
                  const index = category.start + idx;
                  return (
                    <div
                      key={font.name}
                      className={`font-option ${settings.fontIndex === index ? 'selected' : ''}`}
                      onClick={() => handleFontChange(index)}
                    >
                      <div className="font-name">{font.name}</div>
                      <div className="font-preview" style={{ fontFamily: font.family }}>
                        <div className="preview-digits">03 : 11 : 29</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const targetDate = useMemo(() => getDateFromUrl(), []);
  const title = useMemo(() => getTitleFromUrl(), []);
  const [settings, setSettings] = useState(loadSettings);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.title = title || "Countdown";
  }, [title]);

  useEffect(() => {
    const selectedFont = AVAILABLE_FONTS[settings.fontIndex];
    loadFont(selectedFont);
    document.documentElement.style.setProperty('--flap-font', selectedFont.family);
    document.documentElement.style.setProperty('--flap-scale', selectedFont.scale);
  }, [settings.fontIndex]);

  const calculateDiff = (endDate) => {
    const currentDate = new Date();
    const isPast = endDate < currentDate;
    const [start, end] = isPast ? [endDate, currentDate] : [currentDate, endDate];
    const duration = intervalToDuration({ start, end });
    return {
      years: duration.years || 0,
      months: duration.months || 0,
      days: duration.days || 0,
      hours: duration.hours || 0,
      minutes: duration.minutes || 0,
      seconds: duration.seconds || 0,
      isPast,
    };
  };

  const [counter, setCounter] = useState(() => calculateDiff(targetDate));

  useEffect(() => {
    // Auf die volle Sekunde ausrichten, damit der Takt nicht driftet
    let timeout;
    const tick = () => {
      setCounter(calculateDiff(targetDate));
      timeout = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timeout = setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => clearTimeout(timeout);
  }, [targetDate]);

  const allItems = [
    { unit: "years", value: counter.years, label: counter.years === 1 ? 'Jahr' : 'Jahre' },
    { unit: "months", value: counter.months, label: counter.months === 1 ? 'Monat' : 'Monate' },
    { unit: "days", value: counter.days, label: counter.days === 1 ? 'Tag' : 'Tage' },
    { unit: "hours", value: counter.hours, label: counter.hours === 1 ? 'Stunde' : 'Stunden' },
    { unit: "minutes", value: counter.minutes, label: counter.minutes === 1 ? 'Minute' : 'Minuten' },
    { unit: "seconds", value: counter.seconds, label: counter.seconds === 1 ? 'Sekunde' : 'Sekunden' },
  ];

  // Führende Nullwerte ausblenden, aber mindestens Sekunden anzeigen
  const firstNonZeroIndex = allItems.findIndex(item => item.value > 0);
  const items = firstNonZeroIndex === -1
    ? [allItems[allItems.length - 1]] // Nur Sekunden wenn alles 0
    : allItems.slice(firstNonZeroIndex);

  return (
    <div className="App">
      <div className="title-zone">
        {title && <h1 className="countdown-title">{title}</h1>}
      </div>
      <div className="flips">
        {items.map((item) => (
          <div key={item.unit} className="countdown-display">
            <FlapDisplay
              className="flip XL"
              chars={counter.isPast ? " 0123456789" : " 9876543210"}
              length={2}
              value={String(item.value).padStart(2, "0")}
            />
            <div className="countdown-header">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="bottom-zone" />

      <button
        className="settings-button"
        onClick={() => setModalOpen(true)}
        aria-label="Einstellungen"
        title="Einstellungen"
      >
        ⚙
      </button>

      <SettingsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}

export default App;
