import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-12">
          <h1>Recruiter Summary Report</h1>

          <div *ngIf="isLoading" class="alert alert-info">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Loading report...
          </div>

          <div *ngIf="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div *ngIf="report && !isLoading" class="card">
            <div class="card-body">
              <!-- Executive Summary -->
              <div class="mb-4">
                <h5 class="card-title">Executive Summary</h5>
                <p>{{ report.executive_summary }}</p>
              </div>

              <!-- Recommendation Banner -->
              <div [class]="'alert alert-' + getRecommendationClass(report.recommendation)" role="alert">
                <h4 class="alert-heading">Recommendation: {{ report.recommendation }}</h4>
              </div>

              <!-- Strengths -->
              <div class="mb-4" *ngIf="report.strengths?.length > 0">
                <h5>Key Strengths</h5>
                <ul>
                  <li *ngFor="let strength of report.strengths">{{ strength }}</li>
                </ul>
              </div>

              <!-- Concerns -->
              <div class="mb-4" *ngIf="report.concerns?.length > 0">
                <h5>Concerns</h5>
                <ul>
                  <li *ngFor="let concern of report.concerns">{{ concern }}</li>
                </ul>
              </div>

              <!-- Next Steps -->
              <div class="mb-4" *ngIf="report.next_steps?.length > 0">
                <h5>Next Steps</h5>
                <ol>
                  <li *ngFor="let step of report.next_steps">{{ step }}</li>
                </ol>
              </div>

              <!-- Interview Readiness -->
              <div *ngIf="report.interview_readiness">
                <h5>Interview Readiness</h5>
                <p>{{ report.interview_readiness }}</p>
              </div>

              <!-- Processing Time -->
              <div class="mt-4 text-muted small">
                <p>Processing Time: {{ processingTime }}ms</p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex gap-2 mt-4">
            <button (click)="printReport()" class="btn btn-primary">
              🖨️ Print Report
            </button>
            <button (click)="downloadJSON()" class="btn btn-info">
              📥 Download JSON
            </button>
            <button (click)="uploadAnother()" class="btn btn-secondary">
              Analyze Another
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportComponent implements OnInit {
  sessionId: string = '';
  report: any = null;
  processingTime: number = 0;
  isLoading = true;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') || '';
    this.loadReport();
  }

  loadReport() {
    this.apiService.getResults(this.sessionId).subscribe({
      next: (data) => {
        this.report = data.recruiterSummary;
        this.processingTime = data.processingTimeMs;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load report: ' + (err.error?.message || err.message);
        this.isLoading = false;
      }
    });
  }

  getRecommendationClass(recommendation: string): string {
    const rec = recommendation?.toUpperCase();
    if (rec === 'STRONG_YES' || rec === 'YES') return 'success';
    if (rec === 'MAYBE') return 'warning';
    return 'danger';
  }

  printReport() {
    window.print();
  }

  downloadJSON() {
    const dataStr = JSON.stringify(this.report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${this.sessionId}.json`;
    link.click();
  }

  uploadAnother() {
    this.router.navigate(['/upload']);
  }
}
