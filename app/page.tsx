"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Download,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
  Eraser,
  Wand2,
  ZoomIn,
  Crop,
  User,
  Edit,
  Copy,
} from "lucide-react";
import { upload } from "@imagekit/next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import {
  transformationOptions,
  demoImages,
  buildTransformationUrl,
} from "@/config/imagekit";

// Icon mapping for transformations
const iconMap = {
  eraser: Eraser,
  scissors: Eraser,
  shadow: Wand2,
  sparkles: Sparkles,
  "zoom-in": ZoomIn,
  crop: Crop,
  user: User,
  copy: Copy,
  palette: Wand2,
  edit: Edit,
};

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedTransformations, setSelectedTransformations] = useState<
    string[]
  >([]);

  const [processedImageUrl, setProcessedImageUrl] = useState<string>("");

  const [isUsingDemo, setIsUsingDemo] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setUploadedImageUrl("");
      setIsUploading(true);

      try {
        // Get authentication parameters
        const authResponse = await fetch("/api/upload-auth");

        if (!authResponse.ok) {
          throw new Error("Failed to get upload authentication");
        }

        const { token, expire, signature, publicKey } =
          await authResponse.json();

        // Upload using ImageKit SDK
        const uploadResponse = await upload({
          file,
          fileName: file.name,
          token,
          expire,
          signature,
          publicKey,
          // Optional: Track upload progress
          onProgress: (event) => {
            // Could add progress tracking here if needed
            console.log(
              `Upload progress: ${(event.loaded / event.total) * 100}%`
            );
          },
        });

        if (uploadResponse.url) {
          setUploadedImageUrl(uploadResponse.url);
          console.log("Image uploaded to ImageKit:", uploadResponse.url);
        } else {
          throw new Error("Upload response missing URL");
        }
      } catch (error) {
        console.error("Upload error:", error);
        // Upload failed, but we can still continue with demo
      } finally {
        setIsUploading(false);
      }
      // TODO: Add ImageKit upload logic here
      console.log("File selected:", file.name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const toggleTransformation = (transformationId: string) => {
    setSelectedTransformations((prev) => {
      if (prev.includes(transformationId)) {
        return prev.filter((id) => id !== transformationId);
      } else {
        return [...prev, transformationId];
      }
    });

    // Reset processed image and loading state when changing selections
    if (processedImageUrl) {
      setProcessedImageUrl("");
      setIsImageLoading(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setImagePreview("");
  };

  const useDemoImage = () => {
    // For tutorial: Add demo image logic
    console.log("Demo image selected");
  };

  // Get main transformations
  const mainTransformations = transformationOptions.filter((t) =>
    [
      "bg-removal",
      "bg-remove-shadow",
      "smart-crop",
      "face-crop",
      "resize-optimize",
      "enhance-basic",
    ].includes(t.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Pic Forge</h1>
          <p className="text-muted-foreground font-sans">
            Transform your images with AI
          </p>
        </div>

        {!uploadedImage ? (
          /* Upload State */
          <Card className="mx-auto">
            <CardContent className="p-8">
              <div
                {...getRootProps()}
                className={`p-12 text-center cursor-pointer border-2 border-dashed rounded-lg transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />

                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>

                  <div>
                    <h3 className="text-xl font-heading font-semibold mb-2">
                      {isDragActive ? "Drop your image" : "Upload an image"}
                    </h3>
                    <p className="text-muted-foreground font-sans">
                      JPG, PNG, WEBP up to 10MB
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center pt-4">
                    <Button onClick={(e) => e.stopPropagation()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        useDemoImage();
                      }}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Try Demo
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Main Interface */
          <div className="space-y-8">
            {/* Image Preview */}

            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Your Image</CardTitle>

                {isUploading && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      📤 Uploading to PicForge...
                    </p>
                  </div>
                )}
                {!isUsingDemo &&
                  uploadedImage &&
                  !isUploading &&
                  uploadedImageUrl && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        ✅ Image uploaded! AI transformations will work on your
                        actual image.
                      </p>
                    </div>
                  )}
                {!isUsingDemo &&
                  uploadedImage &&
                  !isUploading &&
                  !uploadedImageUrl && (
                    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        ❌ Upload failed. Transformations will use demo image.
                      </p>
                    </div>
                  )}
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 aspect-square flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Transformation Tools Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">AI Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-2">
                    AI Transformations Coming Soon
                  </h3>
                  <p className="text-muted-foreground font-sans">
                    Follow the tutorial to add ImageKit AI transformations
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={reset} variant="outline" size="lg">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Image
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
