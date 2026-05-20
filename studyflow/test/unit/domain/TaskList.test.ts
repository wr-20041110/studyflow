import { TaskList } from '../../../src/domain/entity/TaskList.js';

describe('TaskList Entity', () => {
  it('should create a task list', () => {
    const list = new TaskList('list-1', '学习任务');

    expect(list.id).toBe('list-1');
    expect(list.getName()).toBe('学习任务');
    expect(list.getTaskIds()).toEqual([]);
    expect(list.getTaskCount()).toBe(0);
  });

  it('should create a task list with initial tasks', () => {
    const list = new TaskList('list-1', '学习任务', ['task-1', 'task-2']);

    expect(list.getTaskIds()).toEqual(['task-1', 'task-2']);
    expect(list.getTaskCount()).toBe(2);
  });

  it('should add a task to the list', () => {
    const list = new TaskList('list-1', '学习任务');

    list.addTask('task-1');

    expect(list.getTaskIds()).toEqual(['task-1']);
    expect(list.getTaskCount()).toBe(1);
    expect(list.containsTask('task-1')).toBe(true);
  });

  it('should throw error when adding duplicate task', () => {
    const list = new TaskList('list-1', '学习任务');

    list.addTask('task-1');

    expect(() => {
      list.addTask('task-1');
    }).toThrow('Task already exists in list');
  });

  it('should remove a task from the list', () => {
    const list = new TaskList('list-1', '学习任务', ['task-1', 'task-2']);

    list.removeTask('task-1');

    expect(list.getTaskIds()).toEqual(['task-2']);
    expect(list.getTaskCount()).toBe(1);
    expect(list.containsTask('task-1')).toBe(false);
  });

  it('should throw error when removing non-existent task', () => {
    const list = new TaskList('list-1', '学习任务');

    expect(() => {
      list.removeTask('task-1');
    }).toThrow('Task not found in list');
  });

  it('should return true when task is in list', () => {
    const list = new TaskList('list-1', '学习任务', ['task-1']);

    expect(list.containsTask('task-1')).toBe(true);
  });

  it('should return false when task is not in list', () => {
    const list = new TaskList('list-1', '学习任务');

    expect(list.containsTask('task-1')).toBe(false);
  });
});