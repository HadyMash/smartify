/* Creates embeddings of the icons and saves them in the db */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AIService } from '../../services/ai';
import OpenAI from 'openai';

dotenv.config();

async function start() {
  const ai = new AIService();

  const iconsDir = path.join('src', 'scripts', 'ai', 'icons');

  console.log('icons dir:', iconsDir);

  if (!fs.existsSync(iconsDir)) {
    console.error('Icons directory not found. Please generate the icons first');
    process.exit(1);
  }

  const icons = await fs.promises.readdir(iconsDir);
  const embeddings: Record<string, OpenAI.Embedding[]> = {};

  let totalTime = 0;
  let iconsDone = 0;
  for (const icon of icons) {
    const startTime = Date.now();
    console.log('icon:', icon);

    const description = await ai.generateIconDescription(
      icon,
      path.join(iconsDir, icon),
    );

    console.log('description:', description);

    if (!description) {
      return;
    }
    const embedding = await ai.genereteTextEmbedding(description);
    //console.log('embedding:', embedding);
    embeddings[icon.replace('.png', '')] = embedding;
    const stopTime = Date.now();
    totalTime += stopTime - startTime;
    console.log('\n-------------------------------------------');
    console.log(
      'Time taken:',
      ((stopTime - startTime) / 1000).toFixed(2),
      'seconds',
    );
    console.log('Total time:', (totalTime / 1000).toFixed(2), 'seconds');
    console.log(
      'Average time:',
      (totalTime / ++iconsDone / 1000).toFixed(2),
      'seconds',
    );
    console.log('-------------------------------------------');
    console.log(
      'Estimated time:',
      (((icons.length - iconsDone) * (totalTime / iconsDone)) / 1000).toFixed(
        2,
      ),
      'seconds',
    );
    console.log('-------------------------------------------\n');
  }

  // save embeddings to a file
  const embeddingsFile = path.join('src', 'scripts', 'ai', 'embeddings.json');
  await fs.promises.writeFile(
    embeddingsFile,
    JSON.stringify(embeddings, null, 2),
  );
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
