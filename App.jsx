import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// COMPANY INFO
const COMPANY = {
  name: "Asani Rentals",
  address: "Kalispell MT, 59901",
  phone: "732-470-8233",
  email: "reserve@rentwithasani.com",
  tagline: "Premium economy to luxury rentals • Business • Events • Private travel",
  slogan: "Arrive like it’s already yours.",
};


/** Membership + loyalty helpers (additive; no layout changes) */
function makeId(prefix = "ASANI") {
  // Example: ASANI-4F8C21
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${out}`;
}

function calcTier(points = 0) {
  const p = Number(points) || 0;
  if (p >= 300) return 4;
  if (p >= 150) return 3;
  if (p >= 50) return 2;
  return 1;
}

function tierName(tier = 1) {
  return ({ 1: "Tier 1", 2: "Tier 2", 3: "Tier 3", 4: "Tier 4" }[tier] || "Tier 1");
}

function tierDiscountPct(tier = 1) {
  // Exclusive pricing access by tier (edit anytime)
  return ({ 1: 0, 2: 0.05, 3: 0.1, 4: 0.15 }[tier] ?? 0);
}

function setCookie(name, value, days = 30) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  } catch (_) {}
}

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  } catch (_) {
    return "";
  }
}


// ==== FLEET DATA ====
const SAMPLE_VEHICLES = [
  {
    id: "v001",
    name: "BMW X1 M Package",
    category: "Premium Economy SUV",
    seats: 5,
    pricePerDay: 120,
    color: "Estoril Blue Metallic",
    image:
      "https://file.kelleybluebookimages.com/kbb/base/evox/CP/10908/2017-BMW-X1-front_10908_032_2400x1800_A96.png",
    description:
      "Sporty compact SUV with M styling, agile handling, and everyday comfort for daily drives or weekend escapes.",
    available: true,
  },
  {
    id: "v002",
    name: "Honda CR-V Hybrid Sport",
    category: "Premium SUV",
    seats: 5,
    pricePerDay: 150,
    color: "Urban Gray Pearl",
    image:
      "https://vehicle-images.dealerinspire.com/3dc5-110004598/thumbnails/large/7FARS6H54SE100583/c7206170b726e1316bdc1efa8374f7ae.png",
    description:
      "Fuel-efficient hybrid SUV with a refined ride, great cargo space, and modern tech for family or business travel.",
    available: true,
  },
  {
    id: "v003",
    name: "Nissan Versa",
    category: "Economy Sedan",
    seats: 5,
    pricePerDay: 90,
    color: "Silver",
    image:
      "https://cdn.jdpower.com/ChromeImageGallery/Expanded/Transparent/640/2023NIC10_640/2023NIC100001_640_01.png",
    description:
      "Compact, efficient, and budget-friendly sedan ideal for city trips, errands, and everyday transportation.",
    available: true,
  },
  {
    id: "v004",
    name: "Kia Forte",
    category: "Premium Economy Sedan",
    seats: 5,
    pricePerDay: 75,
    color: "Grey",
    image:
      "https://dealerimages.dealereprocess.com/image/upload/c_limit,f_auto,fl_lossy,w_500/v1/svp/dep/21kiafortelxssd3t/kia_21fortelxssd3t_angularfront_gravitygray",
    description:
      "Modern compact sedan with strong fuel economy, sharp styling, and a comfortable interior.",
    available: true,
  },
  {
    id: "v005",
    name: "Lamborghini Urus",
    category: "Super SUV",
    seats: 5,
    pricePerDay: 1500,
    color: "Yellow",
    image:
      "https://www.lamborghinilongisland.com/imagetag/2333/main/l/New-2019-Lamborghini-Urus-1540414873.jpg",
    description:
      "Super-SUV performance with exotic styling, towering presence, and a cockpit built for high-end luxury travel.",
    available: true,
  },
  {
    id: "v006",
    name: "Rolls Royce Ghost",
    category: "Ultra Luxury Sedan",
    seats: 4,
    pricePerDay: 1800,
    color: "Black",
    image:
      "https://www.motortrend.com/uploads/2021/12/2022-Rolls-Royce-Ghost.png",
    description:
      "The definition of quiet luxury — effortless power, handcrafted materials, and a serene rear-seat experience.",
    available: true,
  },
  {
    id: "v007",
    name: "BMW 3 Series",
    category: "Sport Sedan",
    seats: 5,
    pricePerDay: 150,
    color: "Metallic Grey",
    image:
      "https://media.chromedata.com/MediaGallery/media/MjkzOTU4Xk1lZGlhIEdhbGxlcnk/DDcY5uJ1Hoc2PfKiaPzOoTor54RCDSxmNSMjhIMjMcSABjV1Plsg4az8WgGOqVD42Px_fBnRGfbq6YMoQr9Bwgwa4vs3hsjk7OZwcAD2au-Xj2_jOK1rejFnAEpjN8liQtu0_zWdBrt_zZ94kYd0yB-LZ9J239IX_tK5l7rorkk7c-qGpYTQuQ/cc_2025BMC222011556_01_640_668.png",
    description:
      "Iconic sport sedan that blends sharp handling with everyday comfort and a clean, modern interior.",
    available: true,
  },
  {
    id: "v008",
    name: "BMW 5 Series",
    category: "Executive Sedan",
    seats: 5,
    pricePerDay: 220,
    color: "Jet Black",
    image:
      "https://carimage.d2cmedia.ca/newcars/cb69187e12c4b7b/2025/BMW/5%20Series/MjkxNDg1Xk1lZGlhIEdhbGxlcnk/JlYkWPtHQFHv5iyaE-0ElTJMKcsUkrV6zIwqpULTTzGVYff8AQdRoGb1LNE0kkF9LvxKak38yajBbDVqH2GXAoRwzfyli_8oNZdafozz4_Dvo0JFYpvJ_UML5RdQUqO_jzWxRcM0gc3Bc81o31C4CvRZFRAQKi_vDV1JkK3TadD8KjHDqD6yhOUe0oYKZe3bJaoUf8IXQeI/cc_2025BMC071956866_01_1280_A90.png",
    description:
      "Executive-class sedan with a spacious cabin, advanced tech, and a refined, confident drive.",
    available: true,
  },
  {
    id: "v009",
    name: "Mercedes S Class",
    category: "Flagship Luxury Sedan",
    seats: 4,
    pricePerDay: 350,
    color: "Obsidian Black",
    image:
      "https://vehicle-images.dealerinspire.com/stock-images/chrome/d5bcd7597123f034ff8aca12872d03e6.png",
    description:
      "Flagship Mercedes sedan with first-class comfort, ambient lighting, and a true chauffeured rear seat.",
    available: true,
  },
  {
    id: "v010",
    name: "Cadillac Escalade",
    category: "Full-size Luxury SUV",
    seats: 7,
    pricePerDay: 350,
    color: "Black",
    image:
      "https://d2ivfcfbdvj3sm.cloudfront.net/8nQjctTo7dtJ6WW6/54121/stills_0640_png/MY2024/54121/54121_st0640_116.webp?c=172&p=164&m=1&o=png&s=wuewtb27_XAtqo0e5m3jQS",
    description:
      "Large luxury SUV with three rows, bold presence, and plenty of room for VIP groups, luggage, and gear.",
    available: true,
  },
  {
    id: "v011",
    name: "Mercedes G-Wagon G63 AMG",
    category: "Luxury Performance SUV",
    seats: 5,
    pricePerDay: 950,
    color: "Matte Black",
    image:
      "https://dealerimages.dealereprocess.com/image/upload/c_limit,f_auto,fl_lossy,w_600/v1/svp/dep/25mercedesbenzgclassamgg63suv/mercedesbenz_25gclassamgg63suv_angularfront_black",
    description:
      "Iconic G-Wagon with AMG power, off-road attitude, and a high-status cabin suited for red-carpet arrivals.",
    available: true,
  },
];

// HERO SLIDES
const HERO_SLIDES = [
  {
    id: "s1",
    title: "Lamborghini Urus",
    subtitle: "Super SUV • 1500/day • Limited availability",
    image:
      "https://www.lamborghinilongisland.com/imagetag/2333/main/l/New-2019-Lamborghini-Urus-1540414873.jpg",
  },
  {
    id: "s2",
    title: "Rolls Royce Ghost",
    subtitle: "Ultra luxury sedan • Chauffeur-ready",
    image:
      "https://www.motortrend.com/uploads/2021/12/2022-Rolls-Royce-Ghost.png",
  },
  {
    id: "s3",
    title: "Mercedes S Class",
    subtitle: "Flagship chauffeured comfort • Black with privacy glass",
    image:
      "https://vehicle-images.dealerinspire.com/stock-images/chrome/d5bcd7597123f034ff8aca12872d03e6.png",
  },
  {
    id: "s4",
    title: "Cadillac Escalade",
    subtitle: "Full-size luxury SUV • Perfect for groups & events",
    image:
      "https://d2ivfcfbdvj3sm.cloudfront.net/8nQjctTo7dtJ6WW6/54121/stills_0640_png/MY2024/54121/54121_st0640_116.webp?c=172&p=164&m=1&o=png&s=wuewtb27_XAtqo0e5m3jQS",
  },
  {
    id: "s5",
    title: "BMW X1 M Package",
    subtitle: "Premium economy SUV • Estoril Blue Metallic",
    image:
      "https://file.kelleybluebookimages.com/kbb/base/evox/CP/10908/2017-BMW-X1-front_10908_032_2400x1800_A96.png",
  },
];

// ========= HELPERS =========
function formatCurrency(n) {
  return `$${n.toFixed(2)}`;
}

function applyVehicleFilters(vehicles, filterCategory, sortOrder) {
  let result = [...vehicles];
  if (filterCategory && filterCategory !== "all") {
    result = result.filter((v) => v.category === filterCategory);
  }
  if (sortOrder === "price-asc") {
    result.sort((a, b) => a.pricePerDay - b.pricePerDay);
  } else if (sortOrder === "price-desc") {
    result.sort((a, b) => b.pricePerDay - a.pricePerDay);
  }
  return result;
}

// Deposit mapping per vehicle
function getDepositForVehicle(vehicle) {
  if (!vehicle) return 350;
  switch (vehicle.id) {
    case "v005": // Urus
      return 1500;
    case "v006": // Ghost
      return 2000;
    case "v010": // Escalade
      return 750;
    case "v009": // S Class
      return 750;
    case "v011": // G63
      return 1000;
    case "v007": // BMW 3
    case "v008": // BMW 5
      return 500;
    case "v001": // X1 M
    case "v002": // CR-V
    case "v003": // Versa
    case "v004": // Forte
    default:
      return 350;
  }
}

// ========= UI COMPONENTS =========

function FleetFilters({
  categories,
  filterCategory,
  setFilterCategory,
  sortOrder,
  setSortOrder,
}) {
  const uniqueCategories = Array.from(new Set(categories)).filter(Boolean);

  return (
    <div className="mt-6 mb-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-sm">
      <div className="flex items-center gap-2">
        <span className="text-zinc-600">Vehicle type:</span>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border rounded-2xl px-3 py-2 bg-white text-zinc-800"
        >
          <option value="all">All vehicle types</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-zinc-600">Sort by:</span>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded-2xl px-3 py-2 bg-white text-zinc-800"
        >
          <option value="price-asc">Price — low to high</option>
          <option value="price-desc">Price — high to low</option>
        </select>
      </div>
    </div>
  );
}

function Header({ onNav, profile, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNav(route) {
    onNav(route);
    setMenuOpen(false);
  }

  return (
    <header className="w-full bg-black text-white border-b border-zinc-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* BRAND + SLOGAN (LEFT) */}
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => handleNav("home")}
            className="text-left focus:outline-none"
          >
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight uppercase leading-tight">
              Asani Rentals
            </h1>
            <p className="text-[10px] md:text-xs text-zinc-400 mt-1">
              Premium economy to luxury rentals • Business • Events • Private travel
            </p>
            <p className="text-[10px] md:text-xs text-zinc-500 mt-0.5">
              Kalispell MT, 59901 • 732-470-8233
            </p>
          </button>

          {/* HAMBURGER (MOBILE ONLY) */}
          <button
            type="button"
            className="sm:hidden inline-flex items-center justify-center rounded-full border border-zinc-700 px-3 py-2 text-xs mt-1"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="mr-2">Menu</span>
            <span className="flex flex-col gap-[3px]">
              <span
                className={`h-[2px] w-4 bg-white transition-transform ${
                  menuOpen ? "rotate-45 translate-y-[3px]" : ""
                }`}
              />
              <span
                className={`h-[2px] w-4 bg-white transition-opacity ${
                  menuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`h-[2px] w-4 bg-white transition-transform ${
                  menuOpen ? "-rotate-45 -translate-y-[3px]" : ""
                }`}
              />
            </span>
          </button>
        </div>

        {/* DESKTOP NAV + PROFILE (RIGHT) */}
        <div className="hidden sm:flex items-center gap-6">
          <nav className="space-x-4 text-xs md:text-sm">
            <button
              onClick={() => handleNav("home")}
              className="hover:text-zinc-200"
            >
              Home
            </button>
            <button
              onClick={() => handleNav("vehicles")}
              className="hover:text-zinc-200"
            >
              Vehicles
            </button>
            <button
              onClick={() => handleNav("book")}
              className="hover:text-zinc-200"
            >
              Reserve
            </button>
            <button
              onClick={() => handleNav("chauffeur")}
              className="hover:text-zinc-200"
            >
              Chauffeur
            </button>
            <button
              onClick={() => handleNav("profile")}
              className="hover:text-zinc-200"
            >
              Profile
            </button>
            <button
              onClick={() => handleNav("contact")}
              className="hover:text-zinc-200"
            >
              Contact
            </button>
          
{profile?.email && (
  <button
    onClick={onSignOut}
    className="hover:text-zinc-200"
    type="button"
  >
    Sign out
  </button>
)}
</nav>

          {profile?.fullName && (
            <div className="flex flex-col text-right text-[10px] md:text-xs leading-tight">
              <span className="text-zinc-400">Signed in as</span>
              <span className="font-semibold text-white">
                {profile.fullName}
              </span>
            </div>
          )}
        </div>

        {/* MOBILE DROPDOWN NAV */}
        {menuOpen && (
          <nav className="sm:hidden border-t border-zinc-800 pt-2 mt-1 space-y-1 text-sm">
            <button
              onClick={() => handleNav("home")}
              className="block w-full text-left py-1.5"
            >
              Home
            </button>
            <button
              onClick={() => handleNav("vehicles")}
              className="block w-full text-left py-1.5"
            >
              Vehicles
            </button>
            <button
              onClick={() => handleNav("book")}
              className="block w-full text-left py-1.5"
            >
              Reserve
            </button>
            <button
              onClick={() => handleNav("chauffeur")}
              className="block w-full text-left py-1.5"
            >
              Chauffeur
            </button>
            <button
              onClick={() => handleNav("profile")}
              className="block w-full text-left py-1.5"
            >
              Profile
            </button>
            {profile?.email && (
              <button
                onClick={onSignOut}
                className="block w-full text-left py-1.5"
                type="button"
              >
                Sign out
              </button>
            )}
            <button
              onClick={() => handleNav("contact")}
              className="block w-full text-left py-1.5"
            >
              Contact
            </button>

            {profile?.fullName && (
              <div className="pt-2 mt-1 border-t border-zinc-800 text-[11px] text-zinc-400">
                Signed in as{" "}
                <span className="font-semibold text-zinc-100">
                  {profile.fullName}
                </span>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

function Hero({ onNav }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setCurrent((prev) => (prev + 1) % HERO_SLIDES.length),
      4000
    );
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-black text-white pt-6 pb-16 md:py-24 border-b border-zinc-900">
      <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-zinc-400">
            Premium Economy • Luxury Rentals
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Premium economy to luxury rentals
            <span className="block text-zinc-300 font-normal text-2xl md:text-3xl mt-1">
              for business, events & private travel.
            </span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400 max-w-md">
            A curated range from premium economy to flagship exotics, seamless
            reservations, and white–glove service. Hold your vehicle instantly
            with a secure deposit and arrive like it’s already yours.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onNav("book")}
              className="px-6 md:px-7 py-3 rounded-2xl bg-white text-black font-semibold text-xs md:text-sm tracking-wide uppercase"
            >
              Reserve now
            </button>
            <button
              onClick={() => onNav("vehicles")}
              className="px-6 md:px-7 py-3 rounded-2xl border border-zinc-600 text-xs md:text-sm font-medium text-zinc-200"
            >
              View fleet
            </button>
          </div>
        </div>
        <div className="relative mt-8 md:mt-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-zinc-900 to-zinc-700 blur-xl opacity-60" />
          <div className="relative rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl h-64 md:h-80">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {HERO_SLIDES.map((slide) => (
                <div key={slide.id} className="min-w-full h-64 md:h-80 relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between text-[11px] md:text-xs text-zinc-200">
                    <div>
                      <div className="font-semibold text-sm md:text-base">
                        {slide.title}
                      </div>
                      <div className="text-zinc-400 text-[10px] md:text-xs">
                        {slide.subtitle}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold text-xs md:text-sm">
                        Chauffeur & self-drive options
                      </div>
                      <div className="text-emerald-400 text-[10px] md:text-[11px]">
                        Armed & unarmed chauffeur available
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function VehicleCard({ v, onSelect, onSave, canReserve = true }) {
  async function handleSaveClick() {
    if (onSave) {
      await onSave(v);
    } else {
      alert("We couldn't save this vehicle to your wishlist. Please try again or contact us.");
    }
  }

  return (
    <div className="border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-zinc-800 transition-all duration-200 bg-white flex flex-col">
      <img
        src={v.image}
        alt={v.name}
        className="w-full h-40 md:h-44 object-contain bg-zinc-50"
      />
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 tracking-tight text-sm md:text-base">
              {v.name}
            </h3>
            <div className="text-[11px] md:text-xs text-zinc-500 mt-1">
              {v.category} • {v.seats} seats
              {v.color ? " • " + v.color : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zinc-900 text-sm md:text-base">
              {formatCurrency(v.pricePerDay)}/day
            </div>
            <div
              className={`text-[11px] mt-1 ${
                v.available ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {v.available ? "Available" : "Unavailable"}
            </div>
          </div>
        </div>
        <p className="mt-3 md:mt-4 text-xs md:text-sm text-zinc-600 leading-relaxed line-clamp-3">
          {v.description}
        </p>
        <div className="mt-4 md:mt-5 flex gap-3">
          {canReserve && (
            <button
              disabled={!v.available}
              onClick={() => onSelect && onSelect(v)}
              className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-medium border transition ${
                v.available
                  ? "bg-black text-white border-black hover:bg-zinc-900"
                  : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
              }`}
            >
              Reserve
            </button>
          )}
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-2xl text-xs md:text-sm font-medium border border-zinc-200 text-zinc-700 hover:border-zinc-800 hover:text-zinc-900 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function VehiclesPage({ vehicles, onSelect, onSave, canReserve = true }) {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">Fleet</h2>
      <p className="text-zinc-600 mt-2 text-sm md:text-base">
        Hand-picked premium economy, luxury, and exotic vehicles for every
        occasion.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {vehicles.map((v) => (
          <VehicleCard
            key={v.id}
            v={v}
            onSelect={onSelect}
            onSave={onSave}
            canReserve={canReserve}
          />
        ))}
      </div>
    </section>
  );
}

// ========= BOOKING PANEL =========

function PromoPopup({ open, onClose, onSignup, defaultEmail = "" }) {
  const [email, setEmail] = useState(defaultEmail || "");

  useEffect(() => {
    if (open) setEmail(defaultEmail || "");
  }, [open, defaultEmail]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-zinc-900">Asani Rentals Members</div>
            <h3 className="mt-1 text-2xl font-bold text-zinc-900">Get 10% Off</h3>
            <p className="mt-2 text-sm text-zinc-600">
              Sign up & become a member. We’ll email your unique promo code immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCookie("asani_promo_dismissed", "1", 30);
              onClose();
            }}
            className="text-zinc-500 hover:text-zinc-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border p-3 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              setCookie("asani_promo_dismissed", "1", 30);
              onSignup(email);
            }}
            className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-900"
          >
            Sign up & get the code
          </button>
          <button
            type="button"
            onClick={() => {
              setCookie("asani_promo_dismissed", "1", 30);
              onClose();
            }}
            className="w-full rounded-lg border px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            Not now
          </button>
          <div className="text-[11px] text-zinc-500">
            By signing up, you’ll also earn points per booking and unlock exclusive tier pricing.
          </div>
        </div>
      </div>
    </div>
  );
}


function BookingPanel({ vehicle, onBack, onComplete, profile }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState(350);
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [insurance, setInsurance] = useState("none");
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [ezPass, setEzPass] = useState(false);
  const [prepayFuel, setPrepayFuel] = useState(false);
  const [amenities, setAmenities] = useState({
    infantSeat: false,
    childSeat: false,
    boosterSeat: false,
  });
  const [showProtectionDetails, setShowProtectionDetails] = useState(false);
  const [showEzPassDetails, setShowEzPassDetails] = useState(false);
  const [showAmenitiesDetails, setShowAmenitiesDetails] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (vehicle) {
      setDeposit(getDepositForVehicle(vehicle));
    }
  }, [vehicle]);

  // Prefill customer fields from profile when available
  useEffect(() => {
    if (profile && profile.email) {
      setCustomer((prev) => ({
        fullName: prev.fullName || profile.fullName || "",
        email: prev.email || profile.email || "",
        phone: prev.phone || profile.phone || "",
      }));
    }
  }, [profile]);

  if (!vehicle) return null;

  function daysBetween(a, b) {
    const A = new Date(a);
    const B = new Date(b);
    const diff = Math.ceil((B - A) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const billableDays = days || 1;

  
const promoCodeNormalized = promoCode.trim().toUpperCase();
const memberTier = profile?.tier || calcTier(profile?.points || 0);
const memberDiscount = profile?.email ? tierDiscountPct(memberTier) : 0;

const promoApplied =
  promoCodeNormalized === "ASANI10" ||
  (profile?.promoCode &&
    promoCodeNormalized === String(profile.promoCode).trim().toUpperCase());

const originalDailyRate = vehicle.pricePerDay;

// Exclusive member pricing by tier, then optional promo code discount
const memberDailyRate = Math.round(originalDailyRate * (1 - memberDiscount));
const discountedDailyRate = promoApplied
  ? Math.round(memberDailyRate * 0.9)
  : memberDailyRate;

  const subtotal = discountedDailyRate * billableDays;

  const insuranceDailyRate = 25;
  const insuranceCost =
    insurance === "asani" ? insuranceDailyRate * billableDays : 0;

  const ezPassDailyRate = 3.99;
  const ezPassCost = ezPass ? ezPassDailyRate * billableDays : 0;

  const amenityDailyRate = 15;
  const amenityCount = ["infantSeat", "childSeat", "boosterSeat"].filter(
    (k) => amenities[k]
  ).length;
  const amenitiesCost =
    amenityCount > 0 ? amenityDailyRate * amenityCount * billableDays : 0;

  const fuelPrepayCost = prepayFuel ? 65 : 0;
  const extrasTotal =
    insuranceCost + fuelPrepayCost + ezPassCost + amenitiesCost;
  const total = subtotal + extrasTotal;

  function toggleAmenity(key) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handlePay() {
    if (!startDate || !endDate) {
      alert("Please select your start and end dates.");
      return;
    }

    if (!customer.email) {
      alert("Please enter your email so we can send your confirmation.");
      return;
    }

    if (insurance === "none" && !riskAccepted) {
      alert(
        "Please confirm that you understand and accept the risk of driving without the optional protection plan."
      );
      return;
    }

    const booking = {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehicleImage: vehicle.image,
      startDate,
      endDate,
      days: billableDays,
      subtotal,
      deposit,
      total,
      customer,
      extras: {
        insurance,
        insuranceDailyRate,
        insuranceCost,
        ezPass,
        ezPassDailyRate,
        ezPassCost,
        prepayFuel,
        fuelPrepayCost,
        amenities,
        amenityDailyRate,
        amenityCount,
        amenitiesCost,
        riskAccepted,
        promoCode: promoApplied ? promoCodeNormalized : null,
        originalDailyRate,
        discountedDailyRate,
      },
    };

    try {
      // 1) Try to save booking in Supabase (SOFT FAILURE: do not block payment)
      try {
        const { error } = await supabase.from("bookings").insert({
          customer_name: booking.customer.fullName || null,
          customer_email: booking.customer.email,
          customer_phone: booking.customer.phone || null,
          vehicle_id: booking.vehicleId,
          vehicle_name: booking.vehicleName,
          start_date: booking.startDate,
          end_date: booking.endDate,
          days: booking.days,
          subtotal: booking.subtotal,
          deposit: booking.deposit,
          total: booking.total,
          extras: booking.extras,
        });

        if (error) {
          console.error("Supabase booking insert error", error);
          // No alert here — we continue to payment
        }
      } catch (dbErr) {
        console.error("Supabase booking save failed", dbErr);
      }


// 1b) Loyalty: add points + update tier (soft failure)
try {
  await fetch("/api/loyalty-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: booking.customer.email,
      total: booking.total,
      days: booking.days,
    }),
  });
} catch (e) {
  console.error("Loyalty points update failed", e);
}

      // 2) Send booking email (non-blocking soft error)
      try {
        await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(booking),
        });
      } catch (emailErr) {
        console.error("Booking email error", emailErr);
      }

      // 3) Stripe Checkout redirect (deposit only)
      const stripe = await stripePromise;

      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: booking.customer.email,
          vehicleName: booking.vehicleName,
          depositAmount: booking.deposit,
        }),
      });

      if (!res.ok) {
        console.error("Stripe checkout session error:", await res.text());
        alert(
          "We had a problem starting the payment. Please contact us directly at " +
            COMPANY.email
        );
        return;
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.id && stripe) {
        const result = await stripe.redirectToCheckout({
          sessionId: data.id,
        });

        if (result.error) {
          console.error(result.error);
          alert(
            "Payment could not be started. Please contact us directly at " +
              COMPANY.email
          );
          return;
        }
      }

      // 4) Update local state in parent
      onComplete(booking);
    } catch (err) {
      console.error("Booking error", err);
      alert(
        "We had a problem submitting your booking. Please contact us directly at " +
          COMPANY.email
      );
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 px-2">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onBack} className="text-sm text-zinc-500 mb-4">
          ← Back
        </button>
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
          {/* Vehicle image + title */}
          <div className="w-full md:w-40 flex flex-col items-center md:items-start">
            <div className="w-32 h-20 md:w-40 md:h-24 bg-zinc-50 border rounded-2xl flex items-center justify-center overflow-hidden mb-2">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 text-center md:text-left">
              {vehicle.name}
            </h3>
            <p className="text-[11px] text-zinc-500 text-center md:text-left">
              {vehicle.category} • {vehicle.seats} seats
            </p>
          </div>

          <div className="flex-1">
            <p className="text-xs text-zinc-500">
              A security deposit is collected now to hold your reservation.
              Rental charges and any extras are settled at vehicle pickup.
            </p>
          </div>
        </div>

        {/* Dates + Customer */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm text-zinc-700">
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                setStartDate(newStart);
                if (endDate && endDate < newStart) {
                  setEndDate("");
                }
              }}
              className="mt-2 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700">
            End date
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                const val = e.target.value;
                if (startDate && val < startDate) {
                  setEndDate(startDate);
                } else {
                  setEndDate(val);
                }
              }}
              className="mt-2 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700">
            Full name
            <input
              value={customer.fullName}
              onChange={(e) =>
                setCustomer({ ...customer, fullName: e.target.value })
              }
              className="mt-2 p-2 border rounded"
              placeholder="John Doe"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700">
            Email
            <input
              value={customer.email}
              onChange={(e) =>
                setCustomer({ ...customer, email: e.target.value })
              }
              className="mt-2 p-2 border rounded"
              placeholder="you@domain.com"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700 col-span-1 sm:col-span-2">
            Phone
            <input
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
              className="mt-2 p-2 border rounded"
              placeholder="(555) 555-5555"
            />
          </label>
        </div>

        {/* Protection / extras + Summary */}
        <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">
              Optional protection & extras
            </h4>

            <div className="mt-3 space-y-3 text-sm text-zinc-700">
              {/* Protection */}
              <div className="border rounded-2xl p-3 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Optional protection plan</span>
                  <span className="text-xs text-zinc-500">
                    +{formatCurrency(insuranceDailyRate)} / day
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Third-party protection product that may reduce your financial
                  responsibility for covered damage or theft, subject to the
                  terms of your rental agreement.
                </p>
                <button
                  type="button"
                  onClick={() => setShowProtectionDetails((v) => !v)}
                  className="mt-2 text-[11px] text-zinc-600 flex items-center gap-1"
                >
                  <span className="inline-block text-xs font-semibold">
                    {showProtectionDetails ? "−" : "+"}
                  </span>
                  <span>More details</span>
                </button>
                {showProtectionDetails && (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    This optional protection is provided by{" "}
                    <strong>Rental Car Cover</strong>, a third-party protection
                    provider. Their policies typically help reduce your
                    financial responsibility for covered collision damage,
                    theft, vandalism, and eligible towing or loss-of-use
                    charges, up to the limits and subject to the exclusions
                    stated in their policy wording. Exact coverage and
                    exclusions are defined by Rental Car Cover in the
                    documentation you receive from them — always review their
                    policy and your rental agreement carefully.
                  </p>
                )}
                <div className="mt-2 space-y-1 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="insurance"
                      value="asani"
                      checked={insurance === "asani"}
                      onChange={() => {
                        setInsurance("asani");
                        setRiskAccepted(false);
                      }}
                    />
                    <span>Yes, add the optional protection plan</span>
                  </label>
                  <label className="flex items-start gap-2">
                    <input
                      type="radio"
                      name="insurance"
                      value="none"
                      checked={insurance === "none"}
                      onChange={() => setInsurance("none")}
                    />
                    <span>
                      No, I decline the protection plan. I understand my
                      personal auto insurance or credit card may{" "}
                      <strong>not</strong> cover rental vehicles, and I may be
                      fully responsible for any loss or damage.
                    </span>
                  </label>
                  {insurance === "none" && (
                    <label className="flex items-start gap-2 mt-2 text-[11px] text-red-600">
                      <input
                        type="checkbox"
                        checked={riskAccepted}
                        onChange={(e) => setRiskAccepted(e.target.checked)}
                      />
                      <span>
                        I have reviewed this disclaimer and choose to accept all
                        financial risk for damage, loss, or liability not
                        covered by my own policy.
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* EZ-Pass */}
              <div className="border rounded-2xl p-3 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">EZ-Pass / toll device</span>
                  <span className="text-xs text-zinc-500">
                    +{formatCurrency(ezPassDailyRate)} / day
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Toll usage will be billed after your rental with any
                  applicable service fees as outlined in your rental agreement.
                </p>
                <button
                  type="button"
                  onClick={() => setShowEzPassDetails((v) => !v)}
                  className="mt-2 text-[11px] text-zinc-600 flex items-center gap-1"
                >
                  <span className="inline-block text-xs font-semibold">
                    {showEzPassDetails ? "−" : "+"}
                  </span>
                  <span>More details</span>
                </button>
                {showEzPassDetails && (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    When you opt in to the toll device, all eligible tolls
                    incurred during your rental will be charged to the card on
                    file, plus any service or processing fees described in your
                    rental agreement. Unpaid tolls and violations may result in
                    additional charges.
                  </p>
                )}
                <label className="mt-2 flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={ezPass}
                    onChange={(e) => setEzPass(e.target.checked)}
                  />
                  <span>Yes, add an EZ-Pass/toll device to my rental</span>
                </label>
              </div>

              {/* Prepay fuel */}
              <div className="border rounded-2xl p-3 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Prepay fuel</span>
                  <span className="text-xs text-zinc-500">
                    +{formatCurrency(65)} one-time
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Return the vehicle with any fuel level. We handle the refuel
                  for a flat prepay amount.
                </p>
                <label className="mt-2 flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={prepayFuel}
                    onChange={(e) => setPrepayFuel(e.target.checked)}
                  />
                  <span>Yes, add prepaid fuel for my rental</span>
                </label>
              </div>

              {/* Child seats */}
              <div className="border rounded-2xl p-3 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Amenities & child seats</span>
                  <span className="text-xs text-zinc-500">
                    +{formatCurrency(amenityDailyRate)} / day each
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Pricing applies per seat, per day. Final totals will be
                  confirmed in your rental agreement or by our team.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAmenitiesDetails((v) => !v)}
                  className="mt-2 text-[11px] text-zinc-600 flex items-center gap-1"
                >
                  <span className="inline-block text-xs font-semibold">
                    {showAmenitiesDetails ? "−" : "+"}
                  </span>
                  <span>More details</span>
                </button>
                {showAmenitiesDetails && (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Choose from infant, child, or booster seats to match your
                    passenger&apos;s age and size. Availability may vary by
                    vehicle and local regulations. Our team can help confirm fit
                    and installation guidelines at pickup.
                  </p>
                )}
                <div className="mt-2 grid grid-cols-1 gap-1 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenities.infantSeat}
                      onChange={() => toggleAmenity("infantSeat")}
                    />
                    <span>Infant seat</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenities.childSeat}
                      onChange={() => toggleAmenity("childSeat")}
                    />
                    <span>Child seat</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={amenities.boosterSeat}
                      onChange={() => toggleAmenity("boosterSeat")}
                    />
                    <span>Booster seat</span>
                  </label>
                </div>
              </div>

              {/* Promo code */}
              <div className="border rounded-2xl p-3 bg-zinc-50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Promo code</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Enter a valid promo code to adjust the daily rental rate. Fees
                  and taxes are not discounted.
                </p>
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="mt-2 p-2 border rounded text-xs w-full"
                />
                {promoApplied && (
                  <p className="mt-1 text-[11px] text-emerald-600">
                    ASANI10 applied — daily rate reduced by 10%.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="border rounded-2xl p-4 bg-zinc-50 flex flex-col justify-between">
            <div className="space-y-2 text-sm text-zinc-700">
              <div className="flex justify-between items-center">
                <span>Daily rate</span>
                <div className="text-right">
                  {promoApplied && (
                    <div className="text-[11px] line-through text-zinc-400">
                      {formatCurrency(originalDailyRate)}/day
                    </div>
                  )}
                  <div className="font-medium">
                    {formatCurrency(discountedDailyRate)}/day
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <span>
                  Rental ({billableDays} day{billableDays > 1 ? "s" : ""})
                </span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600">
                <span>Protection & extras (est.)</span>
                <span>{formatCurrency(extrasTotal)}</span>
              </div>
              {insuranceCost > 0 && (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Protection plan</span>
                  <span>{formatCurrency(insuranceCost)}</span>
                </div>
              )}
              {ezPassCost > 0 && (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>EZ-Pass / toll device</span>
                  <span>{formatCurrency(ezPassCost)}</span>
                </div>
              )}
              {fuelPrepayCost > 0 && (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Prepaid fuel</span>
                  <span>{formatCurrency(fuelPrepayCost)}</span>
                </div>
              )}
              {amenitiesCost > 0 && (
                <div className="flex justify-between text-[11px] text-zinc-500">
                  <span>Child seat amenities</span>
                  <span>{formatCurrency(amenitiesCost)}</span>
                </div>
              )}

              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="text-xs text-zinc-600">
                  Estimated trip total*
                </span>
                <span className="font-semibold text-base text-zinc-900">
                  {formatCurrency(total)}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                *Estimate only. Taxes, fees, tolls, violations, and additional
                charges (if any) are calculated by the backend and final rental
                agreement.
              </p>

              <div className="border-t pt-2 mt-2 flex justify-between items-center">
                <span className="text-xs text-zinc-600">
                  Deposit due now (non-refundable if you no-show)
                </span>
                <span className="font-semibold text-base text-red-700">
                  {formatCurrency(deposit)}
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-lg text-sm text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                className="px-6 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
              >
                Pay deposit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========= PROFILE PAGE =========
// ========= PROFILE PAGE =========
function ProfilePage({
  profile,
  setProfile,
  newsletterSignUp,
  vehicles,
  setVehicles,
  onProfileCreated, // callback to go back to home after create
  promoPrefillEmail,
}) {
  const [local, setLocal] = useState(
    profile || {
      fullName: "",
      email: "",
      phone: "",
      driversLicense: "",
      licenseExpiry: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    }
  );

  const [auth, setAuth] = useState({ email: "", password: "" });
  const [createPassword, setCreatePassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(!!profile?.email);
  const [mode, setMode] = useState("login");

useEffect(() => {
  if (promoPrefillEmail && !isLoggedIn) {
    setMode("create");
    setLocal((prev) => ({ ...prev, email: promoPrefillEmail }));
    setAuth((prev) => ({ ...prev, email: promoPrefillEmail }));
  }
}, [promoPrefillEmail, isLoggedIn]);
  const [isAdmin, setIsAdmin] = useState(
    profile?.email &&
      profile.email.toLowerCase() === COMPANY.email.toLowerCase()
  );

const [wishlist, setWishlist] = useState([]);
const [wishlistLoading, setWishlistLoading] = useState(false);

async function refreshWishlist(userId) {
  if (!userId) return;
  setWishlistLoading(true);
  try {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Wishlist fetch error", error);
      setWishlist([]);
    } else {
      const rows = data || [];
const enriched = rows.map((row) => {
  const car = (vehicles || []).find((v) => v.id === row.car_key) || null;
  return {
    ...row,
    car,
    vehicle_name: car?.name || row.vehicle_name || "",
    vehicle_category: car?.category || row.vehicle_category || "",
    vehicle_price: car?.pricePerDay || row.vehicle_price || 0,
    vehicle_image: car?.image || row.vehicle_image || "",
    vehicle_id: row.car_key,
  };
});
setWishlist(enriched);
    }
  } catch (e) {
    console.error("Wishlist fetch failed", e);
    setWishlist([]);
  } finally {
    setWishlistLoading(false);
  }
}

async function removeFromWishlist(id) {
  try {
    const { error } = await supabase.from("wishlist").delete().eq("id", id);
    if (error) {
      console.error("Wishlist delete error", error);
      alert("We couldn't remove that item right now. Please try again.");
      return;
    }
    setWishlist((prev) => prev.filter((x) => x.id !== id));
  } catch (e) {
    console.error("Wishlist delete failed", e);
    alert("We couldn't remove that item right now. Please try again.");
  }
}

useEffect(() => {
  if (isLoggedIn && profile?.userId) {
    refreshWishlist(profile.userId);
  }
}, [isLoggedIn, profile?.userId]);
  const [drafts, setDrafts] = useState(vehicles || []);
  const [newVehicle, setNewVehicle] = useState({
    name: "",
    category: "",
    seats: 5,
    pricePerDay: 0,
    color: "",
    image: "",
    description: "",
  });

  useEffect(() => {
    setDrafts(vehicles || []);
  }, [vehicles]);

  // Normalize user data from Supabase row
  function normalizeUserRow(row, fallbackEmail) {
    if (!row) {
      return {
        userId: null,
        fullName: "",
        email: fallbackEmail || "",
        phone: "",
        driversLicense: "",
        licenseExpiry: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        membershipId: "",
        promoCode: "",
        points: 0,
        tier: 1,
      };
    }

    return {
      userId: row.id || null,
      fullName: row.full_name || "",
      email: row.email || fallbackEmail || "",
      phone: row.phone || "",
      driversLicense: row.drivers_license || "",
      licenseExpiry: row.license_expiry || "",
      addressLine1: row.address_line1 || "",
      addressLine2: row.address_line2 || "",
      city: row.city || "",
      state: row.state || "",
      postalCode: row.postal_code || "",
      country: row.country || "",
      membershipId: row.membership_id || "",
      promoCode: row.promo_code || "",
      points: Number(row.points || 0),
      tier: Number(row.tier || calcTier(row.points || 0)),
    };
  }

  // SIGN IN: email + password check
  async function handleLogin(e) {
    e.preventDefault();
    if (!auth.email || !auth.password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", auth.email)
        .maybeSingle();

      if (error) {
        console.error("Supabase user fetch error", error);
        alert("We had a problem signing you in. Please try again.");
        return;
      }

      if (!data) {
        alert(
          "We don't see a profile with that email yet. Please create a profile first."
        );
        setMode("create");
        setLocal((prev) => ({
          ...prev,
          email: auth.email,
        }));
        return;
      }

      // Basic password check (stored in users.password)
      if (!data.password || data.password !== auth.password) {
        alert("Incorrect password. Please try again.");
        return;
      }

      const loaded = normalizeUserRow(data, auth.email);
      setLocal(loaded);
      setProfile(loaded);
      if (loaded.email) newsletterSignUp(loaded.email);

      setIsLoggedIn(true);
      setIsAdmin(
        loaded.email &&
          loaded.email.toLowerCase() === COMPANY.email.toLowerCase()
      );
      alert("Signed in.");
    } catch (err) {
      console.error("Login error", err);
      alert("We couldn't sign you in. Please try again or contact support.");
    }
  }

  // CREATE PROFILE – with password + duplicate email check
  async function handleCreate(e) {
    e.preventDefault();

    if (!local.email) {
      alert("Email is required.");
      return;
    }
    if (!createPassword || createPassword.length < 6) {
      alert("Please create a password of at least 6 characters.");
      return;
    }

    try {
      // Check if email already exists
      const { data: existing, error: checkError } = await supabase
        .from("users")
        .select("email")
        .eq("email", local.email)
        .maybeSingle();

      if (checkError) {
        console.error("Supabase email check error", checkError);
      }

      if (existing?.email) {
        alert(
          "We already have a profile with this email. Please sign in instead."
        );
        setMode("login");
        setAuth((prev) => ({ ...prev, email: local.email }));
        return;
      }

      // Create new row in users table, including password

const membershipId = makeId("ASANI");
const promoCodeGenerated = makeId("ASANI10");
const initialPoints = 0;
const initialTier = 1;

      const { data: createdRow, error } = await supabase.from("users").insert({
        email: local.email,
        full_name: local.fullName,
        phone: local.phone,
        drivers_license: local.driversLicense,
        license_expiry: local.licenseExpiry || null,
        address_line1: local.addressLine1 || null,
        address_line2: local.addressLine2 || null,
        city: local.city || null,
        state: local.state || null,
        postal_code: local.postalCode || null,
        country: local.country || null,
        membership_id: membershipId,
        promo_code: promoCodeGenerated,
        points: initialPoints,
        tier: initialTier,
        password: createPassword, // basic password storage
      }).select('*').single();

      if (error) {
        console.error("Supabase user insert error", error);
        alert(
          "We couldn't create your profile at the moment. Please try again or contact us."
        );
        return;
      }


// Email member promo code (soft failure)
try {
  await fetch("/api/member-promo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: local.email,
      fullName: local.fullName,
      membershipId,
      promoCode: promoCodeGenerated,
    }),
  });
} catch (e) {
  console.error("member promo email failed", e);
}

setProfile({
  ...local,
  userId: createdRow?.id || null,
  membershipId,
  promoCode: promoCodeGenerated,
  points: initialPoints,
  tier: initialTier,
});

      if (local.email) newsletterSignUp(local.email);
      setIsLoggedIn(true);
      setIsAdmin(
        local.email &&
          local.email.toLowerCase() === COMPANY.email.toLowerCase()
      );
      alert("Your profile has been created.");

      // Go back to main page to view vehicles
      if (typeof onProfileCreated === "function") {
        onProfileCreated();
      }
    } catch (err) {
      console.error("Create profile error", err);
      alert("We couldn't create your profile. Please try again.");
    }
  }

  // SAVE UPDATES for existing profile (no password change here)
  async function save() {
    if (!local.email) {
      alert("Email is required to save your profile.");
      return;
    }

    try {
      const { error } = await supabase.from("users").upsert(
        {
          email: local.email,
          full_name: local.fullName,
          phone: local.phone,
          drivers_license: local.driversLicense,
          license_expiry: local.licenseExpiry || null,
          address_line1: local.addressLine1 || null,
          address_line2: local.addressLine2 || null,
          city: local.city || null,
          state: local.state || null,
          postal_code: local.postalCode || null,
          country: local.country || null,
          membership_id: local.membershipId || null,
          promo_code: local.promoCode || null,
          points: Number(local.points || 0),
          tier: Number(local.tier || calcTier(local.points || 0)),
        },
        { onConflict: "email" }
      );

      if (error) {
        console.error("Supabase user upsert error", error);
        alert("We couldn't save your profile. Please try again.");
        return;
      }

      setProfile(local);
      if (local.email) newsletterSignUp(local.email);
      alert("Profile saved.");
    } catch (err) {
      console.error("Save profile error", err);
      alert("We couldn't save your profile. Please try again.");
    }
  }

  // FLEET ADMIN HELPERS (unchanged)
  function updateVehicleField(id, field, value) {
    setDrafts((current) =>
      current.map((v) =>
        v.id === id
          ? {
              ...v,
              [field]:
                field === "pricePerDay" || field === "seats"
                  ? Number(value) || 0
                  : field === "available"
                  ? value
                  : value,
            }
          : v
      )
    );
  }

  function saveFleetChanges() {
    setVehicles(drafts);
    alert(
      "Fleet updated (demo). In production these changes would be saved to your database."
    );
  }

  function handleAddVehicle(e) {
    e.preventDefault();
    if (!newVehicle.name || !newVehicle.category) {
      alert("Name and category are required.");
      return;
    }
    const id = "v" + Date.now();
    const vehicle = {
      ...newVehicle,
      id,
      seats: Number(newVehicle.seats) || 5,
      pricePerDay: Number(newVehicle.pricePerDay) || 0,
      available: true,
    };
    setVehicles((prev) => [...prev, vehicle]);
    setDrafts((prev) => [...prev, vehicle]);
    setNewVehicle({
      name: "",
      category: "",
      seats: 5,
      pricePerDay: 0,
      color: "",
      image: "",
      description: "",
    });
    alert("Vehicle added (demo).");
  }

  // ---------- UNAUTHENTICATED VIEW ----------
  if (!isLoggedIn) {
    return (
      <section className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-12">
        <h2 className="text-2xl font-bold text-zinc-900">Your profile</h2>
        <p className="text-zinc-600 mt-2 text-sm">
          Create or sign in to your Asani Rentals profile to save your details
          for faster reservations and personalized service.
        </p>

        <div className="mt-6 flex gap-4 border-b pb-4 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-3 py-1 rounded-full ${
              mode === "login"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`px-3 py-1 rounded-full ${
              mode === "create"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700"
            }`}
          >
            Create profile
          </button>
        </div>

        {mode === "login" ? (
          <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handleLogin}>
            <input
              type="email"
              required
              value={auth.email}
              onChange={(e) => setAuth({ ...auth, email: e.target.value })}
              placeholder="Email"
              className="p-3 border rounded text-sm"
            />
            <input
              type="password"
              required
              value={auth.password}
              onChange={(e) =>
                setAuth({ ...auth, password: e.target.value })
              }
              placeholder="Password"
              className="p-3 border rounded text-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
            >
              Sign in
            </button>
          </form>
        ) : (
          <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handleCreate}>
            <input
              value={local.fullName}
              onChange={(e) =>
                setLocal({ ...local, fullName: e.target.value })
              }
              placeholder="Full name"
              className="p-3 border rounded text-sm"
              required
            />
            <input
              type="email"
              value={local.email}
              onChange={(e) => setLocal({ ...local, email: e.target.value })}
              placeholder="Email"
              className="p-3 border rounded text-sm"
              required
            />
            <input
              value={local.phone}
              onChange={(e) => setLocal({ ...local, phone: e.target.value })}
              placeholder="Mobile phone"
              className="p-3 border rounded text-sm"
            />
            <input
              value={local.driversLicense}
              onChange={(e) =>
                setLocal({ ...local, driversLicense: e.target.value })
              }
              placeholder="Driver's license number"
              className="p-3 border rounded text-sm"
            />
            <label className="text-xs text-zinc-600">
              License expiry
              <input
                type="date"
                value={local.licenseExpiry}
                onChange={(e) =>
                  setLocal({ ...local, licenseExpiry: e.target.value })
                }
                className="mt-1 p-3 border rounded text-sm w-full"
              />
            </label>
            <label className="text-xs text-zinc-600">
              Create password
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                placeholder="At least 6 characters"
                className="mt-1 p-3 border rounded text-sm w-full"
                required
              />
            </label>
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
            >
              Create profile
            </button>
          </form>
        )}
      </section>
    );
  }

  // ---------- LOGGED-IN VIEW ----------
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
      <h2 className="text-2xl font-bold text-zinc-900">
        Welcome{local.fullName ? `, ${local.fullName}` : ""}.
      </h2>
      <p className="text-zinc-600 mt-2 text-sm">
        Keep your details up to date for a smooth, white-glove rental experience.
      </p>

<div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
  <div className="rounded-2xl border bg-white p-4">
    <div className="text-xs text-zinc-500">Membership ID</div>
    <div className="mt-1 font-semibold text-zinc-900">
      {local.membershipId || "—"}
    </div>
    <div className="mt-2 text-[11px] text-zinc-500">
      Your unique member number for priority support & perks.
    </div>
  </div>
  <div className="rounded-2xl border bg-white p-4">
    <div className="text-xs text-zinc-500">Points</div>
    <div className="mt-1 font-semibold text-zinc-900">
      {Number(local.points || 0)}
    </div>
    <div className="mt-2 text-[11px] text-zinc-500">
      Tier: {tierName(local.tier || calcTier(local.points || 0))} • Exclusive pricing{" "}
      {Math.round(tierDiscountPct(local.tier || calcTier(local.points || 0)) * 100)}% off
    </div>
  </div>
  <div className="rounded-2xl border bg-white p-4">
    <div className="text-xs text-zinc-500">Your 10% promo code</div>
    <div className="mt-1 font-semibold text-zinc-900">
      {local.promoCode || "—"}
    </div>
    <div className="mt-2 text-[11px] text-zinc-500">
      Use at checkout anytime.
    </div>
  </div>
</div>

<div className="mt-6 rounded-2xl border bg-white p-5">
  <div className="flex items-center justify-between gap-4">
    <div>
      <h3 className="text-sm font-semibold text-zinc-900">Wishlist</h3>
      <p className="text-xs text-zinc-600 mt-1">
        Save vehicles and view them here under your profile.
      </p>
    </div>
    <button
      type="button"
      onClick={() => refreshWishlist(profile?.userId)}
      className="rounded-lg border px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
    >
      Refresh
    </button>
  </div>

  {wishlistLoading ? (
    <div className="mt-4 text-sm text-zinc-600">Loading…</div>
  ) : wishlist.length === 0 ? (
    <div className="mt-4 text-sm text-zinc-600">No saved vehicles yet.</div>
  ) : (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {wishlist.map((w) => (
        <div key={w.id} className="rounded-2xl border overflow-hidden bg-white">
          {w.vehicle_image ? (
            <img
              src={w.vehicle_image}
              alt={w.vehicle_name || "Saved vehicle"}
              className="h-36 w-full object-cover"
            />
          ) : (
            <div className="h-36 w-full bg-zinc-100" />
          )}
          <div className="p-4">
            <div className="font-semibold text-zinc-900 text-sm">
              {w.vehicle_name}
            </div>
            <div className="text-xs text-zinc-600 mt-1">
              {w.vehicle_category} • ${Number(w.vehicle_price || 0)}/day
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  // Optional: jump to booking by selecting vehicle from current fleet
                  const v = (vehicles || []).find((x) => x.id === (w.car_id || w.vehicle_id));
                  if (v) {
                    alert("Go to Vehicles to reserve this car.");
                  } else {
                    alert("This vehicle is not currently in the active fleet list.");
                  }
                }}
                className="flex-1 rounded-lg bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-900"
              >
                Reserve
              </button>
              <button
                type="button"
                onClick={() => removeFromWishlist(w.id)}
                className="rounded-lg border px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      {/* Profile form */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">
            Contact details
          </h3>
          <input
            value={local.fullName}
            onChange={(e) =>
              setLocal({ ...local, fullName: e.target.value })
            }
            placeholder="Full name"
            className="p-3 border rounded text-sm w-full"
          />
          <input
            value={local.email}
            onChange={(e) => setLocal({ ...local, email: e.target.value })}
            placeholder="Email"
            className="p-3 border rounded text-sm w-full"
          />
          <input
            value={local.phone}
            onChange={(e) => setLocal({ ...local, phone: e.target.value })}
            placeholder="Mobile phone"
            className="p-3 border rounded text-sm w-full"
          />

          <h3 className="mt-4 text-sm font-semibold text-zinc-900">
            Driver&apos;s license
          </h3>
          <input
            value={local.driversLicense}
            onChange={(e) =>
              setLocal({ ...local, driversLicense: e.target.value })
            }
            placeholder="License number"
            className="p-3 border rounded text-sm w-full"
          />
          <label className="text-xs text-zinc-600">
            License expiry
            <input
              type="date"
              value={local.licenseExpiry}
              onChange={(e) =>
                setLocal({ ...local, licenseExpiry: e.target.value })
              }
              className="mt-1 p-3 border rounded text-sm w-full"
            />
          </label>
        </div>

        {/* Address side */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">Address</h3>
          <input
            value={local.addressLine1}
            onChange={(e) =>
              setLocal({ ...local, addressLine1: e.target.value })
            }
            placeholder="Street address"
            className="p-3 border rounded text-sm w-full"
          />
          <input
            value={local.addressLine2}
            onChange={(e) =>
              setLocal({ ...local, addressLine2: e.target.value })
            }
            placeholder="Apt, suite, building (optional)"
            className="p-3 border rounded text-sm w-full"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={local.city}
              onChange={(e) =>
                setLocal({ ...local, city: e.target.value })
              }
              placeholder="City"
              className="p-3 border rounded text-sm w-full"
            />
            <input
              value={local.state}
              onChange={(e) =>
                setLocal({ ...local, state: e.target.value })
              }
              placeholder="State / Province"
              className="p-3 border rounded text-sm w-full"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={local.postalCode}
              onChange={(e) =>
                setLocal({ ...local, postalCode: e.target.value })
              }
              placeholder="ZIP / Postal code"
              className="p-3 border rounded text-sm w-full"
            />
            <input
              value={local.country}
              onChange={(e) =>
                setLocal({ ...local, country: e.target.value })
              }
              placeholder="Country"
              className="p-3 border rounded text-sm w-full"
            />
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={save}
              className="px-5 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
            >
              Save profile
            </button>
            <button
              onClick={() =>
                setLocal(
                  normalizeUserRow(
                    {
                      full_name: profile?.fullName,
                      email: profile?.email,
                      phone: profile?.phone,
                      drivers_license: profile?.driversLicense,
                      license_expiry: profile?.licenseExpiry,
                      address_line1: profile?.addressLine1,
                      address_line2: profile?.addressLine2,
                      city: profile?.city,
                      state: profile?.state,
                      postal_code: profile?.postalCode,
                      country: profile?.country,
                    },
                    profile?.email
                  )
                )
              }
              className="px-5 py-3 rounded-2xl border text-sm"
            >
              Reset changes
            </button>
          </div>
        </div>
      </div>

      {/* Admin fleet section (same as before) */}
      {isAdmin && (
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-semibold text-zinc-900">
            Admin — Fleet management
          </h3>
          <p className="text-zinc-600 mt-2 text-sm">
            Update pricing, availability, and add new vehicles. Changes apply
            immediately in this demo.
          </p>

          <div className="mt-6 space-y-6">
            <div className="p-4 border rounded-2xl bg-white overflow-auto">
              <h4 className="font-semibold text-zinc-900 mb-3 text-sm">
                Existing vehicles
              </h4>
              <div className="min-w-full text-xs sm:text-sm">
                <div className="grid grid-cols-7 gap-2 font-semibold text-zinc-700 mb-2">
                  <div>Name</div>
                  <div>Category</div>
                  <div>Price / day</div>
                  <div>Seats</div>
                  <div>Available</div>
                  <div>Color</div>
                  <div>Image URL</div>
                </div>
                {drafts.map((v) => (
                  <div key={v.id} className="grid grid-cols-7 gap-2 mb-2">
                    <input
                      value={v.name}
                      onChange={(e) =>
                        updateVehicleField(v.id, "name", e.target.value)
                      }
                      className="p-1 border rounded text-xs"
                    />
                    <input
                      value={v.category}
                      onChange={(e) =>
                        updateVehicleField(v.id, "category", e.target.value)
                      }
                      className="p-1 border rounded text-xs"
                    />
                    <input
                      type="number"
                      value={v.pricePerDay}
                      onChange={(e) =>
                        updateVehicleField(
                          v.id,
                          "pricePerDay",
                          e.target.value
                        )
                      }
                      className="p-1 border rounded text-xs"
                    />
                    <input
                      type="number"
                      value={v.seats}
                      onChange={(e) =>
                        updateVehicleField(v.id, "seats", e.target.value)
                      }
                      className="p-1 border rounded text-xs"
                    />
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={v.available !== false}
                        onChange={(e) =>
                          updateVehicleField(
                            v.id,
                            "available",
                            e.target.checked
                          )
                        }
                      />
                    </div>
                    <input
                      value={v.color || ""}
                      onChange={(e) =>
                        updateVehicleField(v.id, "color", e.target.value)
                      }
                      className="p-1 border rounded text-xs"
                    />
                    <input
                      value={v.image || ""}
                      onChange={(e) =>
                        updateVehicleField(v.id, "image", e.target.value)
                      }
                      className="p-1 border rounded text-xs"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={saveFleetChanges}
                  className="px-4 py-2 rounded-2xl bg-black text-white text-xs font-semibold"
                >
                  Save changes
                </button>
              </div>
            </div>

            <div className="p-4 border rounded-2xl bg-white">
              <h4 className="font-semibold text-zinc-900 mb-3 text-sm">
                Add new vehicle
              </h4>
              <form
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
                onSubmit={handleAddVehicle}
              >
                <input
                  value={newVehicle.name}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, name: e.target.value })
                  }
                  placeholder="Name (e.g. BMW X1 M Package)"
                  className="p-2 border rounded"
                  required
                />
                <input
                  value={newVehicle.category}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      category: e.target.value,
                    })
                  }
                  placeholder="Category (e.g. Premium SUV)"
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="number"
                  value={newVehicle.pricePerDay}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      pricePerDay: e.target.value,
                    })
                  }
                  placeholder="Price per day"
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  value={newVehicle.seats}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, seats: e.target.value })
                  }
                  placeholder="Seats"
                  className="p-2 border rounded"
                />
                <input
                  value={newVehicle.color}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, color: e.target.value })
                  }
                  placeholder="Color"
                  className="p-2 border rounded"
                />
                <input
                  value={newVehicle.image}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, image: e.target.value })
                  }
                  placeholder="Image URL (optional)"
                  className="p-2 border rounded"
                />
                <textarea
                  value={newVehicle.description}
                  onChange={(e) =>
                    setNewVehicle({
                      ...newVehicle,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description"
                  className="sm:col-span-2 p-2 border rounded"
                  rows={3}
                />
                <div className="sm:col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-2xl bg-black text-white text-xs font-semibold"
                  >
                    Add vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ========= CHAUFFEUR =========
function ChauffeurRequest({ profile }) {
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      serviceType: formData.get("serviceType"),
      date: formData.get("date"),
      time: formData.get("time"),
      passengers: formData.get("passengers"),
      hours: formData.get("hours"),
      pickup: formData.get("pickup"),
      dropoff: formData.get("dropoff"),
      notes: formData.get("notes"),
      to: COMPANY.email,
    };

    try {
      const res = await fetch("/api/chauffeur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      alert(
        "Your chauffeur request has been received. Our team will contact you to confirm availability and pricing."
      );
      e.target.reset();
    } catch (err) {
      console.error("Chauffeur request error", err);
      alert(
        "We had a problem submitting your request. Please try again or contact us directly at " +
          COMPANY.email
      );
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-12">
      <h2 className="text-2xl font-bold text-zinc-900">Chauffeur services</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Request a professional chauffeur for a Sprinter, black SUV, elite
        luxury sedan, or our{" "}
        <span className="font-semibold">armed chauffeur</span> option for
        elevated security.
      </p>
      <form
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6 border rounded-2xl bg-white"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Full name
          <input
            name="name"
            className="mt-2 p-2 border rounded text-sm"
            required
            placeholder="John Doe"
            defaultValue={profile?.fullName || ""}
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Email
          <input
            name="email"
            type="email"
            className="mt-2 p-2 border rounded text-sm"
            required
            placeholder="you@domain.com"
            defaultValue={profile?.email || ""}
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Phone
          <input
            name="phone"
            className="mt-2 p-2 border rounded text-sm"
            required
            placeholder="(555) 555-5555"
            defaultValue={profile?.phone || ""}
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Service type
          <select
            name="serviceType"
            className="mt-2 p-2 border rounded text-sm"
            defaultValue="sprinter"
          >
            <option value="sprinter">Sprinter</option>
            <option value="black-suv">Black truck / black SUV</option>
            <option value="elite-luxury">Elite luxury sedan</option>
            <option value="armed-chauffeur">
              Armed chauffeur (licensed protection)
            </option>
          </select>
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Date
          <input
            name="date"
            type="date"
            className="mt-2 p-2 border rounded text-sm"
            required
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Time
          <input
            name="time"
            type="time"
            className="mt-2 p-2 border rounded text-sm"
            required
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Number of passengers
          <input
            name="passengers"
            type="number"
            min="1"
            className="mt-2 p-2 border rounded text-sm"
            placeholder="2"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Estimated hours
          <input
            name="hours"
            type="number"
            min="1"
            className="mt-2 p-2 border rounded text-sm"
            placeholder="4"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-2">
          Pick-up location
          <input
            name="pickup"
            className="mt-2 p-2 border rounded text-sm"
            required
            placeholder="Hotel / address / airport"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-2">
          Drop-off or itinerary
          <input
            name="dropoff"
            className="mt-2 p-2 border rounded text-sm"
            required
            placeholder="Destination or brief itinerary"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-2">
          Notes
          <textarea
            name="notes"
            rows={4}
            className="mt-2 p-2 border rounded text-sm"
            placeholder="Flight details, occasion (wedding, corporate, night out), security needs, or special requests."
          />
        </label>
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-black text-white text-sm font-semibold"
          >
            Submit request
          </button>
        </div>
      </form>
    </section>
  );
}

// ========= CONTACT =========
function Contact() {
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      to: COMPANY.email,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Request failed");
      alert("Message sent. We'll be in touch shortly.");
      e.target.reset();
    } catch (err) {
      console.error("Contact error", err);
      alert(
        "We had a problem submitting your message. Please try again or email us directly at " +
          COMPANY.email
      );
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-12">
      <h2 className="text-2xl font-bold text-zinc-900">Contact</h2>
      <div className="mt-4 text-zinc-600 text-sm">
        For reservations, partnerships, and corporate accounts:
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 border rounded-2xl bg-white text-sm">
          <h3 className="font-semibold text-zinc-900">Asani Rentals</h3>
          <p className="mt-2 text-zinc-700">{COMPANY.tagline}</p>
          <p className="mt-1 text-zinc-700">{COMPANY.address}</p>
          <p className="mt-1 text-zinc-700">{COMPANY.phone}</p>
          <p className="mt-1 text-zinc-700">{COMPANY.email}</p>
        </div>
        <form
          className="p-6 border rounded-2xl bg-white text-sm"
          onSubmit={handleSubmit}
        >
          <label className="flex flex-col text-sm text-zinc-700">
            Name
            <input
              name="name"
              className="mt-2 p-2 border rounded text-sm"
              required
            />
          </label>
          <label className="flex flex-col mt-3 text-sm text-zinc-700">
            Email
            <input
              name="email"
              className="mt-2 p-2 border rounded text-sm"
              required
              type="email"
            />
          </label>
          <label className="flex flex-col mt-3 text-sm text-zinc-700">
            Message
            <textarea
              name="message"
              className="mt-2 p-2 border rounded text-sm"
              rows={4}
              required
            />
          </label>
          <div className="mt-4">
            <button className="px-4 py-2 rounded-2xl bg-black text-white text-sm">
              Send message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

// ========= NEWSLETTER =========
function NewsletterForm({ onSign }) {
  const [email, setEmail] = useState("");

    function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    onSign(email);
    setEmail("");
    alert(
      "You’re all set. We’ll email you exclusive rates, upgrades, and new vehicle alerts from Asani Rentals."
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <input
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@domain.com"
        className="w-full p-3 border rounded text-sm"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-2xl bg-black text-white text-sm"
        >
          Subscribe
        </button>
      </div>
    </form>
  );
}

// ========= ROOT APP =========
function App() {
  const [route, setRoute] = useState("home");
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES);
  const [selected, setSelected] = useState(null);
    const [profile, setProfile] = useState(null);

const [showPromoPopup, setShowPromoPopup] = useState(false);
const [promoPrefillEmail, setPromoPrefillEmail] = useState("");


  function handleSignOut() {
    setProfile(null);
    // If later you store tokens/localStorage, clear them here too.
  }


useEffect(() => {
  // Show 10% off popup once per visitor (additive)
  const dismissed = getCookie("asani_promo_dismissed");
  if (!profile?.email && !dismissed) {
    setShowPromoPopup(true);
  }
}, [profile?.email]);

  const [bookings, setBookings] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("price-asc");

  function newsletterSignUp(email) {
    if (!email) return;
    setNewsletter((s) => (s.includes(email) ? s : [...s, email]));
    console.log("Newsletter sign-up:", email);
  }

  function handleBookingComplete(booking) {
    setBookings((b) => [...b, booking]);
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === booking.vehicleId ? { ...v, available: false } : v
      )
    );
    setSelected(null);
    setRoute("home");
  }
async function handleSaveWishlist(vehicle) {
  try {
    // User must be logged in / have a profile
    if (!profile || !profile.email) {
      alert(
        "Please create or sign in to your profile before saving vehicles to your wishlist."
      );
      return;
    }

    // Resolve the user's internal id (users.id) to match wishlist.user_id
    let userId = profile.userId || null;
    if (!userId) {
      const { data: urow, error: uerr } = await supabase
        .from("users")
        .select("id")
        .eq("email", profile.email)
        .maybeSingle();
      if (uerr) {
        console.error("User id lookup failed", uerr);
      }
      userId = urow?.id || null;
    }

    if (!userId) {
      alert("Please save your profile first, then try again.");
      return;
    }

    // Prevent duplicates (works with UNIQUE(user_id, car_id))
    const { data: existing, error: exErr } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("car_key", vehicle.id)
      .maybeSingle();

    if (exErr) {
      console.error("Wishlist duplicate check error", exErr);
    }

    if (existing?.id) {
      alert("This vehicle is already in your wishlist.");
      return;
    }

    const { error } = await supabase.from("wishlist").insert({
      user_id: userId,
      car_key: vehicle.id,
    });

    if (error) {
      console.error("Supabase wishlist insert error", error);
      alert(
        "We couldn't save this vehicle to your wishlist. Please try again or contact us."
      );
      return;
    }

    alert("Saved to your wishlist.");
    await refreshWishlist(userId);
  } catch (err) {
    console.error("Wishlist save error", err);
    alert(
      "We couldn't save this vehicle to your wishlist. Please try again or contact us."
    );
  }
}

  const categories = vehicles.map((v) => v.category);
  const filteredSortedVehicles = applyVehicleFilters(
    vehicles,
    filterCategory,
    sortOrder
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 text-zinc-900 flex flex-col">
     <Header
  onNav={(r) => {
    setRoute(r);
    setSelected(null);
  }}
  profile={profile}
  onSignOut={handleSignOut}
/>

<PromoPopup
  open={showPromoPopup}
  onClose={() => setShowPromoPopup(false)}
  defaultEmail={promoPrefillEmail}
  onSignup={(email) => {
    setPromoPrefillEmail(email || "");
    setShowPromoPopup(false);
    setRoute("profile");
  }}
/>

      
      {route === "home" && (
        <>
          <Hero onNav={(r) => setRoute(r)} />
                    <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
            <FleetFilters
              categories={categories}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
            <VehiclesPage
              vehicles={filteredSortedVehicles}
              onSelect={(v) => {
                setSelected(v);
                setRoute("book");
              }}
              onSave={handleSaveWishlist}
              canReserve={true}
            />
          </section>
          <section className="max-w-6xl mx-auto px-4 md:px-6 pb-12 flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-6 border rounded-2xl shadow-sm bg-white">
              <h3 className="font-bold text-xl text-zinc-900">Why Asani</h3>
              <p className="mt-3 text-sm text-zinc-600">
                From premium economy to top-tier exotics, our curated fleet,
                white-glove handoff, and corporate-friendly policies make us the
                preferred partner for business travel, events, and private
                getaways.
              </p>
            </div>
            <div className="w-full md:w-96 p-6 border rounded-2xl shadow-sm bg-white">
              <h3 className="font-bold text-zinc-900">Sign up for offers</h3>
              <p className="text-sm text-zinc-600 mt-2">
                Exclusive rates, last-minute upgrades, and early access to new
                vehicles.
              </p>
              <NewsletterForm onSign={newsletterSignUp} />
            </div>
          </section>
        </>
      )}

      {route === "vehicles" && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
            Fleet
          </h2>
          <p className="text-zinc-600 mt-2 text-sm md:text-base">
            Explore our full range of premium economy, luxury, and exotic
            rentals.
          </p>
                   <FleetFilters
            categories={categories}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
          <VehiclesPage
            vehicles={filteredSortedVehicles}
            onSave={handleSaveWishlist}
            canReserve={false}
          />
</section>
      )}

      {route === "book" && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12">
          <h2 className="text-2xl font-bold text-zinc-900">Reserve</h2>
          <p className="text-zinc-600 mt-2 text-sm">
            Filter by vehicle type, sort by price, then select a vehicle to
            begin. A security deposit is collected at booking to hold your
            reservation.
          </p>
          <FleetFilters
            categories={categories}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
                   <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSortedVehicles.map((v) => (
              <VehicleCard
                key={v.id}
                v={v}
                onSelect={(vv) => setSelected(vv)}
                onSave={handleSaveWishlist}
                canReserve={true}
              />
            ))}
          </div>
          {selected && (
            <BookingPanel
              vehicle={selected}
              onBack={() => setSelected(null)}
              onComplete={handleBookingComplete}
              profile={profile}
            />
          )}
        </section>
      )}

      {route === "profile" && (
  <ProfilePage
    profile={profile}
    setProfile={setProfile}
    newsletterSignUp={newsletterSignUp}
    vehicles={vehicles}
    setVehicles={setVehicles}
    onProfileCreated={() => setRoute("home")} // 👈 go to home after creating profile
    promoPrefillEmail={promoPrefillEmail}
  />
)}
      
      {route === "chauffeur" && <ChauffeurRequest profile={profile} />}

      {route === "contact" && <Contact />}

      <footer className="border-t border-zinc-800 mt-12 bg-black">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-400">
          <div className="space-y-1 text-center sm:text-left">
            <div>
              © {new Date().getFullYear()} {COMPANY.name}
            </div>
            <div className="text-xs text-zinc-500">{COMPANY.tagline}</div>
          </div>
          <div className="mt-4 sm:mt-0 text-center sm:text-right space-y-1 text-xs md:text-sm">
            <div>{COMPANY.address}</div>
            <div>Phone: {COMPANY.phone}</div>
            <div>Email: {COMPANY.email}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
