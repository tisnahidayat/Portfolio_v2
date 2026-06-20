import { Github, Linkedin, Instagram, Youtube, Mail, Heart } from "lucide-react";

const navLinks = [
  { href: "#Home", label: "Home" },
  { href: "#About", label: "About" },
  { href: "#Resume", label: "Resume" },
  { href: "#Portfolio", label: "Portfolio" },
  { href: "#Contact", label: "Contact" },
];

const socialLinks = [
  { icon: Github, url: "https://github.com/tisnahidayat", label: "GitHub" },
  { icon: Linkedin, url: "https://www.linkedin.com/in/tisna-hidayat-778084203/", label: "LinkedIn" },
  { icon: Instagram, url: "https://www.instagram.com/tisnahidayat_/", label: "Instagram" },
  { icon: Youtube, url: "https://www.youtube.com/@tisnahidayat15", label: "YouTube" },
  { icon: Mail, url: "mailto:tisnahidayat304@gmail.com", label: "Email" },
];

const Footer = () => {
  const year = new Date().getFullYear();

  const scrollTo = (e, href) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#030014]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6366f1]/40 to-transparent" />

      <div className="px-[5%] lg:px-[10%] pt-12 pb-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10">

          {/* Branding */}
          <div className="flex flex-col gap-3 max-w-xs">
            <a
              href="#Home"
              onClick={(e) => scrollTo(e, "#Home")}
              className="text-2xl font-bold bg-gradient-to-r from-[#a855f7] to-[#6366f1] bg-clip-text text-transparent w-fit"
            >
              Tisna Hidayat
            </a>
            <p className="text-sm text-gray-500 leading-relaxed">
              Software Quality Assurance Engineer — ensuring quality in every build, every sprint.
            </p>
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map(({ icon: Icon, url, label }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2 rounded-full bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 hover:border-[#6366f1]/40 hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-1 font-semibold">Navigate</p>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => scrollTo(e, link.href)}
                className="text-sm text-gray-500 hover:text-white transition-all duration-200 hover:translate-x-1 inline-block"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-gray-600 mb-1 font-semibold">Contact</p>
            <a
              href="mailto:tisnahidayat304@gmail.com"
              className="text-sm text-gray-500 hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2"
            >
              <Mail className="w-4 h-4 shrink-0" />
              tisnahidayat304@gmail.com
            </a>
            <a
              href="https://github.com/tisnahidayat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              <Github className="w-4 h-4 shrink-0" />
              github.com/tisnahidayat
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-gray-600">
            © {year}{" "}
            <a href="https://tisna-hidayat.vercel.app" className="hover:text-gray-400 transition-colors">
              Tisna Hidayat™
            </a>
            . All Rights Reserved.
          </span>
          <span className="text-xs text-gray-600 flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-pink-500" /> using React & Supabase
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
