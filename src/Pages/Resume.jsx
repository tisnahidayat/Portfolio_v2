import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { getCache, setCache } from "../utils/cache";
import {
  Briefcase,
  GraduationCap,
  Users,
  MapPin,
  Calendar,
  Building2,
} from "lucide-react";
import { supabase } from "../supabase";

const formatDate = (dateStr) => dateStr || "";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`resume-tabpanel-${index}`}
      aria-labelledby={`resume-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `resume-tab-${index}`,
    "aria-controls": `resume-tabpanel-${index}`,
  };
}

const ExperienceCard = ({ item, index }) => (
  <div
    data-aos="fade-up"
    data-aos-delay={index * 100}
    data-aos-duration="800"
    className="group"
  >
    <div className="flex gap-4 md:gap-6 p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-indigo-500/30 hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex-shrink-0">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex items-center justify-center ${item.img ? "" : "border border-white/10 bg-white/5"}`}
        >
          {item.img ? (
            <img
              src={item.img}
              alt={item.company}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-7 h-7 text-indigo-400" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-2">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
              {item.role}
            </h3>
            <p className="text-sm text-indigo-400 font-medium">
              {item.company}
            </p>
          </div>
          {item.is_current && (
            <span className="self-start px-2.5 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full whitespace-nowrap">
              Current
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-xs text-gray-400">
          {(item.start_date || item.end_date) && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(item.start_date)} —{" "}
              {item.is_current ? "Present" : formatDate(item.end_date)}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.location}
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-sm text-gray-400 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const EducationCard = ({ item, index }) => (
  <div
    data-aos="fade-up"
    data-aos-delay={index * 100}
    data-aos-duration="800"
    className="group"
  >
    <div className="flex gap-4 md:gap-6 p-5 md:p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-purple-500/30 hover:bg-white/[0.05] transition-all duration-300">
      <div className="flex-shrink-0">
        <div
          className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden flex items-center justify-center ${item.img ? "" : "border border-white/10 bg-white/5"}`}
        >
          {item.img ? (
            <img
              src={item.img}
              alt={item.institution}
              className="w-full h-full object-cover"
            />
          ) : (
            <GraduationCap className="w-7 h-7 text-purple-400" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base md:text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-1">
          {item.institution}
        </h3>
        <p className="text-sm text-purple-400 font-medium mb-2">
          {item.degree}
          {item.field ? ` — ${item.field}` : ""}
        </p>

        {(item.start_date || item.end_date) && (
          <span className="flex items-center gap-1 text-xs text-gray-400 mb-3">
            <Calendar className="w-3 h-3" />
            {formatDate(item.start_date)} — {formatDate(item.end_date)}
          </span>
        )}

        {item.description && (
          <p className="text-sm text-gray-400 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  </div>
);

const OrganizationCard = ({ item, index }) => (
  <div
    data-aos={
      index % 3 === 0
        ? "fade-up-right"
        : index % 3 === 1
          ? "fade-up"
          : "fade-up-left"
    }
    data-aos-duration="800"
    className="group"
  >
    <div className="h-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-pink-500/30 hover:bg-white/[0.05] transition-all duration-300">
      <div
        className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center mb-4 ${item.img ? "" : "border border-white/10 bg-white/5"}`}
      >
        {item.img ? (
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Users className="w-7 h-7 text-pink-400" />
        )}
      </div>

      <h3 className="text-base font-semibold text-white group-hover:text-pink-300 transition-colors mb-1">
        {item.name}
      </h3>
      <p className="text-sm text-pink-400 font-medium mb-2">{item.role}</p>

      {(item.start_date || item.end_date) && (
        <span className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <Calendar className="w-3 h-3" />
          {formatDate(item.start_date)} — {formatDate(item.end_date)}
        </span>
      )}

      {item.description && (
        <p className="text-sm text-gray-400 leading-relaxed">
          {item.description}
        </p>
      )}
    </div>
  </div>
);

export default function Resume() {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const fetchData = useCallback(async () => {
    const cached = getCache("resume");
    if (cached) {
      setExperience(cached.experience);
      setEducation(cached.education);
      setOrganizations(cached.organizations);
      return;
    }
    try {
      const [expRes, eduRes, orgRes] = await Promise.all([
        supabase.from("experience").select("*").order("sort_order", { ascending: true }),
        supabase.from("education").select("*").order("sort_order", { ascending: true }),
        supabase.from("organizations").select("*").order("sort_order", { ascending: true }),
      ]);
      const experience = expRes.data || [];
      const education = eduRes.data || [];
      const organizations = orgRes.data || [];
      if (!expRes.error) setExperience(experience);
      if (!eduRes.error) setEducation(education);
      if (!orgRes.error) setOrganizations(organizations);
      if (!expRes.error && !eduRes.error && !orgRes.error) {
        setCache("resume", { experience, education, organizations });
      }
    } catch (error) {
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event, newValue) => setValue(newValue);

  return (
    <div
      className="md:px-[10%] px-[5%] py-10 md:py-[5%] w-full bg-[#030014] overflow-hidden"
      id="Resume"
    >
      <div
        className="text-center pb-10"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <h2
          className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(45deg, #6366f1 10%, #a855f7 93%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Resume
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2">
          My professional journey — experience, education, and community
          involvement.
        </p>
      </div>

      <Box sx={{ width: "100%" }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(180deg, rgba(139, 92, 246, 0.03) 0%, rgba(59, 130, 246, 0.03) 100%)",
              backdropFilter: "blur(10px)",
              zIndex: 0,
            },
          }}
          className="md:px-4"
        >
          <Tabs
            value={value}
            onChange={handleChange}
            textColor="secondary"
            indicatorColor="secondary"
            variant="fullWidth"
            sx={{
              minHeight: "70px",
              "& .MuiTab-root": {
                fontSize: { xs: "0.72rem", sm: "0.85rem", md: "1rem" },
                fontWeight: "600",
                color: "#94a3b8",
                textTransform: "none",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: { xs: "12px 2px", sm: "16px 0", md: "20px 0" },
                minWidth: { xs: 0 },
                zIndex: 1,
                margin: { xs: "4px", sm: "8px" },
                borderRadius: "12px",
                "&:hover": {
                  color: "#ffffff",
                  backgroundColor: "rgba(139, 92, 246, 0.1)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-selected": {
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))",
                  boxShadow: "0 4px 15px -3px rgba(139, 92, 246, 0.2)",
                },
              },
              "& .MuiTabs-indicator": { height: 0 },
              "& .MuiTabs-flexContainer": { gap: "8px" },
            }}
          >
            <Tab
              icon={
                <Briefcase className="mb-2 w-5 h-5 transition-all duration-300" />
              }
              label="Experience"
              {...a11yProps(0)}
            />
            <Tab
              icon={
                <GraduationCap className="mb-2 w-5 h-5 transition-all duration-300" />
              }
              label="Education"
              {...a11yProps(1)}
            />
            <Tab
              icon={
                <Users className="mb-2 w-5 h-5 transition-all duration-300" />
              }
              label="Organizations"
              {...a11yProps(2)}
            />
          </Tabs>
        </AppBar>

        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={setValue}
        >
          <TabPanel value={value} index={0} dir={theme.direction}>
            <div className="space-y-4">
              {experience.length > 0 ? (
                experience.map((item, index) => (
                  <ExperienceCard
                    key={item.id || index}
                    item={item}
                    index={index}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-center py-10">
                  No experience data yet.
                </p>
              )}
            </div>
          </TabPanel>

          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className="space-y-4">
              {education.length > 0 ? (
                education.map((item, index) => (
                  <EducationCard
                    key={item.id || index}
                    item={item}
                    index={index}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-center py-10">
                  No education data yet.
                </p>
              )}
            </div>
          </TabPanel>

          <TabPanel value={value} index={2} dir={theme.direction}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {organizations.length > 0 ? (
                organizations.map((item, index) => (
                  <OrganizationCard
                    key={item.id || index}
                    item={item}
                    index={index}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-center py-10 col-span-3">
                  No organization data yet.
                </p>
              )}
            </div>
          </TabPanel>
        </SwipeableViews>
      </Box>
    </div>
  );
}
