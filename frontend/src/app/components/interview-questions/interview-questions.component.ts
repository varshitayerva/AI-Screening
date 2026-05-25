import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-interview-questions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-12">
          <h1>Interview Questions</h1>
          <p class="lead">Prepare for your interview with these tailored questions</p>

          <div *ngIf="isLoading" class="alert alert-info">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Loading interview questions...
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div *ngIf="questions && !isLoading">
            <div *ngFor="let question of questions" class="card mb-3">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title">{{ question.id }}. {{ question.question }}</h5>
                  <div class="badges">
                    <span class="badge bg-info">{{ question.category }}</span>
                    <span [class]="'badge ' + getDifficultyClass(question.difficulty)">
                      {{ question.difficulty }}
                    </span>
                    <span class="badge bg-secondary">{{ question.time_estimate_minutes }}min</span>
                  </div>
                </div>
                <p *ngIf="question.tip" class="text-muted small">
                  💡 Tip: {{ question.tip }}
                </p>
              </div>
            </div>

            <div class="d-flex gap-2 mt-4">
              <button (click)="printQuestions()" class="btn btn-primary">
                🖨️ Print
              </button>
              <button (click)="goToReport()" class="btn btn-success">
                View Full Report
              </button>
              <button (click)="uploadAnother()" class="btn btn-secondary">
                Analyze Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badges {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
  `]
})
export class InterviewQuestionsComponent implements OnInit {
  sessionId: string = '';
  questions: any[] = [];
  isLoading = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    this.loadQuestions();
  }

  loadQuestions() {
    this.apiService.getResults(this.sessionId).subscribe({
      next: (data) => {
        this.questions = data.interviewQuestions || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load questions: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-warning';
      case 'hard': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  printQuestions() {
    window.print();
  }

  goToReport() {
    this.router.navigate(['/report', this.sessionId]);
  }

  uploadAnother() {
    this.router.navigate(['/upload']);
  }
}
