import React, { useEffect, useRef, useCallback } from 'react';
import { REAL_EARTH_CONTINENTS } from './earthContinents';

export interface EarthMarker {
  id: string;
  name: string;
  lat: number;
  lon: number;
  label?: string;
  reviewStatus?: 'yes' | 'mixed' | 'no' | 'unexplored';
  flag?: string;
}

interface CalloutBox {
  marker: EarthMarker;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RotatableEarthProps {
  size?: number;
  interactive?: boolean;
  autoRotate?: boolean;
  markers?: EarthMarker[];
  selectedMarkerId?: string;
  targetCoordinates?: { lat: number; lon: number } | null;
  onMarkerClick?: (marker: EarthMarker) => void;
  onClick?: () => void;
  className?: string;
  variant?: 'auto' | 'low-poly' | 'real-geo';
}

// ============================================================================
// Low-Poly 3D Mesh Data Structures & Generation (Faceted Earth)
// ============================================================================

interface MeshTriangle {
  v0: [number, number, number];
  v1: [number, number, number];
  v2: [number, number, number];
  type: 'ocean' | 'land' | 'cliff' | 'ice';
  baseColor: [number, number, number];
}

function normalizeVec(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function crossVec(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dotVec(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function latLonToVec(lat: number, lon: number, r = 1): [number, number, number] {
  const phi = (lat * Math.PI) / 180;
  const lambda = (lon * Math.PI) / 180;
  return [
    r * Math.cos(phi) * Math.sin(lambda),
    r * -Math.sin(phi),
    r * Math.cos(phi) * Math.cos(lambda),
  ];
}

function rotate3D(v: [number, number, number], rotY: number, rotX: number): [number, number, number] {
  const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
  const x1 = v[0] * cosY + v[2] * sinY;
  const y1 = v[1];
  const z1 = -v[0] * sinY + v[2] * cosY;

  const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
  const x2 = x1;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  return [x2, y2, z2];
}

function pointInTriangle2D(
  p: [number, number],
  a: [number, number],
  b: [number, number],
  c: [number, number]
): boolean {
  const d1 = (p[1] - b[1]) * (a[0] - b[0]) - (p[0] - b[0]) * (a[1] - b[1]);
  const d2 = (p[1] - c[1]) * (b[0] - c[0]) - (p[0] - c[0]) * (b[1] - c[1]);
  const d3 = (p[1] - a[1]) * (c[0] - a[0]) - (p[0] - a[0]) * (c[1] - a[1]);
  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
  return !(hasNeg && hasPos);
}

function triangulatePolygon(polygon: [number, number][]): [number, number][][] {
  if (polygon.length < 3) return [];
  if (polygon.length === 3) return [[polygon[0], polygon[1], polygon[2]]];

  const pts = polygon.slice();
  if (pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
    pts.pop();
  }
  if (pts.length < 3) return [];

  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    area += pts[i][1] * pts[j][0] - pts[j][1] * pts[i][0];
  }
  if (area < 0) pts.reverse();

  const triangles: [number, number][][] = [];
  const indices = pts.map((_, i) => i);

  let iterations = 0;
  while (indices.length > 3 && iterations < pts.length * 4) {
    iterations++;
    let earFound = false;

    for (let i = 0; i < indices.length; i++) {
      const prevIdx = indices[(i - 1 + indices.length) % indices.length];
      const currIdx = indices[i];
      const nextIdx = indices[(i + 1) % indices.length];

      const pPrev = pts[prevIdx];
      const pCurr = pts[currIdx];
      const pNext = pts[nextIdx];

      const cp = (pCurr[1] - pPrev[1]) * (pNext[0] - pCurr[0]) - (pCurr[0] - pPrev[0]) * (pNext[1] - pCurr[1]);
      if (cp <= 0) continue;

      let hasVertexInside = false;
      for (let j = 0; j < indices.length; j++) {
        const testIdx = indices[j];
        if (testIdx === prevIdx || testIdx === currIdx || testIdx === nextIdx) continue;
        if (pointInTriangle2D(pts[testIdx], pPrev, pCurr, pNext)) {
          hasVertexInside = true;
          break;
        }
      }

      if (!hasVertexInside) {
        triangles.push([pPrev, pCurr, pNext]);
        indices.splice(i, 1);
        earFound = true;
        break;
      }
    }

    if (!earFound) break;
  }

  if (indices.length >= 3) {
    for (let i = 1; i < indices.length - 1; i++) {
      triangles.push([pts[indices[0]], pts[indices[i]], pts[indices[i + 1]]]);
    }
  }

  return triangles;
}

function createIcosphere(subdivisions = 2) {
  const t = (1.0 + Math.sqrt(5.0)) / 2.0;

  const rawVertices: [number, number, number][] = [
    [-1,  t,  0], [ 1,  t,  0], [-1, -t,  0], [ 1, -t,  0],
    [ 0, -1,  t], [ 0,  1,  t], [ 0, -1, -t], [ 0,  1, -t],
    [ t,  0, -1], [ t,  0,  1], [-t,  0, -1], [-t,  0,  1],
  ];
  const vertices: [number, number, number][] = rawVertices.map(v => normalizeVec(v));

  let faces: [number, number, number][] = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  const midpointCache = new Map<string, number>();
  function getMidpoint(i1: number, i2: number): number {
    const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
    if (midpointCache.has(key)) return midpointCache.get(key)!;
    const v1 = vertices[i1];
    const v2 = vertices[i2];
    const mid = normalizeVec([(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2, (v1[2] + v2[2]) / 2]);
    const idx = vertices.length;
    vertices.push(mid);
    midpointCache.set(key, idx);
    return idx;
  }

  for (let s = 0; s < subdivisions; s++) {
    const nextFaces: [number, number, number][] = [];
    for (const [v0, v1, v2] of faces) {
      const a = getMidpoint(v0, v1);
      const b = getMidpoint(v1, v2);
      const c = getMidpoint(v2, v0);
      nextFaces.push([v0, a, c], [v1, b, a], [v2, c, b], [a, b, c]);
    }
    faces = nextFaces;
  }

  return { vertices, faces };
}

function buildLowPolyEarthModel(): MeshTriangle[] {
  const R_OCEAN = 0.99;
  const R_LAND = 1.045;
  const triangles: MeshTriangle[] = [];

  function addTri(
    v0: [number, number, number],
    v1: [number, number, number],
    v2: [number, number, number],
    type: 'ocean' | 'land' | 'cliff' | 'ice',
    baseColor: [number, number, number]
  ) {
    const center: [number, number, number] = [
      (v0[0] + v1[0] + v2[0]) / 3,
      (v0[1] + v1[1] + v2[1]) / 3,
      (v0[2] + v1[2]) / 3,
    ];
    const e1: [number, number, number] = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
    const e2: [number, number, number] = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
    const n = crossVec(e1, e2);
    // Guarantee outward counter-clockwise winding
    if (dotVec(n, center) < 0) {
      triangles.push({ v0, v1: v2, v2: v1, type, baseColor });
    } else {
      triangles.push({ v0, v1, v2, type, baseColor });
    }
  }

  // 1. Icosphere Ocean: 320 faceted blue triangles
  const ico = createIcosphere(2);
  ico.faces.forEach(([i0, i1, i2]) => {
    addTri(
      [ico.vertices[i0][0] * R_OCEAN, ico.vertices[i0][1] * R_OCEAN, ico.vertices[i0][2] * R_OCEAN],
      [ico.vertices[i1][0] * R_OCEAN, ico.vertices[i1][1] * R_OCEAN, ico.vertices[i1][2] * R_OCEAN],
      [ico.vertices[i2][0] * R_OCEAN, ico.vertices[i2][1] * R_OCEAN, ico.vertices[i2][2] * R_OCEAN],
      'ocean',
      [52, 126, 222]
    );
  });

  // 2. Continents with vertical cliff skirts
  REAL_EARTH_CONTINENTS.forEach(c => {
    const pts = c.coords.slice();
    if (pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
      pts.pop();
    }
    if (pts.length < 3) return;

    const landColor: [number, number, number] = c.isIce ? [226, 248, 244] : [68, 182, 114];
    const cliffColor: [number, number, number] = c.isIce ? [150, 198, 202] : [28, 92, 56];

    const tris = triangulatePolygon(pts);
    tris.forEach(([p0, p1, p2]) => {
      addTri(
        latLonToVec(p0[0], p0[1], R_LAND),
        latLonToVec(p1[0], p1[1], R_LAND),
        latLonToVec(p2[0], p2[1], R_LAND),
        c.isIce ? 'ice' : 'land',
        landColor
      );
    });

    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % pts.length];

      const top0 = latLonToVec(p0[0], p0[1], R_LAND);
      const top1 = latLonToVec(p1[0], p1[1], R_LAND);
      const base0 = latLonToVec(p0[0], p0[1], R_OCEAN);
      const base1 = latLonToVec(p1[0], p1[1], R_OCEAN);

      addTri(top0, top1, base1, 'cliff', cliffColor);
      addTri(top0, base1, base0, 'cliff', cliffColor);
    }
  });

  return triangles;
}

const LOW_POLY_EARTH_MODEL: MeshTriangle[] = buildLowPolyEarthModel();

// Directional light vector from upper-right
const DIRECTIONAL_LIGHT = normalizeVec([0.45, -0.65, 0.62]);

// ============================================================================
// Rotatable Earth React Component
// ============================================================================

export const RotatableEarth: React.FC<RotatableEarthProps> = ({
  size = 120,
  interactive = true,
  autoRotate = false,
  markers = [],
  selectedMarkerId,
  targetCoordinates,
  onMarkerClick,
  onClick,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotation angles (rotY: yaw/longitude, rotX: pitch/latitude)
  // Initial angle focuses on East Asia / Japan / Korea Pacific
  const rotYRef = useRef<number>(-2.4);
  const rotXRef = useRef<number>(0.35);
  const velocityYRef = useRef<number>(0);
  const velocityXRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const totalDragDistanceRef = useRef<number>(0);
  const isAutoRotatingRef = useRef<boolean>(autoRotate);
  const animFrameIdRef = useRef<number>(0);

  // Smooth camera targeting
  const targetAngleRef = useRef<{ rotX: number; rotY: number } | null>(null);

  // Callout bounding boxes for outer titles
  const calloutBoxesRef = useRef<CalloutBox[]>([]);

  // Update autoRotate ref
  useEffect(() => {
    isAutoRotatingRef.current = autoRotate;
  }, [autoRotate]);

  // Target coordinates smoothly
  useEffect(() => {
    if (targetCoordinates) {
      const targetPhi = (targetCoordinates.lat * Math.PI) / 180;
      const targetLambda = (targetCoordinates.lon * Math.PI) / 180;

      let destY = -targetLambda + Math.PI / 2;
      const currentY = rotYRef.current;
      const diffY = ((destY - currentY + Math.PI) % (Math.PI * 2)) - Math.PI;
      destY = currentY + diffY;

      const destX = Math.max(-0.9, Math.min(0.9, targetPhi * 0.7));
      targetAngleRef.current = { rotX: destX, rotY: destY };
    }
  }, [targetCoordinates]);

  // 3D Spherical Orthographic Projection helper
  const project = useCallback((lat: number, lon: number, r: number, cx: number, cy: number, rMult = 1.055) => {
    const phi = (lat * Math.PI) / 180;
    const lambda = (lon * Math.PI) / 180;

    const x0 = rMult * Math.cos(phi) * Math.sin(lambda);
    const y0 = rMult * -Math.sin(phi);
    const z0 = rMult * Math.cos(phi) * Math.cos(lambda);

    const rotY = rotYRef.current;
    const rotX = rotXRef.current;

    // Rotate Y (yaw)
    const x1 = x0 * Math.cos(rotY) + z0 * Math.sin(rotY);
    const y1 = y0;
    const z1 = -x0 * Math.sin(rotY) + z0 * Math.cos(rotY);

    // Rotate X (pitch)
    const x2 = x1;
    const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
    const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

    return {
      x: cx + r * x2,
      y: cy + r * y2,
      z: z2,
      visible: z2 > 0,
    };
  }, []);

  // Main Canvas 2D Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const dpr = window.devicePixelRatio || 1;
      const w = size;
      const h = size;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      // Size ratio: allocated margin around globe for outer title badges when size >= 240
      const radius = size >= 240 ? Math.round(Math.min(w, h) * 0.31) : Math.round(Math.min(w, h) * 0.44);

      // Smooth Camera Targeting Interpolation
      if (targetAngleRef.current) {
        const { rotX: tX, rotY: tY } = targetAngleRef.current;
        rotXRef.current += (tX - rotXRef.current) * 0.08;
        rotYRef.current += (tY - rotYRef.current) * 0.08;
        if (Math.abs(tX - rotXRef.current) < 0.005 && Math.abs(tY - rotYRef.current) < 0.005) {
          targetAngleRef.current = null;
        }
      } else if (!isDraggingRef.current) {
        // Inertia & Velocity
        rotYRef.current += velocityYRef.current;
        rotXRef.current += velocityXRef.current;
        velocityYRef.current *= 0.85;
        velocityXRef.current *= 0.85;

        if (Math.abs(velocityYRef.current) < 0.0001) velocityYRef.current = 0;
        if (Math.abs(velocityXRef.current) < 0.0001) velocityXRef.current = 0;

        // Auto rotation when enabled
        if (isAutoRotatingRef.current && velocityYRef.current === 0) {
          rotYRef.current += 0.0035;
        }
      }

      // Clamp vertical pitch to prevent flipping
      rotXRef.current = Math.max(-0.95, Math.min(0.95, rotXRef.current));

      const now = Date.now();
      const currentRotY = rotYRef.current;
      const currentRotX = rotXRef.current;

      // 0. Ambient Subtle Stars (in fullscreen canvas sizes >= 240)
      if (size >= 240) {
        for (let i = 0; i < 28; i++) {
          const sx = ((Math.sin(i * 997.3) * 0.5 + 0.5) * w);
          const sy = ((Math.cos(i * 613.7) * 0.5 + 0.5) * h);
          if (Math.hypot(sx - cx, sy - cy) < radius * 1.25) continue;
          const starTwinkle = 0.35 + 0.55 * Math.sin(now * 0.002 + i * 1.7);
          ctx.fillStyle = `rgba(178, 217, 196, ${Math.max(0.1, starTwinkle * 0.35)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, i % 4 === 0 ? 1.2 : 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 1. Atmospheric Soft Blue Radial Glow behind the globe
      const auraGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.34);
      auraGrad.addColorStop(0, 'rgba(65, 140, 245, 0.45)');
      auraGrad.addColorStop(0.55, 'rgba(55, 120, 230, 0.20)');
      auraGrad.addColorStop(0.85, 'rgba(35, 90, 200, 0.07)');
      auraGrad.addColorStop(1, 'rgba(35, 90, 200, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.34, 0, Math.PI * 2);
      ctx.fill();

      // 2. Transform, Cull, Light & Depth Sort Low-Poly Triangles
      interface ProjectedFace {
        p0: [number, number];
        p1: [number, number];
        p2: [number, number];
        z: number;
        color: string;
      }

      const visibleOcean: ProjectedFace[] = [];
      const visibleLand: ProjectedFace[] = [];

      for (let i = 0; i < LOW_POLY_EARTH_MODEL.length; i++) {
        const tri = LOW_POLY_EARTH_MODEL[i];
        const p0 = rotate3D(tri.v0, currentRotY, currentRotX);
        const p1 = rotate3D(tri.v1, currentRotY, currentRotX);
        const p2 = rotate3D(tri.v2, currentRotY, currentRotX);

        // Screen area backface culling (consistent outward winding ensures exactness)
        const screenArea = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0]);
        if (screenArea <= 0) continue;

        // View space normal for lighting
        const e1: [number, number, number] = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        const e2: [number, number, number] = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
        const norm = normalizeVec(crossVec(e1, e2));

        // Directional Flat Shading
        const diff = Math.max(0, dotVec(norm, DIRECTIONAL_LIGHT));
        const intensity = 0.36 + 0.64 * diff;

        const r = Math.min(255, Math.round(tri.baseColor[0] * intensity));
        const g = Math.min(255, Math.round(tri.baseColor[1] * intensity));
        const b = Math.min(255, Math.round(tri.baseColor[2] * intensity));
        const color = `rgb(${r},${g},${b})`;

        const faceCenterZ = (p0[2] + p1[2] + p2[2]) / 3;

        const face: ProjectedFace = {
          p0: [cx + p0[0] * radius, cy + p0[1] * radius],
          p1: [cx + p1[0] * radius, cy + p1[1] * radius],
          p2: [cx + p2[0] * radius, cy + p2[1] * radius],
          z: faceCenterZ,
          color,
        };

        if (tri.type === 'ocean') {
          visibleOcean.push(face);
        } else {
          visibleLand.push(face);
        }
      }

      // Render Pass 1: Ocean facets (back to front)
      visibleOcean.sort((a, b) => a.z - b.z);
      for (let i = 0; i < visibleOcean.length; i++) {
        const f = visibleOcean[i];
        ctx.fillStyle = f.color;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(f.p0[0], f.p0[1]);
        ctx.lineTo(f.p1[0], f.p1[1]);
        ctx.lineTo(f.p2[0], f.p2[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Render Pass 2: Land & Cliff facets (back to front, always rendered over ocean)
      visibleLand.sort((a, b) => a.z - b.z);
      for (let i = 0; i < visibleLand.length; i++) {
        const f = visibleLand[i];
        ctx.fillStyle = f.color;
        ctx.strokeStyle = f.color;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(f.p0[0], f.p0[1]);
        ctx.lineTo(f.p1[0], f.p1[1]);
        ctx.lineTo(f.p2[0], f.p2[1]);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 3. Subtle Horizon Atmospheric Edge Sheen (Limb Glow)
      const rimGrad = ctx.createRadialGradient(cx, cy, radius * 0.93, cx, cy, radius * 1.05);
      rimGrad.addColorStop(0, 'rgba(80, 160, 255, 0)');
      rimGrad.addColorStop(0.75, 'rgba(120, 195, 255, 0.16)');
      rimGrad.addColorStop(1.0, 'rgba(150, 215, 255, 0.38)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // 4. Pins on the Globe Surface
      const pulse = (Math.sin(now * 0.005) + 1) / 2; // 0 to 1

      const projectedMarkers = markers
        .map(marker => ({
          marker,
          pt: project(marker.lat, marker.lon, radius, cx, cy, 1.055),
        }))
        .filter(item => item.pt.visible);

      // Draw pins on the globe surface
      projectedMarkers.forEach(({ marker, pt }) => {
        const isSelected = selectedMarkerId === marker.id;
        const mainColor = marker.reviewStatus === 'mixed' ? '#c97716' : '#44916f';
        const glowColor =
          marker.reviewStatus === 'mixed' ? 'rgba(201, 119, 22, 0.45)' : 'rgba(68, 145, 111, 0.45)';

        // Animated Pulsing Ripple Ring
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (isSelected ? 6 : 4.5) + pulse * 5, 0, Math.PI * 2);
        ctx.stroke();

        // Pin Center Dot
        ctx.fillStyle = isSelected ? '#b2d9c4' : mainColor;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isSelected ? 5.5 : 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 5. Connected Titles Around the Earth (When size >= 240: line connected, zero overlap)
      if (size >= 240 && projectedMarkers.length > 0) {
        const calloutItems = projectedMarkers.map(({ marker, pt }) => {
          const angle = Math.atan2(pt.y - cy, pt.x - cx);
          return {
            marker,
            pt,
            angle,
            baseAngle: angle,
          };
        });

        // Sort items by angle [-PI, PI] for collision resolution
        calloutItems.sort((a, b) => a.angle - b.angle);

        // Angular relaxation: push angles apart so badges never collide
        const minAngleGap = 0.46; // ~26.4 degrees
        for (let pass = 0; pass < 8; pass++) {
          for (let i = 0; i < calloutItems.length - 1; i++) {
            const diff = calloutItems[i + 1].angle - calloutItems[i].angle;
            if (diff < minAngleGap) {
              const push = (minAngleGap - diff) / 2;
              calloutItems[i].angle -= push;
              calloutItems[i + 1].angle += push;
            }
          }
        }

        // Measure text and calculate initial badge positions
        ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        const boxes = calloutItems.map((item, idx) => {
          const { marker, pt } = item;
          const isSelected = selectedMarkerId === marker.id;
          const nameText = `${marker.flag ? marker.flag + ' ' : ''}${marker.name}`;
          const verdictText =
            marker.reviewStatus === 'yes' ? 'Worth it' : marker.reviewStatus === 'mixed' ? 'Mixed' : '';
          const nameMetrics = ctx.measureText(nameText);
          const verdictMetrics = verdictText ? ctx.measureText(verdictText) : { width: 0 };
          const badgeW = Math.max(88, nameMetrics.width + (verdictText ? verdictMetrics.width + 16 : 0) + 14);
          const badgeH = 22;

          // Stagger radial orbit distance for adjacent badges
          const orbitR = radius + 38 + (idx % 2 === 1 ? 18 : 0);
          const rawX = cx + Math.cos(item.angle) * orbitR;
          const rawY = cy + Math.sin(item.angle) * orbitR;

          const boxX = Math.max(8, Math.min(size - badgeW - 8, rawX - badgeW / 2));
          const boxY = Math.max(8, Math.min(size - badgeH - 8, rawY - badgeH / 2));

          return {
            marker,
            pt,
            baseAngle: item.baseAngle,
            isSelected,
            nameText,
            verdictText,
            verdictMetrics,
            x: boxX,
            y: boxY,
            w: badgeW,
            h: badgeH,
          };
        });

        // 2D Box collision resolution pass
        for (let pass = 0; pass < 6; pass++) {
          for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
              const b1 = boxes[i];
              const b2 = boxes[j];
              const pad = 6;
              const overlapX = (b1.w + b2.w) / 2 + pad - Math.abs(b1.x + b1.w / 2 - (b2.x + b2.w / 2));
              const overlapY = (b1.h + b2.h) / 2 + pad - Math.abs(b1.y + b1.h / 2 - (b2.y + b2.h / 2));

              if (overlapX > 0 && overlapY > 0) {
                if (overlapX < overlapY) {
                  const sign = b1.x + b1.w / 2 < b2.x + b2.w / 2 ? -1 : 1;
                  b1.x += sign * (overlapX / 2);
                  b2.x -= sign * (overlapX / 2);
                } else {
                  const sign = b1.y + b1.h / 2 < b2.y + b2.h / 2 ? -1 : 1;
                  b1.y += sign * (overlapY / 2);
                  b2.y -= sign * (overlapY / 2);
                }
                b1.x = Math.max(8, Math.min(size - b1.w - 8, b1.x));
                b1.y = Math.max(8, Math.min(size - b1.h - 8, b1.y));
                b2.x = Math.max(8, Math.min(size - b2.w - 8, b2.x));
                b2.y = Math.max(8, Math.min(size - b2.h - 8, b2.y));
              }
            }
          }
        }

        // Save layout for hit-testing clicks
        calloutBoxesRef.current = boxes.map(b => ({
          marker: b.marker,
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
        }));

        // Render Leader Lines connecting pin on globe -> rim -> title badge
        boxes.forEach(b => {
          const rimX = cx + Math.cos(b.baseAngle) * (radius + 5);
          const rimY = cy + Math.sin(b.baseAngle) * (radius + 5);
          const targetX = Math.max(b.x, Math.min(b.x + b.w, b.pt.x));
          const targetY = Math.max(b.y, Math.min(b.y + b.h, b.pt.y));

          ctx.strokeStyle = b.isSelected ? '#b2d9c4' : 'rgba(128, 185, 200, 0.85)';
          ctx.lineWidth = b.isSelected ? 2 : 1.2;
          if (b.isSelected) {
            ctx.shadowColor = '#b2d9c4';
            ctx.shadowBlur = 6;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.moveTo(b.pt.x, b.pt.y);
          ctx.lineTo(rimX, rimY);
          ctx.lineTo(targetX, targetY);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Tiny accent node at rim
          ctx.fillStyle = b.isSelected ? '#b2d9c4' : '#80b9c8';
          ctx.beginPath();
          ctx.arc(rimX, rimY, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Render Title Badges Around the Earth
        boxes.forEach(b => {
          ctx.fillStyle = b.isSelected ? 'rgba(16, 44, 52, 0.96)' : 'rgba(18, 48, 56, 0.90)';
          ctx.beginPath();
          ctx.roundRect(b.x, b.y, b.w, b.h, 6);
          ctx.fill();

          ctx.strokeStyle = b.isSelected ? '#b2d9c4' : 'rgba(128, 185, 200, 0.5)';
          ctx.lineWidth = b.isSelected ? 1.8 : 1.0;
          if (b.isSelected) {
            ctx.shadowColor = '#b2d9c4';
            ctx.shadowBlur = 8;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Flag & Destination Name
          ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText(b.nameText, b.x + 6, b.y + 14.5);

          // Verdict Chip
          if (b.verdictText) {
            const pillW = b.verdictMetrics.width + 8;
            const pillH = 14;
            const pillX = b.x + b.w - pillW - 4;
            const pillY = b.y + 4;

            ctx.fillStyle =
              b.marker.reviewStatus === 'yes' ? 'rgba(68, 145, 111, 0.92)' : 'rgba(201, 119, 22, 0.92)';
            ctx.beginPath();
            ctx.roundRect(pillX, pillY, pillW, pillH, 999);
            ctx.fill();

            ctx.font = 'bold 8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(b.verdictText, pillX + 4, pillY + 10.5);
          }
        });
      } else {
        calloutBoxesRef.current = [];
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [size, markers, selectedMarkerId, project]);

  // Pointer / Mouse / Touch Drag Handlers for Rotation
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    totalDragDistanceRef.current = 0;
    velocityYRef.current = 0;
    velocityXRef.current = 0;
    targetAngleRef.current = null;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive || !isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    totalDragDistanceRef.current += Math.hypot(dx, dy);

    const sensitivity = 0.007;
    rotYRef.current += dx * sensitivity;
    rotXRef.current += dy * sensitivity;

    velocityYRef.current = dx * sensitivity * 0.4;
    velocityXRef.current = dy * sensitivity * 0.4;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Check pin clicks & title badge clicks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (totalDragDistanceRef.current > 5) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const cx = size / 2;
    const cy = size / 2;
    const radius = size >= 240 ? Math.round(size * 0.31) : Math.round(size * 0.44);

    // 1. Check if clicked an outer title badge around the Earth
    for (const box of calloutBoxesRef.current) {
      if (
        clickX >= box.x &&
        clickX <= box.x + box.w &&
        clickY >= box.y &&
        clickY <= box.y + box.h
      ) {
        onMarkerClick?.(box.marker);
        return;
      }
    }

    // 2. Check if clicked near a visible marker dot on the globe
    for (const marker of markers) {
      const pt = project(marker.lat, marker.lon, radius, cx, cy, 1.055);
      if (pt.visible) {
        const dist = Math.hypot(pt.x - clickX, pt.y - clickY);
        if (dist <= Math.max(18, size * 0.055)) {
          onMarkerClick?.(marker);
          return;
        }
      }
    }

    // Default container click
    onClick?.();
  };

  return (
    <div
      className={`rotatable-earth-wrapper ${className}`}
      style={{ width: size, height: size }}
      role="region"
      aria-label="Rotatable Real-Color Earth"
    >
      <canvas
        ref={canvasRef}
        className="rotatable-earth-canvas"
        style={{
          width: size,
          height: size,
          cursor: interactive ? 'grab' : 'pointer',
          touchAction: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCanvasClick}
        aria-label="Real-Color 3D Earth Globe: drag to rotate"
      />
    </div>
  );
};

export default RotatableEarth;
