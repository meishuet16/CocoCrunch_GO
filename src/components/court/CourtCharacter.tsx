import React, { useState, useEffect, useMemo } from 'react';
import './court-styles.css';

export type CharacterId =
  | 'judge'
  | 'boy_yellow'
  | 'boy_green'
  | 'girl_redhat'
  | 'girl_blonde';

export type CharacterVariant =
  | CharacterId
  | 'green'
  | 'coral'
  | 'blue'
  | 'purple'
  | 'yellow'
  | 'navy';

export type CharacterPose =
  | 'idle'
  | 'blink'
  | 'action'
  | 'correct'
  | 'wrong'
  | 'celebrate'
  | 'thinking';

export interface CourtCharacterProps {
  character: CharacterVariant;
  status?: CharacterPose;
  size?: number;
  autoBlink?: boolean;
  animated?: boolean;
  isAvatar?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
  alt?: string;
}

// Court sprites are versioned public assets, so they work in every checkout.
const CHARACTER_SOURCES: Record<CharacterId, string> = {
  judge: '/characters/judge.png',
  boy_yellow: '/characters/boy_yellow.png',
  boy_green: '/characters/boy_green.png',
  girl_redhat: '/characters/girl_redhat.png',
  girl_blonde: '/characters/girl_blonde.png',
};

export function resolveCharacterId(variant: CharacterVariant): CharacterId {
  switch (variant) {
    case 'judge':
      return 'judge';
    case 'green':
    case 'navy':
    case 'boy_green':
      return 'boy_green';
    case 'coral':
    case 'girl_redhat':
      return 'girl_redhat';
    case 'blue':
    case 'yellow':
    case 'boy_yellow':
      return 'boy_yellow';
    case 'purple':
    case 'girl_blonde':
      return 'girl_blonde';
    default:
      return 'boy_yellow';
  }
}

interface GridCoord {
  r: number; // 0 or 1
  c: number; // 0, 1, or 2
}

function getGridCoord(charId: CharacterId, pose: CharacterPose): GridCoord {
  if (charId === 'judge') {
    switch (pose) {
      case 'idle':
        return { r: 0, c: 0 };
      case 'blink':
        return { r: 0, c: 1 };
      case 'action':
        return { r: 0, c: 2 }; // Raising gavel
      case 'thinking':
        return { r: 1, c: 0 }; // Chin pondering
      case 'correct':
        return { r: 1, c: 1 }; // Checkmark paddle + thumbs up
      case 'wrong':
        return { r: 0, c: 2 }; // Gavel order / strike
      case 'celebrate':
        return { r: 0, c: 0 }; // Normal dignified idle appearance (NEVER JUMP!)
      default:
        return { r: 0, c: 0 };
    }
  }

  // 4 Travelers (boy_yellow, boy_green, girl_redhat, girl_blonde)
  switch (pose) {
    case 'idle':
      return { r: 0, c: 0 };
    case 'blink':
      return { r: 0, c: 1 };
    case 'action':
    case 'thinking':
      return { r: 0, c: 2 };
    case 'correct':
      return { r: 1, c: 0 }; // Green check paddle
    case 'wrong':
      return { r: 1, c: 1 }; // Red X paddle
    case 'celebrate':
      return { r: 1, c: 2 }; // Jumping cheer
    default:
      return { r: 0, c: 0 };
  }
}

// In-memory cache for processed transparent sheets
const transparentCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();

/**
 * Flood-fills outer white border pixels to transparent rgba(0,0,0,0) in client memory.
 * Preserves all internal whites (teeth, eyes, socks, checkmarks, white beard, etc.)
 */
export function createTransparentSpriteSheet(src: string): Promise<string> {
  if (typeof window === 'undefined') return Promise.resolve(src);
  if (transparentCache.has(src)) {
    return Promise.resolve(transparentCache.get(src)!);
  }
  if (pendingPromises.has(src)) {
    return pendingPromises.get(src)!;
  }

  const promise = new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(src);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        const isBg = (idx: number) => {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          return r >= 242 && g >= 242 && b >= 242;
        };

        // Seed outer perimeter
        for (let x = 0; x < w; x++) {
          const topIdx = x * 4;
          if (isBg(topIdx)) {
            visited[x] = 1;
            queue.push(x);
          }
          const botIdx = ((h - 1) * w + x) * 4;
          if (isBg(botIdx) && !visited[(h - 1) * w + x]) {
            visited[(h - 1) * w + x] = 1;
            queue.push((h - 1) * w + x);
          }
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = y * w * 4;
          if (isBg(leftIdx) && !visited[y * w]) {
            visited[y * w] = 1;
            queue.push(y * w);
          }
          const rightIdx = (y * w + (w - 1)) * 4;
          if (isBg(rightIdx) && !visited[y * w + (w - 1)]) {
            visited[y * w + (w - 1)] = 1;
            queue.push(y * w + (w - 1));
          }
        }

        // BFS flood fill
        let head = 0;
        while (head < queue.length) {
          const p = queue[head++];
          const px = p % w;
          const py = Math.floor(p / w);
          const pIdx = p * 4;

          data[pIdx + 3] = 0;

          const neighbors = [
            px > 0 ? p - 1 : -1,
            px < w - 1 ? p + 1 : -1,
            py > 0 ? p - w : -1,
            py < h - 1 ? p + w : -1,
          ];

          for (const n of neighbors) {
            if (n >= 0 && !visited[n]) {
              const nIdx = n * 4;
              if (isBg(nIdx)) {
                visited[n] = 1;
                queue.push(n);
              } else {
                const nr = data[nIdx];
                const ng = data[nIdx + 1];
                const nb = data[nIdx + 2];
                if (nr >= 220 && ng >= 220 && nb >= 220) {
                  visited[n] = 1;
                  const minVal = Math.min(nr, ng, nb);
                  const alpha = Math.max(0, Math.min(255, Math.floor(((242 - minVal) / 22) * 255)));
                  data[nIdx + 3] = alpha;
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        transparentCache.set(src, dataUrl);
        resolve(dataUrl);
      } catch (err) {
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

  pendingPromises.set(src, promise);
  return promise;
}

export const CourtCharacter: React.FC<CourtCharacterProps> = ({
  character,
  status = 'idle',
  size = 160,
  autoBlink = true,
  animated = true,
  isAvatar = false,
  className = '',
  style,
  onClick,
  title,
  alt,
}) => {
  const charId = useMemo(() => resolveCharacterId(character), [character]);
  const [internalPose, setInternalPose] = useState<CharacterPose>(status);
  const [transparentSrc, setTransparentSrc] = useState<string | null>(null);

  // Sync external status
  useEffect(() => {
    setInternalPose(status);
  }, [status]);

  // Duolingo organic breathing & random blinking timer
  useEffect(() => {
    if (!autoBlink || !animated || status !== 'idle') return;

    let blinkTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      setInternalPose((prev) => {
        if (prev === 'idle') {
          blinkTimeout = setTimeout(() => {
            setInternalPose((p) => (p === 'blink' ? 'idle' : p));
          }, 320);
          return 'blink';
        }
        return prev;
      });
    }, 3200 + Math.random() * 1400);

    return () => {
      clearInterval(interval);
      clearTimeout(blinkTimeout);
    };
  }, [autoBlink, animated, status]);

  const baseSrc = CHARACTER_SOURCES[charId];

  // Background transparency processing
  useEffect(() => {
    let active = true;
    setTransparentSrc(null);
    createTransparentSpriteSheet(baseSrc).then((trans) => {
      if (active && trans) {
        setTransparentSrc(trans);
      }
    });
    return () => {
      active = false;
    };
  }, [baseSrc]);

  const coord = useMemo(() => getGridCoord(charId, internalPose), [charId, internalPose]);
  const currentImgSrc = transparentSrc || baseSrc;
  const isTransparent = Boolean(transparentSrc);

  const cellWidth = size;
  const cellHeight = Math.round(size * 1.15);

  const animationClass = !animated
    ? 'duo-anim-static'
    : internalPose === 'idle' || internalPose === 'blink'
    ? 'duo-anim-idle'
    : internalPose === 'correct'
    ? 'duo-anim-correct'
    : internalPose === 'wrong'
    ? 'duo-anim-wrong'
    : internalPose === 'celebrate'
    ? 'duo-anim-celebrate'
    : internalPose === 'action'
    ? 'duo-anim-action'
    : 'duo-anim-thinking';

const AVATAR_CONFIGS: Record<CharacterId, { scale: number; shiftX: number; shiftY: number }> = {
  // Alex (绿色帽子男孩): head centered, cap fully intact with breathing room
  boy_green: { scale: 1.71, shiftX: -22.1, shiftY: -1.9 },
  // Mavis (金发女孩): head centered, golden hair and cute smile framed nicely
  girl_blonde: { scale: 2.04, shiftX: -19.2, shiftY: -13.5 },
  // Ken (墨镜卷发男孩): head centered horizontally, sunglasses and smile centered
  boy_yellow: { scale: 1.71, shiftX: -1.0, shiftY: -1.9 },
  // June (红帽子女孩): head centered, red bucket hat fully visible with breathing room
  girl_redhat: { scale: 2.0, shiftX: -21.2, shiftY: -11.5 },
  // Judge (法官): white wig intact, face centered
  judge: { scale: 1.65, shiftX: -11.5, shiftY: -1.9 },
};

  // Dedicated Centered Bust / Headshot Avatar Mode (Perfect for circular avatars)
  if (isAvatar) {
    const config = AVATAR_CONFIGS[charId] || { scale: 1.71, shiftX: -1.0, shiftY: -1.9 };
    const avatarCellW = Math.round(size * config.scale);
    const avatarCellH = Math.round(avatarCellW * 1.15);
    const avatarTop = Math.round(size * (config.shiftY / 100));
    const avatarLeft = `calc(50% + ${Math.round(size * (config.shiftX / 100))}px)`;

    return (
      <div
        className={`duo-character-avatar select-none ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #f1f5f9 100%)',
          cursor: onClick ? 'pointer' : 'default',
          flexShrink: 0,
          ...style,
        }}
        onClick={onClick}
        title={title || charId}
        role={onClick ? 'button' : undefined}
      >
        <div
          style={{
            width: avatarCellW,
            height: avatarCellH,
            position: 'absolute',
            top: avatarTop,
            left: avatarLeft,
            transform: 'translateX(-50%)',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <img
            src={currentImgSrc}
            alt={alt || `${charId} avatar`}
            className="duo-avatar-sprite-img"
            style={{
              position: 'absolute',
              width: '300%',
              height: '200%',
              maxWidth: 'none',
              maxHeight: 'none',
              borderRadius: 0,
              left: `${-coord.c * 100}%`,
              top: `${-coord.r * 100}%`,
              objectFit: 'fill',
              userSelect: 'none',
              pointerEvents: 'none',
              mixBlendMode: isTransparent ? 'normal' : 'multiply',
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`duo-character-root select-none ${className}`}
      style={{
        width: cellWidth,
        height: cellHeight,
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      title={title || charId}
      role={onClick ? 'button' : undefined}
    >
      <div
        className={`duo-character-bounce-box ${animationClass}`}
        style={{
          width: cellWidth,
          height: cellHeight,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 8,
          transformOrigin: 'center bottom',
          ...(!animated
            ? {
                animation: 'none',
                transform: 'none',
                transition: 'none',
              }
            : {}),
        }}
      >
        <img
          src={currentImgSrc}
          alt={alt || `${charId} ${internalPose}`}
          style={{
            position: 'absolute',
            width: '300%',
            height: '200%',
            left: `${-coord.c * 100}%`,
            top: `${-coord.r * 100}%`,
            objectFit: 'fill',
            userSelect: 'none',
            pointerEvents: 'none',
            mixBlendMode: isTransparent ? 'normal' : 'multiply',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};
