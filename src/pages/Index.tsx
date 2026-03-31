import { useState, useRef, useCallback, useEffect } from "react";

const CAT_IMAGE_CARTOON = "https://cdn.poehali.dev/projects/54c437fd-ed06-46ad-a693-eec01f816eaf/bucket/5f9b441a-af18-4331-8cac-38240271061e.jpg";

type Tab = "home" | "items" | "sounds" | "info" | "messages";
type Room = "bedroom" | "kitchen" | "playroom";

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

const CAT_PHRASES: Record<Room, string[]> = {
  bedroom: [
    "Пррр... тут так уютно... 😴",
    "Не мешай спать! 😾",
    "Мягкая подушка — счастье! 🛏️",
    "Ещё пять минуточек... 💤",
    "Мур-мур... сладкий сон... 🌙",
  ],
  kitchen: [
    "Дай рыбку! Дай рыбку! 🐟",
    "Ням-ням, здесь пахнет едой! 😋",
    "Я голодный как сто котов! 🍣",
    "Молочко? Для меня? ❤️",
    "Хочу курочку-мурочку! 🍗",
  ],
  playroom: [
    "Ура! Играем! 🎉",
    "Кидай клубок, кидай! 🧶",
    "Я самый быстрый кот! ⚡",
    "Ещё разочек, пожалуйста! 🎾",
    "Не могу остановиться! 😹",
  ],
};

const GENERAL_PHRASES = [
  "Мур-мур-мур! 😻",
  "Погладь меня! 🐾",
  "Я тебя люблю! ❤️",
  "Мяу-мяу! 🐱",
  "Ты мой любимый! ✨",
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

interface Message {
  id: number;
  from: "user" | "cat";
  text: string;
  emoji?: string;
}

const QUICK_MESSAGES = [
  { text: "Я тебя люблю 💖", emoji: "💖" },
  { text: "Я скучаю по тебе 🥺", emoji: "🥺" },
  { text: "Вернись, пожалуйста 🙏", emoji: "🙏" },
  { text: "Ты лучший кот на свете! 🌟", emoji: "🌟" },
  { text: "Думаю о тебе 💭", emoji: "💭" },
  { text: "Хочу обнять тебя 🤗", emoji: "🤗" },
];

const CAT_RESPONSES: Record<string, string[]> = {
  love: [
    "Мур-р-р... Я тоже тебя люблю! Всем сердцем! ❤️",
    "Пррр... Ты мой самый любимый человечек! 😻",
    "Мяу! Я очень-очень тебя люблю! 💖",
  ],
  miss: [
    "Мяу-у-у... Я тоже скучаю! Приходи скорее! 😿",
    "Пррр... Без тебя так тихо и грустно... 🥺",
    "Мур... Я жду тебя каждый день! 💔",
  ],
  return: [
    "МЯУ! Я уже бегу к двери! Скорее! 🐾",
    "Пожалуйста-пожалуйста! Я буду очень хорошим! 🙏",
    "Мяу-мяу! Я так рад тебя видеть! 😻",
  ],
  default: [
    "Мур-мур! Слышу тебя, мой хороший! 😺",
    "Пррр... Спасибо! Ты такой добрый! 🧡",
    "Мяу! Как хорошо, что ты написал мне! ✨",
    "Мур-р-р! Я очень рад твоему сообщению! 😻",
  ],
};

function getCatResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("люблю") || lower.includes("любовь") || lower.includes("обожаю")) {
    return CAT_RESPONSES.love[Math.floor(Math.random() * CAT_RESPONSES.love.length)];
  }
  if (lower.includes("скуч")) {
    return CAT_RESPONSES.miss[Math.floor(Math.random() * CAT_RESPONSES.miss.length)];
  }
  if (lower.includes("вернись") || lower.includes("приходи") || lower.includes("пожалуйста")) {
    return CAT_RESPONSES.return[Math.floor(Math.random() * CAT_RESPONSES.return.length)];
  }
  return CAT_RESPONSES.default[Math.floor(Math.random() * CAT_RESPONSES.default.length)];
}

const SOUNDS = [
  { emoji: "😼", name: "Мяукнуть", phrase: "Мяу! Мяу! Мяяяу! 😼" },
  { emoji: "😴", name: "Мурлыкать", phrase: "Пррр... Пррр... 😴" },
  { emoji: "😾", name: "Шипеть", phrase: "Ш-ш-ш-ш! Фыр! 😾" },
  { emoji: "😻", name: "Урчать", phrase: "Мур-р-р-р... Люблю тебя! 😻" },
  { emoji: "😹", name: "Смеяться", phrase: "Хи-хи-хи! Щекотно! 😹" },
  { emoji: "😿", name: "Плакать", phrase: "Мяу-у-у... Обними меня! 😿" },
];

const ROOMS: { id: Room; label: string; emoji: string }[] = [
  { id: "bedroom", label: "Спальня", emoji: "🛏️" },
  { id: "kitchen", label: "Кухня", emoji: "🍳" },
  { id: "playroom", label: "Игровая", emoji: "🎮" },
];

const ROOM_BACKGROUNDS: Record<Room, { bg: string; items: { emoji: string; style: React.CSSProperties }[] }> = {
  bedroom: {
    bg: "linear-gradient(180deg, #1a1a4e 0%, #2d2d6b 40%, #8B7355 100%)",
    items: [
      { emoji: "🌙", style: { top: 12, right: 20, fontSize: 28, opacity: 0.9 } },
      { emoji: "⭐", style: { top: 20, left: 30, fontSize: 16, opacity: 0.7 } },
      { emoji: "⭐", style: { top: 35, right: 60, fontSize: 12, opacity: 0.6 } },
      { emoji: "🛏️", style: { bottom: 0, left: "50%", transform: "translateX(-50%)", fontSize: 72 } },
      { emoji: "🪟", style: { top: 16, left: 16, fontSize: 40, opacity: 0.8 } },
      { emoji: "🧸", style: { bottom: 24, left: 20, fontSize: 28 } },
    ],
  },
  kitchen: {
    bg: "linear-gradient(180deg, #87CEEB 0%, #fffbe6 60%, #d4a96a 100%)",
    items: [
      { emoji: "☀️", style: { top: 10, right: 20, fontSize: 32 } },
      { emoji: "🪟", style: { top: 16, left: 16, fontSize: 40 } },
      { emoji: "🍳", style: { bottom: 28, right: 24, fontSize: 36 } },
      { emoji: "🫙", style: { bottom: 28, left: 24, fontSize: 28 } },
      { emoji: "🐟", style: { bottom: 100, right: 30, fontSize: 24, opacity: 0.6 } },
    ],
  },
  playroom: {
    bg: "linear-gradient(180deg, #e8f4ff 0%, #c8e6ff 50%, #a8d5f5 100%)",
    items: [
      { emoji: "🎈", style: { top: 12, left: 24, fontSize: 32 } },
      { emoji: "🎈", style: { top: 20, right: 20, fontSize: 24, opacity: 0.7 } },
      { emoji: "🧶", style: { bottom: 28, left: 20, fontSize: 32 } },
      { emoji: "🎾", style: { bottom: 36, right: 24, fontSize: 28 } },
      { emoji: "🪀", style: { bottom: 80, right: 40, fontSize: 22, opacity: 0.7 } },
    ],
  },
};

export default function Index() {
  const [tab, setTab] = useState<Tab>("home");
  const [room, setRoom] = useState<Room>("bedroom");
  const [hunger, setHunger] = useState(60);
  const [happiness, setHappiness] = useState(70);
  const [energy, setEnergy] = useState(80);
  const [catPhrase, setCatPhrase] = useState("Привет! Я Томик! 😺");
  const [catAnim, setCatAnim] = useState("");
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [showBubble, setShowBubble] = useState(true);
  const [catLevel] = useState(3);
  const [catName] = useState("Томик");
  const [coins, setCoins] = useState(150);
  const [roomTransition, setRoomTransition] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "cat", text: "Привет! Напиши мне что-нибудь... 😺", emoji: "😺" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isCatTyping, setIsCatTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiIdRef = useRef(0);
  const msgIdRef = useRef(1);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout>>();

  const spawnEmoji = useCallback((emoji: string, e?: React.MouseEvent) => {
    const x = e ? e.clientX : window.innerWidth / 2;
    const y = e ? e.clientY : window.innerHeight / 2;
    const id = ++emojiIdRef.current;
    setFloatingEmojis(prev => [...prev, { id, emoji, x, y }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(fe => fe.id !== id)), 1500);
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
    const phrases = [...CAT_PHRASES[room], ...GENERAL_PHRASES];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    showPhrase(phrase);
    triggerCatAnim("animate-bounce-cat");
    spawnEmoji("💖", e);
    setHappiness(h => Math.min(100, h + 3));
    setCoins(c => c + 1);
  }, [showPhrase, triggerCatAnim, spawnEmoji, room]);

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

  const sendMessage = useCallback((text: string, emoji?: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: ++msgIdRef.current, from: "user", text, emoji };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsCatTyping(true);
    setHappiness(h => Math.min(100, h + 8));
    setTimeout(() => {
      const response = getCatResponse(text);
      const catMsg: Message = { id: ++msgIdRef.current, from: "cat", text: response };
      setMessages(prev => [...prev, catMsg]);
      setIsCatTyping(false);
      showPhrase(response.length > 40 ? response.slice(0, 38) + "..." : response);
    }, 1200);
  }, [showPhrase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isCatTyping]);

  const handleRoomChange = useCallback((newRoom: Room) => {
    if (newRoom === room) return;
    setRoomTransition(true);
    setTimeout(() => {
      setRoom(newRoom);
      setRoomTransition(false);
      const phrases = CAT_PHRASES[newRoom];
      showPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    }, 300);
    if (newRoom === "bedroom") {
      setEnergy(e => Math.min(100, e + 20));
    }
  }, [room, showPhrase]);

  useEffect(() => {
    showPhrase("Привет! Я Томик! Нажми на меня! 😺");
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

  const currentRoom = ROOM_BACKGROUNDS[room];

  return (
    <div className="min-h-screen flex items-center justify-center p-3 font-nunito" style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)" }}>
      {floatingEmojis.map(fe => (
        <div key={fe.id} className="floating-emoji" style={{ left: fe.x - 12, top: fe.y - 12 }}>
          {fe.emoji}
        </div>
      ))}

      <div className="w-full max-w-sm mx-auto flex flex-col gap-2 animate-slide-up" style={{ maxHeight: "100dvh" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xl font-caveat font-bold" style={{ color: "#FFB347" }}>🐱 Мой Томик</span>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full font-bold text-sm shadow-md" style={{ background: "#FFE66D", color: "#8B6914" }}>
            🪙 {coins}
          </div>
        </div>

        {/* HOME TAB */}
        {tab === "home" && (
          <div className="flex flex-col gap-2">

            {/* Room selector */}
            <div className="flex gap-2 px-1">
              {ROOMS.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleRoomChange(r.id)}
                  className="flex-1 py-2 rounded-2xl font-bold text-sm transition-all duration-200 flex flex-col items-center gap-0.5"
                  style={{
                    background: room === r.id
                      ? "linear-gradient(135deg, #FF8C42, #FF6B50)"
                      : "rgba(255,255,255,0.15)",
                    color: room === r.id ? "white" : "rgba(255,255,255,0.7)",
                    border: room === r.id ? "2px solid #FF8C42" : "2px solid rgba(255,255,255,0.2)",
                    transform: room === r.id ? "translateY(-2px)" : "none",
                    boxShadow: room === r.id ? "0 6px 16px rgba(255,140,66,0.4)" : "none",
                  }}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <span style={{ fontSize: 11 }}>{r.label}</span>
                </button>
              ))}
            </div>

            {/* Room arena */}
            <div
              className="card-game border-0 relative overflow-hidden"
              style={{ minHeight: 300, background: currentRoom.bg, transition: "all 0.3s ease", opacity: roomTransition ? 0 : 1 }}
            >
              {/* Room decorations */}
              {currentRoom.items.map((item, i) => (
                <div key={i} className="absolute pointer-events-none" style={item.style}>{item.emoji}</div>
              ))}

              {/* Floor */}
              <div className="absolute bottom-0 left-0 right-0 h-16 rounded-b-3xl" style={{
                background: room === "bedroom" ? "linear-gradient(180deg, #6B4F2A, #4A3520)"
                  : room === "kitchen" ? "linear-gradient(180deg, #c8a870, #a07840)"
                  : "linear-gradient(180deg, #7ab8e8, #5a98c8)"
              }} />

              {/* Stats on left */}
              <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
                <MiniBar icon="🍖" value={hunger} color="#FF8C42" />
                <MiniBar icon="⭐" value={happiness} color="#FF6B9D" />
                <MiniBar icon="⚡" value={energy} color="#4ECDC4" />
              </div>

              {/* Speech bubble */}
              <div className={`absolute top-3 left-1/2 z-20 transition-all duration-300 ${showBubble ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                style={{ transform: showBubble ? "translateX(-50%) scale(1)" : "translateX(-50%) scale(0.75)" }}>
                <div className="relative px-3 py-2 rounded-2xl shadow-lg text-center" style={{ background: "white", border: "2px solid #FF8C42", maxWidth: 200 }}>
                  <span className="font-nunito font-bold text-xs" style={{ color: "#4A2C0A" }}>{catPhrase}</span>
                  <div className="absolute bottom-[-9px] left-1/2 -translate-x-1/2 w-0 h-0" style={{ borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "9px solid #FF8C42" }} />
                </div>
              </div>

              {/* Cat */}
              <div
                className={`absolute left-1/2 z-10 cursor-pointer select-none ${catAnim}`}
                style={{ bottom: 48, transform: "translateX(-50%)" }}
                onClick={handleCatClick}
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-[3px] border-white animate-pulse-glow">
                    <img src={CAT_IMAGE_CARTOON} alt="Томик" className="w-full h-full object-cover object-top" draggable={false} />
                  </div>
                  <div className="absolute -top-1 -right-1 text-xl">{getMoodEmoji()}</div>
                </div>
              </div>
            </div>

            {/* Action buttons - at the bottom */}
            <div className="grid grid-cols-3 gap-2">
              <button className="btn-game py-3 text-xs flex flex-col items-center gap-1" style={{ background: "linear-gradient(135deg, #FF8C42, #FF6B50)" }} onClick={() => setTab("items")}>
                <span className="text-xl">🍣</span>
                <span>Покормить</span>
              </button>
              <button className="btn-game py-3 text-xs flex flex-col items-center gap-1" style={{ background: "linear-gradient(135deg, #FF6B9D, #C44BB3)" }} onClick={() => setTab("items")}>
                <span className="text-xl">🧶</span>
                <span>Поиграть</span>
              </button>
              <button className="btn-game py-3 text-xs flex flex-col items-center gap-1" style={{ background: "linear-gradient(135deg, #4ECDC4, #2EA89E)" }}
                onClick={() => { setEnergy(e => Math.min(100, e + 40)); showPhrase("Пррр... Я немного вздремну... 😴"); triggerCatAnim("animate-wiggle"); handleRoomChange("bedroom"); }}>
                <span className="text-xl">😴</span>
                <span>Поспать</span>
              </button>
            </div>
          </div>
        )}

        {/* ITEMS TAB */}
        {tab === "items" && (
          <div className="flex flex-col gap-2">
            <div className="card-game border-orange-200 p-4">
              <h2 className="font-caveat text-xl font-bold mb-3 text-center" style={{ color: "#FF8C42" }}>🍽️ Еда для Томика</h2>
              <div className="grid grid-cols-2 gap-2">
                {FOODS.map((food) => (
                  <button key={food.name} className="btn-game py-3 flex flex-col items-center gap-1 text-sm"
                    style={{ background: "linear-gradient(135deg, #FF8C42, #FF6B50)" }}
                    onClick={(e) => handleFeed(food, e)}>
                    <span className="text-3xl">{food.emoji}</span>
                    <span className="font-bold">{food.name}</span>
                    <span className="text-xs opacity-90">{food.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card-game border-pink-200 p-4">
              <h2 className="font-caveat text-xl font-bold mb-3 text-center" style={{ color: "#FF6B9D" }}>🎮 Игрушки</h2>
              <div className="grid grid-cols-2 gap-2">
                {TOYS.map((toy) => (
                  <button key={toy.name} className="btn-game py-3 flex flex-col items-center gap-1 text-sm"
                    style={{ background: "linear-gradient(135deg, #FF6B9D, #C44BB3)" }}
                    onClick={(e) => handlePlay(toy, e)}>
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
            <h2 className="font-caveat text-2xl font-bold mb-4 text-center" style={{ color: "#A78BFA" }}>🎵 Звуки Томика</h2>
            <div className="grid grid-cols-2 gap-3">
              {SOUNDS.map((sound) => (
                <button key={sound.name} className="btn-game py-4 flex flex-col items-center gap-2 text-sm"
                  style={{ background: "linear-gradient(135deg, #A78BFA, #7C3AED)" }}
                  onClick={() => handleSound(sound)}>
                  <span className="text-3xl">{sound.emoji}</span>
                  <span className="font-bold">{sound.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 p-3 rounded-2xl text-center" style={{ background: "#F3EEFF", border: "2px dashed #A78BFA" }}>
              <p className="font-caveat text-base font-bold" style={{ color: "#6D28D9" }}>
                🎤 «{catPhrase}»
              </p>
            </div>
          </div>
        )}

        {/* INFO TAB */}
        {tab === "info" && (
          <div className="flex flex-col gap-2">
            <div className="card-game border-teal-200 p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 shadow-lg flex-shrink-0" style={{ borderColor: "#4ECDC4" }}>
                  <img src={CAT_IMAGE_CARTOON} alt={catName} className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <h2 className="font-caveat text-2xl font-bold" style={{ color: "#2A7A74" }}>{catName}</h2>
                  <div className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm" style={{ color: i < catLevel ? "#FFB300" : "#DDD" }}>⭐</span>
                    ))}
                    <span className="text-xs font-bold ml-1" style={{ color: "#888" }}>ур. {catLevel}</span>
                  </div>
                  <div className="text-sm font-bold mt-1" style={{ color: "#4ECDC4" }}>{getMoodText()} {getMoodEmoji()}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <InfoBar label="🍖 Голод" value={hunger} color="#FF8C42" />
                <InfoBar label="⭐ Радость" value={happiness} color="#FF6B9D" />
                <InfoBar label="⚡ Энергия" value={energy} color="#4ECDC4" />
              </div>
            </div>

            <div className="card-game border-yellow-200 p-4">
              <h3 className="font-caveat text-xl font-bold mb-3" style={{ color: "#B8860B" }}>📋 О питомце</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Кличка", value: "Томик 🐾" },
                  { label: "Характер", value: "Добрый 😺" },
                  { label: "Любит", value: "Рыбку 🐟 и сон 😴" },
                  { label: "Сейчас в", value: ROOMS.find(r => r.id === room)?.label + " " + ROOMS.find(r => r.id === room)?.emoji },
                  { label: "Монеток", value: `${coins} 🪙` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-1.5 px-3 rounded-xl" style={{ background: "#FFFBEB" }}>
                    <span className="font-bold text-sm" style={{ color: "#92713A" }}>{item.label}</span>
                    <span className="font-bold text-sm" style={{ color: "#4A3000" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {tab === "messages" && (
          <div className="flex flex-col gap-2">
            {/* Quick phrases */}
            <div className="card-game border-pink-200 p-3">
              <p className="font-caveat text-base font-bold mb-2 text-center" style={{ color: "#FF6B9D" }}>💌 Быстрые фразы</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_MESSAGES.map((qm) => (
                  <button
                    key={qm.text}
                    onClick={() => sendMessage(qm.text, qm.emoji)}
                    className="px-3 py-1.5 rounded-full text-sm font-bold transition-all active:scale-90"
                    style={{ background: "linear-gradient(135deg, #FF6B9D, #C44BB3)", color: "white", boxShadow: "0 4px 12px rgba(255,107,157,0.35)" }}
                  >
                    {qm.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat window */}
            <div className="card-game border-pink-100 flex flex-col" style={{ height: 320 }}>
              {/* Cat header */}
              <div className="flex items-center gap-2 p-3 border-b border-pink-100">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 flex-shrink-0" style={{ borderColor: "#FF6B9D" }}>
                  <img src={CAT_IMAGE_CARTOON} alt="Томик" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#333" }}>Томик</p>
                  <p className="text-xs" style={{ color: isCatTyping ? "#FF6B9D" : "#4ECDC4" }}>
                    {isCatTyping ? "печатает... 🐾" : "онлайн 🟢"}
                  </p>
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.from === "cat" && (
                      <div className="w-7 h-7 rounded-full overflow-hidden mr-1.5 flex-shrink-0 self-end">
                        <img src={CAT_IMAGE_CARTOON} alt="" className="w-full h-full object-cover object-top" />
                      </div>
                    )}
                    <div
                      className="px-3 py-2 rounded-2xl text-sm font-bold max-w-[75%] shadow-sm"
                      style={{
                        background: msg.from === "user"
                          ? "linear-gradient(135deg, #FF6B9D, #C44BB3)"
                          : "white",
                        color: msg.from === "user" ? "white" : "#333",
                        borderRadius: msg.from === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        border: msg.from === "cat" ? "1.5px solid #FFD6E8" : "none",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isCatTyping && (
                  <div className="flex justify-start items-end gap-1.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
                      <img src={CAT_IMAGE_CARTOON} alt="" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-white border border-pink-100 shadow-sm" style={{ borderRadius: "18px 18px 18px 4px" }}>
                      <div className="flex gap-1 items-center">
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#FF6B9D", animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#FF6B9D", animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#FF6B9D", animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-2 border-t border-pink-100 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
                  placeholder="Напиши Томику..."
                  className="flex-1 px-3 py-2 rounded-2xl text-sm font-bold outline-none"
                  style={{ background: "#FFF0F7", border: "2px solid #FFD6E8", color: "#333" }}
                />
                <button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim() || isCatTyping}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all active:scale-90 disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, #FF6B9D, #C44BB3)", color: "white", boxShadow: "0 4px 12px rgba(255,107,157,0.4)" }}
                >
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom navigation */}
        <div className="card-game border-0 p-2" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}>
          <div className="flex justify-around items-center">
            <TabButton active={tab === "home"} emoji="🏠" label="Главная" onClick={() => setTab("home")} />
            <TabButton active={tab === "items"} emoji="🛒" label="Предметы" onClick={() => setTab("items")} />
            <TabButton active={tab === "sounds"} emoji="🎵" label="Звуки" onClick={() => setTab("sounds")} />
            <TabButton active={tab === "messages"} emoji="💌" label="Написать" onClick={() => setTab("messages")} />
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
      <span className="text-xs">{icon}</span>
      <div className="w-10 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.3)" }}>
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
      style={{ color: active ? "white" : "rgba(255,255,255,0.5)", minWidth: 64 }}
      onClick={onClick}
    >
      <span className="text-xl">{emoji}</span>
      <span>{label}</span>
    </button>
  );
}