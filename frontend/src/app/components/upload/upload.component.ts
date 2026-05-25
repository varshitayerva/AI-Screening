import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <h1 class="mb-4">AI Resume Screener</h1>
          <p class="lead mb-4">Upload your resume and job description to get an instant AI analysis</p>

          <div class="card">
            <div class="card-body">
              <form (ngSubmit)="onSubmit()">
                <div class="mb-4">
                  <label class="form-label">Resume File</label>
                  <div class="upload-area" (dragover)="onDragOver($event)" (drop)="onDrop($event)">
                    <input
                      type="file"
                      class="form-control"
                      (change)="onFileSelected($event)"
                      accept=".pdf,.txt,.doc,.docx"
                      #fileInput>
                    <p *ngIf="!selectedFile" class="text-muted mb-0">
                      Drag and drop your resume or click to select
                    </p>
                    <p *ngIf="selectedFile" class="text-success mb-0">
                      📄 {{ selectedFile.name }}
                    </p>
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label">Job Description</label>
                  <textarea
                    class="form-control"
                    rows="6"
                    [(ngModel)]="jobDescription"
                    name="jobDescription"
                    placeholder="Paste the job description here..."></textarea>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  [disabled]="!selectedFile || !jobDescription || isLoading">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ isLoading ? 'Uploading...' : 'Analyze Resume' }}
                </button>

                <div *ngIf="errorMessage" class="alert alert-danger mt-3">
                  {{ errorMessage }}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 4px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
    }
    .upload-area:hover {
      border-color: #0d6efd;
      background-color: #f8f9ff;
    }
    .upload-area.dragover {
      border-color: #0d6efd;
      background-color: #e7f1ff;
    }
    input[type="file"] {
      display: none;
    }
  `]
})
export class UploadComponent {
  selectedFile: File | null = null;
  jobDescription = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    this.errorMessage = '';
  }

  onDragOver(event: any) {
    event.preventDefault();
    event.target.classList.add('dragover');
  }

  onDrop(event: any) {
    event.preventDefault();
    event.target.classList.remove('dragover');
    this.selectedFile = event.dataTransfer.files[0];
  }

  onSubmit() {
    if (!this.selectedFile || !this.jobDescription) {
      this.errorMessage = 'Please select a file and enter job description';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.uploadResume(this.selectedFile, this.jobDescription).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/analysis', response.sessionId]);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Upload failed. Please try again.';
        console.error('Upload error:', error);
      }
    });
  }
}
