import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

const BeforeAfterSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  // Real before/after images
  const beforeImage = "https://ik.imagekit.io/fftupmwca/tree.webp";
  const afterImage = "https://ik.imagekit.io/fftupmwca/tree-transformed.webp";

  return (
    <motion.div
      className="relative w-full max-w-lg mx-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-glass border border-card-border glow-subtle cursor-ew-resize select-none"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Before Image */}
        <div className="absolute inset-0">
          <img
            src={beforeImage}
            alt="Before - Original Image of Tree"
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* After Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={afterImage}
            alt="After - AI Edited Image of Tree"
            className="w-full h-full object-cover select-none"
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-gradient-primary cursor-ew-resize group"
          style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-primary rounded-full shadow-glow-primary group-hover:scale-110 transition-transform flex items-center justify-center">
            <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center">
              <div className="w-1 h-4 bg-gradient-primary rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 text-xs font-medium text-muted-foreground">
          AFTER
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-medium text-primary">
          BEFORE
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="text-center mt-4 text-sm text-muted-foreground"
      >
        Drag the slider to see the magic 🪄
      </motion.p>
    </motion.div>
  );
};

export default BeforeAfterSlider;
