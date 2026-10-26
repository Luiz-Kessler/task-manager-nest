import { Injectable } from '@nestjs/common';
import { Task } from './task.types';

@Injectable()
export class TasksService {
    private tasks: Task[] = [];
    private nextId = 1;

    findAll(): Task[] {
        return this.tasks;
    }

    create(data: {title: string, description?:string}): Task {
        const now= new Date().toISOString()
        const task: Task = {
            id: this.nextId++,
            title: data.title,
            description: data.description || null,
            status: 'pending',
            createdAt: now,
            updatedAt: now,
        };
        this.tasks.push(task)
        return task
    }
}
