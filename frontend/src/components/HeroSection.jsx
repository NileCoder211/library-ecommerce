import { useEffect, useRef, useState } from "react";
import { ShoppingBag, UserPlus, FileText } from "lucide-react";

const AUTOPLAY_MS = 3000;

// Each slide is its own self-contained design (per the brief): the
// first slide is the brand statement ("SEE IT. LOVE IT. BAG IT."),
// every slide after it follows the "New Arrival" product template.
const slides = [
  {
    id: "brand",
    type: "brand",
    image: "/hero2.png",
    itemsSold: "18,179+",
    tagline: ["SPOT IT", "CLICK IT", "ROCK IT"],
    subtitle: "Handpicked. Never restocked.",
  },
  {
    id: "luxe-set",
    type: "product",
    image: "/hero1.png",
    title: "Luxe Set",
    description:
      "A two-piece set featuring a relaxed button-down shirt with rolled sleeves, paired with tailored wide-leg trousers for an effortlessly polished silhouette. Finished with a coordinating waist belt.",
    price: "KES 4,000",
  },
  {
    id: "full-tees",
    type: "product",
    image: "/hero8.png",
    title: "Full Tees — Short Sleeve",
    description:
      "A timeless crew-neck tee designed for effortless everyday styling. Soft, comfortable, and easy to pair with denim, tailored trousers, or shorts.",
    price: "KES 1,000",
  },
  {
    id: "denim-jacket",
    type: "product",
    // Was "hero4.png" (no leading slash) — that resolves relative to
    // whatever route the page is on instead of the site root, unlike
    // every other slide's image here.
    image: "/hero4.png",
    title: "Denim Jacket Classic",
    description:
      "A cropped denim jacket with a structured collar and brushed-metal buttons. Layers over everything from tees to slip dresses without ever feeling bulky.",
    price: "KES 3,500",
  },
  {
    id: "wide-leg-trousers",
    type: "product",
    image: "/hero5.png",
    title: "Wide-Leg Trousers",
    description:
      "High-waisted trousers cut for a fluid, wide-leg drape. Lightweight enough for all-day wear, tailored enough to move straight from desk to dinner.",
    price: "KES 2,800",
  },
  {
    id: "crossbody-bag",
    type: "product",
    image: "/hero6.png",
    title: "Leather Crossbody Bag",
    description:
      "A compact crossbody in full-grain leather with an adjustable strap and a single interior pocket sized for a phone, cards, and keys.",
    price: "KES 5,200",
  },
  {
    id: "slip-dress",
    type: "product",
    image: "/hero7.png",
    title: "Satin Slip Dress",
    description:
      "A bias-cut slip in liquid satin that falls just below the knee. Wear it alone for evening or layered under the Denim Jacket Classic for daytime.",
    price: "KES 3,900",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) {
        setIndex((i) => (i + 1) % slides.length);
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (i) => setIndex(i);

  return (
    <section
      className="relative h-[97vh] min-h-[420px] w-full overflow-hidden bg-black"
      onMouseEnter={() => (isPausedRef.current = true)}
      onMouseLeave={() => (isPausedRef.current = false)}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <SlideBackground image={slide.image} />
          {slide.type === "brand" ? (
            <BrandSlide slide={slide} />
          ) : (
            <ProductSlide slide={slide} />
          )}
        </div>
      ))}

      <DotNav count={slides.length} activeIndex={index} onSelect={goTo} />
    </section>
  );
}

function SlideBackground({ image }) {
  return (
    <>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover "
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/60" />
    </>
  );
}

function BrandSlide({ slide }) {
  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
      <span className="mb-6 flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
        {slide.itemsSold} ITEMS SOLD
      </span>

      <h1 className="font-serif text-5xl leading-tight sm:text-6xl md:text-7xl">
        {slide.tagline[0]} <span className="text-teal-300">.</span> {slide.tagline[1]}{" "}
        <span className="text-teal-300">. {slide.tagline[2]}</span>
      </h1>

      <p className="mt-4 text-sm tracking-[0.15em] text-white/60">{slide.subtitle}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          <ShoppingBag className="h-4 w-4" />
          Shop Now
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
        >
          <UserPlus className="h-4 w-4 text-teal-300" />
          Join Early Access
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/70">
        <Badge dotColor="bg-emerald-400" label="Sustainable" />
        <Badge dotColor="bg-sky-400" label="Curated" />
        <Badge icon={<FileText className="h-3.5 w-3.5" />} label="Size Chart" />
      </div>
    </div>
  );
}

function Badge({ dotColor, icon, label }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 backdrop-blur-sm">
      {dotColor ? <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} /> : icon}
      {label}
    </span>
  );
}

function ProductSlide({ slide }) {
  return (
    <div className="relative z-10 flex h-full items-center px-8 md:px-16">
      <div className="max-w-md text-white">
        <div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-white/70">
          <span className="h-px w-6 bg-white/50" />
          New Arrival
        </div>

        <h2 className="font-serif text-4xl leading-tight sm:text-5xl">{slide.title}</h2>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
          {slide.description}
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop Now
          </button>
          <span className="font-serif text-lg">{slide.price}</span>
        </div>

        <button
          type="button"
          className="mt-4 flex items-center gap-1.5 text-xs text-white/70 underline-offset-4 hover:underline"
        >
          <FileText className="h-3.5 w-3.5" />
          Size chart
        </button>
      </div>
    </div>
  );
}

function DotNav({ count, activeIndex, onSelect }) {
  return (
    <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === activeIndex}
          className={`h-1.5 rounded-full transition-all ${
            i === activeIndex ? "w-6 bg-teal-300" : "w-1.5 bg-white/40 hover:bg-white/70"
          }`}
        />
      ))}
    </div>
  );
}