# AGENTS.md — CocoCrunch_GO

## Before touching anything
Read `docs/COCOCRUNCH_RESCUE_LOG.md` first — it documents past issues in this
codebase. Do not repeat mistakes it describes.

## Non-negotiable constraints
- Never modify business logic in `src/domain/`. This is a pure visual/styling pass.
- Never modify `persistence.ts` state shape or `experience.ts` event contracts.
- Do not rename exported component names or prop APIs without grepping every
  usage and updating all call sites in the same commit.
- The Coco mascot system in `src/components/coco/assets.ts` and
  `src/assets/coco/extracted/**` is already complete (all expression/action/scene/
  movement poses exist as PNGs, plus 16 persona portraits in
  `src/assets/coco/personas/`). Never generate or request new mascot art —
  reuse the existing `cocoAsset(pose)` / `cocoContextPose` system. Your job is to
  make sure every screen surfaces Coco with the *correct* pose at the right
  moment, not to redesign the character.
- `npm run check` (tsc --noEmit + vitest run + vite build) must pass after every
  change. Treat a failing check as a hard blocker, not a warning.
- Never touch more than one "phase" (see below) per commit. Commit after each
  phase passes `npm run check`, with a message naming the phase, so we can
  bisect/revert cleanly.

## Design system target (read once, apply everywhere)
Visual direction: warm travel-journal / scrapbook aesthetic — NOT flat corporate
SaaS. Existing tokens in `src/styles.css :root` are already the right family and
should be treated as the single source of truth, extended rather than replaced:
- `--cream: #fff8e7` — page background
- `--sangria: #930500` — primary accent (CTAs, active tab, progress fill, stamp ink)
- `--blue: #95bbea` — secondary accent (map lines, weather chips)
- `--ink: #2b211f` — primary text
- `--muted: #756862` — secondary text
- `--line: rgba(147,5,0,.13)` / `--paper: rgba(255,255,255,.62)` — hairlines/overlays

Typography (already present in the codebase, just not applied everywhere):
- Editorial headings: Georgia / "Playfair Display" serif — currently only in
  `explore-redesign.css` and `me-redesign.css`; extend to Home, Trips, Court, Packing.
- Handwritten accents (mood notes, tips, postmark labels): 'Caveat' cursive —
  currently only in `me-redesign.css` / `explore-redesign.css`.
- Body/UI text: keep the existing Inter/system-ui sans stack.

Decorative motif: the `.me-postmark-stamp` component in `me-redesign.css` is the
right visual language (circular ink-stamp badge). Extract it into a shared,
reusable component (e.g. `src/components/PostmarkStamp.tsx` +
`src/postmark-stamp.css`) and use it wherever a trip/place/memory needs a small
decorative badge — not just on the Me screen.

Cards/buttons: rounded 16–20px corners, soft shadow, cream card surface, pill or
full-width `--sangria` buttons with white text — codify this as reusable CSS
classes (or a couple of shared React primitives) rather than repeating
declarations per screen file.

## CSS consolidation goal
There are currently 10+ separate "*-redesign.css" / "*-interactions.css" files
layered with heavy `!important` usage (styles.css, v2-polish.css,
me-redesign.css, explore-redesign.css, packing-replica.css,
luggage-interactions.css, gacha-interactions.css, signature-interactions.css,
court/court-styles.css, random-rituals.css). Long-term goal: consolidate shared
tokens/typography/card/button rules into one place, and let per-screen files
only contain what's genuinely screen-specific. Do this incrementally per phase
below — do not attempt one big CSS merge in a single commit.

## CocoCrunch — UX Flow Alignment Rules

### 现状（不要重新发明）

- `src/domain/tingo.ts` + `renderTingoAssessment`（AppRescued.tsx）已经是完整的 16 型人格测验，
  只是目前是可选进入，不是强制 onboarding。新 onboarding 流程要**复用**这个 drawer/state，
  不要另外写一套新的人格测验。
- Group Court、Gacha、Backup Plan（`src/components/court/`）已完成，不要改它的投票/计票逻辑。
- Budget（`drawer === 'budget'`）、Retrospective（`TripRetrospective.tsx`、`itemReviews`、
  `decisionHistory`）已经覆盖了 Plan Health / Worth-it / Decision History / Budget vs Actual，
  只做补丁式扩展，不要重写。
- `CommunityPublishPanel.tsx` 的「显式 consent 才公开、照片单独 toggle」模型是对的，新功能
  照这个模式做，不要发明新的公开机制。

### 新功能要遵守的规则

1. 所有新状态字段加进 `src/persistence.ts` 的 `PersistedState`（或按需新建
   `PersistedOnboardingState` 之类的子类型），并在 `AppRescued.tsx` 里接上
   `useState(stored.xxx ?? default)` 的既有模式，不要绕开 persistence 层直接开 local state。
2. 这是纯前端原型（没有真实后端）。手机号验证、Gmail 解析、比价 API、AI 推荐全部按现有
   `discover` 抽屉的做法来：明确标注「prototype」/「fallback example」/「not live data」，
   不要假装是真实网络请求；已有 `recommendations` 里 `source: 'prototype-catalog'` 这种
   标注方式，新功能照抄这个诚实标注习惯。
3. 每个新 drawer/step 都要有 Skip 出口（除非 spec 明确说这步不能跳过，比如 Terms & Conditions
   同意前不能继续）。
4. Group 模式下任何「本人还未填」的字段要明确显示 pending 状态，不要用别人的值默认填充。
5. 不做无关的样式大改；这轮任务是结构/流程，不是视觉重新设计。如果某个新增页面需要样式，
   尽量复用现有 `.setup-field`、`.drawer-kicker`、`.primary`/`.secondary` 这类既有 class。
6. 每个 Phase 完成后必须跑 `npm run check` 全绿，再建议 commit。**不要**把多个 Phase 的改动
   混在一个 commit 里。
7. 新增的 Flight/Accommodation/Invite 相关组件放 `src/components/`，命名跟现有风格一致
   （PascalCase 文件名 + 同名 `.test.tsx`）。

## CocoCrunch — Visual & Copy Consistency Rules

### 这轮任务的边界

- 这是纯 CSS/文案/版面任务，**不改任何业务逻辑、state、persistence 字段**。如果为了
  某个视觉效果必须改 `.tsx` 里的逻辑（不只是 `className`/文案），先停下来跟我确认，
  不要顺手改。
- 每个 Phase 完成后跑 `npm run check`，确认测试没有因为改了 DOM 结构/文案而挂掉；
  如果某条测试是断言具体英文文案字符串，且这次改动改了那个文案，更新测试期望值是
  允许的，但要在 commit message 里写清楚改了哪些测试字符串。

### 设计 token 唯一来源

- 颜色沿用 `src/styles.css` 里现有的 `--cream / --sangria / --blue` 系列变量，
  **不要新增新的颜色变量**，除非是同一色相的深浅档位且现有档位不够用。
- 圆角只用 `--radius-sm(8px) / --radius(14px) / --radius-lg(24px)` 三档。
- 阴影只用 `--shadow-sm / --shadow / --shadow-lg` 三档（数值见上面 SeedDown 那节）。
- 字体最终只保留两组：一组 UI 正文/标题（Inter 那条 fallback 链，统一成一种写法，
  不要同时存在带 `!important` 和不带的两份），一组装饰性手写体（Caveat，仅用在
  明确是「手写风格」的装饰元素上，比如明信片/邮戳类组件，不能用在按钮、正文、
  一般标签上）。`Brush Script MT`、`Comic Sans MS`、`Playfair Display`、
  `Aptos Display` 这几个孤立字体声明直接删掉，改成上面两组之一。

### 文案规则

- 全大写的 `<span>` kicker/eyebrow 标签，只有在它是**真实的结构性标签**（比如
  Tab 名称、区块的功能分类）时才保留，并且要缩短成 2–4 个词以内的平实描述。
  纯粹是氛围/文采修饰的（比如 “PAR AVION · AIR MAIL”、“JEJU IN AMBER”、
  “SPONTANEITY RESERVE” 这类）一律删除或改写成直接说明内容的文字。
- 不要发明新的诗意短语来「替代」被删掉的旧短语——检查删除后这个位置是否真的需要
  文字，很多时候标题本身或图标已经够用，不需要额外加一行小字撑场面。
- 每处改动前后对照，保存一份 diff 摘要（哪些字符串删了、哪些改了），方便审阅是不是
  真的变克制了，而不是换了一批新的花哨说法。

### 迁移纪律

- CSS 合并按画面一个一个来，每个画面确认视觉没有跑掉、`npm run check` 全绿再进下一个，
  不要一次性把 18 个 CSS 文件揉在一起改。
- 删除某个 `-redesign.css` / `-polish.css` 文件里的规则之前，先确认 `styles.css`
  或新的共享 token 文件已经覆盖了同样的效果，不要先删后补。
