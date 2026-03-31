import { useState, useRef, useCallback, useEffect } from "react";

const CAT_IMAGE = "https://cdn.poehali.dev/projects/54c437fd-ed06-46ad-a693-eec01f816eaf/files/af9c9fa0-62db-4783-91b3-971bf2e81653.jpg";

type Tab = "home" | "items" | "sounds" | "info";

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const CAT_PHRASES = [
  "Мур-мур-мур! 😻",
  "Хочу играть! 🎮",
  "Погладь меня! 🐾",
  "Я тебя люблю! ❤️",
  "Дай поесть! 🍣",
  "Мяу-мяу! 🐱",
  "Ты мой любимый! ✨",
  "Тепло и уютно! 🌸",
  "Хочу рыбку! 🐟",
  "Спать хочу... 😴",
];

const TOYS = [
  { emoji: "🧶", name: "Клубок", fun: 15, label: "+15 радость" },
  { emoji: "🪀", name: "Игрушка", fun: 20, label: "+20 радость" },
  { emoji: "🎾", name: "Мячик", fun: 10, label: "+10 радость" },
  { emoji: "🪁", name: "Пёрышко", fun: 25, label: "+25 радость" },
];

const FOODS = [
  { emoji: "🍣", name: "Суши", food: 30, label: "+30 сытость" },
  { emoji: "🐟", name: "Рыбка", food: 25, label: "+25 сытость" },
  { emoji: "🥛", name: "Молоко", food: 15, label: "+15 сытость" },
  { emoji: "🍗", name: "Курочка", food: 20, label: "+20 сытость" },
];

const SOUNDS = [
  { emoji: "😼", name: "Мяукнуть", phrase: "Мяу! Мяу! Мяяяу! 😼" },
  { emoji: "😴", name: "Мурлыкать", phrase: "Пррр... Пррр... 😴" },
  { emoji: "😾", name: "Шипеть", phrase: "Ш-ш-ш-ш! Фыр! 😾" },
  { emoji: "😻", name: "Урчать", phrase: "Мур-р-р-р... Люблю тебя! 😻" },
  { emoji: "😹", name: "Смеяться", phrase: "Хи-хи-хи! Щекотно! 😹" },
  { emoji: "😿", name: "Плакать", phrase: "Мяу-у-у... Обними меня! 😿" },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [hunger, setHunger] = useState(60);
  const [happiness, setHappiness] = useState(70);
  const [energy, setEnergy] = useState(80);
  const [catPhrase, setCatPhrase] = useState("Привет! Я Пушистик! 😺");
  const [catAnim, setCatAnim] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [showBubble, setShowBubble] = useState(true);
  const [catLevel] = useState(3);
  const [catName] = useState("Пушистик");
  const [coins, setCoins] = useState(150);
  const emojiIdRef = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>();

  const spawnEmoji = useCallback((emoji: string, e?: React.MouseEvent) => {
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const id = ++emojiIdRef.current;
    setFloatingEmojis(prev => [...prev, { id, emoji, x, y }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(fe => fe.id !== id));
    }, 1500);
  }, []);

  const showPhrase = useCallback((phrase: string) => {
    setCatPhrase(phrase);
    setShowBubble(true);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setShowBubble(false), 3500);
  }, []);

  const triggerCatAnim = useCallback((anim: string) => {
    setCatAnim(anim);
    setTimeout(() => setCatAnim(""), 1000);
  }, []);

  const handleCatClick = useCallback((e: React.MouseEvent) => {
    const phrase = CAT_PHRASES[Math.floor(Math.random() * CAT_PHRASES.length)];
    showPhrase(phrase);
    triggerCatAnim("animate-bounce-cat");
    spawnEmoji("💖", e);
    setHappiness(h => Math.min(100, h + 3));
    setCoins(c => c + 1);
  }, [showPhrase, triggerCatAnim, spawnEmoji]);

  const handleFeed = useCallback((food: typeof FOODS[0], e: React.MouseEvent) => {
    setHunger(h => Math.min(100, h + food.food));
    showPhrase(`Ням-ням! Обожаю ${food.name.toLowerCase()}! 😋`);
    triggerCatAnim("animate-wiggle");
    spawnEmoji(food.emoji, e);
    setCoins(c => c + 5);
  }, [showPhrase, triggerCatAnim, spawnEmoji]);

  const handlePlay = useCallback((toy: typeof TOYS[0], e: React.MouseEvent) => {
    setHappiness(h => Math.min(100, h + toy.fun));
    setEnergy(en => Math.max(0, en - 10));
    showPhrase(`Ура! Обожаю ${toy.name.toLowerCase()}! 🎉`);
    triggerCatAnim("animate-shake");
    spawnEmoji(toy.emoji, e);
    setCoins(c => c + 3);
  }, [showPhrase, triggerCatAnim, spawnEmoji]);

  const handleSound = useCallback((sound: typeof SOUNDS[0]) => {
    showPhrase(sound.phrase);
    triggerCatAnim("animate-bounce-cat");
    setHappiness(h => Math.min(100, h + 5));
  }, [showPhrase, triggerCatAnim]);

  const handleSleep = useCallback(() => {
    setEnergy(e => Math.min(100, e + 40));
    showPhrase("Пррр... Я немного вздремну... 😴");
    triggerCatAnim("animate-wiggle");
  }, [showPhrase, triggerCatAnim]);

  useEffect(() => {
    showPhrase("Привет! Я Пушистик! Нажми на меня! 😺");
  }, []);

  const getMoodEmoji = () => {
    const avg = (hunger + happiness + energy) / 3;
    if (avg >= 80) return "😻";
    if (avg >= 60) return "😺";
    if (avg >= 40) return "😐";
    return "😿";
  };

  const getMoodText = () => {
    const avg = (hunger + happiness + energy) / 3;
    if (avg >= 80) return "Отличное!";
    if (avg >= 60) return "Хорошее";
    if (avg >= 40) return "Так себе";
    return "Плохое";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-nunito" style={{ background: "linear-gradient(135deg, #FFF5E4 0%, #FFE8D6 50%, #FFF0F5 100%)" }}>
      {floatingEmojis.map(fe => (
        <div
          key={fe.id}
          className="floating-emoji"
          style={{ left: fe.x - 12, top: fe.y - 12 }}
        >
          {fe.emoji}
        </div>
      ))}

      <div className="fixed top-10 left-10 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #FF8C42, transparent)" }} />
      <div className="fixed bottom-20 right-10 w-40 h-40 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, #FF6B9D, transparent)" }} />

      <div className="w-full max-w-sm mx-auto flex flex-col gap-3 animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <span className="text-2xl font-caveat font-bold" style={{ color: "#FF8C42" }}>🐱 Мой Котик</span>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-sm shadow-md" style={{ background: "#FFE66D", color: "#8B6914" }}>
            🪙 {coins}
          </div>
        </div>

        {/* HOME TAB */}
        {tab === "home" && (
          <div className="flex flex-col gap-3">
            <div className="card-game border-orange-200 relative overflow-hidden" style={{ minHeight: 320 }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #E8F4FF 0%, #FFF5E4 100%)" }}>
                <div className="absolute top-4 left-8 text-4xl opacity-40">☁️</div>
                <div className="absolute top-8 right-6 text-3xl opacity-30">☁️</div>
                <div className="absolute bottom-4 left-4 text-2xl opacity-20">🌿</div>
                <div className="absolute bottom-4 right-4 text-2xl opacity-20">🌺</div>
              </div>

              <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-10 transition-all duration-300 ${showBubble ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
                <div className="relative px-4 py-2 rounded-2xl shadow-lg text-center" style={{ background: "white", border: "2px solid #FF8C42", maxWidth: 220 }}>
                  <span className="font-nunito font-bold text-sm" style={{ color: "#4A2C0A" }}>{catPhrase}</span>
                  <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "10px solid #FF8C42" }} />
                </div>
              </div>

              <div
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer select-none ${catAnim}`}
                onClick={handleCatClick}
              >
                <div className="relative">
                  <div className="w-36 h-36 rounded-full overflow-hidden shadow-2xl border-4 border-white animate-pulse-glow">
                    <img src={CAT_IMAGE} alt="Пушистик" className="w-full h-full object-cover" draggable={false} />
                  </div>
                  <div className="absolute -top-1 -right-1 text-2xl">{getMoodEmoji()}</div>
                </div>
              </div>

              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                <MiniBar icon="🍖" value={hunger} color="#FF8C42" />
                <MiniBar icon="⭐" value={happiness} color="#FF6B9D" />
                <MiniBar icon="⚡" value={energy} color="#4ECDC4" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button className="btn-game py-3 text-sm flex flex-col items-center gap-1" style={{ background: "#FF8C42" }} onClick={() => setTab("items")}>
                <span className="text-xl">🍣</span>
                <span>Покормить</span>
              </button>
              <button className="btn-game py-3 text-sm flex flex-col items-center gap-1" style={{ background: "#FF6B9D" }} onClick={() => setTab("items")}>
                <span className="text-xl">🧶</span>
                <span>Поиграть</span>
              </button>
              <button className="btn-game py-3 text-sm flex flex-col items-center gap-1" style={{ background: "#4ECDC4" }} onClick={handleSleep}>
                <span className="text-xl">😴</span>
                <span>Поспать</span>
              </button>
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {tab === "items" && (
          <div className="flex flex-col gap-3">
            <div className="card-game border-orange-200 p-4">
              <h2 className="font-caveat text-xl font-bold mb-3 text-center" style={{ color: "#FF8C42" }}>🍽️ Еда и угощения</h2>
              <div className="grid grid-cols-2 gap-3">
                {FOODS.map((food) => (
                  <button
                    key={food.name}
                    className="btn-game py-3 flex flex-col items-center gap-1 text-sm"
                    style={{ background: "linear-gradient(135deg, #FF8C42, #FF6B50)" }}
                    onClick={(e) => handleFeed(food, e)}
                  >
                    <span className="text-3xl">{food.emoji}</span>
                    <span className="font-bold">{food.name}</span>
                    <span className="text-xs opacity-90">{food.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card-game border-pink-200 p-4">
              <h2 className="font-caveat text-xl font-bold mb-3 text-center" style={{ color: "#FF6B9D" }}>🎮 Игрушки</h2>
              <div className="grid grid-cols-2 gap-3">
                {TOYS.map((toy) => (
                  <button
                    key={toy.name}
                    className="btn-game py-3 flex flex-col items-center gap-1 text-sm"
                    style={{ background: "linear-gradient(135deg, #FF6B9D, #C44BB3)" }}
                    onClick={(e) => handlePlay(toy, e)}
                  >
                    <span className="text-3xl">{toy.emoji}</span>
                    <span className="font-bold">{toy.name}</span>
                    <span className="text-xs opacity-90">{toy.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOUNDS TAB */}
        {tab === "sounds" && (
          <div className="card-game border-purple-200 p-4">
            <h2 className="font-caveat text-2xl font-bold mb-4 text-center" style={{ color: "#A78BFA" }}>🎵 Звуки и фразы</h2>
            <div className="grid grid-cols-2 gap-3">
              {SOUNDS.map((sound) => (
                <button
                  key={sound.name}
                  className="btn-game py-4 flex flex-col items-center gap-2 text-sm"
                  style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)" }}
                  onClick={() => handleSound(sound)}
                >
                  <span className="text-3xl">{sound.emoji}</span>
                  <span className="font-bold">{sound.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-2xl text-center" style={{ background: "#F3EEFF", border: "2px dashed #A78BFA" }}>
              <p className="font-caveat text-lg font-bold" style={{ color: "#6D28D9" }}>
                🎤 Котик скажет: «{catPhrase}»
              </p>
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {tab === "info" && (
          <div className="flex flex-col gap-3">
            <div className="card-game border-teal-200 p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 shadow-lg flex-shrink-0" style={{ borderColor: "#4ECDC4" }}>
                  <img src={CAT_IMAGE} alt={catName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-caveat text-2xl font-bold" style={{ color: "#2A7A74" }}>{catName}</h2>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm" style={{ color: i < catLevel ? "#FFB300" : "#DDD" }}>⭐</span>
                    ))}
                    <span className="text-xs font-bold ml-1" style={{ color: "#888" }}>ур. {catLevel}</span>
                  </div>
                  <div className="text-sm font-bold mt-1" style={{ color: "#4ECDC4" }}>Настроение: {getMoodText()} {getMoodEmoji()}</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <InfoBar label="🍖 Голод" value={hunger} color="#FF8C42" />
                <InfoBar label="⭐ Радость" value={happiness} color="#FF6B9D" />
                <InfoBar label="⚡ Энергия" value={energy} color="#4ECDC4" />
              </div>
            </div>

            <div className="card-game border-yellow-200 p-4">
              <h3 className="font-caveat text-xl font-bold mb-3" style={{ color: "#B8860B" }}>📋 О питомце</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Порода", value: "Пушистая 🐾" },
                  { label: "Характер", value: "Добрый и ласковый 😺" },
                  { label: "Любимое", value: "Рыбка и клубок 🐟🧶" },
                  { label: "Монеток", value: `${coins} 🪙` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 px-3 rounded-xl" style={{ background: "#FFFBEB" }}>
                    <span className="font-bold text-sm" style={{ color: "#92713A" }}>{item.label}</span>
                    <span className="font-bold text-sm" style={{ color: "#4A3000" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom navigation */}
        <div className="card-game border-orange-100 p-2">
          <div className="flex justify-around items-center">
            <TabButton active={tab === "home"} emoji="🏠" label="Главная" onClick={() => setTab("home")} />
            <TabButton active={tab === "items"} emoji="🛒" label="Предметы" onClick={() => setTab("items")} />
            <TabButton active={tab === "sounds"} emoji="🎵" label="Звуки" onClick={() => setTab("sounds")} />
            <TabButton active={tab === "info"} emoji="📋" label="Инфо" onClick={() => setTab("info")} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniBar({ icon, value, color }: { icon: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-sm">{icon}</span>
      <div className="w-12 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.6)" }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function InfoBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-1">
        <span style={{ color: "#555" }}>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="mood-progress">
        <div className="mood-progress-bar" style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
    </div>
  );
}

function TabButton({ active, emoji, label, onClick }: { active: boolean; emoji: string; label: string; onClick: () => void }) {
  return (
    <button
      className={`tab-btn font-nunito text-xs font-bold ${active ? "active" : ""}`}
      style={{ color: active ? "white" : "#999", minWidth: 64 }}
      onClick={onClick}
    >
      <span className="text-xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}
