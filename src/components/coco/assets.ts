export type CocoExpression = 'normal' | 'happy' | 'excited' | 'sparkle' | 'thinking' | 'confused' | 'worried' | 'sweat' | 'tired' | 'sleepy' | 'angry' | 'shocked' | 'proud' | 'sad' | 'love' | 'panic';
export type CocoAction = 'map' | 'photo' | 'binoculars' | 'gps' | 'journal' | 'drink' | 'snack' | 'suggest' | 'luggage' | 'bags' | 'umbrella' | 'transit' | 'pack' | 'unpack' | 'rest' | 'celebrate';
export type CocoScene = 'home' | 'planning' | 'court' | 'gacha' | 'packing' | 'traveling' | 'memory-trunk' | 'empty';
export type CocoMovementDirection = 'down' | 'left' | 'right' | 'up';
export const movementFrames = ['idle', 'walk-a', 'passing', 'walk-b'] as const;
export type CocoMovementFrame = typeof movementFrames[number];
export type CocoPose = `expression-${CocoExpression}` | `action-${CocoAction}` | `scene-${CocoScene}` | `move-${CocoMovementDirection}-${CocoMovementFrame}`;

export const cocoContextPose = {
  home: 'scene-home', planning: 'scene-planning', why: 'expression-thinking',
  ready: 'expression-proud', traveling: 'scene-traveling', map: 'action-map',
  weather: 'action-umbrella', conditions: 'expression-normal',
  repair: 'expression-thinking', repairSuccess: 'expression-proud', court: 'scene-court',
  courtTie: 'scene-gacha', gacha: 'scene-gacha', lucky: 'expression-sparkle',
  packing: 'scene-packing', completed: 'expression-happy', memory: 'scene-memory-trunk',
  empty: 'scene-empty', askReasoning: 'expression-thinking', askSuggestion: 'action-suggest',
  photo: 'action-photo', journal: 'action-journal', prayer: 'expression-normal',
  exhausted: 'expression-tired', release: 'expression-love', receipt: 'action-journal',
  celebration: 'action-celebrate',
} as const satisfies Record<string, CocoPose>;
export type CocoContext = keyof typeof cocoContextPose;

const images = import.meta.glob<string>('../../assets/coco/extracted/coco-*.png', { eager: true, query: '?url', import: 'default' });
export function cocoAsset(pose: CocoPose): string {
  const image = images[`../../assets/coco/extracted/coco-${pose}.png`];
  if (!image) throw new Error(`Missing canonical Coco asset: ${pose}`);
  return image;
}

export function movementFrame(direction: CocoMovementDirection, tick: number, reducedMotion: boolean): CocoPose {
  const frame = reducedMotion ? 'idle' : movementFrames[((Math.floor(tick) % 4) + 4) % 4];
  return `move-${direction}-${frame}`;
}
