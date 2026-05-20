# StudyFlow API 文档

## 概述

StudyFlow 提供 RESTful API 接口，用于管理学习任务和获取学习进度统计。

## 基础信息

- Base URL: `/api/v1`
- Content-Type: `application/json`

## 接口列表

### 1. 创建任务

创建一个新的学习任务。

**请求**

```
POST /api/v1/tasks
```

**请求体**

```json
{
  "userId": "user-001",
  "title": "完成 TypeScript 课程第1章",
  "description": "阅读文档并完成练习题",
  "priority": "HIGH",
  "dueDate": "2026-05-27T00:00:00.000Z"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户ID |
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务描述 |
| priority | enum | 是 | 优先级：HIGH, MEDIUM, LOW |
| dueDate | string | 否* | 截止日期（ISO 8601格式），高优先级任务必填 |

**响应**

```json
{
  "success": true,
  "data": {
    "id": "task-1716172800000-abc123",
    "title": "完成 TypeScript 课程第1章",
    "description": "阅读文档并完成练习题",
    "status": "NOT_STARTED",
    "priority": "HIGH",
    "dueDate": "2026-05-27T00:00:00.000Z",
    "userId": "user-001",
    "createdAt": "2026-05-20T10:00:00.000Z",
    "updatedAt": "2026-05-20T10:00:00.000Z"
  }
}
```

### 2. 更新任务状态

更新指定任务的状态。

**请求**

```
PATCH /api/v1/tasks/{taskId}/status
```

**请求体**

```json
{
  "status": "IN_PROGRESS"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | enum | 是 | 任务状态：NOT_STARTED, IN_PROGRESS, COMPLETED |

**响应**

```json
{
  "success": true,
  "data": {
    "id": "task-1716172800000-abc123",
    "title": "完成 TypeScript 课程第1章",
    "description": "阅读文档并完成练习题",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "dueDate": "2026-05-27T00:00:00.000Z",
    "userId": "user-001",
    "createdAt": "2026-05-20T10:00:00.000Z",
    "updatedAt": "2026-05-20T10:05:00.000Z"
  }
}
```

### 3. 获取进度报告

获取指定用户在指定时间段内的学习进度统计。

**请求**

```
GET /api/v1/users/{userId}/progress
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| startDate | string | 是 | 开始日期（ISO 8601格式） |
| endDate | string | 是 | 结束日期（ISO 8601格式） |

**示例**

```
GET /api/v1/users/user-001/progress?startDate=2026-05-01T00:00:00.000Z&endDate=2026-05-31T23:59:59.999Z
```

**响应**

```json
{
  "success": true,
  "data": {
    "reportId": "report-1716172800000-xyz789",
    "userId": "user-001",
    "period": {
      "startDate": "2026-05-01T00:00:00.000Z",
      "endDate": "2026-05-31T23:59:59.999Z"
    },
    "statistics": {
      "totalTasks": 10,
      "completedTasks": 7,
      "inProgressTasks": 2,
      "notStartedTasks": 1,
      "completionRate": 70.0
    }
  }
}
```

## 错误响应

所有错误响应遵循以下格式：

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误码

| HTTP状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |

## 业务规则

1. 任务截止时间不能早于任务创建时间
2. 已完成任务不能再次被修改为未开始或进行中状态
3. 高优先级任务必须具有截止日期