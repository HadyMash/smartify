import { DBService } from './db-service';
import {
  Device,
  DeviceType,
  Thermometer,
  SolarPanel,
  HumiditySensor,
  PowerMeter,
} from '../schemas/device';

export class DeviceSimulator {
  private readonly db: DBService;
  private simulationIntervals: Map<string, NodeJS.Timeout>;
  private static instance: DeviceSimulator;

  private constructor() {
    this.db = new DBService();
    this.simulationIntervals = new Map();
  }

  public static getInstance(): DeviceSimulator {
    if (!DeviceSimulator.instance) {
      DeviceSimulator.instance = new DeviceSimulator();
    }
    return DeviceSimulator.instance;
  }

  private getRandomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private generateSineWaveValue(
    min: number,
    max: number,
    period: number,
  ): number {
    const amplitude = (max - min) / 2;
    const offset = min + amplitude;
    return amplitude * Math.sin((Date.now() / period) * 2 * Math.PI) + offset;
  }

  private async simulateThermometer(device: Thermometer) {
    // Simulate temperature changes between 18-26°C with very small random fluctuations
    const currentTemp = device.temperature;
    const newTemp = currentTemp + this.getRandomFloat(-0.1, 0.1);
    const boundedTemp = Math.min(Math.max(newTemp, 18), 26);

    await this.db.updateDeviceState<Thermometer>(device.id, {
      temperature: Number(boundedTemp.toFixed(1)),
      lastUpdated: new Date().toISOString(),
    });
  }

  private async simulateHumiditySensor(device: HumiditySensor) {
    // Simulate humidity changes between 30-70% with very small random fluctuations
    const currentHumidity = device.humidity;
    const newHumidity = currentHumidity + this.getRandomFloat(-0.5, 0.5);
    const boundedHumidity = Math.min(Math.max(newHumidity, 30), 70);

    await this.db.updateDeviceState<HumiditySensor>(device.id, {
      humidity: Number(boundedHumidity.toFixed(1)),
      lastUpdated: new Date().toISOString(),
    });
  }

  private async simulateSolarPanel(device: SolarPanel) {
    // Simulate solar panel output based on time of day (sine wave)
    // Period of 24 hours, max output during midday
    const HOUR_IN_MS = 3600000;
    const maxOutput = 5000; // 5kW maximum output
    const currentOutput = this.generateSineWaveValue(
      0,
      maxOutput,
      24 * HOUR_IN_MS,
    );

    // Only generate power during "daytime" (when sine wave is positive)
    const finalOutput = Math.max(0, currentOutput);

    // Update total daily output
    const prevOutput = device.totalDailyOutput;
    const timeDiff = 10; // our update interval in seconds
    const additionalOutput = (finalOutput * timeDiff) / 3600; // convert to kWh

    await this.db.updateDeviceState<SolarPanel>(device.id, {
      currentPowerOutput: Number(finalOutput.toFixed(2)),
      totalDailyOutput: Number(
        (prevOutput + additionalOutput / 1000).toFixed(2),
      ),
      isExportingToGrid: finalOutput > 2000, // Export if generating more than 2kW
    });
  }

  private async simulatePowerMeter(device: PowerMeter) {
    // Simulate power consumption with smaller random fluctuations and add to total
    const baseLoad = 500; // Base load of 500W
    const randomLoad = this.getRandomFloat(-50, 100);
    const currentConsumption = Math.max(0, baseLoad + randomLoad);

    // Update total consumption (convert W to kWh for the 10-second interval)
    const additionalConsumption = (currentConsumption * 10) / 3600000; // 10 seconds in kWh
    const newTotalConsumption = device.totalConsumption + additionalConsumption;

    await this.db.updateDeviceState<PowerMeter>(device.id, {
      currentConsumption: Number(currentConsumption.toFixed(2)),
      totalConsumption: Number(newTotalConsumption.toFixed(3)),
      lastUpdated: new Date().toISOString(),
    });
  }

  private async simulateDevice(device: Device) {
    switch (device.type) {
      case 'THERMOMETER':
        await this.simulateThermometer(device as Thermometer);
        break;
      case 'HUMIDITY_SENSOR':
        await this.simulateHumiditySensor(device as HumiditySensor);
        break;
      case 'SOLAR_PANEL':
        await this.simulateSolarPanel(device as SolarPanel);
        break;
      case 'POWER_METER':
        await this.simulatePowerMeter(device as PowerMeter);
        break;
    }
  }

  // Reset total daily output for solar panels at midnight
  private async resetDailyValues() {
    const devices = await this.db.getDevices();
    if (!devices) return;

    const solarPanels = devices.filter(
      (d) => d.type === 'SOLAR_PANEL',
    ) as SolarPanel[];
    for (const panel of solarPanels) {
      await this.db.updateDeviceState<SolarPanel>(panel.id, {
        totalDailyOutput: 0,
      });
    }
  }

  public async startSimulation() {
    // Set up midnight reset for solar panels
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.resetDailyValues();
      // Set up daily reset
      setInterval(
        () => {
          this.resetDailyValues();
        },
        24 * 60 * 60 * 1000,
      );
    }, msUntilMidnight);

    // Start device simulations
    const devices = await this.db.getDevices();
    if (!devices) return;

    const simulatedDeviceTypes: DeviceType[] = [
      'THERMOMETER',
      'HUMIDITY_SENSOR',
      'SOLAR_PANEL',
      'POWER_METER',
    ];

    for (const device of devices) {
      if (simulatedDeviceTypes.includes(device.type)) {
        const interval = setInterval(() => this.simulateDevice(device), 30000); // Update every 30 seconds
        this.simulationIntervals.set(device.id, interval);
      }
    }
  }

  public stopSimulation() {
    for (const interval of this.simulationIntervals.values()) {
      clearInterval(interval);
    }
    this.simulationIntervals.clear();
  }
}
