/* Creates embeddings of the icons and saves them in the db */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AIService } from '../../services/ai';

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
  // TEMP
  {
    const description = await ai.generateIconDescription(
      path.join(iconsDir, 'ac_unit_rounded.png'),
    );

    console.log('description:', description);

    if (!description) {
      return;
    }
    const embedding = await ai.genereteTextEmbedding(description);
    console.log('embedding:', embedding);
  }
  {
    const description = await ai.generateIconDescription(
      path.join(iconsDir, 'access_time_filled_rounded.png'),
    );

    console.log('description:', description);

    if (!description) {
      return;
    }
    const embedding = await ai.genereteTextEmbedding(description);
    console.log('embedding:', embedding);
  }
  {
    const description = await ai.generateIconDescription(
      path.join(iconsDir, 'air.png'),
    );

    console.log('description:', description);

    if (!description) {
      return;
    }
    const embedding = await ai.genereteTextEmbedding(description);
    console.log('embedding:', embedding);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
