import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { AnalysisResultComponent } from './components/analysis-result/analysis-result.component';
import { InterviewQuestionsComponent } from './components/interview-questions/interview-questions.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import { ReportComponent } from './components/report/report.component';

export const routes: Routes = [
  { path: '', redirectTo: 'upload', pathMatch: 'full' },
  { path: 'upload', component: UploadComponent },
  { path: 'analysis/:sessionId', component: AnalysisResultComponent },
  { path: 'interview/:sessionId', component: InterviewQuestionsComponent },
  { path: 'feedback/:sessionId', component: FeedbackComponent },
  { path: 'report/:sessionId', component: ReportComponent },
  { path: '**', redirectTo: 'upload' }
];
