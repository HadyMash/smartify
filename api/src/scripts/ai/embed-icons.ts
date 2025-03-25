/* Creates embeddings of the icons and saves them in the db */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AIService } from '../../services/ai';
import OpenAI from 'openai';

dotenv.config();

async function start() {
  const ai = new AIService();

  // Create the icons directory if it doesn't exist
  const iconsDir = path.join('src', 'scripts', 'ai', 'icons');

  console.log('icons dir:', iconsDir);

  console.log('icons dir exists:', fs.existsSync(iconsDir));

  if (!fs.existsSync(iconsDir)) {
    console.error('Icons directory not found. Please generate the icons first');
    process.exit(1);
  }

  let icons = await fs.promises.readdir(iconsDir);
  icons = icons.slice(0, 2);
  const embeddings: Record<string, OpenAI.Embedding[]> = {};

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
    console.log('Time taken:', stopTime - startTime, 'ms');
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
