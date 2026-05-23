// components/HeroSection.jsx

import { useState, useEffect, useCallback } from "react";
import { ArrowRight } from "lucide-react";

// ── Slide Data ─────────────────────────────────────────────
const slides = [
  {
    label: "New Collection 2024",
    heading: "The Art of\nSerene Living",
    subtext:
      "Experience unparalleled comfort with the Aurelius Modular Sofa. Hand-crafted in Italian linen with a focus on architectural silhouette.",
    cta: "Explore Collection",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB_0mG1_Anv1x2hi6yLsHZmIhsOTVnw2dwK3ppDqSNxiFWPpiQe6TDIxIjIU76dLGJQujk0acsYHI0NbsjIm8PCbFqw5ol9f2adUGg4R1uT6XxAcy9PE73kbmLyD9M-RruKWEy8QA9igEtgOZ7DeH4mwK0HlVym84HFakk4pe9Z3__BKRj9zyyIF5htVkUcbTsgQ7IXgU4KU3dkpkrGSbbi38XEiApKEG6sX9daGNhxd7HKr52aHct47zGAPA84TO3t4XPXAvDIWQOv",
  },
  {
    label: "Sanctuary Collection",
    heading: "Rest in\nPure Luxury",
    subtext:
      "Our platform beds are precision-engineered for restful nights. Charcoal velvet headboards, natural linen layers — designed for the architectural home.",
    cta: "Shop Beds",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDU4lCaPuIdTQreubpMxMTzyJcJmJK8VDSyEsV4MumxfX3RNwHnrp3ISml2WqoFYwo_lHEQcPqvJK-inWm0LNbRReI1UYdfRZenMyUlFiI9bJakBzRwKzWh4nYdJH6LG4hlFoAIRGd6N8rtAzOJtf1qZBob9LMSybGQ_Af4foxldO9mwFubMcTKi8gXgLFPEd-9T4B4eGVGhOyKLZghWwuQJVCE1CoCMQUT7mfe-H_pSvOyXKZHw45mLEQaC2y7rFNEi_zqFf5MWrsY",
  },
  {
    label: "Just Arrived",
    heading: "Sculptural\nForm Meets Oak",
    subtext:
      "The Stool Series explores the boundary between functional object and fine sculpture. Hand-carved from reclaimed oak — no two pieces alike.",
    cta: "Discover Stools",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCJZFXp4HuUPFvgW8aeJLqS-y2Dr7N5ivHT4UIT1wn2mOHqQkiZluXzGpd3PrZWwrwz2PYOt6ZK1ZAHhSPU7siCYMfVxbIeXhsow6EbGd3KMu7sHZ4TMLy6w9wIDNwwPHaRUhnoetJkCMEdOTHKQIXEbVQgM_nA-gZEfluNN0uN_eLpyYVBS3uvl5v_Y0FoY6hjTtdW3Z5aIIxqZjCfydSIp_Nav4Yzo_gV6Lt4jAMlgpEGRA6eIWoen484-sqQ_Tfsflfbg8UoF_el",
  },
  {
    label: "Dining Edit",
    heading: "Gather Around\nSolid Walnut",
    subtext:
      "Our dining collection centres the room around organic materials and honest craftsmanship. Smooth edges, ceramic pendants, pure natural light.",
    cta: "Browse Dining",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCjd63qYctRTuq-WyQEhmAXjd95LKoJ6Vmj2aFOkSWpMYpUkgwf1zzrUAnkiZJU-6ztJpmeeMY_cwRTSiWyiUxLLG1UEBYm48GThIFhWBaE3OrTnXtTVa8CX_4TTp31rrWBgX4cbX8bJ0zX5U3IlXQc0ibdgMhUjUAxiO22_GbkfsGXCpVKRUPoQ6JdlG3O8jbhlsOGd-ypuwzEzE1Sn2fS_gJEZ6RjJEZv98UXSwJehG1Q1WYNNWx8QxWofshJAlhc5rwAALRn-HyN",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  const goTo = useCallback(
    (index) => {
      if (animating || index === current) return;

      setAnimating(true);
      setTextVisible(false);

      setTimeout(() => {
        setCurrent(index);
        setTextVisible(true);
        setAnimating(false);
      }, 400);
    },
    [animating, current]
  );

  // Auto Slide
  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = slides[current];

  return (
    <section className="relative flex min-h-[50vh] flex-col overflow-hidden bg-[#faf9f7] md:flex-row">
      {/* Left Content */}
      <div className="flex w-full flex-col justify-center px-6 py-2 sm:px-10 lg:px-20 md:w-1/2">
        {/* Label */}
        <span
          className={`mb-5 block text-xs uppercase tracking-[0.25em] text-[#7c5730] transition-all duration-500 ${
            textVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          {slide.label}
        </span>

        {/* Heading */}
        <h1
          className={`whitespace-pre-line font-serif text-5xl italic leading-[1.05] text-black transition-all duration-500 sm:text-6xl lg:text-7xl ${
            textVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          {slide.heading}
        </h1>

        {/* Subtext */}
        <p
          className={`mt-8 max-w-md text-base leading-relaxed text-gray-500 transition-all duration-500 delay-100 ${
            textVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          {slide.subtext}
        </p>

        {/* Buttons */}
        <div
          className={`mt-10 flex flex-col gap-4 sm:flex-row transition-all duration-500 delay-200 ${
            textVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          }`}
        >
          <button className="flex w-fit items-center gap-2 bg-black px-8 py-4 text-sm text-white transition hover:opacity-80 active:scale-95">
            {slide.cta}
            <ArrowRight size={16} />
          </button>

          <button className="w-fit border border-black px-8 py-4 text-gray-500 text-sm transition hover:bg-black hover:text-white active:scale-95">
            Request Fabric Swatches
          </button>
        </div>

        {/* Indicators */}
        <div className="mt-14 flex items-center gap-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group flex items-center gap-2"
            >
              <span className="relative block h-px w-10 overflow-hidden bg-gray-300">
                {i === current && (
                  <span
                    className="absolute inset-y-0 left-0 bg-black"
                    style={{
                      animation:
                        "hero-progress 5s linear forwards",
                    }}
                  />
                )}
              </span>

              <span
                className={`text-xs transition ${
                  i === current
                    ? "text-black"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                0{i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right Image */}
      <div className="relative h-[400px] w-full md:h-auto md:w-1/2">
        {slides.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt={s.heading}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              i === current
                ? "opacity-100"
                : "opacity-0"
            }`}
          />
        ))}

        {/* Counter */}
        <div className="absolute bottom-8 left-8 flex items-center text-gray-500 gap-3 bg-white/90 px-5 py-3 backdrop-blur-sm">
          <span className="font-serif text-xl italic">
            0{current + 1}
          </span>

          <span className="h-4 w-px bg-gray-300" />

          <span className="text-xs tracking-[0.2em] text-gray-500">
            0{slides.length}
          </span>
        </div>
      </div>

      {/* Animation */}
      <style>
        {`
          @keyframes hero-progress {
            from {
              width: 0%;
            }
            to {
              width: 100%;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HeroSection;