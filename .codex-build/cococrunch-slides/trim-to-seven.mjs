import fs from 'node:fs/promises';
import JSZip from 'jszip';

const source = 'C:/Users/User/OneDrive/Documents/codenection26/CocoCrunch_GO/deliverables/CocoCrunch_Judge_Pitch.pptx';
const target = 'C:/Users/User/OneDrive/Documents/codenection26/CocoCrunch_GO/deliverables/CocoCrunch_Judge_Pitch_7slides.pptx';
const zip = await JSZip.loadAsync(await fs.readFile(source));
const presentationPath = 'ppt/presentation.xml';
const relsPath = 'ppt/_rels/presentation.xml.rels';
let presentation = await zip.file(presentationPath).async('string');
const ids = [...presentation.matchAll(/<p:sldId\b[^>]*\br:id="([^"]+)"[^>]*\/>/g)];
if (ids.length < 7) throw new Error(`Expected at least 7 slides, found ${ids.length}`);
for (const match of ids.slice(7)) presentation = presentation.replace(match[0], '');
zip.file(presentationPath, presentation);
let rels = await zip.file(relsPath).async('string');
for (const match of ids.slice(7)) rels = rels.replace(new RegExp(`<Relationship[^>]*Id="${match[1]}"[^>]*/>`, 'g'), '');
zip.file(relsPath, rels);
await fs.writeFile(target, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
