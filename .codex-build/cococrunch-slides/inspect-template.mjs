import fs from 'node:fs/promises';
import { FileBlob, PresentationFile } from '@oai/artifact-tool';

const source = 'C:/Users/User/Downloads/Travel Infographics by Slidesgo（副本）.pptx';
const output = 'C:/Users/User/OneDrive/Documents/codenection26/CocoCrunch_GO/.codex-build/cococrunch-slides';
const deck = await PresentationFile.importPptx(await FileBlob.load(source));
const snapshot = await deck.inspect({ kind: 'slide,textbox,shape,image,table,chart,notes,layout', maxChars: 50000 });
await fs.writeFile(`${output}/template-inspect.ndjson`, snapshot.ndjson);
for (let i = 0; i < deck.slides.length; i++) {
  const layout = await deck.slides.getItem(i).export({ format: 'layout' });
  await fs.writeFile(`${output}/template-slide-${i + 1}.layout.json`, await layout.text());
}
