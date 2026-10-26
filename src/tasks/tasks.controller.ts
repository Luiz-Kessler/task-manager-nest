import { TasksService } from './tasks.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { get } from 'http';
import { Task } from './task.types';
import { TasksModule } from './tasks.module';

@Controller('tasks')
export class TasksController {
    constructor(
        private tasksService: TasksService
    ) { }


    @Get()
    findAll() {
        return this.tasksService.findAll();
    };

    @Post()
    create(@Body() body: { title: string, description?: string }) {
        return this.tasksService.create(body);
    }
}
