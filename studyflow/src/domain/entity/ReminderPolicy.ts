export enum RepeatType {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export class ReminderPolicy {
  constructor(
    public readonly id: string,
    private readonly taskId: string,
    private remindTime: Date,
    private repeatType: RepeatType,
    private message: string,
    private isActive: boolean = true
  ) {
    this.validateInvariant();
  }

  getTaskId(): string {
    return this.taskId;
  }

  getRemindTime(): Date {
    return new Date(this.remindTime);
  }

  getRepeatType(): RepeatType {
    return this.repeatType;
  }

  getMessage(): string {
    return this.message;
  }

  isReminderActive(): boolean {
    return this.isActive;
  }

  activate(): void {
    this.isActive = true;
  }

  deactivate(): void {
    this.isActive = false;
  }

  updateRemindTime(remindTime: Date): void {
    if (remindTime < new Date()) {
      throw new Error('Remind time cannot be in the past');
    }
    this.remindTime = remindTime;
  }

  updateMessage(message: string): void {
    if (message.trim().length === 0) {
      throw new Error('Reminder message cannot be empty');
    }
    this.message = message;
  }

  private validateInvariant(): void {
    if (this.remindTime < new Date()) {
      throw new Error('Remind time cannot be in the past');
    }
  }
}