import React, { useState, useEffect, useRef } from "react";

const CyberpunkPortfolio = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedText, setTypedText] = useState("");

  const titles = ["Software Engineer", "Full-Stack Developer", "Problem Solver"];
  const titleIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);

  // Typing animation
  useEffect(() => {
    const type = () => {
      const current = titles[titleIndex.current];
      if (isDeleting.current) {
        charIndex.current--;
        setTypedText(current.substring(0, charIndex.current));
        if (charIndex.current === 0) {
          isDeleting.current = false;
          titleIndex.current = (titleIndex.current + 1) % titles.length;
        }
      } else {
        charIndex.current++;
        setTypedText(current.substring(0, charIndex.current));
        if (charIndex.current === current.length) {
          setTimeout(() => {
            isDeleting.current = true;
          }, 2000);
        }
      }
    };
    const interval = setInterval(type, isDeleting.current ? 50 : 100);
    return () => clearInterval(interval);
  }, [typedText]);

  // Scroll spy
  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      const sections = [
        "home",
        "about",
        "experience",
        "education",
        "projects",
        "skills",
      ];
      const scrollPosition = window.scrollY + 150;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && scrollPosition >= section.offsetTop) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-triggered fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const elements = document.querySelectorAll(".fade-in-section");
    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  const projects = [
    {
      title: "Material Calculator",
      description:
        "A software tool for construction companies to calculate materials based on the square footage of jobs. Streamlines estimation and reduces waste.",
      tech: ["JavaScript", "HTML", "CSS"],
      liveLink: "https://esticount.com",
      githubLink: "https://github.com/codecastillo/material-calculator",
    },
    {
      title: "Top Secret Project",
      description:
        "A full-stack application in stealth mode. Leveraging cutting-edge frameworks to solve real-world problems.",
      tech: ["Python", "PostgreSQL", "REST API", "Docker"],
      liveLink: "#",
      githubLink: "#",
    },
    {
      title: "The Next Big Thing",
      description:
        "Working on something special that combines clean architecture with intuitive user experience. Stay tuned for updates.",
      tech: ["JavaScript", "React", "CSS3", "Git"],
      liveLink: "#",
      githubLink: "#",
    },
    {
      title: "Your Project Here?",
      description:
        "Looking for a dedicated developer to bring your vision to life? Let's build something amazing together.",
      tech: ["HTML", "CSS", "JavaScript", "Your Stack"],
      liveLink: "#",
      githubLink: "#",
    },
  ];

  const experiences = [
    {
      role: "Senior Developer",
      company: "Your Company Here",
      period: "Future",
      description:
        "The goal. Leading development teams, architecting scalable solutions, and mentoring the next generation of developers.",
      highlights: [
        "Technical leadership",
        "System architecture",
        "Team mentorship",
      ],
    },
    {
      role: "Mid-Level Developer",
      company: "Growing Here",
      period: "Coming Soon",
      description:
        "Building expertise and taking ownership of features. Ready to tackle complex challenges and contribute to major projects.",
      highlights: [
        "Feature ownership",
        "Code reviews",
        "Cross-team collaboration",
      ],
    },
    {
      role: "Junior Developer",
      company: "Open to Opportunities",
      period: "Available Now",
      description:
        "Currently seeking my first professional role. Eager to learn, contribute, and grow with a team that values clean code and continuous improvement.",
      highlights: ["Fast learner", "Team player", "Strong foundation"],
    },
  ];

  const education = [
    {
      degree: "Technical Certificate",
      school: "Dixie Technical College",
      period: "Jan 2026 - Present",
      focus: "Software Development",
      gpa: "In Progress",
    },
  ];

  const skills = [
    { name: "HTML/CSS", level: 90 },
    { name: "JavaScript", level: 85 },
    { name: "React", level: 80 },
    { name: "Python", level: 80 },
    { name: "TypeScript", level: 75 },
    { name: "PostgreSQL", level: 70 },
  ];

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({ top: section.offsetTop - 80, behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const navItems = [
    "Home",
    "About",
    "Experience",
    "Education",
    "Projects",
    "Skills",
  ];

  return (
    <div className="portfolio-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --neon-pink: #ff2a6d;
          --neon-blue: #05d9e8;
          --neon-purple: #9d4edd;
          --dark-bg: #0a0a0f;
          --darker-bg: #050508;
          --card-bg: rgba(15, 15, 25, 0.8);
          --text-primary: #ffffff;
          --text-secondary: #a0a0b0;
          --gradient-1: linear-gradient(135deg, #ff2a6d 0%, #9d4edd 50%, #05d9e8 100%);
          --gradient-2: linear-gradient(90deg, #ff2a6d, #9d4edd, #05d9e8, #9d4edd, #ff2a6d);
        }

        .portfolio-container {
          min-height: 100vh;
          background: var(--dark-bg);
          color: var(--text-primary);
          font-family: 'Rajdhani', sans-serif;
          overflow-x: hidden;
          position: relative;
        }

        /* Scroll fade-in animations */
        .fade-in-section {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Animated Grid Background */
        .grid-background {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            linear-gradient(rgba(5, 217, 232, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(5, 217, 232, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        .grid-background::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at 50% 0%, rgba(157, 78, 221, 0.15) 0%, transparent 50%),
                      radial-gradient(ellipse at 100% 100%, rgba(255, 42, 109, 0.1) 0%, transparent 40%),
                      radial-gradient(ellipse at 0% 100%, rgba(5, 217, 232, 0.1) 0%, transparent 40%);
        }

        /* Floating Particles */
        .particles {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: var(--neon-blue);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue);
          animation: float 15s infinite;
          opacity: 0.6;
        }

        .particle:nth-child(2) { left: 10%; animation-delay: -2s; background: var(--neon-pink); box-shadow: 0 0 10px var(--neon-pink); }
        .particle:nth-child(3) { left: 20%; animation-delay: -4s; }
        .particle:nth-child(4) { left: 30%; animation-delay: -6s; background: var(--neon-purple); box-shadow: 0 0 10px var(--neon-purple); }
        .particle:nth-child(5) { left: 40%; animation-delay: -8s; }
        .particle:nth-child(6) { left: 50%; animation-delay: -10s; background: var(--neon-pink); box-shadow: 0 0 10px var(--neon-pink); }
        .particle:nth-child(7) { left: 60%; animation-delay: -12s; }
        .particle:nth-child(8) { left: 70%; animation-delay: -14s; background: var(--neon-purple); box-shadow: 0 0 10px var(--neon-purple); }
        .particle:nth-child(9) { left: 80%; animation-delay: -3s; }
        .particle:nth-child(10) { left: 90%; animation-delay: -7s; background: var(--neon-pink); box-shadow: 0 0 10px var(--neon-pink); }

        @keyframes float {
          0%, 100% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 1rem 2rem;
          background: rgba(10, 10, 15, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(157, 78, 221, 0.2);
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }

        .nav-links {
          display: flex;
          gap: 1rem;
          list-style: none;
        }

        .nav-link {
          font-family: 'Rajdhani', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          cursor: pointer;
          position: relative;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--gradient-1);
          transition: width 0.3s ease;
        }

        .nav-link:hover, .nav-link.active {
          color: var(--text-primary);
        }

        .nav-link:hover::before, .nav-link.active::before {
          width: 100%;
        }

        /* Hamburger Menu */
        .hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0.5rem;
          z-index: 101;
        }

        .hamburger span {
          display: block;
          width: 25px;
          height: 2px;
          background: var(--text-primary);
          transition: all 0.3s ease;
        }

        .hamburger.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        .hamburger.open span:nth-child(2) {
          opacity: 0;
        }

        .hamburger.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 15, 0.98);
          z-index: 99;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }

        .mobile-menu-overlay.open {
          display: flex;
        }

        .mobile-menu-overlay .mobile-nav-link {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .mobile-menu-overlay .mobile-nav-link:hover,
        .mobile-menu-overlay .mobile-nav-link.active {
          color: var(--neon-pink);
          text-shadow: 0 0 20px rgba(255, 42, 109, 0.5);
        }

        /* Social Icons */
        .social-icons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .social-icon {
          color: var(--text-secondary);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(157, 78, 221, 0.3);
          text-decoration: none;
        }

        .social-icon:hover {
          color: var(--neon-blue);
          border-color: var(--neon-blue);
          transform: translateY(-2px);
          box-shadow: 0 0 15px rgba(5, 217, 232, 0.3);
        }

        /* Hero Section */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          padding: 6rem 2rem 4rem;
        }

        .hero-content {
          text-align: center;
          max-width: 900px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-subtitle {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          color: var(--neon-blue);
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 1rem;
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 0.2s;
        }

        .hero-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 0.4s;
        }

        .hero-title .pink-text {
          color: var(--neon-pink);
          text-shadow: 0 0 30px rgba(255, 42, 109, 0.5);
          display: block;
        }

        .hero-title .typed-text {
          color: #ffffff;
          display: block;
          margin-top: 0.5rem;
          min-height: 1.2em;
        }

        .typing-cursor {
          display: inline-block;
          width: 3px;
          height: 1em;
          background: var(--neon-blue);
          margin-left: 4px;
          animation: blink 0.7s infinite;
          vertical-align: text-bottom;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.8;
          opacity: 0;
          animation: fadeInUp 0.8s ease forwards;
          animation-delay: 0.6s;
          text-align: center;
        }

        .scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          opacity: 0;
          animation: fadeIn 1s ease forwards, bounce 2s infinite;
          animation-delay: 1s, 2s;
          margin-top: 2rem;
        }

        .scroll-indicator span {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(180deg, var(--neon-blue), transparent);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Section Styles */
        section {
          position: relative;
          z-index: 2;
          padding: 6rem 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
          color: var(--neon-pink);
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 1rem;
        }

        .section-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          background: linear-gradient(135deg, #ff5a8a 0%, #c084fc 50%, #22d3ee 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* About Section */
        .about-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .about-image-container {
          position: relative;
          margin-bottom: 2rem;
        }

        .about-image-wrapper {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          overflow: hidden;
        }

        .about-image-wrapper::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: var(--gradient-1);
          z-index: -1;
        }

        .about-image {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .about-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .about-greeting {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          color: var(--neon-blue);
        }

        .about-name {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .about-title {
          font-size: 1.3rem;
          color: var(--neon-pink);
        }

        .about-bio {
          color: var(--text-secondary);
          line-height: 1.9;
          font-size: 1.05rem;
          max-width: 700px;
          margin-bottom: 1.5rem;
        }

        .about-bio p {
          margin-bottom: 1rem;
        }

        .say-hi-btn {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          padding: 0.9rem 2rem;
          background: transparent;
          border: 2px solid var(--neon-pink);
          color: var(--neon-pink);
          text-decoration: none;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .say-hi-btn:hover {
          background: var(--neon-pink);
          color: var(--dark-bg);
          box-shadow: 0 0 30px var(--neon-pink), 0 0 60px rgba(255, 42, 109, 0.4);
        }

        .say-hi-btn svg {
          transition: all 0.3s ease;
        }

        .say-hi-btn:hover svg {
          stroke: var(--dark-bg);
        }

        /* Projects Grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .project-card {
          background: var(--card-bg);
          border: 1px solid rgba(157, 78, 221, 0.2);
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .project-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-2);
          background-size: 200% 100%;
          animation: gradient-shift 3s linear infinite;
        }

        .project-card:hover {
          transform: translateY(-10px);
          border-color: var(--neon-purple);
          box-shadow: 0 20px 60px rgba(157, 78, 221, 0.3), 0 0 30px rgba(255, 42, 109, 0.2);
        }

        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .project-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .project-description {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          flex-grow: 1;
        }

        .project-tech {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .tech-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
          background: rgba(5, 217, 232, 0.1);
          border: 1px solid rgba(5, 217, 232, 0.3);
          border-radius: 20px;
          color: var(--neon-blue);
        }

        .project-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid rgba(157, 78, 221, 0.2);
          width: 100%;
        }

        .project-link {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .project-link:hover {
          color: var(--neon-pink);
          border-color: var(--neon-pink);
          box-shadow: 0 0 15px rgba(255, 42, 109, 0.3);
        }

        .project-link svg {
          width: 16px;
          height: 16px;
        }

        /* Timeline */
        .timeline-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .timeline {
          position: relative;
          padding-left: 3rem;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, var(--neon-pink), var(--neon-purple), var(--neon-blue));
        }

        .timeline-item {
          position: relative;
          margin-bottom: 3rem;
          padding: 2rem;
          background: var(--card-bg);
          border: 1px solid rgba(157, 78, 221, 0.2);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -3rem;
          top: 2rem;
          width: 16px;
          height: 16px;
          background: var(--neon-pink);
          border-radius: 50%;
          transform: translateX(-7px);
          box-shadow: 0 0 20px var(--neon-pink);
        }

        .timeline-item:hover {
          border-color: var(--neon-purple);
          box-shadow: 0 10px 40px rgba(157, 78, 221, 0.2);
          transform: translateX(10px);
        }

        .timeline-period {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
          color: var(--neon-blue);
          margin-bottom: 0.5rem;
        }

        .timeline-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
        }

        .timeline-company {
          font-size: 1.1rem;
          color: var(--neon-pink);
          margin-bottom: 1rem;
        }

        .timeline-description {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .timeline-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .highlight-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.75rem;
          padding: 0.4rem 0.8rem;
          background: rgba(255, 42, 109, 0.1);
          border: 1px solid rgba(255, 42, 109, 0.3);
          border-radius: 20px;
          color: var(--neon-pink);
        }

        /* Skills Section with glow */
        .skills-container {
          max-width: 800px;
          margin: 0 auto;
        }

        .skill-item {
          margin-bottom: 2rem;
        }

        .skill-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }

        .skill-name {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .skill-percentage {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          color: var(--neon-blue);
        }

        .skill-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .skill-progress {
          height: 100%;
          background: var(--gradient-1);
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(255, 42, 109, 0.5), 0 0 40px rgba(157, 78, 221, 0.3);
          transition: width 1.5s ease;
          position: relative;
        }

        .skill-progress::after {
          content: '';
          position: absolute;
          right: 0;
          top: -4px;
          width: 16px;
          height: 16px;
          background: var(--neon-blue);
          border-radius: 50%;
          box-shadow: 0 0 15px var(--neon-blue), 0 0 30px rgba(5, 217, 232, 0.4);
        }

        .skill-item:hover .skill-progress {
          box-shadow: 0 0 30px rgba(255, 42, 109, 0.7), 0 0 60px rgba(157, 78, 221, 0.5);
        }

        .skill-item:hover .skill-progress::after {
          box-shadow: 0 0 20px var(--neon-blue), 0 0 40px rgba(5, 217, 232, 0.6);
        }

        /* Footer */
        .footer {
          text-align: center;
          padding: 3rem 2rem;
          border-top: 1px solid rgba(157, 78, 221, 0.2);
          position: relative;
          z-index: 2;
        }

        .footer-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .social-icons {
            display: none;
          }

          .hamburger {
            display: flex;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .projects-grid {
            grid-template-columns: 1fr;
          }

          .timeline {
            padding-left: 2rem;
          }

          .timeline::before {
            left: 0;
          }

          .timeline-item::before {
            left: -2rem;
          }

          .about-name {
            font-size: 1.8rem;
          }
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: var(--darker-bg);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--gradient-1);
          border-radius: 4px;
        }

        /* Selection */
        ::selection {
          background: var(--neon-pink);
          color: var(--dark-bg);
        }
      `}</style>

      {/* Background Effects */}
      <div className="grid-background"></div>
      <div className="particles">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}>
        {navItems.map((item) => (
          <span
            key={item}
            className={`mobile-nav-link ${activeSection === item.toLowerCase() ? "active" : ""}`}
            onClick={() => scrollToSection(item.toLowerCase())}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <ul className="nav-links">
            {navItems.map((item) => (
              <li key={item}>
                <span
                  className={`nav-link ${activeSection === item.toLowerCase() ? "active" : ""}`}
                  onClick={() => scrollToSection(item.toLowerCase())}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <div className="social-icons">
            <a
              href="mailto:dancastlebiz@gmail.com"
              className="social-icon"
              title="Email"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
            <a
              href="https://github.com/codecastillo"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="GitHub"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com/in/dancsatle"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
              title="LinkedIn"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="/resume.pdf"
              download
              className="social-icon"
              title="Resume"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </a>
          </div>
          <button
            className={`hamburger ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">
          <p className="hero-subtitle">// Welcome to my portfolio</p>
          <h1 className="hero-title">
            <span className="pink-text">DANIEL CASTILLO</span>
            <span className="typed-text">
              {typedText}
              <span className="typing-cursor"></span>
            </span>
          </h1>
          <p className="hero-description">
            Building clean, efficient web applications with modern technologies.
            Based in Utah, currently pursuing my technical certificate while
            actively seeking opportunities to grow as an engineer.
          </p>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="fade-in-section">
        <div className="section-header">
          <p className="section-tag">// Get to know me</p>
        </div>
        <div className="about-container">
          <div className="about-image-container">
            <div className="about-image-wrapper">
              <img className="about-image" src="/headshot.jpg" alt="Daniel Castillo" />
            </div>
          </div>
          <div className="about-content">
            <p className="about-greeting">Hello, I'm</p>
            <h3 className="about-name">DANIEL CASTILLO</h3>
            <p className="about-title">Software Engineer</p>
            <div className="about-bio">
              <p>
                I'm a 24-year-old software engineer based in Utah with a passion
                for building intuitive, user-friendly web applications. I'm
                currently pursuing my technical certificate at Dixie Technical
                College.
              </p>
              <p>
                My focus is on full-stack web development, with experience in
                JavaScript, React, Python, and database management. I enjoy
                tackling complex problems and turning them into clean, efficient
                solutions.
              </p>
              <p>
                I'm actively seeking opportunities where I can apply my skills,
                learn from experienced developers, and contribute to meaningful
                projects. Outside of coding, I enjoy baking. There's a lot of
                overlap between the two: both require following precise steps,
                experimenting with different combinations, and debugging when
                things don't rise as expected.
              </p>
            </div>
            <a href="mailto:dancastlebiz@gmail.com" className="say-hi-btn">
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Say Hi!
            </a>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="fade-in-section">
        <div className="section-header">
          <p className="section-tag">// Career path</p>
          <h2 className="section-title">Experience</h2>
        </div>
        <div className="timeline-container">
          <div className="timeline">
            {experiences.map((exp, index) => (
              <div key={index} className="timeline-item">
                <p className="timeline-period">{exp.period}</p>
                <h3 className="timeline-title">{exp.role}</h3>
                <p className="timeline-company">{exp.company}</p>
                <p className="timeline-description">{exp.description}</p>
                <div className="timeline-highlights">
                  {exp.highlights.map((highlight, i) => (
                    <span key={i} className="highlight-tag">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="fade-in-section">
        <div className="section-header">
          <p className="section-tag">// My foundation</p>
          <h2 className="section-title">Education</h2>
        </div>
        <div className="timeline-container">
          <div className="timeline">
            {education.map((edu, index) => (
              <div key={index} className="timeline-item">
                <p className="timeline-period">{edu.period}</p>
                <h3 className="timeline-title">{edu.degree}</h3>
                <p className="timeline-company">{edu.school}</p>
                <p className="timeline-description">Focus: {edu.focus}</p>
                <div className="timeline-highlights">
                  <span className="highlight-tag">{edu.gpa}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="fade-in-section">
        <div className="section-header">
          <p className="section-tag">// What I'm working on</p>
          <h2 className="section-title">Projects</h2>
        </div>
        <div className="projects-grid">
          {projects.map((project, index) => (
            <div key={index} className="project-card">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              <div className="project-tech">
                {project.tech.map((tech, i) => (
                  <span key={i} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="project-links">
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  Demo
                </a>
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Code
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="fade-in-section">
        <div className="section-header">
          <p className="section-tag">// My tech stack</p>
          <h2 className="section-title">Skills</h2>
        </div>
        <div className="skills-container">
          {skills.map((skill, index) => (
            <div key={index} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-percentage">{skill.level}%</span>
              </div>
              <div className="skill-bar">
                <div
                  className="skill-progress"
                  style={{ width: isLoaded ? `${skill.level}%` : "0%" }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer-text">&copy; Daniel Castillo 2026</p>
      </footer>
    </div>
  );
};

export default CyberpunkPortfolio;
