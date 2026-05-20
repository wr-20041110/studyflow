export class DateRange {
    startDate;
    endDate;
    constructor(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        if (startDate > endDate) {
            throw new Error('Start date cannot be after end date');
        }
    }
    contains(date) {
        return date >= this.startDate && date <= this.endDate;
    }
}
//# sourceMappingURL=DateRange.js.map