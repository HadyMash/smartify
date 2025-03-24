/* Creates embeddings of the icons and saves them in the db */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { AIService } from '../../services/ai.ts';

dotenv.config();

async function start() {
  const ai = new AIService();

  // Create the icons directory if it doesn't exist
  const iconsDir = path.join(
    path.dirname(import.meta.url.replace('file:', '')),
    'icons',
  );

  console.log('icons dir:', iconsDir);

  console.log('icons dir exists:', fs.existsSync(iconsDir));

  if (!fs.existsSync(iconsDir)) {
    console.error('Icons directory not found. Please generate the icons first');
    process.exit(1);
  }
  // TEMP
  console.log(
    await ai.generateIconDescription(path.join(iconsDir, 'ac_unit.png')),
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
