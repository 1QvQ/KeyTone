import React from 'react';

interface KeySwitchIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function KeySwitchIcon({ className = "w-5 h-5", ...props }: KeySwitchIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#121212"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* 3D Base Plate (Solid black bottom housing) */}
      <path
        d="M2.5 13.5 L12 17.5 L21.5 13.5 L21.5 16.5 L12 20.5 L2.5 16.5 Z"
        fill="#121212"
        stroke="#121212"
        strokeWidth="1"
        strokeLinejoin="miter"
      />
      <path
        d="M2.5 13.5 L12 17.5 L21.5 13.5 L12 9.5 Z"
        fill="#121212"
        stroke="#121212"
        strokeWidth="1"
      />

      {/* Main Upper Housing (White sloped sides) */}
      <path
        d="M4 12.5 L12 16 L20 12.5 L16.5 8 L7.5 8 Z"
        fill="#ffffff"
        stroke="#121212"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      
      {/* Front-left and Front-right housing divide line */}
      <path
        d="M12 16 L12 11.5"
        stroke="#121212"
        strokeWidth="1.8"
      />

      {/* Front latch/tab (triangular/trapezoidal notch in Cherry MX switch) */}
      <path
        d="M10 12.5 L14 12.5 L13 15 L11 15 Z"
        fill="#ffffff"
        stroke="#121212"
        strokeWidth="1.2"
        strokeLinejoin="miter"
      />
      <circle cx="12" cy="13.7" r="0.6" fill="#121212" stroke="none" />

      {/* Center top opening (Black square chimney hole) */}
      <path
        d="M8.5 8 L12 9.2 L15.5 8 L12 6.8 Z"
        fill="#121212"
        stroke="#121212"
        strokeWidth="1.5"
      />

      {/* Switch Stem (White MX cross plunger) */}
      <path
        d="M10 4 L12 5 L14 4 L14 8 L10 8 Z"
        fill="#ffffff"
        stroke="#121212"
        strokeWidth="1.2"
      />
      {/* Stem cross plunger details */}
      <path d="M12 3 L12 7.5" stroke="#121212" strokeWidth="1.6" />
      <path d="M10 5.2 L14 5.2" stroke="#121212" strokeWidth="1.6" />
    </svg>
  );
}
