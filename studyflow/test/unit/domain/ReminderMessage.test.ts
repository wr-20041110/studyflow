import { ReminderMessage } from '../../../src/domain/valueobject/ReminderMessage.js';

describe('ReminderMessage Value Object', () => {
  it('should create a valid reminder message', () => {
    const message = new ReminderMessage('任务即将到期');

    expect(message.getValue()).toBe('任务即将到期');
  });

  it('should throw error when message is empty', () => {
    expect(() => {
      new ReminderMessage('');
    }).toThrow('Reminder message cannot be empty');
  });

  it('should throw error when message contains only whitespace', () => {
    expect(() => {
      new ReminderMessage('   ');
    }).toThrow('Reminder message cannot be empty');
  });

  it('should preserve message value', () => {
    const message = new ReminderMessage('请按时完成任务');

    expect(message.getValue()).toBe('请按时完成任务');
  });
});