export declare enum RepeatType {
    ONCE = "ONCE",
    DAILY = "DAILY",
    WEEKLY = "WEEKLY"
}
export declare class ReminderPolicy {
    readonly id: string;
    private readonly taskId;
    private remindTime;
    private repeatType;
    private message;
    private isActive;
    constructor(id: string, taskId: string, remindTime: Date, repeatType: RepeatType, message: string, isActive?: boolean);
    getTaskId(): string;
    getRemindTime(): Date;
    getRepeatType(): RepeatType;
    getMessage(): string;
    isReminderActive(): boolean;
    activate(): void;
    deactivate(): void;
    updateRemindTime(remindTime: Date): void;
    updateMessage(message: string): void;
    private validateInvariant;
}
//# sourceMappingURL=ReminderPolicy.d.ts.map