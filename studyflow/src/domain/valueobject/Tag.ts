/**
 * 标签值对象
 * 用于对任务进行分类和筛选
 */
export class Tag {
  private static readonly VALID_COLORS = [
    '#ef4444', // 红色
    '#f97316', // 橙色
    '#eab308', // 黄色
    '#22c55e', // 绿色
    '#3b82f6', // 蓝色
    '#8b5cf6', // 紫色
    '#ec4899', // 粉色
    '#6b7280', // 灰色
  ];

  constructor(
    public readonly name: string,
    public readonly color: string = '#3b82f6'
  ) {
    this.validateName(name);
    this.validateColor(color);
  }

  getName(): string {
    return this.name;
  }

  getColor(): string {
    return this.color;
  }

  equals(other: Tag): boolean {
    return this.name === other.name && this.color === other.color;
  }

  /**
   * 判断两个标签是否同名（忽略颜色）
   */
  hasSameName(other: Tag): boolean {
    return this.name === other.name;
  }

  private validateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tag name cannot be empty');
    }
    if (name.trim().length > 30) {
      throw new Error('Tag name cannot exceed 30 characters');
    }
  }

  private validateColor(color: string): void {
    if (!Tag.VALID_COLORS.includes(color)) {
      throw new Error(
        `Invalid tag color: ${color}. Valid colors: ${Tag.VALID_COLORS.join(', ')}`
      );
    }
  }

  /**
   * 获取所有预设颜色
   */
  static getPresetColors(): string[] {
    return [...Tag.VALID_COLORS];
  }

  /**
   * 从名称创建标签（使用默认颜色）
   */
  static fromName(name: string): Tag {
    return new Tag(name.trim());
  }
}
