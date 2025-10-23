"use client";
import { signIn, useSession, signOut } from "next-auth/react"; // 1. Import signOut
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, SwitchCamera, X } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (session?.user) {
      scrollToSection("editor");
    } else {
      await signIn("google");
    }
  };

  // 2. Add a sign-out handler
  const handleSignOut = async () => {
    setIsMobileMenuOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
  ${
    isScrolled
      ? "glass border-b border-card-border backdrop-blur-glass"
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
                className="h-8 w-8 text-primary animate-glow-pulse"
              />
              <div className="absolute inset-0 h-8 w-8 text-secondary animate-glow-pulse opacity-50" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary !bg-clip-text text-transparent">
              PicForge AI
            </span>
          </motion.div>

          {/*Navigation*/}
          <div className="hidden md:flex items-center space-x-6">
            {" "}
            {/* Reduced space slightly to fit */}
            <button
              onClick={() => scrollToSection("features")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Pricing
            </button>
            <Button
              variant="hero"
              className="font-semibold" // Removed w-full
              onClick={handleSubmit}
            >
              {session?.user ? "Let's Forge" : "Sign In"}
            </Button>
            {/* 3. Add Sign Out button for desktop */}
            {session?.user && (
              <Button
                variant="outline"
                className="font-semibold"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4">
            <button
              onClick={() => scrollToSection("features")}
              className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="block w-full text-left text-foreground hover:text-primary transition-colors font-medium"
            >
              Pricing
            </button>
            <Button
              variant="hero"
              className="w-full font-semibold"
              onClick={handleSubmit}
            >
              {session?.user ? "Let's Forge" : "Sign In"}
            </Button>
            {/* 4. Add Sign Out button for mobile */}
            {session?.user && (
              <Button
                variant="outline"
                className="w-full font-semibold"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
