import React, { useCallback, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Crown, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import PaymentModal from "@/components/PaymentModal";
import { useSession } from "next-auth/react"; // 1. Import useSession
import SignInModal from "@/components/SignInModal"; // 2. Import the new modal

interface UploadZoneProps {
  onImageUpload: (imageUrl: string) => Promise<void>;
}

const UploadZone = ({ onImageUpload }: UploadZoneProps) => {
  const { data: session, status } = useSession(); // 3. Get session status
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false); // 4. Add state for sign-in modal
  const [usageData, setUsageData] = useState<{
    usageCount: number;
    usageLimit: number;
    plan: string;
    canUpload: boolean;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // check the usage on component mount, only if authenticated
  useEffect(() => {
    if (status === "authenticated") {
      checkUsage()?.catch(console.error);
    }
  }, [status]); // Run when status changes

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const getUploadAuthParams = async () => {
    const response = await fetch("/api/upload-auth");

    if (!response.ok) {
      throw new Error("Failed to get upload auth params");
    }
    const data = await response?.json();

    return data;
  };

  const uploadToImageKit = async (file: File): Promise<string> => {
    try {
      // Get authentication parameters
      const { token, expire, signature, publicKey } =
        await getUploadAuthParams();

      const result = await upload({
        file,
        fileName: file?.name,
        folder: "picforge-uploads",
        expire,
        token,
        signature,
        publicKey,
        onProgress: (event) => {
          // Update progress if needed
          console.log(
            `Upload progress: ${(event.loaded / event.total) * 100}%`
          );
        },
      });

      return result.url || "";
    } catch (error) {
      if (error instanceof ImageKitInvalidRequestError) {
        throw new Error("Invalid upload request");
      } else if (error instanceof ImageKitServerError) {
        throw new Error("ImageKit server error");
      } else if (error instanceof ImageKitUploadNetworkError) {
        throw new Error("Network error during upload");
      } else {
        throw new Error("Upload failed");
      }
    }
  };

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

  // Wrapped handleFiles in useCallback for stability
  const handleFiles = useCallback(
    async (files: File[]) => {
      // 5. Check session status before doing anything
      if (status === "loading") {
        return; // Wait for session to load
      }

      if (status === "unauthenticated") {
        setShowSignInModal(true); // Show sign-in modal
        return;
      }

      const imageFile = files?.find((file) => file.type.startsWith("image/"));
      if (imageFile) {
        setIsUploading(true);

        try {
          // Check usage first
          await checkUsage();

          // Update usage count
          await updateUsage();

          // Upload to ImageKit
          const imageUrl = await uploadToImageKit(imageFile);
          setUploadedImage(imageUrl);
          await onImageUpload(imageUrl);
        } catch (error) {
          console.error("Upload failed:", error);
          // Don't reset uploading state if payment modal is shown
          if (!showPaymentModal) {
            setIsUploading(false);
          }
        } finally {
          // Only set to false if not showing payment modal
          if (!showPaymentModal) {
            setIsUploading(false);
          }
        }
      }
    },
    [onImageUpload, status, showPaymentModal] // 6. Add status and showPaymentModal to dependencies
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles] // handleFiles will now check auth
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFiles(files);
    },
    [handleFiles] // handleFiles will now check auth
  );

  const clearImage = () => {
    setUploadedImage(null);
    onImageUpload(null as any); // Clear image in parent
  };

  const handleBrowseClick = () => {
    // 7. Check auth on button click too, before opening file dialog
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setShowSignInModal(true);
      return;
    }
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {uploadedImage ? (
        <div className="relative glass rounded-xl p-4 border border-card-border">
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 z-10 p-1 bg-background/80 rounded-full hover:bg-destructive/20 transition-colors"
          >
            <X className="h-4 w-4 text-foreground hover:text-destructive" />
          </button>
          <div className="aspect-square rounded-lg overflow-hidden">
            <img
              src={uploadedImage}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm font-medium text-foreground">
              {uploadedImage.startsWith("data:")
                ? "Local preview"
                : "Uploaded to cloud"}
            </p>
            <p className="text-xs text-muted-foreground">
              Ready for AI magic ✨
            </p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`shadow-glass rounded-xl p-8 border-2 border-dashed border-gray-800 transition-all duration-300 ${
            isDragOver
              ? "border-primary bg-primary/5 scale-105"
              : "border-card-border  hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            ref={fileInputRef}
          />
          <label
            htmlFor={status === "authenticated" ? "file-upload" : undefined}
            onClick={(e) => {
              if (status !== "authenticated") e.preventDefault();
            }} // Prevent label click from opening dialog if not auth'd
            className="cursor-pointer block text-center"
          >
            <motion.div
              animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
              className="mb-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : isDragOver ? (
                  <Upload className="w-8 h-8 text-primary animate-bounce" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-primary" />
                )}
              </div>
            </motion.div>

            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isUploading
                ? "Uploading to cloud..."
                : isDragOver
                ? "Drop your Image here"
                : "Upload Image"}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {isUploading
                ? "Please wait while we upload your image"
                : "Drag & drop or click to browse"}
            </p>
          </label>

          <div className="text-center">
            <Button
              variant="outline"
              className="glass border-card-border"
              disabled={isUploading}
              onClick={handleBrowseClick} // This handler now checks auth
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Browse Files
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Usage Info*/}

      {usageData &&
        status === "authenticated" && ( // Only show usage if logged in
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <span>
                Usage: {usageData.usageCount}/{usageData.usageLimit}
              </span>
              {usageData.plan === "Free" && (
                <Crown className="h-3 w-3 text-primary" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Supports JPG, PNG, WebP up to 10MB
            </p>
          </div>
        )}

      {/*Payment Modal*/}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setIsUploading(false); // Reset uploading state when modal is closed
        }}
        onUpgrade={() => {
          setShowPaymentModal(false);
          setIsUploading(false);
        }}
        usageCount={usageData?.usageCount || 0}
        usageLimit={usageData?.usageLimit || 20}
      />

      {/* 8. Add the new sign-in modal to the DOM */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </motion.div>
  );
};

export default UploadZone;
