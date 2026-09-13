import { useState, useMemo } from 'react';
import { Compass, ZoomIn, ZoomOut, Target, Footprints, Camera, ExternalLink, X } from 'lucide-react';
import type { TripPlan } from '../domain/itinerary';
import { CocoCompanion } from './coco/CocoCompanion';
import './RealisticRouteMap.css';

export type PhotoPinData = {
  id: string;
  title: string;
  audience: 'personal' | 'group';
  capturedAt?: string;
  x?: number;
  y?: number;
};

export type ServicePoint = {
  id: string;
  name: string;
  type: 'hospital' | 'luggage' | 'repair' | 'pharmacy';
  icon: string;
  label: string;
  x: number;
  y: number;
  distance: string;
  address: string;
};

export const NEARBY_SERVICES: ServicePoint[] = [
  { id: 'hosp-1', name: 'Tokyo Midtown Clinic Daikanyama', type: 'hospital', icon: '🏥', label: 'Medical Clinic', x: 210, y: 110, distance: '320m · ~4 min walk', address: 'Sarugakucho 18-8, Shibuya-ku' },
  { id: 'lug-1', name: 'Daikanyama Stn Coin Lockers', type: 'luggage', icon: '🧳', label: 'Luggage Storage', x: 340, y: 310, distance: '250m · ~3 min walk', address: 'Daikanyama Station Concourse' },
  { id: 'rep-1', name: 'QuickTech Repair Hub', type: 'repair', icon: '🔧', label: 'Repair Hub', x: 140, y: 250, distance: '190m · ~2 min walk', address: 'Hachiyamacho 11-3' },
  { id: 'pharm-1', name: 'Kokumin Drug Daikanyama', type: 'pharmacy', icon: '💊', label: 'Pharmacy', x: 270, y: 210, distance: '210m · ~3 min walk', address: 'Kyū-Yamate-dōri 24' },
];

export type RealisticRouteMapProps = {
  destination: string;
  plan: TripPlan;
  currentItem?: { name: string; timeLabel: string };
  nextItem?: { name: string; timeLabel: string; transferMinutes?: number };
  afterNextItem?: { name: string; timeLabel?: string };
  browserLocation?: { latitude: number; longitude: number } | null;
  browserLocationError?: string | null;
  delay?: boolean;
  isGroupMode?: boolean;
  splitActive?: boolean;
  meetingPoint?: string;
  meetingTime?: string;
  photoPins?: PhotoPinData[];
  onAddPhotoPin?: (entry: { title: string; audience: 'personal' | 'group' }) => void;
  activeServiceCategory?: 'all' | 'hospital' | 'luggage' | 'repair' | 'pharmacy' | 'none';
  onSelectServiceCategory?: (cat: 'all' | 'hospital' | 'luggage' | 'repair' | 'pharmacy' | 'none') => void;
};

const COCO_WALK_TIPS = [
  'On track! 20 min gentle stroll to Daikanyama 🐾',
  'Passing Daikanyama T-Site on your left · great coffee! ☕',
  'Kyū-Yamate-dōri has wide tree-lined sidewalks today 🌿',
  'Breeze from Meguro River feels refreshing! 🍃',
];

export function RealisticRouteMap({
  destination,
  plan,
  currentItem,
  nextItem,
  afterNextItem,
  browserLocation,
  browserLocationError,
  delay = false,
  isGroupMode = false,
  splitActive = false,
  meetingPoint,
  meetingTime,
  photoPins = [],
  onAddPhotoPin,
  activeServiceCategory,
  onSelectServiceCategory,
}: RealisticRouteMapProps) {
  const [zoomLevel, setZoomLevel] = useState<1 | 1.2 | 1.4>(1);
  const [recenterActive, setRecenterActive] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [showTargetDetails, setShowTargetDetails] = useState(true);

  // Photo Pin State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoAudience, setPhotoAudience] = useState<'personal' | 'group'>('personal');
  const [localPhotoPins, setLocalPhotoPins] = useState<PhotoPinData[]>([
    { id: 'sample-pin-1', title: 'Meguro River Bridge View', audience: 'group', x: 235, y: 385 },
  ]);
  const [selectedPhotoPin, setSelectedPhotoPin] = useState<PhotoPinData | null>(null);

  // Nearby Service Points State
  const [internalServiceCat, setInternalServiceCat] = useState<'all' | 'hospital' | 'luggage' | 'repair' | 'pharmacy' | 'none'>('none');
  const serviceCategory = activeServiceCategory ?? internalServiceCat;
  const [selectedService, setSelectedService] = useState<ServicePoint | null>(null);

  const handleSelectServiceCategory = (cat: 'all' | 'hospital' | 'luggage' | 'repair' | 'pharmacy' | 'none') => {
    setInternalServiceCat(cat);
    onSelectServiceCategory?.(cat);
    setSelectedService(null);
  };

  // Stop 1 (Origin / Anchor)
  const stop1Name = currentItem?.name || plan.items.find(i => i.kind === 'anchor')?.name || 'Current departure';
  const stop1Time = currentItem?.timeLabel || '10:00';

  // Stop 2 (Next Stop / Target)
  const stop2Name = nextItem?.name || plan.items.find(i => i.kind === 'floating')?.name || 'Daikanyama';
  const stop2Time = nextItem?.timeLabel || '12:10';
  const stop2Mins = nextItem?.transferMinutes || 20;

  // Stop 3 (Subsequent Stop)
  const stop3Name = afterNextItem?.name || plan.items.find(i => i.id !== currentItem?.name && i.id !== nextItem?.name && i.kind !== 'buffer')?.name || 'Scenic cafe';

  const liveCoordsString = useMemo(() => {
    if (browserLocation) {
      return `${browserLocation.latitude.toFixed(4)}° N, ${browserLocation.longitude.toFixed(4)}° E`;
    }
    return '35.6492° N, 139.7028° E';
  }, [browserLocation]);

  // Combined photo pins
  const allPhotoPins = useMemo(() => {
    return [...localPhotoPins, ...photoPins.filter(p => !localPhotoPins.some(lp => lp.id === p.id))];
  }, [localPhotoPins, photoPins]);

  // Filtered service points
  const visibleServices = useMemo(() => {
    if (serviceCategory === 'none') return [];
    if (serviceCategory === 'all') return NEARBY_SERVICES;
    return NEARBY_SERVICES.filter(s => s.type === serviceCategory);
  }, [serviceCategory]);

  function handleRecenter() {
    setRecenterActive(true);
    setZoomLevel(1.2);
    setTimeout(() => setRecenterActive(false), 1400);
  }

  function toggleZoom(direction: 'in' | 'out') {
    if (direction === 'in') {
      setZoomLevel(prev => (prev === 1 ? 1.2 : 1.4));
    } else {
      setZoomLevel(prev => (prev === 1.4 ? 1.2 : 1));
    }
  }

  function nextTip() {
    setTipIndex(prev => (prev + 1) % COCO_WALK_TIPS.length);
  }

  function handleDropPhotoPin() {
    const title = photoTitle.trim() || 'Moment at Daikanyama';
    const newPin: PhotoPinData = {
      id: `photo-pin-${Date.now()}`,
      title,
      audience: photoAudience,
      capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      x: 185 + ((localPhotoPins.length % 3) * 16) - 8,
      y: 205 + ((localPhotoPins.length % 3) * 12) - 6,
    };
    setLocalPhotoPins(prev => [...prev, newPin]);
    onAddPhotoPin?.({ title, audience: photoAudience });
    setPhotoTitle('');
    setShowPhotoModal(false);
  }

  return (
    <div className="realistic-map-container" aria-label={`Live navigation map for ${destination}`}>
      {/* Top Turn-by-Turn Navigation HUD Banner */}
      <div className="nav-hud-banner">
        <div className="nav-hud-left">
          <div className="nav-turn-badge" aria-hidden="true">
            ↱
          </div>
          <div className="nav-hud-instruction">
            <b>In 120m, continue on Kyū-Yamate-dōri</b>
            <small>Toward {stop2Name} · Sidewalk available</small>
          </div>
        </div>
        <div className="nav-hud-right">
          <span className="nav-hud-eta">{stop2Time}</span>
          <span className="nav-hud-dist">~{stop2Mins} min (1.1 km)</span>
        </div>
      </div>

      {/* Service Points Quick Filter Bar */}
      <div className="map-service-filter-bar" aria-label="Nearby emergency services filter">
        <span className="service-filter-label">Quick Help:</span>
        <button
          type="button"
          className={`service-filter-pill ${serviceCategory === 'hospital' ? 'active' : ''}`}
          onClick={() => handleSelectServiceCategory(serviceCategory === 'hospital' ? 'none' : 'hospital')}
          title="Nearby Hospital & Medical"
        >
          🏥 Clinic
        </button>
        <button
          type="button"
          className={`service-filter-pill ${serviceCategory === 'luggage' ? 'active' : ''}`}
          onClick={() => handleSelectServiceCategory(serviceCategory === 'luggage' ? 'none' : 'luggage')}
          title="Luggage Storage & Coin Lockers"
        >
          🧳 Luggage
        </button>
        <button
          type="button"
          className={`service-filter-pill ${serviceCategory === 'repair' ? 'active' : ''}`}
          onClick={() => handleSelectServiceCategory(serviceCategory === 'repair' ? 'none' : 'repair')}
          title="Repair & Tech Essentials"
        >
          🔧 Repair
        </button>
        <button
          type="button"
          className={`service-filter-pill ${serviceCategory === 'pharmacy' ? 'active' : ''}`}
          onClick={() => handleSelectServiceCategory(serviceCategory === 'pharmacy' ? 'none' : 'pharmacy')}
          title="Pharmacy & First Aid"
        >
          💊 Pharmacy
        </button>
        {serviceCategory !== 'none' && (
          <button
            type="button"
            className="service-filter-pill clear-btn"
            onClick={() => handleSelectServiceCategory('none')}
            title="Hide service points"
          >
            ✕ Hide
          </button>
        )}
      </div>

      {/* SVG Realistic Vector Map (Enlarged 540x440 Canvas with Zero Overlaps) */}
      <svg
        className="realistic-map-svg"
        viewBox="0 0 540 440"
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: `scale(${zoomLevel})` }}
        role="img"
        aria-label="Spacious urban map with streets, parks, navigation route and live GPS location"
      >
        <defs>
          <linearGradient id="headingBeamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
          </linearGradient>

          <filter id="puckShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.38" />
          </filter>

          <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.25" />
          </filter>

          <filter id="servicePinShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 1. Map Base Land */}
        <rect className="map-bg-land" width="540" height="440" />

        {/* 2. City Blocks (Parcels) */}
        <path
          className="map-block"
          d="M 15 22 L 130 18 L 115 88 L 18 82 Z
             M 150 20 L 290 16 L 275 80 L 138 84 Z
             M 310 18 L 515 14 L 505 76 L 295 78 Z
             M 20 105 L 105 108 L 92 185 L 18 175 Z
             M 125 106 L 265 102 L 255 180 L 118 184 Z
             M 285 100 L 490 94 L 478 175 L 275 178 Z
             M 18 205 L 85 210 L 70 290 L 15 280 Z
             M 108 208 L 245 204 L 235 285 L 98 288 Z
             M 265 198 L 480 192 L 470 275 L 255 278 Z
             M 12 305 L 90 308 L 85 365 L 10 365 Z
             M 112 305 L 240 302 L 230 365 L 104 365 Z
             M 260 300 L 515 294 L 508 365 L 252 365 Z"
        />

        {/* 3. Water Features: Meguro River */}
        <path
          className="map-water-river"
          d="M -10 355 C 80 330, 150 375, 240 395 S 390 420, 550 410"
        />
        <path
          className="map-water-flow"
          d="M -10 355 C 80 330, 150 375, 240 395 S 390 420, 550 410"
        />
        <text className="map-water-label" x="220" y="402" transform="rotate(5 220 402)">
          Meguro River
        </text>

        {/* 4. Parks & Green Spaces: Saigoyama Park */}
        <path
          className="map-park"
          d="M 18 185 C 25 180, 80 182, 88 188 C 85 225, 80 260, 55 268 C 28 272, 16 250, 18 185 Z"
        />
        <path className="map-park-trail" d="M 30 200 Q 60 218 50 252" />
        <text className="map-park-label" x="26" y="228">
          Saigoyama Park 🌲
        </text>

        {/* 5. Railway Line (Tokyu Toyoko Line) */}
        <path
          className="map-railway"
          d="M 420 -10 C 395 100, 355 230, 320 450"
        />
        <text className="map-street-label" x="338" y="285" transform="rotate(74 338 285)">
          [TY] Tokyu Toyoko Line
        </text>

        {/* 6. Urban Road Hierarchy */}
        {/* Secondary Streets */}
        <g>
          <path className="map-road-casing map-road-secondary-casing" d="M -10 95 L 550 88" />
          <path className="map-road-surface map-road-secondary-surface" d="M -10 95 L 550 88" />

          <path className="map-road-casing map-road-secondary-casing" d="M -10 195 L 550 188" />
          <path className="map-road-surface map-road-secondary-surface" d="M -10 195 L 550 188" />

          <path className="map-road-casing map-road-secondary-casing" d="M -10 295 L 550 288" />
          <path className="map-road-surface map-road-secondary-surface" d="M -10 295 L 550 288" />

          <path className="map-road-casing map-road-secondary-casing" d="M 120 -10 L 105 450" />
          <path className="map-road-surface map-road-secondary-surface" d="M 120 -10 L 105 450" />

          <path className="map-road-casing map-road-secondary-casing" d="M 275 -10 L 260 450" />
          <path className="map-road-surface map-road-secondary-surface" d="M 275 -10 L 260 450" />

          <path className="map-road-casing map-road-secondary-casing" d="M 465 -10 L 450 450" />
          <path className="map-road-surface map-road-secondary-surface" d="M 465 -10 L 450 450" />
        </g>

        {/* Major Boulevard 1: Kyū-Yamate-dōri */}
        <g>
          <path
            className="map-road-casing map-road-major-casing"
            d="M 50 -10 C 70 80, 115 165, 205 188 S 330 230, 460 275"
          />
          <path
            className="map-road-surface map-road-major-surface"
            d="M 50 -10 C 70 80, 115 165, 205 188 S 330 230, 460 275"
          />
          <text className="map-street-label" x="115" y="152" transform="rotate(14 115 152)">
            Kyū-Yamate-dōri
          </text>
        </g>

        {/* Major Boulevard 2: Komazawa-dōri */}
        <g>
          <path
            className="map-road-casing map-road-major-casing"
            d="M -10 160 C 120 168, 260 190, 375 220 S 490 250, 550 258"
          />
          <path
            className="map-road-surface map-road-major-surface"
            d="M -10 160 C 120 168, 260 190, 375 220 S 490 250, 550 258"
          />
          <text className="map-street-label" x="430" y="242" transform="rotate(11 430 242)">
            Komazawa-dōri
          </text>
        </g>

        {/* River Bridges */}
        <rect className="map-road-bridge" x="95" y="348" width="16" height="26" rx="2" transform="rotate(-15 103 361)" />
        <rect className="map-road-bridge" x="250" y="380" width="16" height="26" rx="2" transform="rotate(10 258 393)" />

        {/* Pedestrian Promenade */}
        <path className="map-pedestrian-path" d="M 195 180 Q 230 145 270 155 T 325 170" />

        {/* Landmark POI 1: Daikanyama T-Site */}
        <g className="map-landmark" transform="translate(280, 125)">
          <circle cx="0" cy="0" r="4.5" fill="#3b82f6" />
          <text className="map-landmark-label" x="9" y="3">Daikanyama T-Site</text>
        </g>

        {/* Landmark POI 2: Daikanyama Station */}
        <g className="map-landmark" transform="translate(355, 335)">
          <rect x="-7" y="-7" width="14" height="14" rx="3.5" fill="#10b981" />
          <text x="0" y="3.5" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="bold">M</text>
          <text className="map-landmark-label" x="12" y="3">Daikanyama Station</text>
        </g>

        {/* 7. AUTHENTIC TURN-BY-TURN NAVIGATION ROUTE */}
        <path
          className="nav-route-glow"
          d="M 65 105 L 105 175 Q 145 186 215 195 L 385 260 L 470 165"
        />
        <path
          className="nav-route-casing"
          d="M 65 105 L 105 175 Q 145 186 215 195 L 385 260 L 470 165"
        />
        <path
          className="nav-route-traversed"
          d="M 65 105 L 105 175 Q 145 186 185 205"
        />
        <path
          className="nav-route-active"
          d="M 185 205 L 385 260 L 470 165"
        />

        {/* Directional Chevrons on Active Path */}
        <g className="nav-route-chevron">
          <polygon points="255,221 264,225 255,229 258,225" />
          <polygon points="315,237 324,241 315,245 318,241" />
          <polygon points="415,230 424,220 417,215 420,222" />
          <polygon points="445,195 454,185 447,180 450,187" />
        </g>

        {/* 8. REALISTIC REAL-TIME LOCATION: LIVE GPS PUCK (185, 205) */}
        <g
          className="gps-puck-group"
          transform="translate(185, 205)"
          onClick={handleRecenter}
          aria-label={`Current real-time location: ${liveCoordsString}`}
        >
          <circle className="gps-radar-wave" cx="0" cy="0" r="8" />
          <circle className="gps-radar-wave gps-radar-wave-delayed" cx="0" cy="0" r="8" />
          <circle className="gps-accuracy-halo" cx="0" cy="0" r="22" />
          <path
            className="gps-heading-beam"
            d="M 0 0 L 42 -10 A 44 44 0 0 1 44 18 Z"
          />
          <circle className="gps-dot-casing" cx="0" cy="0" r="9.5" />
          <circle className="gps-dot-core" cx="0" cy="0" r="7" />
          <circle className="gps-dot-center" cx="0" cy="0" r="2.5" />
        </g>

        {/* 9. WAYPOINT PINS */}
        {/* Stop 1: Origin Anchor */}
        <g
          className="waypoint-pin waypoint-pin-anchor"
          transform="translate(65, 105)"
          aria-label={`Stop 1: ${stop1Name} at ${stop1Time}`}
        >
          <circle cx="0" cy="0" r="11" />
          <text x="0" y="4">1</text>
        </g>

        {/* Stop 2: Target / Next Stop */}
        <g
          className="waypoint-pin waypoint-pin-target"
          transform="translate(385, 260)"
          onClick={() => setShowTargetDetails(prev => !prev)}
          aria-label={`Stop 2: ${stop2Name} at ${stop2Time}`}
        >
          <circle className="waypoint-pulse-ring" cx="0" cy="-14" r="14" />
          <path
            d="M 0 0 C -8 -11, -12 -18, -12 -25 A 12 12 0 1 1 12 -25 C 12 -18, 8 -11, 0 0 Z"
            filter="url(#pinShadow)"
          />
          <text x="0" y="-20">2</text>
        </g>

        {/* Stop 3: Afternoon / Floating Block */}
        <g
          className="waypoint-pin waypoint-pin-anchor"
          transform="translate(470, 165)"
          aria-label={`Stop 3: ${stop3Name}`}
        >
          <circle cx="0" cy="0" r="10" fill="#e07a5f" stroke="#ffffff" strokeWidth="2.5" />
          <text x="0" y="4" fill="#ffffff">3</text>
        </g>

        {/* 10. Rendezvous / Meeting Point Pin */}
        {splitActive && meetingPoint && (
          <g
            className="waypoint-pin waypoint-pin-reunion"
            transform="translate(290, 140)"
            aria-label={`Rendezvous Meeting Point: ${meetingPoint}`}
          >
            <circle cx="0" cy="-14" r="16" stroke="#930500" strokeWidth="2" fill="none" opacity="0.75" />
            <path
              d="M 0 0 C -8 -11, -12 -18, -12 -25 A 12 12 0 1 1 12 -25 C 12 -18, 8 -11, 0 0 Z"
              fill="#930500"
              filter="url(#pinShadow)"
            />
            <text x="0" y="-20" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">★</text>
          </g>
        )}

        {/* 11. NEARBY SERVICE POINTS PINS (Layered based on selection) */}
        {visibleServices.map(service => (
          <g
            key={service.id}
            className="service-point-pin"
            transform={`translate(${service.x}, ${service.y})`}
            onClick={() => setSelectedService(service)}
            aria-label={`${service.label}: ${service.name}`}
            style={{ cursor: 'pointer' }}
          >
            <circle cx="0" cy="-12" r="13" fill="#ffffff" stroke="#e11d48" strokeWidth="2" filter="url(#servicePinShadow)" />
            <text x="0" y="-8" fontSize="11" textAnchor="middle">{service.icon}</text>
            <path d="M -3 0 L 0 4 L 3 0 Z" fill="#e11d48" />
          </g>
        ))}

        {/* 12. DROPPED PHOTO PINS ON MAP */}
        {allPhotoPins.map(pin => {
          const posX = pin.x ?? 195;
          const posY = pin.y ?? 215;
          return (
            <g
              key={pin.id}
              className="map-photo-pin"
              transform={`translate(${posX}, ${posY})`}
              onClick={() => setSelectedPhotoPin(pin)}
              aria-label={`Photo pin: ${pin.title} (${pin.audience})`}
              style={{ cursor: 'pointer' }}
            >
              <rect x="-10" y="-22" width="20" height="18" rx="3" fill="#ffffff" stroke="#8b5cf6" strokeWidth="1.8" filter="url(#pinShadow)" />
              <circle cx="0" cy="-13" r="4" fill="#8b5cf6" />
              <path d="M -3 -4 L 0 0 L 3 -4 Z" fill="#8b5cf6" />
              <text x="0" y="-25" fontSize="8" textAnchor="middle" fill="#6d28d9" fontWeight="bold">
                {pin.audience === 'group' ? '👥' : '🔒'}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Live GPS Status Pill */}
      <div
        className="gps-live-pill"
        style={{ left: '34.3%', top: '41.5%' }}
        title="Live GPS location tracked - Only your location is shown on map"
      >
        <span className="gps-live-dot" />
        <span>{browserLocation ? 'GPS LIVE (YOU)' : 'LIVE ROUTE (YOU)'}</span>
        <span className="gps-live-meta">· ±4m</span>
      </div>

      {/* Group Mode Map Privacy HUD Badge */}
      {isGroupMode && (
        <div className="map-privacy-hud" title="Member location privacy protection">
          <span className="map-privacy-dot" />
          <span>Only your location is shown · Members stay private</span>
        </div>
      )}

      {/* Callout Bubble for Rendezvous Point */}
      {splitActive && meetingPoint && (
        <div
          className="reunion-callout-bubble"
          style={{ left: '53.7%', top: '28%' }}
        >
          <strong>★ Meeting Point: {meetingPoint}</strong>
          {meetingTime && <small>Meet at: {meetingTime}</small>}
        </div>
      )}

      {/* Callout Bubble for Stop 2 */}
      {showTargetDetails && (
        <div
          className="target-callout-bubble"
          style={{ left: '71.3%', top: '52%' }}
        >
          <strong>📍 Next: {stop2Name}</strong>
          <small>{stop2Time} · {stop2Mins} min walk away</small>
        </div>
      )}

      {/* Service Point Popup Card */}
      {selectedService && (
        <div className="service-popup-card">
          <div className="service-popup-header">
            <span>{selectedService.icon} {selectedService.label}</span>
            <button type="button" className="service-popup-close" onClick={() => setSelectedService(null)} aria-label="Close details">
              <X size={14} />
            </button>
          </div>
          <b>{selectedService.name}</b>
          <p className="service-popup-address">{selectedService.address}</p>
          <div className="service-popup-meta">
            <span>🚶 {selectedService.distance}</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedService.name} Tokyo`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="service-popup-nav-link"
          >
            Open in Google Maps <ExternalLink size={13} />
          </a>
        </div>
      )}

      {/* Photo Pin Detail Popup Card */}
      {selectedPhotoPin && (
        <div className="photo-pin-popup-card">
          <div className="photo-popup-header">
            <span>📸 Photo Moment</span>
            <button type="button" className="photo-popup-close" onClick={() => setSelectedPhotoPin(null)} aria-label="Close photo card">
              <X size={14} />
            </button>
          </div>
          <b>{selectedPhotoPin.title}</b>
          <div className="photo-popup-audience">
            <span>{selectedPhotoPin.audience === 'group' ? '👥 Shared with Group Album' : '🔒 Personal Journal Only'}</span>
            <small>📍 Pinned at Live Location</small>
          </div>
        </div>
      )}

      {/* Photo Pin Drop Modal */}
      {showPhotoModal && (
        <div className="photo-pin-modal-overlay">
          <div className="photo-pin-modal cc-card">
            <div className="photo-pin-modal-header">
              <b>📸 Drop Photo Pin Here</b>
              <button type="button" className="close-btn" onClick={() => setShowPhotoModal(false)} aria-label="Cancel">
                <X size={16} />
              </button>
            </div>
            <p className="photo-pin-modal-tip">
              Pin a photo moment to your live GPS coordinates ({liveCoordsString}).
            </p>
            <label className="photo-pin-input-label">
              <span>Moment Caption / Place:</span>
              <input
                type="text"
                placeholder="e.g. Daikanyama cozy book cafe"
                value={photoTitle}
                onChange={e => setPhotoTitle(e.target.value)}
                autoFocus
              />
            </label>
            <div className="photo-pin-audience-toggle">
              <span>Audience:</span>
              <div className="audience-buttons">
                <button
                  type="button"
                  className={photoAudience === 'personal' ? 'active' : ''}
                  onClick={() => setPhotoAudience('personal')}
                >
                  🔒 Personal Only
                </button>
                <button
                  type="button"
                  className={photoAudience === 'group' ? 'active' : ''}
                  onClick={() => setPhotoAudience('group')}
                >
                  👥 Share to Group
                </button>
              </div>
            </div>
            <div className="photo-pin-modal-actions">
              <button type="button" className="secondary" onClick={() => setShowPhotoModal(false)}>
                Cancel
              </button>
              <button type="button" className="primary" onClick={handleDropPhotoPin}>
                Drop Pin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Floating Controls (Top/Upper-Right) */}
      <div className="map-floating-controls">
        <button
          type="button"
          className="map-ctrl-btn compass"
          onClick={() => setZoomLevel(1)}
          title="Reset orientation to North"
          aria-label="Compass North"
        >
          <Compass size={18} />
        </button>

        <button
          type="button"
          className={`map-ctrl-btn recenter ${recenterActive ? 'active' : ''}`}
          onClick={handleRecenter}
          title="Recenter to Live GPS location"
          aria-label="Recenter GPS"
        >
          <Target size={18} />
        </button>

        {/* Camera Photo Pin Trigger */}
        <button
          type="button"
          className="map-ctrl-btn photo-pin-trigger"
          onClick={() => setShowPhotoModal(true)}
          title="Drop photo pin at current location"
          aria-label="Drop photo pin"
        >
          <Camera size={18} />
        </button>

        <button
          type="button"
          className="map-ctrl-btn"
          onClick={() => toggleZoom('in')}
          disabled={zoomLevel >= 1.4}
          title="Zoom in"
          aria-label="Zoom in"
        >
          <ZoomIn size={16} />
        </button>

        <button
          type="button"
          className="map-ctrl-btn"
          onClick={() => toggleZoom('out')}
          disabled={zoomLevel <= 1}
          title="Zoom out"
          aria-label="Zoom out"
        >
          <ZoomOut size={16} />
        </button>
      </div>

      {/* Coco Mascot Navigation Companion Guide */}
      <div
        className="map-coco-guide"
        onClick={nextTip}
        title="Tap Coco for navigation tips"
        role="button"
        tabIndex={0}
      >
        <CocoCompanion context="traveling" pose={delay ? 'expression-panic' : 'action-gps'} size={32} />
        <span className="map-coco-bubble">{COCO_WALK_TIPS[tipIndex]}</span>
      </div>

      {/* Bottom Scale & Route Mode HUD with Live Coordinates */}
      <div className="map-bottom-hud">
        <div className="map-scale-bar" title="Map scale indicator">
          <span className="map-scale-line" />
          <span>200 m</span>
        </div>

        <div className="map-mode-badge" title="Walking navigation mode and live GPS coordinates">
          <Footprints size={12} />
          <span>Walking route · 4.2 km/h · {liveCoordsString}</span>
        </div>
      </div>
    </div>
  );
}

