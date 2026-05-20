export class ConsoleNotificationService {
    sendNotification(message) {
        const timestamp = new Date().toLocaleString('zh-CN');
        console.log(`[${timestamp}] 📢 ${message}`);
    }
}
//# sourceMappingURL=ConsoleNotificationService.js.map