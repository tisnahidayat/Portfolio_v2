import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import CustomCursor from "./components/CustomCursor";
import ScrollProgress from "./components/ScrollProgress";
import BackToTop from "./components/BackToTop";
import HireMeCTA from "./components/HireMeCTA";
import MusicPlayer from "./components/MusicPlayer";
import { AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import Footer from "./components/Footer";
import { supabase } from "./supabase";

import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Maintenance from "./Pages/Maintenance";

const Portofolio = lazy(() => import("./Pages/Portofolio"));
const Resume = lazy(() => import("./Pages/Resume"));
const ContactPage = lazy(() => import("./Pages/Contact"));
const ProjectDetails = lazy(() => import("./components/ProjectDetail"));
const WelcomeScreen = lazy(() => import("./Pages/WelcomeScreen"));
const NotFoundPage = lazy(() => import("./Pages/404"));
const Blog = lazy(() => import("./Pages/Blog"));
const ArticleDetail = lazy(() => import("./Pages/ArticleDetail"));


const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <Suspense fallback={null}>
            <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
          </Suspense>
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          <Navbar />
          <Home />
          <About />
          <Suspense fallback={<div className="h-20" />}>
            <Resume />
            <Portofolio />
            <Blog />
            <ContactPage />
          </Suspense>
          <Footer />
        </>
      )}
    </>
  );
};

const ProjectPageLayout = () => (
  <>
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProjectDetails />
    </Suspense>
    <Footer />
  </>
);

function triggerEasterEgg() {
  import("canvas-confetti").then(({ default: confetti }) => {
    const end = Date.now() + 3000;
    const colors = ["#6366f1", "#a855f7", "#ec4899", "#ffffff"];
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  });
  Swal.fire({
    title: "🎮 Easter Egg Found!",
    html: "<p style='color:#a855f7;font-size:1rem'>You clicked the logo 5 times!</p><p style='color:#94a3b8;margin-top:8px'>Thanks for exploring my portfolio 😄<br/>You're clearly very thorough — perfect for a QA Engineer!</p>",
    background: "#030014",
    color: "#ffffff",
    confirmButtonColor: "#6366f1",
    confirmButtonText: "Nice! 🎉",
  });
}

function AppRoutes({ maintenanceMode, showWelcome, setShowWelcome }) {
  const location = useLocation();
  const isAdminPath =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/login";

  if (maintenanceMode && !isAdminPath) {
    return <Maintenance />;
  }

  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/"
        element={
          <LandingPage
            showWelcome={showWelcome}
            setShowWelcome={setShowWelcome}
          />
        }
      />

      <Route path="/project/:slug" element={<ProjectPageLayout />} />

      {/* BLOG ARTICLE DETAIL */}
      <Route
        path="/blog/:slug"
        element={
          <Suspense fallback={<div className="min-h-screen bg-[#030014]" />}>
            <ArticleDetail />
          </Suspense>
        }
      />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />

      {/* ADMIN (PROTECTED) */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    AOS.init({ once: false, duration: 800, easing: "ease-out-quart" });

    supabase
      .from("settings")
      .select("maintenance_mode")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data) setMaintenanceMode(data.maintenance_mode);
      })
      .catch(() => {});

    const handler = () => triggerEasterEgg();
    window.addEventListener("easter-egg", handler);
    return () => window.removeEventListener("easter-egg", handler);
  }, []);

  return (
    <HelmetProvider>
      <CustomCursor />
      <ScrollProgress />
      {!maintenanceMode && <BackToTop />}
      {!maintenanceMode && <HireMeCTA />}
      {!maintenanceMode && <MusicPlayer />}
      <div className="pointer-events-none">
        <AnimatedBackground />
      </div>
      <BrowserRouter>
        <AppRoutes
          maintenanceMode={maintenanceMode}
          showWelcome={showWelcome}
          setShowWelcome={setShowWelcome}
        />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
