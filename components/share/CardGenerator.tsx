"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { Scan } from "@/types/scan";
import SummaryCard from "./SummaryCard";

interface CardGeneratorProps {
  scan: Scan;
  previousScan?: Scan | null;
  theme?: 'light' | 'dark' | 'branded';
}

export default function CardGenerator({ scan, previousScan, theme = 'light' }: CardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const exportAsPNG = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        scale: 2, // Higher quality
        logging: false,
      });

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inbody-scan-${new Date(scan.scan_date || scan.created_at).toISOString().split('T')[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error exporting card:', error);
      alert('Failed to export card. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <div ref={cardRef} className="scale-50 origin-top">
          <SummaryCard scan={scan} previousScan={previousScan} theme={theme} />
        </div>
      </div>
      
      <div className="flex gap-4 justify-center">
        <button
          onClick={exportAsPNG}
          className="btn-organic"
        >
          Download as PNG
        </button>
      </div>
    </div>
  );
}

