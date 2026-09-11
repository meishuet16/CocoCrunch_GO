import React from 'react';

export interface ItemVisualConfig {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  category: 'clothing' | 'shoes' | 'toiletries' | 'tech' | 'mesh-lid';
  compartment: 'clothing' | 'shoes' | 'toiletries' | 'tech' | 'mesh-lid';
  colorAccent: string;
}

// 1. Walking Sneakers / Shoes
export const ShoesArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sneaker silhouette */}
    <path
      d="M6 34C6 34 8 26 14 24C19 22 22 23 26 16C28 13 31 9 37 9C43 9 47 13 46 17C45 20 44 24 53 26C58 27 60 30 60 35C60 38 57 40 52 40L10 40C7 40 6 37 6 34Z"
      fill="rgba(149, 187, 234, 0.12)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Thick Sole */}
    <path
      d="M6 36L60 36C60 38.5 58 41 53 41L11 41C8 41 6 38.5 6 36Z"
      fill="rgba(255,255,255,0.7)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Sole grip tread lines */}
    <line x1="14" y1="41" x2="16" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="22" y1="41" x2="24" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="30" y1="41" x2="32" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="38" y1="41" x2="40" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="46" y1="41" x2="48" y2="37" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Shoe tongue and ankle collar */}
    <path d="M28 15C32 15 36 15 37 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M37 13C41 13 45 15 46 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Laces */}
    <line x1="26" y1="21" x2="35" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="29" y1="25" x2="38" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <line x1="33" y1="29" x2="42" y2="26" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    {/* Side stripe / flourish */}
    <path d="M19 28C26 27 34 29 42 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 2" />
    {/* Heel pull tab */}
    <path d="M46 17L50 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 2. Folded Clothes Stack / 5-Day Clothing
export const ClothesStackArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 56 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Bottom layer */}
    <path
      d="M7 38C7 36 10 35 15 35H41C46 35 49 36 49 38C49 40 46 41 41 41H15C10 41 7 40 7 38Z"
      fill="rgba(212, 168, 83, 0.2)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Middle folded layer */}
    <path
      d="M6 28C6 26 9 25 14 25H42C47 25 50 26 50 28C50 30 47 31 42 31H14C9 31 6 30 6 28Z"
      fill="rgba(149, 187, 234, 0.2)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Top folded shirt */}
    <path
      d="M8 17C8 14 11 13 16 13H40C45 13 48 14 48 17C48 20 45 21 40 21H16C11 21 8 20 8 17Z"
      fill="rgba(255, 255, 255, 0.7)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Folded collar on top shirt */}
    <path d="M22 13L26 17L28 14L30 17L34 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="28" y1="17" x2="28" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Side seam folds */}
    <path d="M12 17V36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M44 17V36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Stack tag */}
    <rect x="36" y="27" width="6" height="3" rx="1" fill="#fff" stroke="currentColor" strokeWidth="1" />
  </svg>
);

// 3. Light Rain Layer / Jacket
export const RainLayerArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.85} viewBox="0 0 54 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Folded jacket block with hood curve */}
    <path
      d="M10 16C10 13 14 10 20 9H34C40 9 44 13 44 16L46 36C46 39 42 40 36 40H18C12 40 8 39 8 36L10 16Z"
      fill="rgba(127, 158, 176, 0.22)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Center waterproof zipper */}
    <line x1="27" y1="10" x2="27" y2="39" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="27" cy="14" r="2" fill="currentColor" />
    {/* Hood collar & drawstrings */}
    <path d="M18 10C22 13 32 13 36 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M22 14L22 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M32 14L32 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    {/* Chest pocket */}
    <path d="M14 20H21V26H14V20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeDasharray="2 1.5" />
    {/* Water drop badge */}
    <path d="M37 23C37 25 35.5 27 34 27C32.5 27 31 25 31 23C31 21 34 18 34 18C34 18 37 21 37 23Z" fill="rgba(149, 187, 234, 0.5)" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

// 4. Passport & Boarding Pass
export const PassportArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 54 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Boarding Pass Ticket sliding out */}
    <g transform="rotate(12 36 18)">
      <rect x="22" y="4" width="22" height="34" rx="2" fill="#FFFDF7" stroke="currentColor" strokeWidth="1.6" />
      <line x1="25" y1="9" x2="41" y2="9" stroke="currentColor" strokeWidth="1.4" />
      <line x1="25" y1="13" x2="37" y2="13" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
      {/* Flight barcode lines */}
      <line x1="25" y1="20" x2="25" y2="32" stroke="currentColor" strokeWidth="1.2" />
      <line x1="28" y1="20" x2="28" y2="32" stroke="currentColor" strokeWidth="2" />
      <line x1="32" y1="20" x2="32" y2="32" stroke="currentColor" strokeWidth="1" />
      <line x1="35" y1="20" x2="35" y2="32" stroke="currentColor" strokeWidth="1.8" />
      <line x1="39" y1="20" x2="39" y2="32" stroke="currentColor" strokeWidth="1" />
    </g>
    {/* Passport Booklet */}
    <rect
      x="8"
      y="10"
      width="28"
      height="35"
      rx="3"
      fill="rgba(147, 5, 0, 0.12)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M8 12C10 12 11 11 11 10V45H8V12Z" fill="rgba(147,5,0,0.2)" stroke="currentColor" strokeWidth="1.5" />
    {/* Passport Emblem / Globe */}
    <circle cx="22" cy="24" r="6" stroke="currentColor" strokeWidth="1.5" />
    <ellipse cx="22" cy="24" rx="3.5" ry="6" stroke="currentColor" strokeWidth="1.2" />
    <line x1="16" y1="24" x2="28" y2="24" stroke="currentColor" strokeWidth="1.2" />
    {/* PASSPORT text lines */}
    <line x1="16" y1="15" x2="28" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="17" y1="36" x2="27" y2="36" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 5. Portable Water Bottle / Tumbler
export const WaterBottleArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size * 0.65} height={size} viewBox="0 0 32 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Cap Loop */}
    <path d="M12 6C12 4 14 3 16 3C18 3 20 4 20 6V8H12V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Bottle Neck Cap */}
    <rect x="9" y="8" width="14" height="6" rx="2" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="1.8" />
    {/* Bottle Body */}
    <path
      d="M7 16C7 14.5 8.5 14 10 14H22C23.5 14 25 14.5 25 16V42C25 45 23 47 20 47H12C9 47 7 45 7 42V16Z"
      fill="rgba(149, 187, 234, 0.18)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Silicone grip sleeve */}
    <rect x="7.5" y="24" width="17" height="12" rx="2" fill="rgba(212,168,83,0.18)" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2" />
    {/* Capacity marks */}
    <line x1="11" y1="28" x2="15" y2="28" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="11" y1="32" x2="14" y2="32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 6. Portable Charger / Power Bank with Cable
export const ChargerArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 52 42" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Power bank body */}
    <rect
      x="8"
      y="12"
      width="34"
      height="24"
      rx="4"
      fill="rgba(255, 255, 255, 0.7)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Lightning Bolt Symbol */}
    <path d="M25 17L22 24H27L24 31" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="rgba(212, 168, 83, 0.3)" />
    {/* USB Ports on left side */}
    <rect x="12" y="14" width="4" height="2" rx="0.5" fill="currentColor" />
    <rect x="18" y="14" width="4" height="2" rx="0.5" fill="currentColor" />
    {/* 4 Battery status indicator LEDs */}
    <circle cx="34" cy="18" r="1" fill="currentColor" />
    <circle cx="34" cy="22" r="1" fill="currentColor" />
    <circle cx="34" cy="26" r="1" fill="currentColor" />
    <circle cx="34" cy="30" r="1" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="0.8" />
    {/* Cable emerging from port and coiling around */}
    <path
      d="M14 13C14 8 20 4 28 4C36 4 44 8 44 14C44 20 42 22 42 26"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Cable USB-C plug tip */}
    <rect x="40" y="26" width="4" height="6" rx="1" fill="#fff" stroke="currentColor" strokeWidth="1.4" />
    <line x1="41" y1="32" x2="43" y2="32" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// 7. Retro Camera
export const CameraArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 54 42" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Camera Body */}
    <rect
      x="6"
      y="11"
      width="42"
      height="26"
      rx="4"
      fill="rgba(255, 255, 255, 0.7)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Top housing */}
    <path d="M12 11V7H24V11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    {/* Shutter button */}
    <rect x="15" y="4" width="5" height="3" rx="0.8" fill="currentColor" />
    {/* Shutter speed dial */}
    <circle cx="38" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    {/* Lens rings */}
    <circle cx="27" cy="24" r="9" fill="rgba(149, 187, 234, 0.2)" stroke="currentColor" strokeWidth="2" />
    <circle cx="27" cy="24" r="5.5" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="25" cy="22" r="1.5" fill="#fff" />
    {/* Viewfinder window */}
    <rect x="36" y="14" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.4" />
    {/* Leatherette middle texture */}
    <line x1="6" y1="20" x2="16" y2="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
    <line x1="38" y1="20" x2="48" y2="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
    {/* Strap eyelets */}
    <path d="M4 17L6 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M48 17L50 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 8. Compact Folded Umbrella
export const UmbrellaArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size * 0.65} height={size} viewBox="0 0 32 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Umbrella tip */}
    <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Folded canopy sleeve */}
    <path
      d="M11 8C9.5 8 9 9.5 9 11L10 38C10 39.5 11 40.5 13 40.5H19C21 40.5 22 39.5 22 38L23 11C23 9.5 22.5 8 21 8H11Z"
      fill="rgba(147, 5, 0, 0.12)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Fluted fold ribs */}
    <line x1="13" y1="9" x2="14" y2="39" stroke="currentColor" strokeWidth="1.3" />
    <line x1="16" y1="9" x2="16" y2="39" stroke="currentColor" strokeWidth="1.3" />
    <line x1="19" y1="9" x2="18" y2="39" stroke="currentColor" strokeWidth="1.3" />
    {/* Wraparound strap with snap */}
    <rect x="8.5" y="22" width="15" height="5" rx="1.5" fill="#FFFDF7" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="16" cy="24.5" r="1" fill="currentColor" />
    {/* Handle with wrist loop */}
    <rect x="13" y="40.5" width="6" height="5" rx="2" fill="rgba(87,53,31,0.3)" stroke="currentColor" strokeWidth="1.6" />
    <path d="M16 45.5C16 48 13 49 11 47C9 45 11 42 14 43" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 9. Toiletries Pouch / Washbag
export const ToiletryPouchArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.75} viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Washbag curved trapezoid shape */}
    <path
      d="M10 12C10 9 12 8 15 8H39C42 8 44 9 44 12L47 32C47 35 44 37 40 37H14C10 37 7 35 7 32L10 12Z"
      fill="rgba(255, 255, 255, 0.7)"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Top zipper track */}
    <line x1="11" y1="12" x2="43" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 1.5" />
    {/* Zipper pull loop */}
    <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.4" fill="#fff" />
    <path d="M10 13L8 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Toiletry Bottle silhouette visible through mesh */}
    <rect x="20" y="16" width="8" height="15" rx="2" fill="rgba(149, 187, 234, 0.25)" stroke="currentColor" strokeWidth="1.4" />
    <rect x="22" y="14" width="4" height="2" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
    {/* Small jar / tin */}
    <rect x="31" y="21" width="10" height="10" rx="3" fill="rgba(212, 168, 83, 0.2)" stroke="currentColor" strokeWidth="1.4" />
    <line x1="31" y1="24" x2="41" y2="24" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

// 10. Sunglasses
export const SunglassesArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left lens & frame */}
    <path
      d="M7 11C7 8 10 7 14 7H21C24 7 25 9 25 12V18C25 22 22 25 17 25C11 25 7 21 7 17V11Z"
      fill="rgba(43, 33, 31, 0.2)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Right lens & frame */}
    <path
      d="M29 12C29 9 30 7 33 7H40C44 7 47 8 47 11V17C47 21 43 25 37 25C32 25 29 22 29 18V12Z"
      fill="rgba(43, 33, 31, 0.2)"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    {/* Bridge connection */}
    <path d="M25 10C26 8.5 28 8.5 29 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    {/* Brow bar */}
    <line x1="12" y1="6" x2="42" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    {/* Folded temple arms */}
    <path d="M7 10L3 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M47 10L51 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Lens reflection glint */}
    <line x1="11" y1="11" x2="16" y2="20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="33" y1="11" x2="38" y2="20" stroke="rgba(255,255,255,0.7)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 11. Over-Ear Headphones
export const HeadphonesArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 52 46" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Headband arch */}
    <path
      d="M12 25C12 14 18 8 26 8C34 8 40 14 40 25"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    {/* Inner padded band */}
    <path
      d="M15 24C15 16 20 11 26 11C32 11 37 16 37 24"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeDasharray="2 2"
    />
    {/* Left earcup */}
    <rect x="7" y="24" width="9" height="16" rx="4" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="1.8" />
    <ellipse cx="11.5" cy="32" rx="2.5" ry="5.5" fill="rgba(149,187,234,0.3)" stroke="currentColor" strokeWidth="1" />
    {/* Right earcup */}
    <rect x="36" y="24" width="9" height="16" rx="4" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="1.8" />
    <ellipse cx="40.5" cy="32" rx="2.5" ry="5.5" fill="rgba(149,187,234,0.3)" stroke="currentColor" strokeWidth="1" />
    {/* Ear cup hinge stems */}
    <line x1="11.5" y1="21" x2="11.5" y2="24" stroke="currentColor" strokeWidth="2" />
    <line x1="40.5" y1="21" x2="40.5" y2="24" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// 12. Pocket Wi-Fi Router
export const PocketWifiArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Router casing */}
    <rect x="7" y="7" width="30" height="30" rx="8" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="2" />
    {/* Mini display screen */}
    <rect x="12" y="12" width="20" height="12" rx="3" fill="rgba(149, 187, 234, 0.2)" stroke="currentColor" strokeWidth="1.4" />
    {/* Signal waves on screen */}
    <path d="M16 20C17.5 18 20.5 18 22 20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M18 21.5C18.8 20.5 20.2 20.5 21 21.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="19.5" cy="23" r="0.8" fill="currentColor" />
    {/* Power button */}
    <circle cx="22" cy="31" r="2.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

// 13. Pill Strip / Medicine
export const MedicineArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size * 0.75} height={size} viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Blister card foil */}
    <rect x="6" y="6" width="24" height="36" rx="3" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="1.8" />
    {/* Perforated blister lines */}
    <line x1="6" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="6" y1="30" x2="30" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
    {/* 6 Blister bubbles */}
    <ellipse cx="12" cy="12" rx="3.5" ry="2.5" fill="rgba(147, 5, 0, 0.15)" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="24" cy="12" rx="3.5" ry="2.5" fill="rgba(147, 5, 0, 0.15)" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="12" cy="24" rx="3.5" ry="2.5" fill="rgba(147, 5, 0, 0.15)" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="24" cy="24" rx="3.5" ry="2.5" fill="rgba(147, 5, 0, 0.15)" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="12" cy="36" rx="3.5" ry="2.5" fill="rgba(147, 5, 0, 0.15)" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="24" cy="36" rx="3.5" ry="2.5" fill="rgba(147, 5, 0, 0.15)" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

// 14. Transit IC Card / Metro Pass
export const TransitCardArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 52 34" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Card plastic body */}
    <rect x="5" y="4" width="42" height="26" rx="3" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="1.8" />
    {/* Smart chip gold plate */}
    <rect x="10" y="12" width="8" height="6" rx="1" fill="rgba(212, 168, 83, 0.3)" stroke="currentColor" strokeWidth="1.2" />
    <line x1="14" y1="12" x2="14" y2="18" stroke="currentColor" strokeWidth="1" />
    {/* Contactless waves symbol */}
    <path d="M40 12C41.5 14 41.5 17 40 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M37 14C38 15 38 16 37 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    {/* Subtitle / text line */}
    <line x1="10" y1="24" x2="26" y2="24" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="30" y1="24" x2="38" y2="24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 15. Universal Plug Adapter
export const PlugAdapterArt: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size * 0.8} height={size * 0.8} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Adapter block cube */}
    <rect x="8" y="10" width="28" height="26" rx="5" fill="rgba(255,255,255,0.7)" stroke="currentColor" strokeWidth="2" />
    {/* Outlet socket holes */}
    <rect x="14" y="16" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="27" y="16" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="20.5" y="24" width="3" height="6" rx="1" fill="currentColor" />
    {/* Side sliding prong switches */}
    <line x1="5" y1="16" x2="8" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 16. Fallback General Travel Kit / Pouch
export const TravelPouchFallback: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = '' }) => (
  <svg width={size} height={size * 0.8} viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Zipper envelope pouch */}
    <rect x="6" y="8" width="38" height="26" rx="4" fill="rgba(255, 255, 255, 0.7)" stroke="currentColor" strokeWidth="1.8" />
    {/* Envelope flap / seam */}
    <path d="M6 14L25 24L44 14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    {/* Tag label */}
    <rect x="18" y="26" width="14" height="5" rx="1" fill="rgba(212,168,83,0.2)" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export function getItemVisualConfig(name: string): ItemVisualConfig {
  const n = name.toLowerCase();

  // Shoes / Walking Sneakers
  if (n.includes('shoe') || n.includes('sneaker') || n.includes('walking') || n.includes('footwear')) {
    return {
      icon: ShoesArt,
      label: name,
      category: 'shoes',
      compartment: 'shoes',
      colorAccent: '#6B8EAA',
    };
  }

  // Clothes / 5-Day Clothing / Shirts
  if (n.includes('5-day') || n.includes('cloth') || n.includes('shirt') || n.includes('pants') || (n.includes('layer') && !n.includes('rain')) || n.includes('wear')) {
    return {
      icon: ClothesStackArt,
      label: name,
      category: 'clothing',
      compartment: 'clothing',
      colorAccent: '#D4A853',
    };
  }

  // Rain Layer / Umbrella
  if (n.includes('rain') || n.includes('jacket') || n.includes('windbreaker') || n.includes('coat')) {
    return {
      icon: RainLayerArt,
      label: name,
      category: 'clothing',
      compartment: 'clothing',
      colorAccent: '#7F9EB0',
    };
  }

  if (n.includes('umbrella')) {
    return {
      icon: UmbrellaArt,
      label: name,
      category: 'toiletries',
      compartment: 'toiletries',
      colorAccent: '#930500',
    };
  }

  // Passport / Tickets / Travel docs
  if (n.includes('passport') || n.includes('ticket') || n.includes('boarding') || n.includes('visa') || n.includes('doc')) {
    return {
      icon: PassportArt,
      label: name,
      category: 'mesh-lid',
      compartment: 'mesh-lid',
      colorAccent: '#930500',
    };
  }

  // Water Bottle
  if (n.includes('water') || n.includes('bottle') || n.includes('tumbler') || n.includes('thermos') || n.includes('flask')) {
    return {
      icon: WaterBottleArt,
      label: name,
      category: 'toiletries',
      compartment: 'toiletries',
      colorAccent: '#5A7995',
    };
  }

  // Charger / Battery / Power bank
  if (n.includes('charger') || n.includes('power') || n.includes('battery') || n.includes('cable') || n.includes('bank')) {
    return {
      icon: ChargerArt,
      label: name,
      category: 'tech',
      compartment: 'tech',
      colorAccent: '#3C5C38',
    };
  }

  // Camera
  if (n.includes('camera') || n.includes('lens') || n.includes('photo')) {
    return {
      icon: CameraArt,
      label: name,
      category: 'tech',
      compartment: 'tech',
      colorAccent: '#5A4A42',
    };
  }

  // Toiletries / Skincare / Laundry
  if (n.includes('toiletr') || n.includes('pouch') || n.includes('laundry') || n.includes('soap') || n.includes('wash') || n.includes('skincare')) {
    return {
      icon: ToiletryPouchArt,
      label: name,
      category: 'toiletries',
      compartment: 'toiletries',
      colorAccent: '#C98B63',
    };
  }

  // Sunglasses / Glasses
  if (n.includes('glass') || n.includes('shade')) {
    return {
      icon: SunglassesArt,
      label: name,
      category: 'mesh-lid',
      compartment: 'mesh-lid',
      colorAccent: '#46322B',
    };
  }

  // Headphones / Audio
  if (n.includes('headphone') || n.includes('earphone') || n.includes('audio') || n.includes('airpod')) {
    return {
      icon: HeadphonesArt,
      label: name,
      category: 'tech',
      compartment: 'tech',
      colorAccent: '#2F4F4F',
    };
  }

  // Wi-Fi / Hotspot
  if (n.includes('wifi') || n.includes('wi-fi') || n.includes('sim') || n.includes('hotspot')) {
    return {
      icon: PocketWifiArt,
      label: name,
      category: 'tech',
      compartment: 'mesh-lid',
      colorAccent: '#3B6E8C',
    };
  }

  // Medicine / First Aid
  if (n.includes('med') || n.includes('pill') || n.includes('first aid')) {
    return {
      icon: MedicineArt,
      label: name,
      category: 'mesh-lid',
      compartment: 'mesh-lid',
      colorAccent: '#A23B2A',
    };
  }

  // Transit card / Metro
  if (n.includes('transit') || n.includes('metro') || n.includes('card') || n.includes('pass')) {
    return {
      icon: TransitCardArt,
      label: name,
      category: 'mesh-lid',
      compartment: 'mesh-lid',
      colorAccent: '#2E6B58',
    };
  }

  // Plug Adapter
  if (n.includes('plug') || n.includes('adapter')) {
    return {
      icon: PlugAdapterArt,
      label: name,
      category: 'tech',
      compartment: 'tech',
      colorAccent: '#605048',
    };
  }

  // Default fallback
  return {
    icon: TravelPouchFallback,
    label: name,
    category: 'clothing',
    compartment: 'clothing',
    colorAccent: '#7C675B',
  };
}
