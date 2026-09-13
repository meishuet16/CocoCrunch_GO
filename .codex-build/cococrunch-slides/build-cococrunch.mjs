import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const root = 'C:/Users/User/OneDrive/Documents/codenection26/CocoCrunch_GO';
const source = 'C:/Users/User/Downloads/Travel Infographics by Slidesgo（副本）.pptx';
const out = path.join(root, 'deliverables', 'CocoCrunch_Judge_Pitch.pptx');
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
const raw = await deck.inspect({ kind: 'textbox', maxChars: 60000 });
for (const line of raw.ndjson.split('\n')) {
  try {
    const record = JSON.parse(line);
    if (record.kind === 'textbox' && record.id) deck.resolve(record.id).text = '';
  } catch {}
}

const cream = '#FFF8E7';
const ink = '#2B211F';
const sangria = '#930500';
const blue = '#95BBEA';
const muted = '#756862';
function addText(slide, text, x, y, w, h, size, options = {}) {
  const box = slide.shapes.add({ geometry: 'textbox', position: { left: x, top: y, width: w, height: h }, fill: 'none', line: { fill: 'none', width: 0 } });
  box.text = text;
  box.text.style = { typeface: 'Aptos', fontSize: size, color: options.color ?? ink, bold: options.bold ?? false, alignment: options.align ?? 'left', autoFit: 'shrinkText' };
  return box;
}
async function addCoco(slide, asset, x, y, w, h, alt) {
  const bytes = await fs.readFile(path.join(root, asset));
  slide.images.add({ blob: bytes, contentType: 'image/png', alt, fit: 'contain', position: { left: x, top: y, width: w, height: h } });
}
function note(slide, text) { slide.speakerNotes.textFrame.setText(text); slide.speakerNotes.setVisible(true); }
const slides = Array.from({ length: 7 }, (_, i) => deck.slides.getItem(i));
slides.forEach(s => { s.background.fill = cream; });

// 1. Cover
addText(slides[0], 'CocoCrunch', 52, 112, 370, 72, 54, { bold: true, color: sangria });
addText(slides[0], 'Planning an escape without losing the group along the way', 55, 194, 370, 86, 25, { color: ink });
addText(slides[0], 'Lifestyle Track · Travel Planner\n[Team Name]', 55, 310, 260, 55, 16, { color: muted });
await addCoco(slides[0], 'src/assets/coco/extracted/coco-scene-planning.png', 520, 205, 300, 210, 'Coco planning a trip');
note(slides[0], '0:00–0:15\nHello judges. We are [Team Name], and this is CocoCrunch. CocoCrunch helps friends turn different travel preferences into a plan that everyone can understand and accept.');

// 2. Pain points
addText(slides[1], 'Why group trips become stressful', 55, 46, 560, 48, 32, { bold: true, color: sangria });
addText(slides[1], 'Planning is spread across bookings, notes, and group chat. The organiser carries the hidden work.', 55, 92, 620, 42, 18, { color: muted });
addText(slides[1], 'Preferences arrive late', 92, 308, 170, 24, 17, { bold: true });
addText(slides[1], 'Budgets are unclear', 292, 308, 170, 24, 17, { bold: true });
addText(slides[1], 'Changes break the plan', 492, 308, 175, 24, 17, { bold: true });
addText(slides[1], 'Must-Go plans, pace, and availability remain hidden until someone objects.', 70, 350, 190, 58, 14, { color: muted });
addText(slides[1], 'People agree to a total, then discover different comfort limits.', 275, 350, 180, 58, 14, { color: muted });
addText(slides[1], 'A delay forces a rushed manual rewrite and can lose what matters most.', 480, 350, 190, 58, 14, { color: muted });
note(slides[1], '0:15–0:45\nThe hardest part of travel planning is not finding places. It is coordinating people. Preferences, budgets, and non-negotiables often stay buried in chat until the group has already committed. When a delay happens, one person has to rebuild the day while trying not to disappoint everyone else.');

// 3. Solution
addText(slides[2], 'A plan with visible reasons', 55, 46, 560, 48, 32, { bold: true, color: sangria });
addText(slides[2], 'CocoCrunch connects personal inputs to group decisions and recovery options.', 55, 93, 650, 36, 18, { color: muted });
addText(slides[2], 'Tingo profile', 84, 170, 155, 28, 20, { bold: true, align: 'center' });
addText(slides[2], 'Preference and pace signals guide planning.', 84, 220, 155, 70, 15, { align: 'center', color: muted });
addText(slides[2], 'Group Travel DNA', 378, 170, 175, 28, 20, { bold: true, align: 'center' });
addText(slides[2], 'Shared needs and conflicts remain visible.', 378, 220, 175, 70, 15, { align: 'center', color: muted });
addText(slides[2], 'Plan and repair', 681, 170, 170, 28, 20, { bold: true, align: 'center' });
addText(slides[2], 'Protected anchors, clear impact, explicit approval.', 681, 220, 170, 70, 15, { align: 'center', color: muted });
await addCoco(slides[2], 'src/assets/coco/extracted/coco-expression-thinking.png', 430, 355, 100, 120, 'Coco considering preferences');
note(slides[2], '0:45–1:15\nCocoCrunch starts with what people actually need. Tingo captures a person’s travel style. Group Travel DNA shows what the group shares and where it disagrees. The itinerary then keeps Must-Go anchors protected, explains why suggestions fit, and asks for approval before a shared plan changes.');

// 4. Journey
addText(slides[3], 'From preference to confirmed plan', 55, 46, 620, 48, 32, { bold: true, color: sangria });
addText(slides[3], 'The prototype supports the journey before, during, and after a trip.', 55, 94, 610, 34, 18, { color: muted });
addText(slides[3], '1  Set up the trip\nDestination, dates, budget, Must-Go anchors', 90, 385, 290, 70, 17, { bold: true });
addText(slides[3], '2  Build the group plan\nTingo, Group DNA, Plan Health, Group Court', 410, 385, 310, 70, 17, { bold: true });
addText(slides[3], '3  Travel and learn\nRepair changes, check in, compare planned vs actual', 560, 480, 300, 56, 16, { bold: true });
await addCoco(slides[3], 'src/assets/coco/extracted/coco-scene-traveling.png', 75, 165, 280, 180, 'Coco during travel');
note(slides[3], '1:15–1:45\nThe journey has three stages. First, the group sets the frame: budget, dates, Must-Go items, and Deal Breakers. Next, CocoCrunch turns those inputs into a plan with Group DNA, Plan Health, and Group Court. During the trip, the app supports repair, check-ins, and reflection from actual outcomes.');

// 5. Scenario
addText(slides[4], 'When the flight is delayed', 55, 46, 570, 48, 32, { bold: true, color: sangria });
addText(slides[4], 'A 90-minute disruption becomes a clear group decision instead of a rushed group-chat rewrite.', 55, 93, 610, 40, 18, { color: muted });
addText(slides[4], 'What stays', 105, 165, 250, 28, 19, { bold: true });
addText(slides[4], 'The group’s protected dinner booking remains an anchor.', 105, 205, 260, 54, 16, { color: muted });
addText(slides[4], 'What changes', 105, 295, 250, 28, 19, { bold: true });
addText(slides[4], 'CocoCrunch previews a backup option and its time, cost, and preference impact.', 105, 335, 280, 68, 16, { color: muted });
addText(slides[4], 'Who decides', 105, 425, 250, 28, 19, { bold: true });
addText(slides[4], 'The group confirms the repair. Reversible changes include undo.', 105, 465, 265, 54, 16, { color: muted });
await addCoco(slides[4], 'src/assets/coco/extracted/coco-action-umbrella.png', 470, 145, 210, 270, 'Coco responding to a travel disruption');
note(slides[4], '1:45–2:30\nThis is the moment we designed around. A flight delay changes the day. CocoCrunch keeps the dinner booking visible as a protected anchor, then previews a repair using a viable backup option. The group can see time, cost, and preference effects before it confirms the update. The system does not silently change a shared plan.');

// 6. Differences
addText(slides[5], 'What makes CocoCrunch different', 55, 46, 650, 48, 32, { bold: true, color: sangria });
addText(slides[5], 'Travel planning needs more than a list of places.', 55, 94, 550, 34, 18, { color: muted });
const labels = [
  ['Preference provenance', 'Unknown inputs stay pending instead of becoming assumptions.'],
  ['Group governance', 'Saved ideas stay separate from official itinerary changes.'],
  ['Recovery preview', 'The group sees trade-offs before a repair applies.'],
  ['Privacy boundary', 'Reassurance and location sharing remain separate.'],
  ['Honest prototype data', 'Demo catalogs and unavailable services are labelled.'],
  ['Reflection loop', 'Actual spend and decisions inform the next trip.'],
];
const pos = [[65,260],[365,260],[665,260],[65,410],[365,410],[665,410]];
labels.forEach((item,i)=>{ addText(slides[5], item[0], pos[i][0], pos[i][1], 190, 26, 16, { bold:true, align:'center' }); addText(slides[5], item[1], pos[i][0], pos[i][1]+32, 190, 45, 13, { color:muted, align:'center' }); });
note(slides[5], '2:30–3:05\nCocoCrunch differs because it treats group travel as a shared decision process. It keeps preferences attributable, distinguishes saving an idea from changing the itinerary, previews recovery trade-offs, and separates reassurance from tracking. It also labels prototype data clearly instead of pretending demo values are live services.');

// 7. Feasibility / close
addText(slides[6], 'A feasible path from prototype to product', 55, 46, 700, 48, 32, { bold: true, color: sangria });
addText(slides[6], 'The current frontend proves the interaction model. The next phases add trusted shared data and providers.', 55, 94, 720, 38, 18, { color: muted });
addText(slides[6], 'Today', 85, 250, 160, 28, 22, { bold: true, align:'center' });
addText(slides[6], 'React + TypeScript\nTyped planning logic\nLocal prototype state', 78, 295, 175, 82, 15, { align:'center', color:muted });
addText(slides[6], 'Next', 385, 250, 160, 28, 22, { bold: true, align:'center' });
addText(slides[6], 'Accounts and member roles\nRealtime Court and decisions\nSecure provider boundary', 370, 295, 190, 82, 15, { align:'center', color:muted });
addText(slides[6], 'Then', 685, 250, 160, 28, 22, { bold: true, align:'center' });
addText(slides[6], 'Places, routes, weather\nBooking handoff\nOpt-in travel learning', 675, 295, 185, 82, 15, { align:'center', color:muted });
addText(slides[6], 'CocoCrunch helps a group decide together before, during, and after the trip.', 125, 490, 700, 38, 24, { bold:true, align:'center', color:sangria });
note(slides[6], '3:05–3:35\nCocoCrunch is a frontend prototype built with React, TypeScript, tested planning logic, and local persistence. The next production phases are clear: accounts and roles first, real-time governed decisions next, then secure travel-data integrations and booking handoffs. Our goal is not to replace every travel service. It is to make the group decision layer trustworthy. Thank you.');

await fs.mkdir(path.dirname(out), { recursive: true });
await (await PresentationFile.exportPptx(deck)).save(out);
