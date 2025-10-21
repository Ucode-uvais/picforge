"use client";
import {
  CheckCircle,
  Clock,
  Crop,
  Download,
  Edit3Icon,
  Expand,
  ImageUpscaleIcon,
  Loader2,
  ScanFace,
  Scissors,
  ScissorsSquare,
  Type,
  Wallpaper,
  Wand2,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import UploadZone from "./UploadZone";
import { Button } from "@/components/ui/button";
import CanvasEditor from "./CanvasEditor";
import { saveAs } from "file-saver";

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
    icon: ScissorsSquare,
    color: "secondary",
    description: "High-quality background removal",
  },
  {
    id: "e-changebg",
    name: "Change Background",
    icon: Wallpaper,
    color: "primary",
    description: "Replace background with AI",
    hasPrompt: true,
  },
  {
    id: "e-edit",
    name: "AI Edit",
    icon: Edit3Icon,
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
    icon: Wand2,
    color: "primary",
    description: "Enhance and retouch image",
  },
  {
    id: "e-upscale",
    name: "AI Upscale 2x",
    icon: ImageUpscaleIcon,
    color: "secondary",
    description: "Upscale image quality",
  },
  {
    id: "e-genvar",
    name: "Generate Variations",
    icon: Type,
    color: "primary",
    description: "Create image variations",
    hasPrompt: false, // No prompt parameter according to docs
  },
  {
    id: "fo-face",
    name: "Face Crop",
    icon: ScanFace,
    color: "secondary",
    description: "Smart face-focused cropping",
  },
  {
    id: "fo-auto",
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
  const [effectPrompts, setEffectPrompts] = useState<Record<string, string>>(
    {}
  );
  const [promptText, setPromptText] = useState<string>("");
  const [showPromptInput, setShowPromptInput] = useState<boolean>(false);
  const [selectedPromptTool, setSelectedPromptTool] = useState<string | null>(
    null
  );
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const getImageDimensions = (
    imageUrl: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      img.src = imageUrl;
    });
  };

  const handleImageUpload = async (imageUrl: string) => {
    setUploadedImage(imageUrl);
    setProcessedImage(null);
    setCurrentJob(null);
    setActiveEffects(new Set());
    setEffectPrompts({});

    // Get image dimensions for bg-genfill
    try {
      const dimensions = await getImageDimensions(imageUrl);
      setImageDimensions(dimensions);
    } catch (error) {
      console.error("Failed to get image dimensions:", error);
      // Set default dimensions as fallback
      setImageDimensions({ width: 1200, height: 800 });
    }
  };

  const handlePromptSubmit = async () => {
    if (!promptText.trim() || !selectedPromptTool) return;

    await applyEffect(selectedPromptTool, promptText);
    setShowPromptInput(false);
    setPromptText("");
    setSelectedPromptTool(null);
  };

  const getImageKitTransform = (
    toolId: string,
    prompt?: string,
    additionalParams?: Record<string, string>
  ): string => {
    const transforms: Record<string, string> = {
      "e-bgremove": "e-bgremove",
      "e-removedotbg": "e-removedotbg",
      "e-changebg": prompt
        ? `e-changebg-prompt-${encodeURIComponent(prompt)}`
        : "e-changebg",
      "e-edit": prompt
        ? `e-edit-prompt-${encodeURIComponent(prompt)}`
        : "e-edit",
      "bg-genfill": (() => {
        let transform = prompt
          ? `bg-genfill-prompt-${encodeURIComponent(prompt)}`
          : "bg-genfill";

        // Add required parameters for bg-genfill
        if (additionalParams?.w) transform += `,w-${additionalParams.w}`;
        if (additionalParams?.h) transform += `,h-${additionalParams.h}`;
        if (additionalParams?.cm) transform += `,cm-${additionalParams.cm}`;

        return transform;
      })(),
      "e-dropshadow": "e-dropshadow",
      "e-retouch": "e-retouch",
      "e-upscale": "e-upscale",
      "e-genvar": "e-genvar", // No prompt parameter according to docs
      "fo-face": "fo-face", // Fixed ID for face crop
      "fo-auto": "fo-auto", // Fixed ID for smart crop
    };

    return transforms[toolId] || "";
  };

  // AI transformations that require async processing and colon chaining
  const isAITransformation = (toolId: string): boolean => {
    const aiTransforms = [
      "e-bgremove",
      "e-removedotbg",
      "e-changebg",
      "e-edit",
      "bg-genfill",
      "e-dropshadow",
      "e-retouch",
      "e-upscale",
      "e-genvar",
    ];
    return aiTransforms.includes(toolId);
  };

  const buildTransformUrl = (
    effects: string[],
    uploadedImage: string,
    promptMap?: Record<string, string>,
    dimensions?: { width: number; height: number } | null
  ): string => {
    if (effects.length === 0) return uploadedImage;

    // According to ImageKit docs: AI transformations should be chained with colons
    // When mixing AI and regular transformations, separate them appropriately
    const aiEffects: string[] = [];
    const regularEffects: string[] = [];

    effects.forEach((effect) => {
      const prompt = promptMap?.[effect];

      // Check if this effect requires a prompt but doesn't have one
      const tool = allTools.find((t) => t.id === effect);
      if (tool?.hasPrompt && !prompt) {
        // Skip this effect if it requires a prompt but doesn't have one
        return;
      }

      // Special handling for bg-genfill which requires width, height, and crop mode
      let additionalParams: Record<string, string> | undefined;
      if (effect === "bg-genfill") {
        // Use actual image dimensions if available, otherwise use default fallbacks
        if (dimensions) {
          // For generative fill, we typically want to extend beyond original dimensions
          // Adding 20% to each dimension for a nice extension effect
          const extendWidth = Math.round(dimensions.width * 1.2);
          const extendHeight = Math.round(dimensions.height * 1.2);

          additionalParams = {
            w: extendWidth.toString(),
            h: extendHeight.toString(),
            cm: "pad_resize",
          };
        } else {
          // Fallback to default dimensions if image dimensions not available
          additionalParams = {
            w: "1200",
            h: "800",
            cm: "pad_resize",
          };
        }
      }

      const transform = getImageKitTransform(effect, prompt, additionalParams);

      if (isAITransformation(effect)) {
        aiEffects.push(transform);
      } else {
        regularEffects.push(transform);
      }
    });

    // Build the transformation string
    let transformString = "";

    // Filter out empty transformations
    const filteredRegularEffects = regularEffects.filter(
      (t) => t && t.trim() !== ""
    );
    const filteredAiEffects = aiEffects.filter((t) => t && t.trim() !== "");

    if (filteredRegularEffects.length > 0 && filteredAiEffects.length > 0) {
      // Mixed transformations: regular first, then AI chained
      transformString = `${filteredRegularEffects.join(
        ","
      )},${filteredAiEffects.join(":")}`;
    } else if (filteredRegularEffects.length > 0) {
      // Only regular transformations
      transformString = filteredRegularEffects.join(",");
    } else if (filteredAiEffects.length > 0) {
      // Only AI transformations - chain with colons
      transformString = filteredAiEffects.join(":");
    }

    return `${uploadedImage}?tr=${transformString}`;
  };

  const handleToolClick = async (toolId: string) => {
    if (!uploadedImage) return;

    const tool = allTools.find((t) => t.id === toolId);

    if (!tool) return;

    // Toggle effect on/off
    const newActiveEffects = new Set(activeEffects);
    if (newActiveEffects.has(toolId)) {
      newActiveEffects.delete(toolId);
      setActiveEffects(newActiveEffects);

      // Remove the prompt for this effect as well
      const newEffectPrompts = { ...effectPrompts };
      delete newEffectPrompts[toolId];
      setEffectPrompts(newEffectPrompts);

      // remove effect from image
      const remainingEffects = Array.from(newActiveEffects);
      const newImageUrl = buildTransformUrl(
        remainingEffects,
        uploadedImage,
        newEffectPrompts,
        imageDimensions
      );
      setProcessedImage(newImageUrl);
      return;
    }

    // Check if tool requires prompt
    if (tool.hasPrompt) {
      setSelectedPromptTool(tool.id);
      setShowPromptInput(true);
      setPromptText("");
      return;
    }

    // Apply effect immediately
    await applyEffect(toolId);
  };

  const applyEffect = async (toolId: string, prompt?: string) => {
    if (!uploadedImage) return;

    const newJob: ProcessingJob = {
      id: Date.now().toString(),
      type: toolId,
      status: "queued",
      progress: 0,
    };

    setCurrentJob(newJob);

    // Check if tool requires prompt and we have one, or if it doesn't require prompt
    const tool = allTools.find((t) => t.id === toolId);
    const hasRequiredPrompt = !tool?.hasPrompt || (tool?.hasPrompt && prompt);

    if (!hasRequiredPrompt) {
      console.warn(`Tool ${toolId} requires a prompt but none was provided`);
      return;
    }

    // Apply effect to active effects
    const newActiveEffects = new Set(activeEffects);
    newActiveEffects.add(toolId);
    setActiveEffects(newActiveEffects);

    // Update effect prompts to include the current prompt
    const newEffectPrompts = { ...effectPrompts };
    if (prompt && toolId) {
      newEffectPrompts[toolId] = prompt;
    }
    setEffectPrompts(newEffectPrompts);

    // Generate the ImageKit transformation URL
    const allEffects = Array.from(newActiveEffects);
    const newImageUrl = buildTransformUrl(
      allEffects,
      uploadedImage,
      newEffectPrompts,
      imageDimensions
    );

    try {
      // Start polling the AI transformation URL to check when it's complete
      setCurrentJob((prev) =>
        prev ? { ...prev, status: "processing", progress: 10 } : null
      );

      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5s intervals)
      const pollInterval = 5000; // 5seconds / 5k ms

      const pollImageKit = async (): Promise<boolean> => {
        attempts++;

        try {
          const response = await fetch(newImageUrl, {
            method: "HEAD", // only check headers, don't download image
            cache: "no-cache", // don't use cached version
          });

          // Check for intermediate response header as per ImageKit docs
          const isIntermediateResponse = response.headers.get(
            "is-intermediate-response"
          );

          if (response.ok && isIntermediateResponse !== "true") {
            // AI transformation is complete
            setProcessedImage(newImageUrl);
            setCurrentJob((prev) =>
              prev ? { ...prev, progress: 100, status: "completed" } : null
            );

            const completedJob = {
              ...newJob,
              status: "completed" as JobStatus,
              progress: 100,
              result: newImageUrl,
            };
            setEditHistory((prev) => [completedJob, ...prev.slice(0, 2)]);
            return true;
          } else if (response.ok && isIntermediateResponse === "true") {
            // Still processing, continue polling
            console.log(`Poll attempt ${attempts}: AI still processing...`);
          }
        } catch (error) {
          console.log(`Poll attempt ${attempts}: AI still processing...`);
        }

        // update progress based on attempts
        const progress = Math.min(10 + attempts * 1.5, 90); // 10% to 90%
        setCurrentJob((prev) => (prev ? { ...prev, progress } : null));

        if (attempts >= maxAttempts) {
          // Timeout - mark as completed anyway
          setProcessedImage(newImageUrl);
          setCurrentJob((prev) =>
            prev ? { ...prev, progress: 100, status: "completed" } : null
          );

          const completedJob = {
            ...newJob,
            status: "completed" as JobStatus,
            progress: 100,
            result: newImageUrl,
          };
          setEditHistory((prev) => [completedJob, ...prev.slice(0, 2)]);
          return true;
        }

        // Continue polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
        return pollImageKit();
      };

      // starting polling
      await pollImageKit();
    } catch (error) {
      console.error("Error applying effect:", error);
      setCurrentJob((prev) => (prev ? { ...prev, status: "error" } : null));
    }
  };

  const handleExport = (format: string) => {
    if (!processedImage) return;

    saveAs(processedImage, `pixora-${Date.now()}.${format}`);
  };

  return (
    <section id="editor" className="py-24 relative overflow-hidden">
      {/* Background effects */}
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
              Magic
            </span>
            <span className="text-foreground"> Studio</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload your photo and transform it with AI-powered tools. See the
            magic happen in real-time.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* upload area */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <UploadZone onImageUpload={handleImageUpload} />

            {/* Toolbar */}
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                AI Tools
              </h3>

              {/* Prompt Input */}
              {showPromptInput && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 p-4 glass rounded-lg border border-card-border"
                >
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    placeholder="Describe what you want to change..."
                    className="w-full p-3 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground resize-none"
                    rows={3}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePromptSubmit}
                      disabled={!promptText.trim()}
                      className="flex-1"
                    >
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPromptInput(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}

              {primaryTools.map((tool) => {
                const isActive = activeEffects.has(tool.id);
                const isProcessing =
                  currentJob?.type === tool.id &&
                  currentJob.status === "processing";
                const isQueued =
                  currentJob?.type === tool.id &&
                  currentJob.status === "processing";
                const isDisabled =
                  !uploadedImage || currentJob?.status === "processing";

                return (
                  <Button
                    key={tool.id}
                    variant={isActive ? "default" : "outline"}
                    className={`w-full justify-start shadow-glass transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-gray-600 hover:border-primary/30"
                    }`}
                    onClick={() => handleToolClick(tool.id)}
                    disabled={isDisabled}
                    title={tool.description}
                  >
                    <tool.icon
                      className={`h-4 w-4 mr-2 ${
                        isProcessing ? "animate-pulse" : ""
                      }`}
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{tool.name}</div>
                      {tool?.hasPrompt && (
                        <div className="text-xs opacity-70">
                          Requires Prompt
                        </div>
                      )}
                    </div>
                    {isActive && !isProcessing && (
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    )}
                    {isQueued && (
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    )}
                    {isProcessing && (
                      <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                    )}
                  </Button>
                );
              })}
            </div>
          </motion.div>

          {/* Main Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <CanvasEditor
              originalImage={uploadedImage}
              processedImage={processedImage}
              isProcessing={currentJob?.status === "processing"}
            />

            {/* Secondery Tools */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Additional Tools
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {secondaryTools.map((tool) => {
                  const isActive = activeEffects.has(tool.id);
                  const isProcessing =
                    currentJob?.type === tool.id &&
                    currentJob.status === "processing";
                  const isQueued =
                    currentJob?.type === tool.id &&
                    currentJob.status === "queued";
                  const isDisabled =
                    !uploadedImage || currentJob?.status === "processing";

                  return (
                    <Button
                      key={tool.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className={`justify-start shadow-glass transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-gray-600 hover:border-primary/30"
                      }`}
                      onClick={() => handleToolClick(tool.id)}
                      disabled={isDisabled}
                      title={tool.description}
                    >
                      <tool.icon
                        className={`h-3 w-3 mr-2 ${
                          isProcessing ? "animate-pulse" : ""
                        }`}
                      />
                      <span className="text-xs">{tool.name}</span>
                      {isActive && !isProcessing && (
                        <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full ml-auto" />
                      )}
                      {isProcessing && (
                        <Loader2 className="h-3 w-3 ml-auto animate-spin" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Panel - Job Status */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="shadow-glass rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Job Status
              </h3>

              {currentJob ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {currentJob.status === "processing" ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : currentJob.status === "completed" ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : currentJob.status === "queued" ? (
                      <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {allTools.find((t) => t.id === currentJob.type)?.name ||
                          currentJob.type.replace("-", " ")}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {currentJob.status === "queued" &&
                          "Preparing AI transformation..."}
                        {currentJob.status === "processing" &&
                          `Processing with AI... (${currentJob.progress}%)`}
                        {currentJob.status === "completed" &&
                          "AI transformation completed!"}
                        {currentJob.status === "error" && "Processing failed"}
                      </p>
                    </div>
                  </div>

                  {(currentJob.status === "processing" ||
                    currentJob.status === "queued") && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          currentJob.status === "queued"
                            ? "bg-muted-foreground animate-pulse"
                            : "bg-gradient-primary"
                        }`}
                        style={{
                          width:
                            currentJob.status === "queued"
                              ? "100%"
                              : `${currentJob.progress}%`,
                        }}
                      />
                      <div className="text-xs text-muted-foreground mt-1 text-center">
                        {currentJob.status === "queued" && "Initializing..."}
                        {currentJob.status === "processing" &&
                          "Waiting for AI to complete transformation..."}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Upload an image and select a tool to start
                </p>
              )}

              {/* Edit History */}
              {editHistory?.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Recent Edits
                  </h4>
                  <div className="space-y-2">
                    {editHistory?.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center space-x-2 text-sm"
                      >
                        <CheckCircle className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground capitalize">
                          {job?.type?.replace("-", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Button */}
              {processedImage && (
                <div className="mt-6">
                  <Button
                    variant={"hero"}
                    onClick={() => handleExport("jpg")}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Editor;
