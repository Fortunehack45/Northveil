import React, { useMemo } from 'react';

interface BlockiesAvatarProps {
  address: string;
  size?: number; // Size in pixels (e.g. 32)
  className?: string;
}

/**
 * On-Chain Deterministic Blockies Avatar
 * Generates a unique 5x5 SVG identicon directly from the user's blockchain wallet address.
 */
export const BlockiesAvatar: React.FC<BlockiesAvatarProps> = ({
  address,
  size = 32,
  className = '',
}) => {
  const svgContent = useMemo(() => {
    const cleanAddr = (address || '0x0000000000000000000000000000000000000000').toLowerCase();
    
    // Create a simple deterministic random seed from address characters
    let seed = 0;
    for (let i = 0; i < cleanAddr.length; i++) {
      seed = ((seed << 5) - seed) + cleanAddr.charCodeAt(i);
      seed |= 0;
    }

    const rand = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Generate HSL colors based on address seed
    const hue1 = Math.floor(rand() * 360);
    const hue2 = (hue1 + 140 + Math.floor(rand() * 80)) % 360;
    const bgHue = (hue1 + 220 + Math.floor(rand() * 50)) % 360;

    const mainColor = `hsl(${hue1}, 85%, 55%)`;
    const spotColor = `hsl(${hue2}, 90%, 60%)`;
    const bgColor = `hsl(${bgHue}, 40%, 15%)`;

    // Build 5x5 symmetric grid (columns 0..2 mirrored to 3..4)
    const grid: number[][] = [];
    for (let y = 0; y < 5; y++) {
      const row: number[] = [];
      for (let x = 0; x < 3; x++) {
        const val = rand();
        row.push(val < 0.4 ? 0 : val < 0.8 ? 1 : 2);
      }
      grid.push([row[0], row[1], row[2], row[1], row[0]]);
    }

    // Render SVG elements
    const rects: React.ReactNode[] = [];
    grid.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val > 0) {
          rects.push(
            <rect
              key={`${x}-${y}`}
              x={x * 10}
              y={y * 10}
              width="10"
              height="10"
              fill={val === 1 ? mainColor : spotColor}
            />
          );
        }
      });
    });

    return { bgColor, rects };
  }, [address]);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className={`rounded-md border border-white/40 overflow-hidden shrink-0 ${className}`}
      style={{ backgroundColor: svgContent.bgColor }}
    >
      {svgContent.rects}
    </svg>
  );
};
