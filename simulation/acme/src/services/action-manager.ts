import { DBService } from './db-service';
import {
  ActionStatus,
  DeviceAction,
  HookContext,
} from '../schemas/capabilities';

export class ActionManager {
  private static instance: ActionManager;
  private actionTimers: Map<string, NodeJS.Timeout>;
  private dbService: DBService;
  private lockedProperties: Map<string, Set<string>>; // deviceId -> Set of locked properties

  private constructor() {
    this.actionTimers = new Map();
    this.dbService = new DBService();
    this.lockedProperties = new Map();
  }

  public async handleIncompleteActions(): Promise<void> {
    try {
      const devices = await this.dbService.getDevices();
      if (!devices) return;

      for (const device of devices) {
        const activeActions = device.activeActions;
        if (!activeActions || !Object.keys(activeActions).length) continue;

        console.log('updating active actions:', activeActions);

        for (const [actionId, action] of Object.entries(activeActions)) {
          // Only process actions that weren't completed or failed
          if (action.status === 'PENDING' || action.status === 'IN_PROGRESS') {
            console.log(
              `Found incomplete action ${actionId} for device ${device.id}`,
            );

            // Mark actions as failed since they were interrupted
            await this.updateActionStatus(
              device.id,
              actionId,
              'FAILED',
              'Action interrupted by system shutdown or crash',
            );

            // Execute fail hook if it exists
            const deviceWithCaps =
              await this.dbService.getDeviceWithCapabilities(device.id);
            const actionCapability = deviceWithCaps?.capabilities.find(
              (cap) =>
                cap.type === 'ACTION' &&
                'name' in cap &&
                cap.name === action.name,
            );

            if (actionCapability && 'hooks' in actionCapability) {
              await this.executeHook(actionCapability.hooks?.onFail);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling incomplete actions:', error);
    }
  }

  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }
  private async executeHook(
    hook: ((context: HookContext) => Promise<void>) | undefined,
    context: HookContext,
  ): Promise<void> {
    if (!hook) return;
    try {
      await hook(context);
    } catch (error) {
      console.error('Hook execution failed:', error);
    }
  }

  private isPropertyLocked(deviceId: string, property: string): boolean {
    const deviceLocks = this.lockedProperties.get(deviceId);
    return deviceLocks ? deviceLocks.has(property) : false;
  }

  private lockProperties(deviceId: string, properties: string[]): boolean {
    // Check if any properties are already locked
    if (properties.some((prop) => this.isPropertyLocked(deviceId, prop))) {
      return false;
    }

    // Lock the properties
    let deviceLocks = this.lockedProperties.get(deviceId);
    if (!deviceLocks) {
      deviceLocks = new Set();
      this.lockedProperties.set(deviceId, deviceLocks);
    }

    properties.forEach((prop) => deviceLocks!.add(prop));
    return true;
  }

  private unlockProperties(deviceId: string, properties: string[]): void {
    const deviceLocks = this.lockedProperties.get(deviceId);
    if (!deviceLocks) return;

    properties.forEach((prop) => deviceLocks.delete(prop));
    if (deviceLocks.size === 0) {
      this.lockedProperties.delete(deviceId);
    }
  }

  private generateActionId(actionName: string): string {
    return `${actionName}-${Date.now()}`;
  }

  private async updateActionStatus(
    deviceId: string,
    actionId: string,
    status: ActionStatus,
    error?: string,
  ): Promise<void> {
    const device = await this.dbService.getDevice(deviceId);
    if (!device) return;

    const action = device.activeActions[actionId];
    if (!action) return;

    const updatedAction: DeviceAction = {
      ...action,
      status,
      ...(status === 'COMPLETED' || status === 'FAILED'
        ? { completedAt: new Date().toISOString() }
        : {}),
      ...(error ? { error } : {}),
    };

    await this.dbService.updateDeviceState(deviceId, {
      activeActions: {
        ...device.activeActions,
        [actionId]: updatedAction,
      },
    });
  }

  public async startAction(
    deviceId: string,
    actionName: string,
    config?: {
      duration?: number;
      parameters?: Record<string, any>;
    },
  ): Promise<{ actionId: string; action: DeviceAction }> {
    // Get device and capability information
    const device = await this.dbService.getDeviceWithCapabilities(deviceId);
    if (!device) throw new Error('Device not found');

    const capability = device.capabilities.find(
      (cap) => cap.type === 'ACTION' && cap.name === actionName,
    ) as ActionCapability;

    if (!capability) throw new Error('Action not supported by device');

    // Validate and set duration
    const duration = config?.duration ?? capability.defaultDuration;
    if (capability.minDuration && duration < capability.minDuration) {
      throw new Error(`Duration must be at least ${capability.minDuration}ms`);
    }
    if (capability.maxDuration && duration > capability.maxDuration) {
      throw new Error(`Duration must not exceed ${capability.maxDuration}ms`);
    }

    // Validate parameters if provided
    if (capability.parameters && config?.parameters) {
      // TODO: Validate parameters against schema
    }

    // Check and acquire locks if needed
    const propertiesToLock = capability.locks?.properties ?? [];
    if (!this.lockProperties(deviceId, propertiesToLock)) {
      throw new Error('Required properties are locked by another action');
    }

    const action: DeviceAction = {
      name: actionName,
      status: 'PENDING',
      startedAt: new Date().toISOString(),
      duration,
      parameters: config?.parameters,
      lockedProperties: propertiesToLock,
    };

    // Create context for hooks
    const hookContext: HookContext = {
      deviceId,
      actionName,
      currentState: device,
      updateState: async (updates) => {
        await this.dbService.updateDeviceState(deviceId, updates);
      },
    };

    try {
      // Create or update the action in the active actions
      await this.dbService.updateDeviceState(deviceId, {
        activeActions: {
          ...device.activeActions,
          [actionName]: action, // Use actionName as key instead of generated ID
        },
      });

      // Start the action
      await this.executeHook(capability.hooks?.onStart, hookContext);
      await this.updateActionStatus(deviceId, actionName, 'IN_PROGRESS');

      // Set timer for completion
      const timer = setTimeout(async () => {
        try {
          await this.executeHook(capability.hooks?.onComplete, hookContext);
          await this.updateActionStatus(deviceId, actionName, 'COMPLETED');
        } catch (error) {
          await this.executeHook(capability.hooks?.onFail, hookContext);
          await this.updateActionStatus(
            deviceId,
            actionName,
            'FAILED',
            error?.toString(),
          );
        } finally {
          this.actionTimers.delete(actionName);
          this.unlockProperties(deviceId, propertiesToLock);
        }
      }, duration);

      this.actionTimers.set(actionName, timer);

      return { actionId: actionName, action };
    } catch (error) {
      // If anything fails, release the locks
      this.unlockProperties(deviceId, propertiesToLock);
      throw error;
    }
  }

  public async cancelAction(
    deviceId: string,
    actionId: string,
  ): Promise<boolean> {
    const timer = this.actionTimers.get(actionId);
    if (timer) {
      clearTimeout(timer);
      this.actionTimers.delete(actionId);
      await this.updateActionStatus(
        deviceId,
        actionId,
        'FAILED',
        'Action cancelled',
      );
      return true;
    }
    return false;
  }

  public getRunningActions(): string[] {
    return Array.from(this.actionTimers.keys());
  }
}
