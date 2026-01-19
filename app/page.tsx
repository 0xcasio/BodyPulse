"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSession } from "@/lib/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import { pageVariants, fadeInUp, scaleIn, staggerContainer, scrollFadeIn } from "@/lib/motion";

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { session } = await getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
    } catch (error) {
      router.push("/auth/login");
    } finally {
      setIsCheckingAuth(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen blob-bg flex items-center justify-center">
        <div className="text-sage-600">Loading...</div>
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/heic", "application/pdf"];
    return validTypes.includes(file.type);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Clear any old extraction data before processing new file
      sessionStorage.removeItem('extractedScanData');
      sessionStorage.removeItem('currentScan');
      
      const formData = new FormData();
      formData.append('file', file);

      console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze scan');
      }

      // Log extraction result for debugging
      console.log('📊 Extraction result:', {
        fileName: result.fileName,
        confidence: result.confidence,
        hasData: !!result.data,
        scanDate: result.data?.scan_date,
        weight: result.data?.weight?.value,
        inbodyScore: result.data?.inbody_score,
        warning: result.warning,
      });

      // Store the result in sessionStorage
      sessionStorage.setItem('extractedScanData', JSON.stringify(result));
      
      // Navigate to review page (we're not storing images for now)
      router.push('/review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen blob-bg overflow-x-hidden">
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20 w-full overflow-x-hidden"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={fadeInUp}>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 text-sage-900">
            Body Pulse
          </h1>
          <p className="text-lg md:text-xl text-sage-600 max-w-2xl mx-auto text-balance">
            Upload your InBody scan and get clear, actionable insights about your body composition
          </p>
        </motion.div>

        {/* Upload Card */}
        <motion.div
          className="card-soft p-8 md:p-12"
          variants={scaleIn}
        >
          <motion.div
            className={`
              relative border-2 border-dashed rounded-2xl p-12 md:p-16 text-center
              transition-all duration-300 ease-out
              ${
                isDragging
                  ? "border-sage-400 bg-sage-50 scale-[1.02]"
                  : "border-sage-200 bg-white hover:border-sage-300"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              scale: isDragging ? 1.02 : 1,
              borderColor: isDragging ? "rgb(125, 149, 125)" : "rgb(163, 181, 163)",
            }}
            transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                >
                  {/* Upload Icon */}
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <div className="absolute inset-0 bg-sage-200 rounded-full blur-xl opacity-40 animate-pulse-soft"></div>
                      <div className="relative bg-gradient-to-br from-sage-100 to-terracotta-50 p-6 rounded-full">
                        <Upload className="w-12 h-12 text-sage-600" strokeWidth={1.5} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Upload Text */}
                  <h2 className="text-2xl font-display font-semibold text-sage-900 mb-3">
                    Upload Your InBody Scan
                  </h2>
                  <p className="text-sage-600 mb-8 max-w-md mx-auto">
                    Drag and drop your scan here, or choose from your device
                  </p>

                  {/* Upload Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.label
                      className="btn-organic cursor-pointer flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take Photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/heic"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </motion.label>

                    <motion.label
                      className="px-6 py-3 rounded-full font-medium transition-all duration-300 cursor-pointer flex items-center gap-2 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/heic,application/pdf"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </motion.label>
                  </div>

                  {/* Supported Formats */}
                  <p className="text-sm text-sage-500 mt-6">
                    Supports JPG, PNG, HEIC, and PDF
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
                >
                  {/* File Selected */}
                  <div className="mb-6 flex justify-center">
                    <motion.div
                      className="relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="absolute inset-0 bg-sage-200 rounded-full blur-xl opacity-40"></div>
                      <div className="relative bg-gradient-to-br from-sage-500 to-sage-600 p-6 rounded-full">
                        <FileText className="w-12 h-12 text-white" strokeWidth={1.5} />
                      </div>
                    </motion.div>
                  </div>

                  <h3 className="text-xl font-display font-semibold text-sage-900 mb-2">
                    {file.name}
                  </h3>
                  <p className="text-sage-600 mb-6">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="mb-4 p-4 bg-terracotta-50 border border-terracotta-200 rounded-xl text-terracotta-700 text-sm"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                      onClick={handleAnalyze}
                      disabled={isProcessing}
                      className="btn-organic disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      whileHover={!isProcessing ? { scale: 1.05 } : {}}
                      whileTap={!isProcessing ? { scale: 0.95 } : {}}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <span>Analyze Scan</span>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setFile(null);
                        setError(null);
                        // Clear sessionStorage when choosing a different file
                        sessionStorage.removeItem('extractedScanData');
                        sessionStorage.removeItem('currentScan');
                      }}
                      disabled={isProcessing}
                      className="px-6 py-3 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={!isProcessing ? { scale: 1.05 } : {}}
                      whileTap={!isProcessing ? { scale: 0.95 } : {}}
                    >
                      Choose Different File
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            {
              title: "AI-Powered",
              description: "Advanced vision AI extracts all metrics accurately",
            },
            {
              title: "Clear Insights",
              description: "Complex metrics explained in plain English",
            },
            {
              title: "Track Progress",
              description: "Save scans and visualize your journey over time",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="card-soft p-6 text-center"
              variants={scrollFadeIn}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 24px rgba(95, 122, 95, 0.12)",
                transition: {
                  duration: 0.2,
                  ease: [0.4, 0.0, 0.2, 1],
                },
              }}
            >
              <h3 className="font-display font-semibold text-sage-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-sage-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
