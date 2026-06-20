import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function ScrambleText({ text, active }) {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    let iteration = 0;
    const total = text.length * 2;
    const step = () => {
      setDisplay(
        text
          .split("")
          .map((char, i) =>
            i < Math.floor(iteration / 2)
              ? char
              : char === " "
                ? " "
                : CHARS[Math.floor(Math.random() * CHARS.length)],
          )
          .join(""),
      );
      iteration++;
      if (iteration <= total) rafRef.current = requestAnimationFrame(step);
      else setDisplay(text);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, text]);

  return <>{display}</>;
}

const NAV_ITEMS = [
  { href: "#Home", label: "Home" },
  { href: "#About", label: "About" },
  { href: "#Resume", label: "Resume" },
  { href: "#Portfolio", label: "Portfolio" },
  { href: "#Blog", label: "Blog" },
  { href: "#Contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");
  const [hoveredItem, setHoveredItem] = useState(null);
  const logoClickRef = useRef({ count: 0, timer: null });
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = NAV_ITEMS
        .filter((item) => !item.isPage)
        .map((item) => {
          const section = document.querySelector(item.href);
          if (section) {
            return {
              id: item.href.replace("#", ""),
              offset: section.offsetTop - 550,
              height: section.offsetHeight,
            };
          }
          return null;
        })
        .filter(Boolean);

      const currentPosition = window.scrollY;
      const active = sections.find(
        (section) =>
          currentPosition >= section.offset &&
          currentPosition < section.offset + section.height,
      );

      if (active) {
        setActiveSection(active.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  const scrollToSection = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    const section = document.querySelector(href);
    if (section) {
      window.scrollTo({ top: section.offsetTop - 100, behavior: "smooth" });
    } else {
      // Not on landing page — navigate home then scroll to section
      navigate("/" + href);
    }
  };

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        isOpen
          ? "bg-[#030014]"
          : scrolled
            ? "bg-[#030014]/80 backdrop-blur-xl border-b border-[#6366f1]/20 shadow-[0_0_30px_rgba(99,102,241,0.08)]"
            : "bg-transparent"
      }`}
    >
      <div className="mx-auto px-[5%] sm:px-[5%] lg:px-[10%]">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a
              href="#Home"
              onClick={(e) => {
                scrollToSection(e, "#Home");
                const ref = logoClickRef.current;
                ref.count++;
                clearTimeout(ref.timer);

                if (ref.count >= 5) {
                  ref.count = 0;
                  window.dispatchEvent(new CustomEvent("easter-egg"));
                } else {
                  ref.timer = setTimeout(() => {
                    ref.count = 0;
                  }, 1500);
                }
              }}
              className="flex items-center gap-2"
            >
              <img
                src="/logo.webp"
                alt="Tisna Hidayat"                className="h-9 w-9 rounded-full object-cover"
              />

              <span className="text-xl font-bold bg-gradient-to-r from-[#a855f7] to-[#6366f1] bg-clip-text text-transparent">
                Tisna Hidayat
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-8 flex items-center space-x-8">
              {NAV_ITEMS.map((item) => {
                const isActive = activeSection === item.href.substring(1);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="group relative px-1 py-2 text-sm font-medium"
                  >
                    <span className={`relative z-10 transition-colors duration-300 ${isActive ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold" : "text-[#e2d3fd] group-hover:text-white"}`}>
                      <ScrambleText text={item.label} active={hoveredItem === item.label} />
                    </span>
                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] transform origin-left transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`relative p-2 text-[#e2d3fd] hover:text-white transition-transform duration-300 ease-in-out transform ${
                isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
              }`}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="px-4 py-6 space-y-4">
          {NAV_ITEMS.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              onClick={(e) => scrollToSection(e, item.href)}
              className={`block px-4 py-3 text-lg font-medium transition-all duration-300 ease ${activeSection === item.href.substring(1) ? "bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent font-semibold" : "text-[#e2d3fd] hover:text-white"}`}
              style={{ transitionDelay: `${index * 100}ms`, transform: isOpen ? "translateX(0)" : "translateX(50px)", opacity: isOpen ? 1 : 0 }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
