import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-analysis-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-12">
          <h1>Resume Analysis Results</h1>

          <div *ngIf="isLoading" class="alert alert-info">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Analyzing your resume with AI...
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div *ngIf="analysisData && !isLoading">
            <!-- Match Score Section -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Match Score</h5>
                <div class="progress mb-3" style="height: 30px;">
                  <div class="progress-bar"
                       [class]="analysisData.extractedData.match_score >= 70 ? 'bg-success' : 'bg-warning'"
                       [style.width.%]="analysisData.extractedData.match_score">
                    {{ analysisData.extractedData.match_score }}%
                  </div>
                </div>
                <p *ngIf="analysisData.extractedData.match_score >= 70" class="text-success">
                  ✅ Great match! You qualify for an interview.
                </p>
                <p *ngIf="analysisData.extractedData.match_score < 70" class="text-warning">
                  ⚠️ Fair match. Check the feedback section for improvement areas.
                </p>
              </div>
            </div>

            <!-- Extracted Data Section -->
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Extracted Information</h5>
                <div class="row">
                  <div class="col-md-6">
                    <p><strong>Experience:</strong> {{ analysisData.extractedData.experience_years }} years</p>
                    <p><strong>Education:</strong> {{ analysisData.extractedData.education }}</p>
                  </div>
                  <div class="col-md-6">
                    <p><strong>Skills:</strong></p>
                    <div class="mb-2">
                      <span *ngFor="let skill of analysisData.extractedData.skills" class="badge bg-primary me-2">
                        {{ skill }}
                      </span>
                    </div>
                  </div>
                </div>

                <p *ngIf="analysisData.extractedData.strengths?.length > 0"><strong>Strengths:</strong></p>
                <ul>
                  <li *ngFor="let strength of analysisData.extractedData.strengths">{{ strength }}</li>
                </ul>

                <p *ngIf="analysisData.extractedData.missing_requirements?.length > 0">
                  <strong>Missing Requirements:</strong>
                </p>
                <ul>
                  <li *ngFor="let missing of analysisData.extractedData.missing_requirements">{{ missing }}</li>
                </ul>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-2 mb-4">
              <button *ngIf="analysisData.extractedData.match_score >= 70"
                      (click)="goToInterview()"
                      class="btn btn-success">
                View Interview Questions
              </button>
              <button *ngIf="analysisData.extractedData.match_score < 70"
                      (click)="goToFeedback()"
                      class="btn btn-warning">
                View Feedback & Suggestions
              </button>
              <button (click)="goToReport()"
                      class="btn btn-primary">
                View Full Report
              </button>
              <button (click)="uploadAnother()"
                      class="btn btn-secondary">
                Analyze Another
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AnalysisResultComponent implements OnInit {
  sessionId: string = '';
  analysisData: any = null;
  isLoading = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';

    if (!this.sessionId) {
      this.error = 'Invalid session ID';
      return;
    }

    this.performAnalysis();
  }

  performAnalysis() {
    this.apiService.getResumePreview(this.sessionId).subscribe({
      next: (preview) => {
        this.apiService.analyzeResume(
          this.sessionId,
          preview.resumeTextPreview,
          preview.jobDescription
        ).subscribe({
          next: (data) => {
            this.analysisData = data;
            this.isLoading = false;
          },
          error: (err) => {
            this.error = 'Analysis failed: ' + (err.error?.message || err.message);
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to retrieve resume: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  goToInterview() {
    this.router.navigate(['/interview', this.sessionId]);
  }

  goToFeedback() {
    this.router.navigate(['/feedback', this.sessionId]);
  }

  goToReport() {
    this.router.navigate(['/report', this.sessionId]);
  }

  uploadAnother() {
    this.router.navigate(['/upload']);
  }
}
