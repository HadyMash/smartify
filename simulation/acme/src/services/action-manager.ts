import { DBService } from './db-service';
import { ActionStatus, DeviceAction } from '../schemas/capabilities';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ActionManager {
  private static instance: ActionManager;
  private actionTimers: Map<string, NodeJS.Timeout>;
  private dbService: DBService;

  private constructor() {
    this.actionTimers = new Map();
    this.dbService = new DBService();
  }

  public static getInstance(): ActionManager {
    if (!ActionManager.instance) {
      ActionManager.instance = new ActionManager();
    }
    return ActionManager.instance;
  }

  private async executeHook(command: string | undefined): Promise<void> {
    if (!command) return;
    try {
      await execAsync(command);
    } catch (error) {
      console.error('Hook execution failed:', error);
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
    duration: number,
    hooks?: {
      onStart?: string;
      onComplete?: string;
      onFail?: string;
    },
  ): Promise<{ actionId: string; action: DeviceAction }> {
    const actionId = this.generateActionId(actionName);
    const action: DeviceAction = {
      name: actionName,
      status: 'PENDING',
      startedAt: new Date().toISOString(),
    };

    // Create the action in pending state
    await this.dbService.updateDeviceState(deviceId, {
      activeActions: {
        ...(await this.dbService.getDevice(deviceId))?.activeActions,
        [actionId]: action,
      },
    });

    // Start the action
    await this.executeHook(hooks?.onStart);
    await this.updateActionStatus(deviceId, actionId, 'IN_PROGRESS');

    // Set timer for completion
    const timer = setTimeout(async () => {
      try {
        await this.executeHook(hooks?.onComplete);
        await this.updateActionStatus(deviceId, actionId, 'COMPLETED');
      } catch (error) {
        await this.executeHook(hooks?.onFail);
        await this.updateActionStatus(
          deviceId,
          actionId,
          'FAILED',
          error?.toString(),
        );
      } finally {
        this.actionTimers.delete(actionId);
      }
    }, duration);

    this.actionTimers.set(actionId, timer);

    return { actionId, action };
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
