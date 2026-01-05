"use client";

import { useState } from "react";
import { SegmentalLean, SegmentalFat } from "@/types/scan";

interface BodyDiagramProps {
  segmentalLean: SegmentalLean;
  segmentalFat?: SegmentalFat | null;
  weightUnit?: string;
}

type ViewMode = 'muscle' | 'fat';
type BodyPart = 'trunk' | 'right_arm' | 'left_arm' | 'right_leg' | 'left_leg';

export default function BodyDiagram({ segmentalLean, segmentalFat, weightUnit = 'lb' }: BodyDiagramProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('muscle');
  const [hoveredSegment, setHoveredSegment] = useState<BodyPart | null>(null);

  // Enhanced color scheme with gradients for 3D effect
  const getMuscleGradient = (percentage: number) => {
    if (percentage >= 110) return { base: '#4a6a4a', light: '#6d8f6d', dark: '#2d4a2d' }; // Excellent
    if (percentage >= 100) return { base: '#5f7a5f', light: '#7d957d', dark: '#4a5f4a' }; // Good
    if (percentage >= 90) return { base: '#a3b5a3', light: '#c2d1c2', dark: '#8a9d8a' }; // Fair
    return { base: '#f0a02d', light: '#f4b55f', dark: '#c98520' }; // Needs work
  };

  const getFatGradient = (percentage: number) => {
    if (percentage <= 85) return { base: '#4a6a4a', light: '#6d8f6d', dark: '#2d4a2d' }; // Excellent
    if (percentage <= 100) return { base: '#5f7a5f', light: '#7d957d', dark: '#4a5f4a' }; // Good
    if (percentage <= 120) return { base: '#f0a02d', light: '#f4b55f', dark: '#c98520' }; // Fair
    return { base: '#d0704e', light: '#e08f73', dark: '#b35a3d' }; // High
  };

  const getSegmentGradient = (segment: BodyPart) => {
    const data = viewMode === 'muscle' ? segmentalLean[segment] : segmentalFat?.[segment];
    const percentage = data?.percentage ?? 100;

    if (viewMode === 'muscle') {
      return getMuscleGradient(percentage);
    } else {
      return getFatGradient(percentage);
    }
  };

  const getTooltipInfo = (segment: BodyPart) => {
    const data = viewMode === 'muscle' ? segmentalLean[segment] : segmentalFat?.[segment];
    if (!data) return null;

    const labels: Record<BodyPart, string> = {
      trunk: 'Trunk',
      right_arm: 'Right Arm',
      left_arm: 'Left Arm',
      right_leg: 'Right Leg',
      left_leg: 'Left Leg',
    };

    return {
      label: labels[segment],
      mass: data.mass,
      percentage: data.percentage,
      evaluation: data.evaluation,
    };
  };

  const renderSegmentInfo = (segment: keyof SegmentalLean, label: string) => {
    const data = viewMode === 'muscle' ? segmentalLean[segment] : segmentalFat?.[segment];
    if (!data || data.mass === null || data.mass === undefined) return null;

    return (
      <div className="card-soft p-4 text-center hover:shadow-lg transition-shadow">
        <div className="text-xs font-medium text-sage-600 mb-1">{label}</div>
        <div className="text-2xl font-bold text-sage-900">
          {data.mass.toFixed(1)}<span className="text-sm ml-1 text-sage-600">{weightUnit}</span>
        </div>
        <div className="text-sm font-semibold text-sage-700">{data.percentage ?? 'N/A'}%</div>
        {data.evaluation && (
          <div className={`text-xs mt-2 px-2 py-0.5 rounded-full inline-block font-medium ${
            (() => {
              const evalLower = data.evaluation.toLowerCase();
              if (evalLower.includes('normal')) return 'bg-sage-100 text-sage-700 border border-sage-300';
              if (evalLower.includes('bajo') || evalLower.includes('low')) return 'bg-amber-100 text-amber-700 border border-amber-300';
              return 'bg-terracotta-100 text-terracotta-700 border border-terracotta-300';
            })()
          }`}>
            {data.evaluation}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-soft p-6 overflow-visible">
      {/* View Mode Toggle */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setViewMode('muscle')}
          className={`px-6 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
            viewMode === 'muscle'
              ? 'bg-gradient-to-br from-sage-600 to-sage-700 text-white shadow-lg'
              : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
          }`}
        >
          Muscle Development
        </button>
        {segmentalFat && (
          <button
            onClick={() => setViewMode('fat')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
              viewMode === 'fat'
                ? 'bg-gradient-to-br from-terracotta-600 to-terracotta-700 text-white shadow-lg'
                : 'bg-terracotta-100 text-terracotta-700 hover:bg-terracotta-200'
            }`}
          >
            Fat Distribution
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Data Display - Left Side */}
        <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
          {/* Arms */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {renderSegmentInfo('right_arm', 'Right Arm')}
            {renderSegmentInfo('left_arm', 'Left Arm')}
          </div>

          {/* Legs */}
          <div className="col-span-2 grid grid-cols-2 gap-4">
            {renderSegmentInfo('right_leg', 'Right Leg')}
            {renderSegmentInfo('left_leg', 'Left Leg')}
          </div>
        </div>

        {/* Body Diagram with 3D Effect - Right Side */}
        <div className="relative order-1 lg:order-2">
          <svg
            width="350"
            height="550"
            viewBox="0 0 350 550"
            className="drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 10px 40px rgba(0,0,0,0.15))' }}
          >
            <defs>
              {/* Gradients for each body part */}
              {(['trunk', 'right_arm', 'left_arm', 'right_leg', 'left_leg'] as BodyPart[]).map((segment) => {
                const colors = getSegmentGradient(segment);
                return (
                  <linearGradient key={segment} id={`gradient-${segment}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: colors.light, stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: colors.base, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: colors.dark, stopOpacity: 1 }} />
                  </linearGradient>
                );
              })}

              {/* Shadow filter */}
              <filter id="innerShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="0" dy="2" result="offsetblur"/>
                <feFlood floodColor="#000000" floodOpacity="0.2"/>
                <feComposite in2="offsetblur" operator="in"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Highlight filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Head with 3D effect */}
            <circle
              cx="175"
              cy="45"
              r="35"
              fill="url(#gradient-head)"
              stroke="#8a9d8a"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
            />
            <defs>
              <radialGradient id="gradient-head">
                <stop offset="0%" style={{ stopColor: '#f5f8f5', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#d5dfd5', stopOpacity: 1 }} />
              </radialGradient>
            </defs>

            {/* Neck */}
            <rect
              x="160"
              y="75"
              width="30"
              height="30"
              rx="5"
              fill="#e3e9e3"
              stroke="#8a9d8a"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
            />

            {/* Trunk - 3D with depth (no hover) */}
            <g>
              <path
                d="M 130 105 L 125 310 L 175 325 L 225 310 L 220 105 Z"
                fill={`url(#gradient-trunk)`}
                stroke="#fff"
                strokeWidth="4"
                filter="url(#innerShadow)"
                opacity={!hoveredSegment ? 1 : 0.4}
              />
              <text
                x="175"
                y="220"
                textAnchor="middle"
                fill="#fff"
                fontSize="18"
                fontWeight="bold"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', pointerEvents: 'none' }}
              >
                TRUNK
              </text>
            </g>

            {/* Right Arm - 3D with depth */}
            <g>
              <path
                d="M 130 120 L 75 145 L 65 270 L 75 280 L 90 275 L 115 145 Z"
                fill={`url(#gradient-right_arm)`}
                stroke="#fff"
                strokeWidth="4"
                filter={hoveredSegment === 'right_arm' ? 'url(#glow)' : 'url(#innerShadow)'}
                opacity={!hoveredSegment || hoveredSegment === 'right_arm' ? 1 : 0.4}
                onMouseEnter={() => setHoveredSegment('right_arm')}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredSegment === 'right_arm' ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
              <text
                x="90"
                y="210"
                textAnchor="middle"
                fill="#fff"
                fontSize="24"
                fontWeight="bold"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
              >
                R
              </text>
            </g>

            {/* Left Arm - 3D with depth */}
            <g>
              <path
                d="M 220 120 L 275 145 L 285 270 L 275 280 L 260 275 L 235 145 Z"
                fill={`url(#gradient-left_arm)`}
                stroke="#fff"
                strokeWidth="4"
                filter={hoveredSegment === 'left_arm' ? 'url(#glow)' : 'url(#innerShadow)'}
                opacity={!hoveredSegment || hoveredSegment === 'left_arm' ? 1 : 0.4}
                onMouseEnter={() => setHoveredSegment('left_arm')}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredSegment === 'left_arm' ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
              <text
                x="260"
                y="210"
                textAnchor="middle"
                fill="#fff"
                fontSize="24"
                fontWeight="bold"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
              >
                L
              </text>
            </g>

            {/* Right Leg - 3D with depth */}
            <g>
              <path
                d="M 155 325 L 140 335 L 125 520 L 145 535 L 165 525 L 175 335 Z"
                fill={`url(#gradient-right_leg)`}
                stroke="#fff"
                strokeWidth="4"
                filter={hoveredSegment === 'right_leg' ? 'url(#glow)' : 'url(#innerShadow)'}
                opacity={!hoveredSegment || hoveredSegment === 'right_leg' ? 1 : 0.4}
                onMouseEnter={() => setHoveredSegment('right_leg')}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredSegment === 'right_leg' ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
              <text
                x="145"
                y="440"
                textAnchor="middle"
                fill="#fff"
                fontSize="24"
                fontWeight="bold"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
              >
                R
              </text>
            </g>

            {/* Left Leg - 3D with depth */}
            <g>
              <path
                d="M 195 325 L 210 335 L 225 520 L 205 535 L 185 525 L 175 335 Z"
                fill={`url(#gradient-left_leg)`}
                stroke="#fff"
                strokeWidth="4"
                filter={hoveredSegment === 'left_leg' ? 'url(#glow)' : 'url(#innerShadow)'}
                opacity={!hoveredSegment || hoveredSegment === 'left_leg' ? 1 : 0.4}
                onMouseEnter={() => setHoveredSegment('left_leg')}
                onMouseLeave={() => setHoveredSegment(null)}
                className="cursor-pointer transition-all duration-300"
                style={{
                  transform: hoveredSegment === 'left_leg' ? 'scale(1.05)' : 'scale(1)',
                  transformOrigin: 'center',
                  transition: 'all 0.3s ease'
                }}
              />
              <text
                x="205"
                y="440"
                textAnchor="middle"
                fill="#fff"
                fontSize="24"
                fontWeight="bold"
                style={{ textShadow: '0 2px 6px rgba(0,0,0,0.5)', pointerEvents: 'none' }}
              >
                L
              </text>
            </g>
          </svg>

          {/* Hover Tooltip - Only for arms and legs */}
          {hoveredSegment && hoveredSegment !== 'trunk' && (
            <div
              className="absolute pointer-events-none z-50"
              style={{
                left: hoveredSegment === 'right_arm' ? '20%' :
                      hoveredSegment === 'left_arm' ? '80%' :
                      hoveredSegment === 'right_leg' ? '35%' : '65%',
                top: (hoveredSegment === 'right_arm' || hoveredSegment === 'left_arm') ? '35%' : '75%',
                transform: 'translate(-50%, -120%)'
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 min-w-[200px] border-2 border-sage-200 animate-in fade-in zoom-in duration-200">
                <div className="text-center">
                  <div className="text-sm font-semibold text-sage-600 mb-2">
                    {getTooltipInfo(hoveredSegment)?.label}
                  </div>
                  <div className="text-3xl font-display font-bold text-sage-900 mb-1">
                    {getTooltipInfo(hoveredSegment)?.mass?.toFixed(1)}
                    <span className="text-lg ml-1 text-sage-600">{weightUnit}</span>
                  </div>
                  <div className="text-lg font-semibold text-sage-700 mb-2">
                    {getTooltipInfo(hoveredSegment)?.percentage}%
                  </div>
                  {getTooltipInfo(hoveredSegment)?.evaluation && (
                    <div className={`text-xs px-3 py-1 rounded-full inline-block font-medium ${
                      (() => {
                        const eval_str = getTooltipInfo(hoveredSegment)?.evaluation?.toLowerCase() || '';
                        if (eval_str.includes('normal')) return 'bg-sage-100 text-sage-700 border border-sage-300';
                        if (eval_str.includes('bajo') || eval_str.includes('low')) return 'bg-amber-100 text-amber-700 border border-amber-300';
                        if (eval_str.includes('high') || eval_str.includes('alto')) return 'bg-terracotta-100 text-terracotta-700 border border-terracotta-300';
                        return 'bg-sage-100 text-sage-700 border border-sage-300';
                      })()
                    }`}>
                      {getTooltipInfo(hoveredSegment)?.evaluation}
                    </div>
                  )}
                </div>
                {/* Tooltip arrow */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 text-center">
        <div className="text-sm text-sage-600 mb-3 font-semibold">
          {viewMode === 'muscle' ? 'Muscle Development Level' : 'Fat Distribution Level'}
        </div>
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
            <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #6d8f6d, #4a6a4a)' }}></div>
            <span className="text-xs font-medium text-sage-700">Excellent</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
            <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #7d957d, #5f7a5f)' }}></div>
            <span className="text-xs font-medium text-sage-700">Good</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
            <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #f4b55f, #f0a02d)' }}></div>
            <span className="text-xs font-medium text-sage-700">Fair</span>
          </div>
          {viewMode === 'fat' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm">
              <div className="w-4 h-4 rounded-full" style={{ background: 'linear-gradient(135deg, #e08f73, #d0704e)' }}></div>
              <span className="text-xs font-medium text-sage-700">High</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Instruction */}
      <div className="text-center mt-6 text-sm text-sage-500 font-medium">
        Hover over body parts to see detailed stats
      </div>
    </div>
  );
}
