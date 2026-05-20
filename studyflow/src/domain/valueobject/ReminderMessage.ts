export class ReminderMessage {
  constructor(private readonly message: string) {
    if (message.trim().length === 0) {
      throw new Error('Reminder message cannot be empty');
    }
  }

  getValue(): string {
    return this.message;
  }
}