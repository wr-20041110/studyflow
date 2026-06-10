import { Tag } from '../../../src/domain/valueobject/Tag.js';

describe('Tag Value Object', () => {
  describe('创建标签', () => {
    it('应成功创建有效标签', () => {
      const tag = new Tag('编程', '#3b82f6');

      expect(tag.getName()).toBe('编程');
      expect(tag.getColor()).toBe('#3b82f6');
    });

    it('应使用默认颜色创建标签', () => {
      const tag = Tag.fromName('算法');

      expect(tag.getName()).toBe('算法');
      expect(tag.getColor()).toBe('#3b82f6');
    });

    it('应支持所有预设颜色', () => {
      const colors = Tag.getPresetColors();
      expect(colors).toHaveLength(8);

      colors.forEach(color => {
        const tag = new Tag('测试', color);
        expect(tag.getColor()).toBe(color);
      });
    });

    it('应从名称创建标签（trim 空格）', () => {
      const tag = Tag.fromName('  前端  ');
      expect(tag.getName()).toBe('前端');
    });
  });

  describe('标签相等性', () => {
    it('同名同色的标签应相等', () => {
      const tag1 = new Tag('编程', '#3b82f6');
      const tag2 = new Tag('编程', '#3b82f6');

      expect(tag1.equals(tag2)).toBe(true);
    });

    it('同名异色的标签不应相等', () => {
      const tag1 = new Tag('编程', '#3b82f6');
      const tag2 = new Tag('编程', '#ef4444');

      expect(tag1.equals(tag2)).toBe(false);
    });

    it('仅比较名称时应识别同名标签', () => {
      const tag1 = new Tag('编程', '#3b82f6');
      const tag2 = new Tag('编程', '#ef4444');

      expect(tag1.hasSameName(tag2)).toBe(true);
    });
  });

  describe('标签验证', () => {
    it('空名称应抛错', () => {
      expect(() => new Tag('', '#3b82f6')).toThrow('Tag name cannot be empty');
    });

    it('纯空格名称应抛错', () => {
      expect(() => new Tag('   ', '#3b82f6')).toThrow('Tag name cannot be empty');
    });

    it('名称超过30字符应抛错', () => {
      const longName = 'A'.repeat(31);
      expect(() => new Tag(longName, '#3b82f6')).toThrow('Tag name cannot exceed 30 characters');
    });

    it('名称恰好30字符应成功', () => {
      const name = 'A'.repeat(30);
      const tag = new Tag(name, '#3b82f6');
      expect(tag.getName()).toHaveLength(30);
    });

    it('无效颜色应抛错', () => {
      expect(() => new Tag('测试', '#000000')).toThrow('Invalid tag color');
    });
  });
});
