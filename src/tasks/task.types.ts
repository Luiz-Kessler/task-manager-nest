export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export interface Task {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
}