import React, {
  useEffect,
  useState,
  useRef,
  memo,
  useMemo,
} from "react";
import {
  FileText,
  Code,
  Award,
  ArrowUpRight,
  Sparkles,
  ClipboardCheck,
  Briefcase,
  Bug,
} from "lucide-react";
import { supabase } from "../supabase";

// ─── Magnetic Button ─────────────────────────────────────────────────────────
function MagneticButton({ children, className, ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };
  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transition: "transform 0.2s ease" }}
      {...props}
    >
      {children}
    </button>
  );
}

// ─── Count-Up ────────────────────────────────────────────────────────────────
function CountUp({ value, suffix = "", started, delay = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started || value === 0) return;
    const timer = setTimeout(() => {
      const duration = 2000;
      const start = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(eased * value));
        if (progress < 1) requestAnimationFrame(animate);
        else setCount(value);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, started, delay]);

  return (
    <span className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = memo(
  ({
    icon: Icon,
    gradient,
    value,
    suffix,
    label,
    description,
    started,
    delay,
  }) => (
    <div
      className="relative group"
      data-aos="fade-up"
      data-aos-delay={delay}
      data-aos-duration="800"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500 pointer-events-none`}
      />
      <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl p-3 md:p-6 overflow-hidden h-full hover:border-white/20 transition-all duration-300">
        {/* top accent line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient} opacity-70`}
        />
        {/* subtle bg on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.05] transition duration-500`}
        />

        <div className="relative z-10 flex flex-col h-full">
          <div
            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div
            className={`text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1.5 leading-none`}
          >
            <CountUp
              value={value}
              suffix={suffix}
              started={started}
              delay={delay}
            />
          </div>

          <p className="text-sm font-semibold text-white/80 mb-1">{label}</p>
          <p className="text-xs text-gray-500 mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
            {description}
            <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
          </p>
        </div>
      </div>
    </div>
  ),
);

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
        data-aos="zoom-in-up"
        data-aos-duration="600"
      >
        About Me
      </h2>
    </div>
    <p
      className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
      data-aos-duration="800"
    >
      <Sparkles className="w-5 h-5 text-purple-400" />
      Ensuring quality in every build, every sprint
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
));

// ─── Profile Image ────────────────────────────────────────────────────────────
const ProfileImage = memo(() => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div className="relative group" data-aos="fade-up" data-aos-duration="1000">
      <div className="absolute -inset-6 opacity-[25%] z-0 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 rounded-full blur-2xl animate-spin-slower" />
        <div className="absolute inset-0 bg-gradient-to-l from-fuchsia-500 via-rose-500 to-pink-600 rounded-full blur-2xl animate-pulse-slow opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400 rounded-full blur-2xl animate-float opacity-50" />
      </div>

      <div className="relative">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)] transform transition-all duration-700 group-hover:scale-105">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full z-20 transition-all duration-700 group-hover:border-white/40 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10 transition-opacity duration-700 group-hover:opacity-0 hidden sm:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-blue-500/20 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block" />
          <img
            src="/Photo.jpeg"
            alt="Profile"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
            loading="lazy"
          />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 z-20 hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/10 to-transparent transform translate-y-full group-hover:-translate-y-full transition-transform duration-1000 delay-100" />
            <div className="absolute inset-0 rounded-full border-8 border-white/10 scale-0 group-hover:scale-100 transition-transform duration-700 animate-pulse-slow" />
          </div>
        </div>
      </div>
    </div>
  </div>
));

// ─── Main ─────────────────────────────────────────────────────────────────────
const AboutPage = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCertificates: 0,
    YearExperience: 0,
  });
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef(null);

  // fetch counts from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      const startDate = new Date("2023-08-23");
      const today = new Date();
      const experience =
        today.getFullYear() -
        startDate.getFullYear() -
        (today <
        new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate())
          ? 1
          : 0);

      const [projRes, certRes] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase
          .from("certificates")
          .select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalProjects: projRes.count || 0,
        totalCertificates: certRes.count || 0,
        YearExperience: experience,
      });
    };
    fetchStats();
  }, []);

  // intersection observer for count-up trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsStarted(true);
      },
      { threshold: 0.3 },
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);


  const { totalProjects, totalCertificates, YearExperience } = stats;

  const statsData = useMemo(
    () => [
      {
        icon: Briefcase,
        gradient: "from-blue-500 to-indigo-500",
        value: YearExperience,
        suffix: "+",
        label: "Years Experience",
        description: "Growing in QA, one sprint at a time",
        delay: 0,
      },
      {
        icon: ClipboardCheck,
        gradient: "from-indigo-500 to-violet-500",
        value: totalProjects,
        suffix: "+",
        label: "Projects Tested",
        description: "Quality products delivered end-to-end",
        delay: 100,
      },
      {
        icon: Award,
        gradient: "from-violet-500 to-purple-500",
        value: totalCertificates,
        suffix: "+",
        label: "Certificates",
        description: "Professional skills validated",
        delay: 200,
      },
      {
        icon: Bug,
        gradient: "from-purple-500 to-pink-500",
        value: 80,
        suffix: "+",
        label: "Bugs Reported",
        description: "Issues caught before reaching users",
        delay: 300,
      },
    ],
    [totalProjects, totalCertificates, YearExperience],
  );

  return (
    <div
      className="h-auto text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] py-10 md:py-[5%]"
      id="About"
      itemScope
      itemType="https://schema.org/Person"
    >
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold"
              data-aos="fade-right"
              data-aos-duration="1000"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I'm
              </span>
              <span
                className="block mt-2 text-gray-200"
                data-aos="fade-right"
                data-aos-duration="1300"
                itemProp="name"
              >
                Tisna Hidayat
              </span>
            </h2>

            <p
              className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify pb-4 sm:pb-0"
              data-aos="fade-right"
              data-aos-duration="1500"
            >
              I am a Software Quality Assurance Engineer focused on software
              testing and automation. I am committed to ensuring the quality of
              digital products through structured test planning and effective
              team collaboration.
            </p>

            <div
              className="relative bg-gradient-to-br from-[#6366f1]/5 via-transparent to-[#a855f7]/5 border border-[#6366f1]/30 rounded-2xl p-4 my-6 backdrop-blur-md shadow-2xl overflow-hidden"
              data-aos="fade-up"
              data-aos-duration="1700"
            >
              <div className="absolute top-2 right-4 w-16 h-16 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-2 w-12 h-12 bg-gradient-to-r from-[#a855f7]/20 to-[#6366f1]/20 rounded-full blur-lg" />
              <div className="absolute top-3 left-4 text-[#6366f1] opacity-30">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
              </div>
              <blockquote className="text-gray-300 text-center lg:text-left italic font-medium text-sm relative z-10 pl-6">
                "Leveraging AI as a professional tool, not a replacement."
              </blockquote>
            </div>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:px-0 w-full">
              <a
                href="/CV Latest - Tisna Hidayat.pdf"
                download="CV - Tisna Hidayat.pdf"
                className="w-full lg:w-auto"
              >
                <MagneticButton
                  data-aos="fade-up"
                  data-aos-duration="800"
                  className="w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium hover:scale-105 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl"
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Download CV
                </MagneticButton>
              </a>
              <a href="#Portfolio" className="w-full lg:w-auto">
                <MagneticButton
                  data-aos="fade-up"
                  data-aos-duration="1000"
                  className="w-full lg:w-auto px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-[#a855f7]/50 text-[#a855f7] font-medium hover:scale-105 flex items-center justify-center lg:justify-start gap-2 hover:bg-[#a855f7]/10"
                >
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
                </MagneticButton>
              </a>
            </div>
          </div>

          <ProfileImage />
        </div>

        {/* Stats Grid */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mt-16"
        >
          {statsData.map((stat) => (
            <StatCard key={stat.label} {...stat} started={statsStarted} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 3s infinite; }
        .animate-spin-slower { animation: spin-slower 8s linear infinite; }
      `}</style>
    </div>
  );
};

export default memo(AboutPage);
