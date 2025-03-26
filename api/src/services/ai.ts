import fs from 'fs';
import OpenAI from 'openai';
import { Device, deviceSchema } from '../schemas/devices';
import { randomUUID } from 'crypto';
import { validMaterialIcon } from '../schemas/icon';
import SQDB from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import path from 'path';

const DEVICE_MODEL = 'qwen2.5-3b-instruct-ml';
const VLM_MODEL = 'gemma-3-4b-it';
const EMBEDDING_MODEL = 'text-embedding-nomic-embed-text-v1.5';

export class AIService {
  private static _client: OpenAI;
  protected readonly client: OpenAI;
  protected static _db: SQDB.Database;
  protected readonly db: SQDB.Database;

  constructor() {
    if (!AIService._client) {
      AIService._client = new OpenAI({
        baseURL: process.env.INFERENCE_URL,
        apiKey: process.env.INFERENCE_API_KEY,
      });
    }
    this.client = AIService._client;
    if (!AIService._db) {
      AIService._db = new SQDB(path.join('src', 'scripts', 'ai', 'icons.db'));
      sqliteVec.load(AIService._db);
    }
    this.db = AIService._db;
  }

  /**
   * Pick a suitable icon for the device
   * @param device - The device to generate an icon for
   * @returns The icon name
   * @throws An error if the model fails to generate a valid icon after retries
   */
  public async pickDeviceIcon(
    device: Omit<Device, 'icon'>,
  ): Promise<string | undefined> {
    console.log('device:', device);

    const example1device: Omit<Device, 'icon'> = {
      id: randomUUID(),
      source: 'acme',
      capabilities: [
        {
          id: 'on',
          name: 'On',
          type: 'switch',
        },
        {
          type: 'range',
          id: 'brightness',
          name: 'Brightness',
          min: 0,
          max: 100,
          step: 1,
          unit: '%',
        },
        {
          type: 'multirange',
          id: 'color',
          name: 'Color',
          min: 0,
          max: 255,
          length: 3,
          step: 1,
        },
      ],
    };

    // make sure device is valid
    deviceSchema.parse(device);

    const example2device: Omit<Device, 'icon'> = {
      id: randomUUID(),
      source: 'acme',
      capabilities: [
        {
          id: 'power',
          type: 'switch',
        },
        {
          id: 'value',
          type: 'range',
          min: 15,
          max: 30,
          step: 0.5,
          unit: '°C',
        },
        {
          id: 'mode',
          type: 'mode',
          modes: ['cool', 'heat', 'fan', 'dry'],
        },
        {
          id: 'fan',
          type: 'mode',
          modes: ['auto', 'low', 'medium', 'high'],
        },
        {
          id: 'swing',
          type: 'multiswitch',
          length: 2,
        },
      ],
    };

    // make sure device is valid
    deviceSchema.parse(example2device);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const badexample1device: Device = {
      id: randomUUID(),
      source: 'acme',
      name: 'ACME Fan',
      capabilities: [
        //{
        //  id: 'heartrate',
        //  type: 'number',
        //  name: 'Heart Rate',
        //  unit: 'bpm',
        //  readonly: true,
        //},
        //{
        //  id: 'bloodpressure',
        //  type: 'number',
        //  unit: 'mmHg',
        //  readonly: true,
        //},
        {
          id: 'on',
          type: 'switch',
        },
        {
          id: 'speed',
          type: 'mode',
          modes: ['low', 'medium', 'high'],
        },
        {
          id: 'swing',
          type: 'switch',
          name: 'Horizontal Swing',
        },
      ],
    };

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI designed to select appropriate icons for smart home devices
Given a smart home device and it's capabilites, you must select an icon which represents the device.

RULES:
1. You MUST ALWAYS follow ALL the rules below.
2. RESTRICTED ICON LIST - You must ONLY use flutter's material icons.
3. You must select the most suitable icon for the device based on it's capabilites and information provided.
4. The device may sometimes include optional name and/or description fields. You may use these to help you select the most suitable icon, but they might not be included.
5. You must consider what the icon looks like, but also what it may mean/represent.
6. Respond with the icon name and a very brief description of what it may look lile. You should include possible names for the icon/tags at the end of your response.
8. EXAMPLES: below are examples of inputs and possible icon choices:
Example 1:
INPUT:
${JSON.stringify(example1device)}

OUTPUT:
lightbulb. A lightbulb icon, possibly with light rays. bulb, idea, bright, illumination

Example 2:
INPUT:
${JSON.stringify(example2device)}

OUTPUT:
air. An icon showing air, or curvy lines, or a fan, or temperature. air, fan, temperature control, climate control
`,
      },
    ];

    messages.push({
      role: 'user',
      content: JSON.stringify(device),
    });

    const response = await this.client.chat.completions.create({
      model: DEVICE_MODEL,
      messages,
      temperature: 0.1,
    });

    console.log(`Response content: ${response.choices[0].message.content}`);

    const iconContent = response.choices[0].message.content;

    if (!iconContent) {
      throw new Error('Failed to generate icon');
    }

    // get an icon name from the embedding
    const iconName = await this.vectorSearchIcon(iconContent);

    if (!validMaterialIcon(iconName)) {
      throw new Error(`Invalid icon name: ${iconName}`);
    }
    return iconName;
  }

  public async generateIconDescription(iconName: string, imagePath: string) {
    // read the image
    const imageFile = await fs.promises.readFile(imagePath);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an icon descriptor AI assistant. You describe images of smart home device icons. You are given an image of an icon for a smart device and you must provide a brief description of the icon's visual appearance, and of what it can mean. Additionally, you must provide 8 to 10 tags for the icon. You must describe the image in a way that is useful for someone who is looking for an icon for a smart device such that they are able to match the device and icon.

All of the icons are black, so do not talk about the colour of the icon. Only talk about what it looks like, what it represents, it's sematncis, etc.

You should also consider all common meanings. For example, the snowflake icon can represent cold, cool, air conditioning etc. It can be the cool mode on an air conditioner, it could represent the air conditioner itself, it could represent a freezer, or other devices. Be sure to consider and include all possible (but reasonable and semantically sound) meanings for the icon and include it in your description.

However, you must be very brief. It shouldn't be longer than 3-4 lines (excluding tags).

CRITICAL: Your tags and description of the icon, must be specific to the icon. DO NOT indclude any vague information about smart devices in general. Only include relevant information.

IMPORTANT: Your tags should be about the semantics of the icon, and possible names for the icon.

IMPORTANT: You are also provided with the icon name. You should add the icon name to your tags.

POSITIVE EXAMPLES:
Example 1: ABC icon

description: This icon depicts a block letter “ABC” stacked vertically, forming a geometric shape. It represents a system or sequence – potentially referencing initial settings, configurations, or control elements within a smart home environment. The design suggests a foundational element of device management and organization.

Tags: ABC, Letter Icon, Block Letter, Sequential, Configuration, Control, System, Initial Setup, Device Management, Alphabet.

Example 2: Snowflake icon (called ac_unit)
description: This icon represents a snowflake, strongly suggesting cooling or refrigeration functionality. It commonly symbolizes air conditioning, freezer settings, or temperature control within a smart home system. The design evokes a sense of cold and climate regulation.

Tags:
ac_unit, snowflake, cooling, refrigeration, temperature, air_conditioner, freeze, climate_control, cold

NEGATIVE EXAMPLES:
Example: ABC icon
description: This icon represents a stylized block letter “ABC”, suggesting a device focused on temperature control or cooling. It could represent an air conditioner, a freezer, or a thermostat controlling a cool setting.

Tags:
Cooling, Temperature, AirConditioner, Freezer, Thermostat, ABC, ClimateControl, Cold, Freeze
`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Describe the icon in the image and provide 8 to 10 tags for the icon. this icon is called: ${iconName}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${imageFile.toString('base64')}`,
            },
          },
        ],
      },
    ];
    const response = await this.client.chat.completions.create({
      model: VLM_MODEL,
      messages,
      temperature: 0.3,
    });
    return response.choices[0].message.content;
  }

  public async genereteTextEmbedding(
    text: string,
  ): Promise<OpenAI.Embedding[]> {
    const response = await this.client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data;
  }

  public async vectorSearchIcon(description: string): Promise<string> {
    const embedding = await this.genereteTextEmbedding(description);

    // convert open ai embedding to number[]
    const queryEmbedding = embedding[0].embedding;

    // Make sure sqlite-vec extension is loaded
    try {
      // Check if vec_version function exists
      this.db.prepare('SELECT vec_version() as version').get();
    } catch (_) {
      // Load the extension if not already loaded
      const sqliteVec = await import('sqlite-vec');
      sqliteVec.load(this.db);
      console.log('Loaded sqlite-vec extension');
    }

    // Prepare query to search for the most similar icon
    const searchQuery = this.db.prepare(`
      SELECT name, distance
      FROM icons 
      WHERE embedding MATCH ?
      AND k = 5
      ORDER BY distance ASC
    `);

    // Convert embedding to Float32Array and then to Buffer for SQLite binding
    const float32Embedding = new Float32Array(queryEmbedding);

    try {
      // Execute the query with the embedding buffer
      const result = searchQuery.get(Buffer.from(float32Embedding.buffer)) as {
        distance: number;
        name: string;
      };

      if (!result) {
        console.warn('No matching icon found in the database');
        return 'lightbulb'; // Default fallback icon
      }

      //console.log(
      //  'Found matching icon:',
      //  result.name,
      //  'with distance:',
      //  result.distance,
      //);
      return result.name;
      //return result.name;
    } catch (error) {
      console.error('Error during vector search:', error);
      return 'help_outline'; // Default fallback icon
    }
  }
}
