import React, { useState, useEffect } from "react";

// Asani Rentals - Single-file React app
// Tailwind CSS assumed.

const COMPANY = {
  name: "Asani Rentals",
  address: "1001 S Main #8227, Kalispell, MT 59901",
  phone: "732-470-8233",
  email: "reserve@rentwithasani.com",
};

// Using Unsplash "featured" URLs so images are stable & always return something.
const SAMPLE_VEHICLES = [
  {
    id: "v001",
    name: "BMW X1 M Package",
    category: "Premium Economy SUV",
    seats: 5,
    pricePerDay: 120,
    color: "Estoril Blue Metallic",
    image: "https://www.nicepng.com/png/detail/379-3798850_x1trans-bmw-x1-2017-white.png",
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
    image: "https://vexstockimages.fastly.carvana.io/stockimages/2023_HONDA_CR-V%20HYBRID_SPORT%20TOURING%20SPORT%20UTILITY%204D_BEIGE_stock_desktop_1920x1080.png?v=1680131793.405&width=680",
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
    image: "https://cdn.jdpower.com/ChromeImageGallery/Expanded/Transparent/640/2023NIC10_640/2023NIC100001_640_01.png",
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
    image: "https://dealerimages.dealereprocess.com/image/upload/c_limit,f_auto,fl_lossy,w_500/v1/svp/dep/21kiafortelxssd3t/kia_21fortelxssd3t_angularfront_gravitygray",
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
      "https://static.wixstatic.com/media/34f039_9c7fb6f21ab645e6bb88188e55202640~mv2.png/v1/fill/w_800,h_800,al_c/Urus.png",
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
    image: "https://media.chromedata.com/MediaGallery/media/MjkzOTU4Xk1lZGlhIEdhbGxlcnk/DDcY5uJ1Hoc2PfKiaPzOoTor54RCDSxmNSMjhIMjMcSABjV1Plsg4az8WgGOqVD42Px_fBnRGfbq6YMoQr9Bwgwa4vs3hsjk7OZwcAD2au-Xj2_jOK1rejFnAEpjN8liQtu0_zWdBrt_zZ94kYd0yB-LZ9J239IX_tK5l7rorkk7c-qGpYTQuQ/cc_2025BMC222011556_01_640_668.png",
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
      "Flagship Mercedes sedan with first-class comfort, ambient lighting, and a true chauffeured-experience rear seat.",
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
      "https://file.kelleybluebookimages.com/kbb/base/evox/CP/55025/2024-Cadillac-Escalade%20ESV-front_55025_032_2400x1800_GBA.png",
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

// Slides for the hero carousel on the home page
const HERO_SLIDES = [
  {
    id: "s1",
    title: "Lamborghini Urus",
    subtitle: "Super SUV • 1500/day • Limited availability",
    image:
      "https://static.wixstatic.com/media/34f039_9c7fb6f21ab645e6bb88188e55202640~mv2.png/v1/fill/w_800,h_800,al_c/Urus.png",
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
      "https://file.kelleybluebookimages.com/kbb/base/evox/CP/55025/2024-Cadillac-Escalade%20ESV-front_55025_032_2400x1800_GBA.png",
  },
  {
    id: "s5",
    title: "BMW X1 M Package",
    subtitle: "Premium economy SUV • Estoril Blue Metallic",
    image: "https://www.nicepng.com/png/detail/379-3798850_x1trans-bmw-x1-2017-white.png",
  },
];

function formatCurrency(n) {
  return `$${n.toFixed(2)}`;
}

// Helper to filter & sort vehicles
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

function Header({ onNav }) {
  return (
    <header className="w-full bg-black text-white border-b border-zinc-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">
            {COMPANY.name}
          </h1>
          <div className="text-xs text-zinc-400">
            {COMPANY.address} • {COMPANY.phone}
          </div>
        </div>
        <nav className="space-x-4 text-sm">
          <button onClick={() => onNav("home")} className="hover:text-zinc-200">
            Home
          </button>
          <button
            onClick={() => onNav("vehicles")}
            className="hover:text-zinc-200"
          >
            Vehicles
          </button>
          <button onClick={() => onNav("book")} className="hover:text-zinc-200">
            Reserve
          </button>
          <button
            onClick={() => onNav("chauffeur")}
            className="hover:text-zinc-200"
          >
            Chauffeur
          </button>
          <button
            onClick={() => onNav("profile")}
            className="hover:text-zinc-200"
          >
            Profile
          </button>
          <button
            onClick={() => onNav("contact")}
            className="hover:text-zinc-200"
          >
            Contact
          </button>
        </nav>
      </div>
    </header>
  );
}

function Hero({ onNav }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="bg-black text-white py-16 md:py-24 border-b border-zinc-900">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p className="text-xs tracking-[0.25em] uppercase text-zinc-400">
            Premium Economy • Luxury Rentals
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Premium economy to luxury rentals
            <span className="block text-zinc-300 font-normal">
              for business, events & private travel.
            </span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400 max-w-md">
            A curated range from premium economy to flagship luxury, seamless
            reservations, and white–glove service. Hold your vehicle instantly
            with a secure deposit and arrive in style, every time.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onNav("book")}
              className="px-7 py-3 rounded-2xl bg-white text-black font-semibold text-sm tracking-wide uppercase"
            >
              Reserve now
            </button>
            <button
              onClick={() => onNav("vehicles")}
              className="px-7 py-3 rounded-2xl border border-zinc-600 text-sm font-medium text-zinc-200"
            >
              View fleet
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-zinc-900 to-zinc-700 blur-xl opacity-60" />
          <div className="relative rounded-3xl overflow-hidden border border-zinc-700 shadow-2xl h-80">
            <div
              className="flex h-full w-full transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {HERO_SLIDES.map((slide) => (
                <div key={slide.id} className="min-w-full h-80 relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between text-xs text-zinc-200">
                    <div>
                      <div className="font-semibold text-sm md:text-base">
                        {slide.title}
                      </div>
                      <div className="text-zinc-400 text-[11px] md:text-xs">
                        {slide.subtitle}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-semibold text-sm">
                        Chauffeur & self-drive options
                      </div>
                      <div className="text-emerald-400 text-[11px]">
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

function VehicleCard({ v, onSelect, canReserve = true }) {
  return (
    <div className="border border-zinc-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-zinc-800 transition-all duration-200 bg-white">
      <img src={v.image} alt={v.name} className="w-full h-44 object-cover" />
      <div className="p-5">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="font-semibold text-zinc-900 tracking-tight">
              {v.name}
            </h3>
            <div className="text-xs text-zinc-500 mt-1">
              {v.category} • {v.seats} seats
              {v.color ? " • " + v.color : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-zinc-900">
              {formatCurrency(v.pricePerDay)}/day
            </div>
            <div
              className={`text-xs mt-1 ${
                v.available ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {v.available ? "Available" : "Unavailable"}
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-600 leading-relaxed line-clamp-3">
          {v.description}
        </p>
        <div className="mt-5 flex gap-3">
          {canReserve && (
            <button
              disabled={!v.available}
              onClick={() => onSelect && onSelect(v)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium border transition ${
                v.available
                  ? "bg-black text-white border-black hover:bg-zinc-900"
                  : "bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed"
              }`}
            >
              Reserve
            </button>
          )}
          <button
            onClick={() => alert("Saved to wishlist (demo)")}
            className="px-4 py-2 rounded-2xl text-sm font-medium border border-zinc-200 text-zinc-700 hover:border-zinc-800 hover:text-zinc-900 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function VehiclesPage({ vehicles, onSelect, canReserve = true }) {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-zinc-900">Fleet</h2>
      <p className="text-zinc-600 mt-2">
        Hand-picked premium economy and luxury vehicles for every occasion.
      </p>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {vehicles.map((v) => (
          <VehicleCard
            key={v.id}
            v={v}
            onSelect={onSelect}
            canReserve={canReserve}
          />
        ))}
      </div>
    </section>
  );
}

function BookingPanel({ vehicle, onBack, onComplete }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deposit, setDeposit] = useState(350);
  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [insurance, setInsurance] = useState("none"); // "none" | "asani" (third-party protection)
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

  useEffect(() => {
    if (vehicle) {
      setDeposit(350);
    }
  }, [vehicle]);

  if (!vehicle) return null;

  function daysBetween(a, b) {
    const A = new Date(a);
    const B = new Date(b);
    const diff = Math.ceil((B - A) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const billableDays = days || 1;
  const subtotal = vehicle.pricePerDay * billableDays;

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

  function handlePay() {
    if (!startDate || !endDate) {
      alert("Please select your start and end dates.");
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
      },
    };

    alert("Demo mode: deposit not actually charged. Booking saved locally.");
    onComplete(booking);
  }

  function toggleAmenity(key) {
    setAmenities((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onBack} className="text-sm text-zinc-500 mb-4">
          ← Back
        </button>
        <h3 className="text-2xl font-bold text-zinc-900">
          Reserve — {vehicle.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          A $350 security deposit is collected now to hold your reservation.
          Rental charges and any extras are settled at vehicle pickup.
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col text-sm text-zinc-700">
            Start date
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 p-2 border rounded"
            />
          </label>
          <label className="flex flex-col text-sm text-zinc-700">
            End date
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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

        <div className="mt-6 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-zinc-900">
              Optional protection & extras
            </h4>

            <div className="mt-3 space-y-3 text-sm text-zinc-700">
              {/* Protection plan */}
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
                    stated in their policy wording. Exact coverage, deductibles,
                    territories, and exclusions are defined by Rental Car Cover
                    in the documentation you receive from them — always review
                    their policy and your rental agreement carefully before
                    deciding to add or decline this protection.
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

              {/* EZ-Pass / toll device */}
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

              {/* Prepaid fuel */}
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

              {/* Amenities & child seats */}
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
            </div>
          </div>

          <div className="border rounded-2xl p-4 bg-zinc-50 flex flex-col justify-between">
            <div className="space-y-2 text-sm text-zinc-700">
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
                <span className="text-xs text-zinc-600">Deposit due now</span>
                <span className="font-semibold text-base text-zinc-900">
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

function ProfilePage({
  profile,
  setProfile,
  newsletterSignUp,
  vehicles,
  setVehicles,
}) {
  const [local, setLocal] = useState(
    profile || {
      fullName: "",
      email: "",
      phone: "",
      driversLicense: "",
    }
  );
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState("login"); // "login" or "create"
  const [isAdmin, setIsAdmin] = useState(false);
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

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auth),
      });

      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        if (data.profile) {
          setLocal(data.profile);
        }
        if (
          auth.email &&
          auth.email.toLowerCase() === COMPANY.email.toLowerCase()
        ) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        return;
      }
    } catch (err) {
      console.error("Login error", err);
    }

    alert("Logged in (demo). No real authentication configured yet.");
    setIsLoggedIn(true);
    if (auth.email && auth.email.toLowerCase() === COMPANY.email.toLowerCase()) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }

  function handleCreate(e) {
    e.preventDefault();
    setProfile(local);
    if (local.email) newsletterSignUp(local.email);
    setIsLoggedIn(true);
    if (
      local.email &&
      local.email.toLowerCase() === COMPANY.email.toLowerCase()
    ) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    alert(
      "Profile created (demo). In production this will create a secure account."
    );
  }

  function save() {
    setProfile(local);
    if (local.email) newsletterSignUp(local.email);
    alert("Profile saved (demo)");
  }

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

  if (!isLoggedIn) {
    return (
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-zinc-900">Your profile</h2>
        <p className="text-zinc-600 mt-2 text-sm">
          Sign in to your existing profile or create a new one to save your
          details for faster reservations.
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
          <form
            className="mt-6 grid grid-cols-1 gap-4"
            onSubmit={handleLogin}
          >
            <input
              type="email"
              required
              value={auth.email}
              onChange={(e) => setAuth({ ...auth, email: e.target.value })}
              placeholder="Email"
              className="p-3 border rounded"
            />
            <input
              type="password"
              required
              value={auth.password}
              onChange={(e) => setAuth({ ...auth, password: e.target.value })}
              placeholder="Password"
              className="p-3 border rounded"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
            >
              Sign in
            </button>
            <p className="text-xs text-zinc-500">
              In production, connect this form to your real auth API (JWT /
              session based) to allow customers to log in and manage their
              rentals securely.
            </p>
          </form>
        ) : (
          <form
            className="mt-6 grid grid-cols-1 gap-4"
            onSubmit={handleCreate}
          >
            <input
              value={local.fullName}
              onChange={(e) =>
                setLocal({ ...local, fullName: e.target.value })
              }
              placeholder="Full name"
              className="p-3 border rounded"
              required
            />
            <input
              type="email"
              value={local.email}
              onChange={(e) =>
                setLocal({ ...local, email: e.target.value })
              }
              placeholder="Email"
              className="p-3 border rounded"
              required
            />
            <input
              value={local.phone}
              onChange={(e) =>
                setLocal({ ...local, phone: e.target.value })
              }
              placeholder="Phone"
              className="p-3 border rounded"
            />
            <input
              value={local.driversLicense}
              onChange={(e) =>
                setLocal({ ...local, driversLicense: e.target.value })
              }
              placeholder="Driver's license #"
              className="p-3 border rounded"
            />
            <input
              type="password"
              placeholder="Create a password"
              className="p-3 border rounded"
              required
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
            >
              Create profile
            </button>
            <p className="text-xs text-zinc-500">
              In production, this form should create a secure customer account
              in your backend and authentication system.
            </p>
          </form>
        )}
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-zinc-900">Your profile</h2>
      <p className="text-zinc-600 mt-2 text-sm">
        Save your details for faster reservations and tailored offers.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 max-w-xl">
        <input
          value={local.fullName}
          onChange={(e) => setLocal({ ...local, fullName: e.target.value })}
          placeholder="Full name"
          className="p-3 border rounded"
        />
        <input
          value={local.email}
          onChange={(e) => setLocal({ ...local, email: e.target.value })}
          placeholder="Email"
          className="p-3 border rounded"
        />
        <input
          value={local.phone}
          onChange={(e) => setLocal({ ...local, phone: e.target.value })}
          placeholder="Phone"
          className="p-3 border rounded"
        />
        <input
          value={local.driversLicense}
          onChange={(e) =>
            setLocal({ ...local, driversLicense: e.target.value })
          }
          placeholder="Driver's license #"
          className="p-3 border rounded"
        />
        <div className="flex gap-3">
          <button
            onClick={save}
            className="px-5 py-3 rounded-2xl bg-black text-white font-semibold text-sm"
          >
            Save profile
          </button>
          <button
            onClick={() => {
              setLocal({
                fullName: "",
                email: "",
                phone: "",
                driversLicense: "",
              });
            }}
            className="px-5 py-3 rounded-2xl border text-sm"
          >
            Reset
          </button>
        </div>
      </div>

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
                          updateVehicleField(v.id, "available", e.target.checked)
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

function ChauffeurRequest() {
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
        "Request submitted. Our team will contact you to confirm availability and pricing."
      );
      e.target.reset();
    } catch (err) {
      console.error("Chauffeur request error", err);
      alert(
        "Request submitted in demo mode. Connect /api/chauffeur on your backend to receive chauffeur inquiries at " +
          COMPANY.email
      );
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-zinc-900">Chauffeur services</h2>
      <p className="mt-2 text-sm text-zinc-600">
        Request a professional chauffeur for a Sprinter, black SUV, elite luxury
        sedan, or our{" "}
        <span className="font-semibold">armed chauffeur</span> option for
        elevated security.
      </p>
      <form
        className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border rounded-2xl bg-white"
        onSubmit={handleSubmit}
      >
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Full name
          <input
            name="name"
            className="mt-2 p-2 border rounded"
            required
            placeholder="John Doe"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Email
          <input
            name="email"
            type="email"
            className="mt-2 p-2 border rounded"
            required
            placeholder="you@domain.com"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Phone
          <input
            name="phone"
            className="mt-2 p-2 border rounded"
            required
            placeholder="(555) 555-5555"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-1">
          Service type
          <select
            name="serviceType"
            className="mt-2 p-2 border rounded"
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
            className="mt-2 p-2 border rounded"
            required
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Time
          <input
            name="time"
            type="time"
            className="mt-2 p-2 border rounded"
            required
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Number of passengers
          <input
            name="passengers"
            type="number"
            min="1"
            className="mt-2 p-2 border rounded"
            placeholder="2"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700">
          Estimated hours
          <input
            name="hours"
            type="number"
            min="1"
            className="mt-2 p-2 border rounded"
            placeholder="4"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-2">
          Pick-up location
          <input
            name="pickup"
            className="mt-2 p-2 border rounded"
            required
            placeholder="Hotel / address / airport"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-2">
          Drop-off or itinerary
          <input
            name="dropoff"
            className="mt-2 p-2 border rounded"
            required
            placeholder="Destination or brief itinerary"
          />
        </label>
        <label className="flex flex-col text-sm text-zinc-700 md:col-span-2">
          Notes
          <textarea
            name="notes"
            rows={4}
            className="mt-2 p-2 border rounded"
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
        "Message sent in demo mode. Connect /api/contact on your backend to receive emails at " +
          COMPANY.email
      );
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-zinc-900">Contact</h2>
      <div className="mt-4 text-zinc-600 text-sm">
        For reservations, partnerships, and corporate accounts:
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 border rounded-2xl bg-white">
          <h3 className="font-semibold text-zinc-900">Asani Rentals</h3>
          <p className="mt-2 text-sm text-zinc-700">{COMPANY.address}</p>
          <p className="mt-1 text-sm text-zinc-700">{COMPANY.phone}</p>
          <p className="mt-1 text-sm text-zinc-700">{COMPANY.email}</p>
        </div>
        <form className="p-6 border rounded-2xl bg-white" onSubmit={handleSubmit}>
          <label className="flex flex-col text-sm text-zinc-700">
            Name
            <input name="name" className="mt-2 p-2 border rounded" required />
          </label>
          <label className="flex flex-col mt-3 text-sm text-zinc-700">
            Email
            <input
              name="email"
              className="mt-2 p-2 border rounded"
              required
              type="email"
            />
          </label>
          <label className="flex flex-col mt-3 text-sm text-zinc-700">
            Message
            <textarea
              name="message"
              className="mt-2 p-2 border rounded"
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

function NewsletterForm({ onSign }) {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    onSign(email);
    setEmail("");
    alert("Signed up (demo). In production this will add you to our email list.");
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

function App() {
  const [route, setRoute] = useState("home");
  const [vehicles, setVehicles] = useState(SAMPLE_VEHICLES);
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [newsletter, setNewsletter] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("price-asc");

  function newsletterSignUp(email) {
    if (!email) return;
    setNewsletter((s) => (s.includes(email) ? s : [...s, email]));
    console.log("Newsletter sign-up (demo):", email);
  }

  function handleBookingComplete(booking) {
    setBookings((b) => [...b, booking]);
    // mark the vehicle as unavailable once booked
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === booking.vehicleId ? { ...v, available: false } : v
      )
    );
    alert("Reservation created (demo). A confirmation email would be sent.");
    setSelected(null);
    setRoute("home");
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
      />

      {route === "home" && (
        <>
          <Hero onNav={(r) => setRoute(r)} />
          <section className="max-w-6xl mx-auto px-6 py-12">
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
              canReserve={true}
            />
          </section>
          <section className="max-w-6xl mx-auto px-6 pb-12 flex flex-col md:flex-row gap-6">
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
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-zinc-900">Fleet</h2>
          <p className="text-zinc-600 mt-2">
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
          <VehiclesPage vehicles={filteredSortedVehicles} canReserve={false} />
        </section>
      )}

      {route === "book" && (
        <section className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-zinc-900">Reserve</h2>
          <p className="text-zinc-600 mt-2 text-sm">
            Filter by vehicle type, sort by price, then select a vehicle to
            begin. A $350 security deposit is collected at booking to hold your
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
                canReserve={true}
              />
            ))}
          </div>
          {selected && (
            <BookingPanel
              vehicle={selected}
              onBack={() => setSelected(null)}
              onComplete={handleBookingComplete}
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
        />
      )}

      {route === "chauffeur" && <ChauffeurRequest />}

      {route === "contact" && <Contact />}

      <footer className="border-t border-zinc-800 mt-12 bg-black">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-sm text-zinc-400">
          <div className="space-y-1 text-center sm:text-left">
            <div>© {new Date().getFullYear()} {COMPANY.name}</div>
            <div className="text-xs text-zinc-500">
              Premium economy to luxury rentals • Business • Events • Private
              travel
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-center sm:text-right space-y-1">
            <div>{COMPANY.address}</div>
            <div>
              Phone: {COMPANY.phone} • Email: {COMPANY.email}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
