import { cocoAsset, cocoContextPose, type CocoContext, type CocoPose } from './assets';
import './coco-motion.css';

/** Context is semantic; image filenames and crop geometry remain private to assets.ts. */
export function CocoCompanion({ context, pose, size = 112 }: { context: CocoContext; pose?: CocoPose; size?: number }) {
  const selected = pose ?? cocoContextPose[context];
  return <span className="coco-companion" data-context={context} data-pose={selected} style={{ width: size, maxWidth: '100%' }} aria-hidden="true">
    <img key={selected} src={cocoAsset(selected)} alt="" draggable={false}/>
  </span>;
}
