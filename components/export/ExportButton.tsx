"use client";

import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2, Check } from "lucide-react";
import { Scan } from "@/types/scan";
import { exportScanToCSV, downloadCSV } from "@/lib/export/csv";
import { exportScanToExcel, downloadExcel } from "@/lib/export/excel";

interface ExportButtonProps {
  scan: Scan;
}

export default function ExportButton({ scan }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showDropdown, setShowDropdown] = useState(false);

  const generateFilename = (extension: string): string => {
    const date = scan.scan_date 
      ? new Date(scan.scan_date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    return `body-pulse-scan-${date}.${extension}`;
  };

  const handleCSVExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    setShowDropdown(false);

    try {
      const csvData = exportScanToCSV(scan);
      const filename = generateFilename('csv');
      downloadCSV(csvData, filename);
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExcelExport = async () => {
    setIsExporting(true);
    setExportStatus('idle');
    setShowDropdown(false);

    try {
      const excelBlob = exportScanToExcel(scan);
      const filename = generateFilename('xlsx');
      downloadExcel(excelBlob, filename);
      
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch (error) {
      console.error('Error exporting Excel:', error);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="px-4 py-2 rounded-full font-medium transition-all duration-300 bg-white text-sage-700 border-2 border-sage-200 hover:border-sage-300 hover:bg-sage-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export scan data"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : exportStatus === 'success' ? (
          <>
            <Check className="w-4 h-4" />
            <span>Exported!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && !isExporting && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-sage-200 z-20 overflow-hidden">
            <button
              onClick={handleCSVExport}
              className="w-full px-4 py-3 text-left hover:bg-sage-50 transition-colors flex items-center gap-3 text-sage-700"
            >
              <FileText className="w-5 h-5 text-sage-600" />
              <div>
                <div className="font-medium">Export as CSV</div>
                <div className="text-xs text-sage-500">Comma-separated values</div>
              </div>
            </button>
            <button
              onClick={handleExcelExport}
              className="w-full px-4 py-3 text-left hover:bg-sage-50 transition-colors flex items-center gap-3 text-sage-700 border-t border-sage-100"
            >
              <FileSpreadsheet className="w-5 h-5 text-sage-600" />
              <div>
                <div className="font-medium">Export as Excel</div>
                <div className="text-xs text-sage-500">Multiple sheets (.xlsx)</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}



