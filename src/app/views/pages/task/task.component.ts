declare var bootstrap: any;
declare var $: any;

import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { 
  TaskService, 
  ChapterService, 
  TaskModule, 
  Task, 
  TaskListResponse, 
  Chapter,
  CreateTaskRequest 
} from '../../../services/auth.service';
import { swalHelper } from '../../../core/constants/swal-helper';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxPaginationModule, NgSelectModule],
  providers: [TaskService, ChapterService],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskManagementComponent implements OnInit, AfterViewInit {
  chapters: Chapter[] = [];
  chapterOptions: any[] = [];
  taskList: TaskListResponse = {
    docs: [],
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
    pagingCounter: 1
  };

  statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Completed', value: 'completed' }
  ];

  selectedTask: TaskModule | null = null;
  loading: boolean = false;
  chaptersLoading: boolean = false;
  submitting: boolean = false;
  isEditMode: boolean = false;
  Math = Math;

  private filterSubject = new Subject<void>();
  private taskModal: any = null;
  private viewTaskModal: any = null;

  filters = {
    page: 1,
    limit: 10,
    search: '',
    chapter_name: null,
    status: null
  };

  taskForm: CreateTaskRequest = {
    title: '',
    description: '',
    chapter_name: '',
    startDate: '',
    endDate: '',
    tasks: []
  };

  currentEditId: string | null = null;

  paginationConfig = {
    id: 'task-management-pagination'
  };

  constructor(
    private taskService: TaskService,
    private chapterService: ChapterService,
    private cdr: ChangeDetectorRef
  ) {
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => {
      this.fetchTasks();
    });
  }

  ngOnInit(): void {
    this.fetchChapters();
    this.fetchTasks();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const taskModalElement = document.getElementById('taskModal');
      if (taskModalElement) {
        this.taskModal = new bootstrap.Modal(taskModalElement);
      }

      const viewTaskModalElement = document.getElementById('viewTaskModal');
      if (viewTaskModalElement) {
        this.viewTaskModal = new bootstrap.Modal(viewTaskModalElement);
      }
    }, 300);
  }

  async fetchChapters(): Promise<void> {
    this.chaptersLoading = true;
    try {
      const response = await this.chapterService.getAllChapters({
        page: 1,
        limit: 1000,
        search: ''
      });
      this.chapters = response.docs || [];
      
      // Create chapter options with "All" option
      this.chapterOptions = [
        { label: 'All Chapters', value: 'All' },
        ...this.chapters.map(chapter => ({
          label: chapter.name,
          value: chapter.name
        }))
      ];
    } catch (error) {
      console.error('Error fetching chapters:', error);
      swalHelper.showToast('Failed to fetch chapters', 'error');
    } finally {
      this.chaptersLoading = false;
      this.cdr.detectChanges();
    }
  }

  async fetchTasks(): Promise<void> {
    this.loading = true;
    try {
      const response = await this.taskService.getAllTasks(this.filters);
      this.taskList = response;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      swalHelper.showToast('Failed to fetch tasks', 'error');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  openCreateTaskModal(): void {
    this.isEditMode = false;
    this.currentEditId = null;
    this.resetForm();
    this.showTaskModal();
  }

  editTask(task: TaskModule): void {
    this.isEditMode = true;
    this.currentEditId = task._id;
    
    // Populate form with task data
    this.taskForm = {
      title: task.title,
      description: task.description,
      chapter_name: task.chapter_name,
      startDate: this.formatDateForInput(task.startDate),
      endDate: this.formatDateForInput(task.endDate),
      tasks: task.tasks.map(t => ({
        taskTitle: t.taskTitle,
        taskDescription: t.taskDescription,
        deadline: this.formatDateForInput(t.deadline),
        isMandatory: t.isMandatory
      }))
    };
    
    this.showTaskModal();
  }

  viewTaskDetails(task: TaskModule): void {
    this.selectedTask = task;
    this.showViewTaskModal();
  }

  async saveTask(): Promise<void> {
    if (!this.isFormValid()) {
      swalHelper.showToast('Please fill all required fields', 'warning');
      return;
    }

    this.submitting = true;
    try {
      // Format dates to ISO string
      const formattedData: CreateTaskRequest = {
        ...this.taskForm,
        startDate: new Date(this.taskForm.startDate).toISOString(),
        endDate: new Date(this.taskForm.endDate).toISOString(),
        tasks: this.taskForm.tasks.map(task => ({
          ...task,
          deadline: new Date(task.deadline).toISOString()
        }))
      };

      if (this.isEditMode && this.currentEditId) {
        const response = await this.taskService.updateTask(this.currentEditId, formattedData);
        if (response.success) {
          swalHelper.showToast('Task updated successfully', 'success');
          this.hideTaskModal();
          await this.fetchTasks();
        } else {
          swalHelper.showToast(response.message || 'Failed to update task', 'error');
        }
      } else {
        const response = await this.taskService.createTask(formattedData);
        if (response.success) {
          const stats = response.data.stats;
          swalHelper.showToast(
            `Task created successfully! Assigned to ${stats.usersAssigned} users in ${stats.chapterScope}`,
            'success'
          );
          this.hideTaskModal();
          await this.fetchTasks();
        } else {
          swalHelper.showToast(response.message || 'Failed to create task', 'error');
        }
      }
    } catch (error: any) {
      console.error('Error saving task:', error);
      swalHelper.showToast(error?.message || 'Failed to save task', 'error');
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }

  async confirmDelete(taskId: string): Promise<void> {
    const result = await swalHelper.confirmation(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      'warning'
    );

    if (result.isConfirmed) {
      await this.deleteTask(taskId);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      const response = await this.taskService.deleteTask(taskId);
      if (response.success) {
        swalHelper.showToast('Task deleted successfully', 'success');
        await this.fetchTasks();
      } else {
        swalHelper.showToast(response.message || 'Failed to delete task', 'error');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      swalHelper.showToast('Failed to delete task', 'error');
    }
  }

  addTask(): void {
    this.taskForm.tasks.push({
      taskTitle: '',
      taskDescription: '',
      deadline: '',
      isMandatory: false
    });
    this.cdr.detectChanges();
  }

  removeTask(index: number): void {
    if (this.taskForm.tasks.length > 1) {
      this.taskForm.tasks.splice(index, 1);
      this.cdr.detectChanges();
    }
  }

  resetForm(): void {
    this.taskForm = {
      title: '',
      description: '',
      chapter_name: 'All',
      startDate: '',
      endDate: '',
      tasks: [
        {
          taskTitle: '',
          taskDescription: '',
          deadline: '',
          isMandatory: false
        }
      ]
    };
  }

  isFormValid(): boolean {
    if (!this.taskForm.title || !this.taskForm.chapter_name || 
        !this.taskForm.startDate || !this.taskForm.endDate) {
      return false;
    }

    if (this.taskForm.tasks.length === 0) {
      return false;
    }

    for (const task of this.taskForm.tasks) {
      if (!task.taskTitle || !task.deadline) {
        return false;
      }
    }

    return true;
  }

  showTaskModal(): void {
    this.cdr.detectChanges();
    if (this.taskModal) {
      this.taskModal.show();
    } else {
      try {
        const modalElement = document.getElementById('taskModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.taskModal = modalInstance;
          modalInstance.show();
        } else {
          $('#taskModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing task modal:', error);
        $('#taskModal').modal('show');
      }
    }
  }

  hideTaskModal(): void {
    if (this.taskModal) {
      this.taskModal.hide();
    } else {
      $('#taskModal').modal('hide');
    }
  }

  showViewTaskModal(): void {
    this.cdr.detectChanges();
    if (this.viewTaskModal) {
      this.viewTaskModal.show();
    } else {
      try {
        const modalElement = document.getElementById('viewTaskModal');
        if (modalElement) {
          const modalInstance = new bootstrap.Modal(modalElement);
          this.viewTaskModal = modalInstance;
          modalInstance.show();
        } else {
          $('#viewTaskModal').modal('show');
        }
      } catch (error) {
        console.error('Error showing view task modal:', error);
        $('#viewTaskModal').modal('show');
      }
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateForInput(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'completed':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.filterSubject.next();
  }

  resetFilters(): void {
    this.filters = {
      page: 1,
      limit: 10,
      search: '',
      chapter_name: null,
      status: null
    };
    this.fetchTasks();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.fetchTasks();
  }
}