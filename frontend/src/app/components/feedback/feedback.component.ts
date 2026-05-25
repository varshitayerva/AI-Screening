import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-12">
          <h1>Feedback & Improvement Suggestions</h1>
          <p class="lead">Here's how to improve your candidacy</p>

          <div *ngIf="isLoading" class="alert alert-info">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Loading feedback...
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div *ngIf="feedback && !isLoading">
            <!-- Rejection Reasons -->
            <div class="card mb-4 border-warning">
              <div class="card-body">
                <h5 class="card-title">Why You Weren't Selected</h5>
                <ul>
                  <li *ngFor="let reason of feedback.rejection_reasons">{{ reason }}</li>
                </ul>
              </div>
            </div>

            <!-- Improvements -->
            <div class="card mb-4 border-info">
              <div class="card-body">
                <h5 class="card-title">Skills to Improve</h5>
                <div *ngFor="let improvement of feedback.improvements" class="mb-3 pb-3 border-bottom">
                  <h6>{{ improvement.skill }}</h6>
                  <p><small class="text-muted">Current Level: {{ improvement.current_level }}</small></p>
                  <p><strong>Resources:</strong></p>
                  <ul>
                    <li *ngFor="let resource of improvement.recommended_resources">{{ resource }}</li>
                  </ul>
                  <p><strong>Timeline:</strong> ~{{ improvement.estimated_months }} months</p>
                </div>
              </div>
            </div>

            <!-- Alternative Roles -->
            <div class="card mb-4 border-success">
              <div class="card-body">
                <h5 class="card-title">Alternative Roles You'd Be Great For</h5>
                <div class="row">
                  <div *ngFor="let role of feedback.alternative_roles" class="col-md-6 mb-2">
                    <div class="alert alert-success mb-0">✅ {{ role }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Encouragement -->
            <div class="alert alert-success" *ngIf="feedback.encouragement">
              <h5>Keep Going!</h5>
              <p>{{ feedback.encouragement }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 mt-4">
              <button (click)="goToReport()" class="btn btn-primary">
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
  `
})
export class FeedbackComponent implements OnInit {
  sessionId: string = '';
  feedback: any = null;
  isLoading = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    this.loadFeedback();
  }

  loadFeedback() {
    this.apiService.getResults(this.sessionId).subscribe({
      next: (data) => {
        this.feedback = data.rejectionGuidance;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load feedback: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  goToReport() {
    this.router.navigate(['/report', this.sessionId]);
  }

  uploadAnother() {
    this.router.navigate(['/upload']);
  }
}
