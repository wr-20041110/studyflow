export var RepeatType;
(function (RepeatType) {
    RepeatType["ONCE"] = "ONCE";
    RepeatType["DAILY"] = "DAILY";
    RepeatType["WEEKLY"] = "WEEKLY";
})(RepeatType || (RepeatType = {}));
export class ReminderPolicy {
    id;
    taskId;
    remindTime;
    repeatType;
    message;
    isActive;
    constructor(id, taskId, remindTime, repeatType, message, isActive = true) {
        this.id = id;
        this.taskId = taskId;
        this.remindTime = remindTime;
        this.repeatType = repeatType;
        this.message = message;
        this.isActive = isActive;
        this.validateInvariant();
    }
    getTaskId() {
        return this.taskId;
    }
    getRemindTime() {
        return new Date(this.remindTime);
    }
    getRepeatType() {
        return this.repeatType;
    }
    getMessage() {
        return this.message;
    }
    isReminderActive() {
        return this.isActive;
    }
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
    }
    updateRemindTime(remindTime) {
        if (remindTime < new Date()) {
            throw new Error('Remind time cannot be in the past');
        }
        this.remindTime = remindTime;
    }
    updateMessage(message) {
        if (message.trim().length === 0) {
            throw new Error('Reminder message cannot be empty');
        }
        this.message = message;
    }
    validateInvariant() {
        if (this.remindTime < new Date()) {
            throw new Error('Remind time cannot be in the past');
        }
    }
}
//# sourceMappingURL=ReminderPolicy.js.map