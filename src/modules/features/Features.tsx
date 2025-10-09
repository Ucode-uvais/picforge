"use client";
import { Crop, Expand, Scissors, Type, Zap } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-test";
const features = [
  {
    icon: Scissors,
    title: "AI Background Removal",
    description:
      "1-click clean photos with precision AI. Remove any background instantly and get professional results.",
    gradient: "from-primary to-primary-glow",
    delay: 0.1,
  },
  {
    icon: Expand,
    title: "AI Generative Fill",
    description:
      "Expand your canvas and auto-fill edges seamlessly. Create perfect aspect ratios effortlessly.",
    gradient: "from-secondary to-secondary-glow",
    delay: 0.2,
  },
  {
    icon: Zap,
    title: "AI Upscale & Enhance",
    description:
      "Transform low-quality or compressed images into crisp, high-definition visuals.",
    gradient: "from-primary to-secondary",
    delay: 0.3,
  },
  {
    icon: Crop,
    title: "Smart Crop & Face Focus",
    description:
      "Let AI auto-crop images, keeping faces and key details perfectly centered.",
    gradient: "from-secondary to-primary",
    delay: 0.4,
  },
  {
    icon: Type,
    title: "Watermark & Text Overlay",
    description:
      "Brand your content professionally. Add custom watermarks and text with perfect positioning.",
    gradient: "from-primary-glow to-secondary-glow",
    delay: 0.5,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center">
            <SparklesText
              text="Magical AI"
              colors={{ first: "#ffc800", second: "#ff8c00" }}
              className="text-4xl lg:text-6xl"
            />
            <h2 className="text-4xl lg:text-6xl font-bold ml-4">
              <span className="bg-gradient-primary !bg-clip-text text-transparent">
                Features
              </span>
            </h2>
          </div>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mt-6">
            Transform your images with next-generation AI tools. Every feature
            in PicForge is designed to give you professional-quality results in
            an instant.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {features?.slice(0, 3).map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.slice(3).map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index + 3}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

function FeatureCard({ feature, index }: { feature: any; index: number }) {
  const { icon: Icon, title, description, gradient, delay } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group"
    >
      <div className="h-full glass rounded-2xl p-8 border border-card-border hover:border-primary/30 transition-all duration-300 shadow-glow-subtle hover:shadow-glow-primary">
        <div className="relative mb-6">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} p-4 group-hover:animate-glow-pulse`}
          >
            <Icon className="w-full h-full text-background" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
        </div>

        <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground leading-relaxed">{description}</p>

        <div className="mt-6 pt-6 border-t border-card-border">
          <div className="flex items-center space-x-2 text-sm text-primary">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="font-medium">PicForge AI Powered</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Features;
