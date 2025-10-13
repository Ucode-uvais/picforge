"use client";
import {
  CheckCircle,
  Clock,
  Crop,
  Download,
  Expand,
  Loader2,
  Scissors,
  Type,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import UploadZone from "./UploadZone";

type JobStatus = "idle" | "queued" | "processing" | "completed" | "error";

interface ProcessingJob {
  id: string;
  type: string;
  status: JobStatus;
  progress: number;
  result?: string;
}

const primaryTools = [
  {
    id: "e-bgremove",
    name: "Remove Background",
    icon: Scissors,
    color: "primary",
    description: "Remove background with AI",
  },
  {
    id: "e-removedotbg",
    name: "Remove Background (Pro)",
    icon: Scissors,
    color: "secondary",
    description: "High-quality background removal",
  },
  {
    id: "e-changebg",
    name: "Change Background",
    icon: Expand,
    color: "primary",
    description: "Replace background with AI",
    hasPrompt: true,
  },
  {
    id: "e-edit",
    name: "AI Edit",
    icon: Type,
    color: "secondary",
    description: "Edit image with text prompts",
    hasPrompt: true,
  },
  {
    id: "bg-genfill",
    name: "Generative Fill",
    icon: Expand,
    color: "primary",
    description: "Fill empty areas with AI",
    hasPrompt: true,
  },
];

const secondaryTools = [
  {
    id: "e-dropshadow",
    name: "AI Drop Shadow",
    icon: Zap,
    color: "secondary",
    description: "Add realistic shadows",
  },
  {
    id: "e-retouch",
    name: "AI Retouch",
    icon: Zap,
    color: "primary",
    description: "Enhance and retouch image",
  },
  {
    id: "e-upscale",
    name: "AI Upscale 2x",
    icon: Zap,
    color: "secondary",
    description: "Upscale image quality",
  },
  {
    id: "e-genvar",
    name: "Generate Variations",
    icon: Type,
    color: "primary",
    description: "Create image variations",
    hasPrompt: true,
  },
  {
    id: "e-crop-face",
    name: "Face Crop",
    icon: Crop,
    color: "secondary",
    description: "Smart face-focused cropping",
  },
  {
    id: "e-crop-smart",
    name: "Smart Crop",
    icon: Crop,
    color: "primary",
    description: "AI-powered intelligent cropping",
  },
];

const allTools = [...primaryTools, ...secondaryTools];

const Editor = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<ProcessingJob | null>(null);
  const [editHistory, setEditHistory] = useState<ProcessingJob[]>([]);
  const [activeEffects, setActiveEffects] = useState<Set<string>>(new Set());
  const [promptText, setPromptText] = useState<string>("");
  const [showPromptInput, setShowPromptInput] = useState<boolean>(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setProcessedImage(null);
    setCurrentJob(null);
  };

  return (
    <section id="editor" className="py-24 relative overflow-hidden">
      {/*BG Effects*/}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/10" />
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary !bg-clip-text text-transparent">
              Forging
            </span>
            <span className="text-foreground"> Studio</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload your photo and transform it with AI-powered tools. See the
            image forgery happen in real-time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/*Upload Area*/}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <UploadZone onImageUpload={handleImageUpload} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Editor;
