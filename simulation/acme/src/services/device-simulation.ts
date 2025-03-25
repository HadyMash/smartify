import { DBService } from './db-service';
import {
  Device,
  DeviceType,
  Thermometer,
  SolarPanel,
  HumiditySensor,
  PowerMeter,
  TempColorBulb,
  Curtain,
  AC,
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
    const boundedTemp = Math.min(Math.max(newTemp, 16), 30);

    await this.db.updateDeviceState<Thermometer>(device.id, {
      temperature: Number(boundedTemp.toFixed(1)),
    });
  }

  private async simulateHumiditySensor(device: HumiditySensor) {
    // Simulate humidity changes between 30-70% with very small random fluctuations
    const currentHumidity = device.humidity;
    const newHumidity = currentHumidity + this.getRandomFloat(-0.5, 0.5);
    const boundedHumidity = Math.min(Math.max(newHumidity, 30), 70);

    await this.db.updateDeviceState<HumiditySensor>(device.id, {
      humidity: Number(boundedHumidity.toFixed(1)),
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
    });
  }

  private async simulateTempColorBulb(device: TempColorBulb) {
    // Only simulate if the bulb is on
    if (!device.on) return;

    // Calculate RGB values based on temperature
    // Mapping temperature to color (blue for cold, white for neutral, red for warm)
    // Temperature range: 16-30°C
    let r = 255;
    let g = 255;
    let b = 255;

    if (device.temperature < 22) {
      // Cooler temperatures become more blue
      const factor = (22 - device.temperature) / 6; // 16-22 range mapped to 0-1
      r = Math.round(255 * (1 - factor * 0.7));
      g = Math.round(255 * (1 - factor * 0.5));
      b = 255;
    } else if (device.temperature > 22) {
      // Warmer temperatures become more red/yellow
      const factor = (device.temperature - 22) / 8; // 22-30 range mapped to 0-1
      r = 255;
      g = Math.round(255 * (1 - factor * 0.6));
      b = Math.round(255 * (1 - factor * 0.8));
    }

    await this.db.updateDeviceState<TempColorBulb>(device.id, {
      rgb: [r, g, b],
    });
  }

  private async simulateCurtain(device: Curtain) {
    // nothing to simulate for curtains
    return;
  }

  private async simulateAC(device: AC) {
    // Simulate the current temperature based on target temperature, mode, and on state
    const currentTemp = device.currentTemperature;
    const targetTemp = device.targetTemperature;

    // Base natural temperature change (very slight fluctuation)
    let tempChange = this.getRandomFloat(-0.03, 0.03);

    // If AC is on, adjust temperature based on mode and temperature difference
    if (device.on) {
      const tempDiff = currentTemp - targetTemp;

      if (device.mode === 'cool' && currentTemp > targetTemp) {
        // Cooling mode - move towards target temperature at a rate proportional to the difference
        // Faster cooling when the difference is bigger, with fan speed multiplier
        // Increased base cooling rate to make it more effective
        let coolingRate = Math.min(0.5, Math.abs(tempDiff) * 0.1);

        // Apply fan speed multiplier
        switch (device.fanSpeed) {
          case 'low':
            coolingRate *= 0.6;
            break;
          case 'medium':
            coolingRate *= 1.0;
            break;
          case 'high':
            coolingRate *= 1.5;
            break;
          case 'auto':
            // Auto fan is more aggressive when the difference is large
            coolingRate *= Math.min(1.8, Math.max(0.7, Math.abs(tempDiff) / 2));
            break;
        }

        // Make cooling more consistent with less randomness
        tempChange -= coolingRate * (0.9 + Math.random() * 0.2);
        //console.log('cooling, rate:', coolingRate, 'change:', tempChange);
      } else if (device.mode === 'heat' && currentTemp < targetTemp) {
        // Heating mode - move towards target temperature
        // Increased base heating rate to make it more effective
        let heatingRate = Math.min(0.5, Math.abs(tempDiff) * 0.1);

        // Apply fan speed multiplier similar to cooling
        switch (device.fanSpeed) {
          case 'low':
            heatingRate *= 0.6;
            break;
          case 'medium':
            heatingRate *= 1.0;
            break;
          case 'high':
            heatingRate *= 1.5;
            break;
          case 'auto':
            heatingRate *= Math.min(2.0, Math.max(0.7, Math.abs(tempDiff) / 2));
            break;
        }

        // Make heating more consistent with less randomness
        tempChange += heatingRate * (0.9 + Math.random() * 0.2);
        console.log('heating, rate:', heatingRate, 'change:', tempChange);
      } else if (device.mode === 'fan') {
        // Fan mode - just circulates air, minimal effect on temperature
        // Slightly enhance the natural fluctuation
        tempChange *= 1.5;
      }
    } else {
      // AC is off - temperature naturally drifts towards ambient
      const ambientTemp = 25; // Ambient room temperature
      const ambientDiff = currentTemp - ambientTemp;
      if (Math.abs(ambientDiff) > 0.2) {
        // Add randomness factor to make the change less predictable
        const randomFactor = 0.7 + Math.random() * 0.6; // Random factor between 0.7 and 1.3
        // Make change more gradual by reducing the rate slightly
        tempChange -=
          Math.sign(ambientDiff) *
          Math.min(0.15, Math.max(0.05, Math.abs(ambientDiff) * 0.08)) *
          randomFactor;
      }
    }

    // Apply temperature change and ensure it stays within reasonable bounds
    const newTemp = currentTemp + tempChange;
    const boundedTemp = Math.min(Math.max(newTemp, 16), 32); // Allow a wider range than the target settings

    await this.db.updateDeviceState<AC>(device.id, {
      currentTemperature: Number(boundedTemp.toFixed(1)),
    });

    // logging
    //if (device.on) {
    //  console.log(
    //    `AC [${device.mode}] temp: ${boundedTemp.toFixed(
    //      1,
    //    )}, target: ${targetTemp}, change: ${tempChange.toFixed(3)}`,
    //  );
    //} else {
    //  console.log(
    //    `AC [OFF] temp: ${boundedTemp.toFixed(1)}, change: ${tempChange.toFixed(
    //      3,
    //    )}`,
    //  );
    //}
  }

  private async simulateDevice(deviceId: string) {
    // Fetch the latest device state
    const device = await this.db.getDevice(deviceId);
    if (!device) return;

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
      case 'BULB_TEMP_COLOR':
        await this.simulateTempColorBulb(device as TempColorBulb);
        break;
      case 'CURTAIN':
        await this.simulateCurtain(device as Curtain);
        break;
      case 'AC':
        await this.simulateAC(device as AC);
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
      'BULB_TEMP_COLOR',
      'CURTAIN',
      'AC',
    ];

    for (const device of devices) {
      if (simulatedDeviceTypes.includes(device.type)) {
        const interval = setInterval(
          () => this.simulateDevice(device.id),
          30000,
        );
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
