export class ReminderMessage {
    message;
    constructor(message) {
        this.message = message;
        if (message.trim().length === 0) {
            throw new Error('Reminder message cannot be empty');
        }
    }
    getValue() {
        return this.message;
    }
}
//# sourceMappingURL=ReminderMessage.js.map