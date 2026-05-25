import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) { }

  uploadResume(file: File, jobDescription: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobDescription', jobDescription);

    return this.http.post(`${this.apiUrl}/resume/upload`, formData);
  }

  getResumePreview(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resume/${sessionId}/preview`);
  }

  analyzeResume(sessionId: string, resumeText: string, jobDescription: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/analysis/screen`, {
      sessionId,
      resumeText,
      jobDescription
    });
  }

  getResults(sessionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/analysis/${sessionId}/results`);
  }

  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }
}
