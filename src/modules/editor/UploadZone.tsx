import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Crown, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadZoneProps {
  onImageUpload: (imageUrl: string) => void;
}

const UploadZone = ({ onImageUpload }: UploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [usageData, setUsageData] = useState<{
    usageCount: number;
    usageLimit: number;
    plan: string;
    canUpload: boolean;
  } | null>(null);

  // check the usage on component mount
  useEffect(() => {
    checkUsage()?.catch(console.error);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const imageFile = files?.find((file) => file.type.startsWith("image/"));
    if (imageFile) {
      setIsUploading(true);

      try {
        // Check usage first
        await checkUsage();

        // Update usage count
        await updateUsage();
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
    },
    []
  );

  const checkUsage = async () => {
    const response = await fetch("/api/usage");
    if (!response.ok) {
      throw new Error("Failed to check usage");
    }
    const data = await response.json();
    setUsageData(data);
    return data;
  };

  const updateUsage = async () => {
    const response = await fetch("/api/usage", { method: "POST" });
    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 403) {
        // Usage limit reached
        setUsageData(errorData);
        setShowPaymentModal(true);
        throw new Error("Usage limit reached");
      }
      throw new Error("Failed to update usage");
    }
    const data = await response.json();
    setUsageData(data);
    return data;
  };

  return <div></div>;
};

export default UploadZone;
