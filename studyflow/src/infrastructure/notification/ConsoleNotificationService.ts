export interface INotificationService {
  sendNotification(message: string): void;
}

export class ConsoleNotificationService implements INotificationService {
  sendNotification(message: string): void {
    const timestamp = new Date().toLocaleString('zh-CN');
    console.log(`[${timestamp}] 📢 ${message}`);
  }
}