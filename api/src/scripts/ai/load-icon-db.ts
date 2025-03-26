/* Creates an SQLite database with the icons and their embeddings */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import { AIService } from '../../services/ai';

dotenv.config();

async function start() {
  const embeddingsFile = path.join('src', 'scripts', 'ai', 'embeddings.json');

  console.log('embeddings file:', embeddingsFile);

  if (!fs.existsSync(embeddingsFile)) {
    console.error('Embeddings file not found. Please embed the icons first');
    process.exit(1);
  }

  const file = await fs.promises.readFile(embeddingsFile, 'utf-8');

  const parsed = JSON.parse(file) as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: [{ embedding: number[]; [x: string]: any }];
  };
  const embeddings: { [key: string]: number[] } = Object.entries(parsed).reduce(
    (acc, [key, value]) => {
      acc[key] = value[0].embedding;
      return acc;
    },
    {} as { [key: string]: number[] },
  );
  console.log(`Loaded ${Object.keys(embeddings).length} embeddings`);

  console.log('parsed:', parsed['abc']);
  console.log('parsed:', parsed['abc'][0]['embedding']);
  console.log('embeddings:', embeddings['abc']);

  //const db = new Database(path.join('src', 'scripts', 'ai', 'icons.db'));
  const db = new Database(':memory:');
  sqliteVec.load(db);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { vec_version } = db
    .prepare('select vec_version() as vec_version;')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .get() as any;
  console.log(`vec_version=${vec_version}`);
  // create a table with the icon name and the embedding
  const dimensions = embeddings[Object.keys(embeddings)[0]].length;
  console.log('dimensions:', dimensions);

  try {
    // Create a virtual table with the icon name and the embedding vector using vec0
    db.prepare(
      `
      CREATE VIRTUAL TABLE IF NOT EXISTS icons USING vec0(
        name TEXT PRIMARY KEY,
        embedding float[${dimensions}] distance_metric=cosine
      )
    `,
    ).run();

    console.log('Virtual table created');

    // Begin a transaction for better performance
    // For direct insertion without vec_fromdense
    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO icons (name, embedding)
      VALUES (?, ?)
    `);

    const transaction = db.transaction(() => {
      for (const [iconName, embedding] of Object.entries(embeddings)) {
        // Convert the embedding array to Float32Array and use its buffer
        const float32Embedding = new Float32Array(embedding);
        // Make sure to pass the buffer as a Node.js Buffer object
        insertStmt.run(iconName, Buffer.from(float32Embedding.buffer));
      }
    });

    console.log('Starting transaction to insert embeddings...');
    transaction();
    console.log(
      `Successfully inserted ${Object.keys(embeddings).length} icons with embeddings`,
    );

    // Test a simple vector search
    const firstIcon = Object.keys(embeddings)[0];
    const testEmbedding = embeddings[firstIcon];

    const testQuery = db.prepare(`
      SELECT name, distance
      FROM icons 
      WHERE embedding MATCH ?
      AND k = 5
    `);

    const float32TestEmbedding = new Float32Array(testEmbedding);
    const result = testQuery.all(Buffer.from(float32TestEmbedding.buffer));
    console.log('Test vector search results:', result);

    // Test another icon to verify similarity search is working properly
    const iconNames = Object.keys(embeddings);
    if (iconNames.length > 5) {
      const anotherIcon = iconNames[5];
      console.log(`Testing similarity search with icon: ${anotherIcon}`);
      const float32AnotherEmbedding = new Float32Array(embeddings[anotherIcon]);
      const anotherResult = testQuery.all(
        Buffer.from(float32AnotherEmbedding.buffer),
      );
      console.log('Another test vector search results:', anotherResult);
    }

    console.log('Database created and populated successfully!');

    console.log(
      'Test search (abc):',
      await new AIService().vectorSearchIcon(db, 'abc'),
    );

    console.log(
      'Test search (snowflake):',
      await new AIService().vectorSearchIcon(db, 'snowflake'),
    );

    console.log(
      'Test search (heart monitor):',
      await new AIService().vectorSearchIcon(db, 'heart monitor'),
    );
  } catch (error) {
    console.error('Error creating or populating database:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
start();
