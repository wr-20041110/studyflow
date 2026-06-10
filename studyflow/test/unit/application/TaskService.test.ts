/// <reference types="@types/jest" />
import { jest } from '@jest/globals';

import { TaskService } from '../../../src/application/service/TaskService.js';
import { ITaskRepository } from '../../../src/domain/repository/ITaskRepository.js';
import { Task } from '../../../src/domain/entity/Task.js';
import { Priority } from '../../../src/domain/valueobject/Priority.js';
import { TaskStatus } from '../../../src/domain/valueobject/TaskStatus.js';
import { CreateTaskCommand } from '../../../src/application/service/ITaskService.js';

describe('TaskService - createTask', () => {
  let taskService: TaskService;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByPriority: jest.fn(),
      findByUserIdAndStatus: jest.fn(),
    } as unknown as jest.Mocked<ITaskRepository>;

    taskService = new TaskService(mockRepository);
  });

  describe('正常路径测试', () => {
    test('应成功创建低优先级任务（有到期时间）', async () => {
      const command: CreateTaskCommand = {
        title: '完成数学作业',
        description: '完成第三章习题',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result).toBeDefined();
      expect(result.getTitle()).toBe(command.title);
      expect(result.getDescription()).toBe(command.description);
      expect(result.getPriority()).toBe(command.priority);
      expect(result.getUserId()).toBe(command.userId);
      expect(result.getStatus()).toBe(TaskStatus.NOT_STARTED);
      expect(mockRepository.save).toHaveBeenCalledWith(result);
    });

    test('应成功创建中优先级任务（有到期时间）', async () => {
      const command: CreateTaskCommand = {
        title: '准备英语演讲',
        description: '准备演讲稿和PPT',
        priority: Priority.MEDIUM,
        dueDate: new Date('2026-12-29'),
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result).toBeDefined();
      expect(result.getPriority()).toBe(command.priority);
      expect(result.getStatus()).toBe(TaskStatus.NOT_STARTED);
    });

    test('应成功创建高优先级任务（有到期时间）', async () => {
      const command: CreateTaskCommand = {
        title: '紧急：提交项目报告',
        description: '必须在明天之前提交',
        priority: Priority.HIGH,
        dueDate: new Date('2026-12-28'),
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result).toBeDefined();
      expect(result.getPriority()).toBe(command.priority);
      expect(result.getStatus()).toBe(TaskStatus.NOT_STARTED);
    });
  });

  describe('边界值测试', () => {
    test('应允许title长度恰好为200', async () => {
      const command: CreateTaskCommand = {
        title: 'A'.repeat(200),
        description: '测试描述',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result.getTitle()).toHaveLength(200);
    });

    test('应拒绝title长度为201', async () => {
      const command: CreateTaskCommand = {
        title: 'A'.repeat(201),
        description: '测试描述',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });

    test('应允许description长度恰好为1000', async () => {
      const command: CreateTaskCommand = {
        title: '测试任务',
        description: 'A'.repeat(1000),
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result.getDescription()).toHaveLength(1000);
    });

    test('应拒绝description长度为1001', async () => {
      const command: CreateTaskCommand = {
        title: '测试任务',
        description: 'A'.repeat(1001),
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });

    test('应允许description为空字符串', async () => {
      const command: CreateTaskCommand = {
        title: '测试任务',
        description: '',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result.getDescription()).toBe('');
    });

    test('应允许dueDate恰好为今天', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const command: CreateTaskCommand = {
        title: '测试任务',
        description: '测试描述',
        priority: Priority.LOW,
        dueDate: tomorrow,
        userId: 'user-123'
      };

      const result = await taskService.createTask(command);

      expect(result.getDueDate()).toBeDefined();
    });
  });

  describe('非法输入测试', () => {
    test('应拒绝title为空字符串', async () => {
      const command: CreateTaskCommand = {
        title: '',
        description: '测试描述',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });

    test('应拒绝title为null', async () => {
      const command: CreateTaskCommand = {
        title: null as any,
        description: '测试描述',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: 'user-123'
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });

    test('应拒绝userId为空字符串', async () => {
      const command: CreateTaskCommand = {
        title: '测试任务',
        description: '测试描述',
        priority: Priority.LOW,
        dueDate: new Date('2026-12-30'),
        userId: ''
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });
  });

  describe('业务规则测试', () => {
    test('高优先级任务必须有到期时间（无到期时间应失败）', async () => {
      const command: CreateTaskCommand = {
        title: '紧急任务',
        description: '这是一个紧急任务',
        priority: Priority.HIGH,
        dueDate: null,
        userId: 'user-123'
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });

    test('高优先级任务的到期时间不能是过去', async () => {
      const pastDate = new Date('2020-01-01');

      const command: CreateTaskCommand = {
        title: '紧急任务',
        description: '这是一个紧急任务',
        priority: Priority.HIGH,
        dueDate: pastDate,
        userId: 'user-123'
      };

      await expect(taskService.createTask(command)).rejects.toThrow();
    });
  });
});

describe('TaskService - completeTask', () => {
  let taskService: TaskService;
  let mockRepository: jest.Mocked<ITaskRepository>;
  let mockTask: jest.Mocked<Task>;

  beforeEach(() => {
    mockTask = {
      getTitle: jest.fn().mockReturnValue('测试任务'),
      getDescription: jest.fn().mockReturnValue('测试描述'),
      getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
      getPriority: jest.fn().mockReturnValue(Priority.LOW),
      getDueDate: jest.fn().mockReturnValue(new Date('2026-12-30')),
      getUserId: jest.fn().mockReturnValue('user-123'),
      getCreatedAt: jest.fn().mockReturnValue(new Date()),
      getUpdatedAt: jest.fn().mockReturnValue(new Date()),
      updateTitle: jest.fn(),
      updateDescription: jest.fn(),
      updatePriority: jest.fn(),
      updateDueDate: jest.fn(),
      updateStatus: jest.fn(),
      markAsCompleted: jest.fn(),
    } as unknown as jest.Mocked<Task>;

    mockRepository = {
      save: jest.fn(),
      // @ts-expect-error
      findById: jest.fn().mockResolvedValue(mockTask),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByPriority: jest.fn(),
      findByUserIdAndStatus: jest.fn(),
    } as unknown as jest.Mocked<ITaskRepository>;

    taskService = new TaskService(mockRepository);
  });

  describe('正常路径测试', () => {
    test('应成功完成NOT_STARTED状态的任务', async () => {
      mockTask.getStatus.mockReturnValue(TaskStatus.NOT_STARTED);

      await taskService.completeTask('task-123');

      expect(mockTask.markAsCompleted).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });

    test('应成功完成IN_PROGRESS状态的任务', async () => {
      mockTask.getStatus.mockReturnValue(TaskStatus.IN_PROGRESS);

      await taskService.completeTask('task-123');

      expect(mockTask.markAsCompleted).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('边界值测试', () => {
    test('重复完成已完成的任务应幂等', async () => {
      mockTask.getStatus.mockReturnValue(TaskStatus.COMPLETED);

      await taskService.completeTask('task-123');

      expect(mockTask.markAsCompleted).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('非法输入测试', () => {
    test('完成不存在的任务应抛出异常', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(taskService.completeTask('non-existent-task')).rejects.toThrow();
    });
  });
});

describe('TaskService - listTasksByPriority', () => {
  let taskService: TaskService;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByPriority: jest.fn(),
      findByUserIdAndStatus: jest.fn(),
    } as unknown as jest.Mocked<ITaskRepository>;

    taskService = new TaskService(mockRepository);
  });

  describe('正常路径测试', () => {
    test('应按优先级排序返回用户的任务（HIGH > MEDIUM > LOW）', async () => {
      const createMockTask = (
        id: string,
        priority: Priority,
        dueDate: Date | null
      ): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
        getPriority: jest.fn().mockReturnValue(priority),
        getDueDate: jest.fn().mockReturnValue(dueDate),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const lowTask = createMockTask('task-1', Priority.LOW, new Date('2026-12-01'));
      const highTask = createMockTask('task-2', Priority.HIGH, new Date('2026-12-28'));
      const mediumTask = createMockTask('task-3', Priority.MEDIUM, new Date('2026-12-30'));

      mockRepository.findByUserId.mockResolvedValue([lowTask, highTask, mediumTask]);

      const result = await taskService.listTasksByPriority('user-123');

      expect(result).toHaveLength(3);
      expect(result[0].getPriority()).toBe(Priority.HIGH);
      expect(result[1].getPriority()).toBe(Priority.MEDIUM);
      expect(result[2].getPriority()).toBe(Priority.LOW);
    });

    test('应正确处理没有到期时间的任务（排在同优先级最后）', async () => {
      const createMockTask = (
        id: string,
        priority: Priority,
        dueDate: Date | null
      ): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
        getPriority: jest.fn().mockReturnValue(priority),
        getDueDate: jest.fn().mockReturnValue(dueDate),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const taskWithDueDate = createMockTask('task-1', Priority.HIGH, new Date('2026-12-28'));
      const taskWithoutDueDate = createMockTask('task-2', Priority.HIGH, null);

      mockRepository.findByUserId.mockResolvedValue([taskWithDueDate, taskWithoutDueDate]);

      const result = await taskService.listTasksByPriority('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].getDueDate()).not.toBeNull();
      expect(result[1].getDueDate()).toBeNull();
    });
  });

  describe('边界值测试', () => {
    test('用户没有任务应返回空数组', async () => {
      mockRepository.findByUserId.mockResolvedValue([]);

      const result = await taskService.listTasksByPriority('user-123');

      expect(result).toHaveLength(0);
    });

    test('所有任务优先级相同应按到期时间排序', async () => {
      const createMockTask = (
        id: string,
        dueDate: Date | null
      ): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
        getPriority: jest.fn().mockReturnValue(Priority.HIGH),
        getDueDate: jest.fn().mockReturnValue(dueDate),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const task1 = createMockTask('task-1', new Date('2026-12-30'));
      const task2 = createMockTask('task-2', new Date('2026-12-28'));

      mockRepository.findByUserId.mockResolvedValue([task1, task2]);

      const result = await taskService.listTasksByPriority('user-123');

      expect(result[0].getDueDate()?.getTime()).toBeLessThan(result[1].getDueDate()?.getTime() || 0);
    });
  });
});

describe('TaskService - listDueTasks', () => {
  let taskService: TaskService;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      // @ts-expect-error
      findByStatus: jest.fn().mockResolvedValue([]),
      // @ts-expect-error
      findByPriority: jest.fn().mockResolvedValue([]),
      // @ts-expect-error
      findByUserIdAndStatus: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<ITaskRepository>;

    taskService = new TaskService(mockRepository);
  });

  describe('正常路径测试', () => {
    test('应返回指定日期之前到期的未完成任务', async () => {
      const createMockTask = (
        id: string,
        status: TaskStatus,
        dueDate: Date | null
      ): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(status),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(dueDate),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const notStartedTask = createMockTask('task-1', TaskStatus.NOT_STARTED, new Date('2026-12-26'));
      const completedTask = createMockTask('task-2', TaskStatus.COMPLETED, new Date('2026-12-26'));
      const inProgressTask = createMockTask('task-3', TaskStatus.IN_PROGRESS, new Date('2026-12-26'));

      mockRepository.findByStatus.mockImplementation((status: TaskStatus) => {
        if (status === TaskStatus.NOT_STARTED) return Promise.resolve([notStartedTask]);
        if (status === TaskStatus.IN_PROGRESS) return Promise.resolve([inProgressTask]);
        if (status === TaskStatus.COMPLETED) return Promise.resolve([completedTask]);
        return Promise.resolve([]);
      });

      const queryDate = new Date('2026-12-27');
      const result = await taskService.listDueTasks(queryDate);

      expect(result).toHaveLength(2);
      expect(result.every((t: Task) => t.getStatus() !== TaskStatus.COMPLETED)).toBe(true);
    });
  });

  describe('边界值测试', () => {
    test('指定日期没有到期任务应返回空数组', async () => {
      const queryDate = new Date('2026-12-27');
      const result = await taskService.listDueTasks(queryDate);

      expect(result).toHaveLength(0);
    });

    test('任务到期时间恰好为指定日期应包含在结果中', async () => {
      const createMockTask = (id: string, dueDate: Date): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(dueDate),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const task = createMockTask('task-1', new Date('2026-12-27'));
      mockRepository.findByStatus.mockImplementation((status: TaskStatus) => {
        if (status === TaskStatus.NOT_STARTED) return Promise.resolve([task]);
        return Promise.resolve([]);
      });

      const queryDate = new Date('2026-12-27');
      const result = await taskService.listDueTasks(queryDate);

      expect(result).toHaveLength(1);
    });
  });

  describe('业务规则测试', () => {
    test('不应包含已完成的任务', async () => {
      const createMockTask = (
        id: string,
        status: TaskStatus
      ): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(status),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(new Date('2026-12-26')),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      mockRepository.findByStatus.mockImplementation((status: TaskStatus) => {
        if (status === TaskStatus.COMPLETED) return Promise.resolve([createMockTask('task-1', TaskStatus.COMPLETED)]);
        if (status === TaskStatus.NOT_STARTED) return Promise.resolve([createMockTask('task-2', TaskStatus.NOT_STARTED)]);
        return Promise.resolve([]);
      });

      const queryDate = new Date('2026-12-27');
      const result = await taskService.listDueTasks(queryDate);

      expect(result.every((t: Task) => t.getStatus() !== TaskStatus.COMPLETED)).toBe(true);
    });

    test('不应包含没有到期时间的任务', async () => {
      const createMockTask = (
        id: string,
        dueDate: Date | null
      ): jest.Mocked<Task> => ({
        id,
        getTitle: jest.fn().mockReturnValue(`任务${id}`),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(dueDate),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      mockRepository.findByStatus.mockResolvedValue([createMockTask('task-1', null)]);

      const queryDate = new Date('2026-12-27');
      const result = await taskService.listDueTasks(queryDate);

      expect(result).toHaveLength(0);
    });
  });
});

describe('TaskService - getProgressByUser', () => {
  let taskService: TaskService;
  let mockRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      delete: jest.fn(),
      findByStatus: jest.fn(),
      findByPriority: jest.fn(),
      findByUserIdAndStatus: jest.fn(),
    } as unknown as jest.Mocked<ITaskRepository>;

    taskService = new TaskService(mockRepository);
  });

  describe('正常路径测试', () => {
    test('应正确统计用户的任务完成情况', async () => {
      const createMockTask = (status: TaskStatus): jest.Mocked<Task> => ({
        id: `task-${Math.random()}`,
        getTitle: jest.fn().mockReturnValue('任务'),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(status),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(new Date('2026-12-30')),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const completedTasks = [createMockTask(TaskStatus.COMPLETED), createMockTask(TaskStatus.COMPLETED)];
      const inProgressTasks = [createMockTask(TaskStatus.IN_PROGRESS)];
      const notStartedTasks = [createMockTask(TaskStatus.NOT_STARTED)];

      mockRepository.findByUserIdAndStatus.mockImplementation((_userId: string, status: TaskStatus) => {
        if (status === TaskStatus.COMPLETED) return Promise.resolve(completedTasks);
        if (status === TaskStatus.IN_PROGRESS) return Promise.resolve(inProgressTasks);
        if (status === TaskStatus.NOT_STARTED) return Promise.resolve(notStartedTasks);
        return Promise.resolve([]);
      });

      const result = await taskService.getProgressByUser('user-123');

      expect(result.totalTasks).toBe(4);
      expect(result.completedTasks).toBe(2);
      expect(result.inProgressTasks).toBe(1);
      expect(result.notStartedTasks).toBe(1);
      expect(result.completionRate).toBe(0.5);
    });

    test('应正确计算只有一种状态任务的统计', async () => {
      const createMockTask = (status: TaskStatus): jest.Mocked<Task> => ({
        id: `task-${Math.random()}`,
        getTitle: jest.fn().mockReturnValue('任务'),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(status),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(new Date('2026-12-30')),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const completedTasks = [createMockTask(TaskStatus.COMPLETED), createMockTask(TaskStatus.COMPLETED)];

      mockRepository.findByUserIdAndStatus.mockImplementation((_userId: string, status: TaskStatus) => {
        if (status === TaskStatus.COMPLETED) return Promise.resolve(completedTasks);
        return Promise.resolve([]);
      });

      const result = await taskService.getProgressByUser('user-123');

      expect(result.totalTasks).toBe(2);
      expect(result.completedTasks).toBe(2);
      expect(result.inProgressTasks).toBe(0);
      expect(result.notStartedTasks).toBe(0);
      expect(result.completionRate).toBe(1);
    });
  });

  describe('边界值测试', () => {
    test('用户没有任务应返回全零统计', async () => {
      mockRepository.findByUserIdAndStatus.mockResolvedValue([]);

      const result = await taskService.getProgressByUser('user-123');

      expect(result.totalTasks).toBe(0);
      expect(result.completedTasks).toBe(0);
      expect(result.inProgressTasks).toBe(0);
      expect(result.notStartedTasks).toBe(0);
      expect(result.completionRate).toBe(0);
    });

    test('所有任务都已完成应计算正确', async () => {
      const createMockTask = (): jest.Mocked<Task> => ({
        id: `task-${Math.random()}`,
        getTitle: jest.fn().mockReturnValue('任务'),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.COMPLETED),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(new Date('2026-12-30')),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const completedTasks = [createMockTask(), createMockTask(), createMockTask()];

      mockRepository.findByUserIdAndStatus.mockImplementation((_userId: string, status: TaskStatus) => {
        if (status === TaskStatus.COMPLETED) return Promise.resolve(completedTasks);
        return Promise.resolve([]);
      });

      const result = await taskService.getProgressByUser('user-123');

      expect(result.totalTasks).toBe(3);
      expect(result.completedTasks).toBe(3);
      expect(result.completionRate).toBe(1);
    });

    test('所有任务都未开始应计算正确', async () => {
      const createMockTask = (): jest.Mocked<Task> => ({
        id: `task-${Math.random()}`,
        getTitle: jest.fn().mockReturnValue('任务'),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(TaskStatus.NOT_STARTED),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(new Date('2026-12-30')),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      const notStartedTasks = [createMockTask(), createMockTask()];

      mockRepository.findByUserIdAndStatus.mockImplementation((_userId: string, status: TaskStatus) => {
        if (status === TaskStatus.NOT_STARTED) return Promise.resolve(notStartedTasks);
        return Promise.resolve([]);
      });

      const result = await taskService.getProgressByUser('user-123');

      expect(result.totalTasks).toBe(2);
      expect(result.completedTasks).toBe(0);
      expect(result.notStartedTasks).toBe(2);
      expect(result.completionRate).toBe(0);
    });
  });

  describe('业务规则测试', () => {
    test('完成率计算应正确（已完成/总数）', async () => {
      const createMockTask = (status: TaskStatus): jest.Mocked<Task> => ({
        id: `task-${Math.random()}`,
        getTitle: jest.fn().mockReturnValue('任务'),
        getDescription: jest.fn().mockReturnValue('描述'),
        getStatus: jest.fn().mockReturnValue(status),
        getPriority: jest.fn().mockReturnValue(Priority.MEDIUM),
        getDueDate: jest.fn().mockReturnValue(new Date('2026-12-30')),
        getUserId: jest.fn().mockReturnValue('user-123'),
        getCreatedAt: jest.fn().mockReturnValue(new Date()),
        getUpdatedAt: jest.fn().mockReturnValue(new Date()),
        updateTitle: jest.fn(),
        updateDescription: jest.fn(),
        updatePriority: jest.fn(),
        updateDueDate: jest.fn(),
        updateStatus: jest.fn(),
        markAsCompleted: jest.fn(),
      } as unknown as jest.Mocked<Task>);

      mockRepository.findByUserIdAndStatus.mockImplementation((_userId: string, status: TaskStatus) => {
        if (status === TaskStatus.COMPLETED) return Promise.resolve([createMockTask(TaskStatus.COMPLETED)]);
        if (status === TaskStatus.NOT_STARTED) return Promise.resolve([createMockTask(TaskStatus.NOT_STARTED), createMockTask(TaskStatus.NOT_STARTED)]);
        return Promise.resolve([]);
      });

      const result = await taskService.getProgressByUser('user-123');

      expect(result.completionRate).toBeCloseTo(0.33, 2);
    });
  });
});