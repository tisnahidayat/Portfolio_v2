import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ArrowRight, Heart, Github, FileSpreadsheet, Youtube } from "lucide-react";
import { toSlug } from "../utils/slug";
import Swal from "sweetalert2";
import { supabase } from "../supabase";

const swal = (opts) =>
  Swal.fire({ background: "#030014", color: "#ffffff", confirmButtonColor: "#6366f1", ...opts });

function useLike(id, initialLikes) {
  const key = `like_${id}`;
  const [liked, setLiked] = useState(() => localStorage.getItem(key) === "1");
  const [count, setCount] = useState(initialLikes ?? 0);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !liked;
    setLiked(next);
    setCount((prev) => prev + (next ? 1 : -1));
    localStorage.setItem(key, next ? "1" : "0");

    if (!id || isNaN(Number(id))) return;

    try {
      const fn = next ? "increment_project_likes" : "decrement_project_likes";
      await supabase.rpc(fn, { project_id: Number(id) });
    } catch {
      setLiked(!next);
      setCount((prev) => prev + (next ? -1 : 1));
      localStorage.setItem(key, !next ? "1" : "0");
    }
  };

  return { liked, count, toggle };
}

const CardProject = ({
  Img,
  Title,
  Description,
  Link: ProjectLink,
  id,
  Likes,
  Github: GithubLink,
  Sheet: SheetLink,
  YoutubeUrl: YoutubeLink,
}) => {
  const cardRef = useRef(null);
  const { liked, count, toggle } = useLike(id || Title, Likes ?? 0);

  const handleGithubClick = (e) => {
    if (GithubLink === "Private") {
      e.preventDefault();
      swal({ title: "Private Repository", text: "The source code for this project is private.", icon: "info" });
    }
  };

  const handleDetails = (e) => {
    if (!id) {
      e.preventDefault();
      swal({ title: "Not available", text: "Project details are not available.", icon: "info" });
    }
  };

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    card.style.transform = `perspective(900px) rotateX(${((y - cy) / cy) * -7}deg) rotateY(${((x - cx) / cx) * 7}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current)
      cardRef.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative w-full"
      style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300" />

        <div className="relative p-5 z-10 flex flex-col gap-4">
          {/* Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={Img}
              alt={Title}
              className="w-full h-full object-cover aspect-[16/8] transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Text */}
          <div className="space-y-1.5">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {Title}
            </h3>
            <p className="text-gray-300/80 text-sm leading-relaxed line-clamp-2">
              {Description}
            </p>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-y-2 pt-1 border-t border-white/5">

            {/* Like button */}
            <button
              onClick={toggle}
              aria-label={liked ? "Unlike" : "Like"}
              className={`group/like flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-90 select-none shrink-0
                ${liked
                  ? "bg-pink-500/15 border border-pink-400/40 text-pink-300 shadow-[0_0_16px_rgba(236,72,153,0.2)]"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:text-pink-300 hover:border-pink-400/25 hover:bg-pink-500/10"
                }`}
            >
              <Heart className={`w-4 h-4 transition-all duration-300 ${liked ? "fill-pink-400 text-pink-400 scale-110" : "group-hover/like:scale-110"}`} />
              <span className={`tabular-nums ${liked ? "text-pink-200" : ""}`}>{count.toLocaleString()}</span>
              <span className={`text-xs ${liked ? "text-pink-400/70" : "text-gray-500"}`}>
                {count === 1 ? "like" : "likes"}
              </span>
            </button>

            {/* Icon links + Details */}
            <div className="flex flex-wrap items-center gap-1 shrink-0">
              {/* GitHub */}
              {GithubLink && (
                <a
                  href={GithubLink !== "Private" ? GithubLink : undefined}
                  target={GithubLink !== "Private" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={handleGithubClick}
                  title="GitHub"
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}

              {/* Live Demo */}
              {ProjectLink && (
                <a
                  href={ProjectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Live Demo"
                  className="p-2 rounded-lg text-blue-400 hover:text-blue-200 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Test Cases Sheet */}
              {SheetLink && (
                <a
                  href={SheetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Test Cases Sheet"
                  className="p-2 rounded-lg text-emerald-400 hover:text-emerald-200 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-200"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </a>
              )}

              {/* YouTube */}
              {YoutubeLink && (
                <a
                  href={YoutubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Demo Video"
                  className="p-2 rounded-lg text-red-400 hover:text-red-200 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}

              {/* Details */}
              {id && (
                <Link
                  to={`/project/${toSlug(Title)}`}
                  onClick={handleDetails}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-white/20 hover:text-white transition-all duration-200"
                >
                  Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/50 rounded-xl transition-colors duration-300 -z-50" />
        </div>
      </div>
    </div>
  );
};

export default CardProject;
