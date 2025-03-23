import OpenAI from 'openai';
import { Device, deviceSchema } from '../schemas/devices';
import { randomUUID } from 'crypto';
import { validMaterialIcon } from '../schemas/icon';

const MODEL = 'qwen2.5-3b-instruct-mlx';

export class AIService {
  private static _client: OpenAI;
  protected readonly client: OpenAI;
  constructor() {
    if (!AIService._client) {
      AIService._client = new OpenAI({
        baseURL: process.env.INFERENCE_URL,
        apiKey: process.env.INFERENCE_API_KEY,
      });
    }
    this.client = AIService._client;
  }

  /**
   * Pick a suitable icon for the device
   * @param device - The device to generate an icon for
   * @returns The icon name
   * @throws An error if the model fails to generate a valid icon
   */
  public async pickDeviceIcon(
    device: Omit<Device, 'icon'>,
  ): Promise<string | undefined> {
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

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: `You are an AI designed to select appropriate icons for smart home device attributes.
Given a smart home device with its capabilities, you must select the most suitable icon for each value of an attribute.

RULES:
1. You MUST ALWAYS follow ALL the rules below.
2. RESTRICTED ICON LIST - You may ONLY use valid icons from Flutter's Material Icons. You should use the constant name of the icon. Below are examples of valid icons:
  - "ac_unit"
  - "lightbulb"
  - "lock"
  - "alarm"
3. You must select the most suitable icon for the device based on it's capabilites and information provided.
4. CRITICAL: Do NOT invent new icons or modify the icons in any way. You must only use Flutter's Material icons.
5. The device may sometimes include optional name and/or description fields. You may use these to help you select the most suitable icon, but they might not be included.
6. You must consider what the icon looks like. For example, the ac_unit icon is a snowflake, which is suitable for an air conditioner or similar devices, but not a fan since it doesn't cool the room.
7. Respond with the icon name ONLY. Provide no explanations and just return the icon name.
8. EXAMPLES: below are examples of inputs and possible icon choices:
Example 1:
INPUT:
${JSON.stringify(example1device)}

OUTPUT:
lightbulb

Example 2:
INPUT:
${JSON.stringify(example2device)}

OUTPUT:
air
`,
      },
    ];

    messages.push({
      role: 'user',
      content: JSON.stringify(device),
    });

    const response = await this.client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.2,
    });

    console.log(response);
    console.log(response.choices[0].message.content);

    // check icon is valid
    if (
      !response.choices[0].message.content ||
      !validMaterialIcon(response.choices[0].message.content)
    ) {
      if (!validMaterialIcon(response.choices[0].message.content?.trim())) {
        messages.push({
          role: 'user',
          content: 'Invalid icon',
        });
      } else {
        return response.choices[0].message.content!.trim();
      }
    }
    return;
  }
}
