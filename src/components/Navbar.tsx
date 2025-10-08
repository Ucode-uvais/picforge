"use client";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { SwitchCamera } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
  ${
    isScrolled
      ? "shadow-glass border-b border-card-border backdrop-blur-glass"
      : "bg-transparent"
  }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/*LOGO*/}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection("hero")}
          >
            <div className="relative">
              <SwitchCamera
                fill="transparent"
                className="h-w w-8 text-primary animate-glow-pulse"
              />
              <div className="absolute inset-0 h-8 w-8 text-secondary animate-glow-pulse opacity-50" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary !bg-clip-text text-transparent">
              Picforge AI
            </span>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
