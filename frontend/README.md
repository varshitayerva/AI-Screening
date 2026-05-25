# AI Resume Screener - Frontend

Angular 18 SPA for resume screening and interview generation.

## Quick Start

```bash
# Install Node.js 18+
node --version

# Setup
cd frontend
npm install

# Run dev server
ng serve
# App available at http://localhost:4200
```

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── ai-orchestration.service.ts
│   │   │   └── resume.service.ts
│   │   ├── guards/
│   │   └── interceptors/
│   ├── features/
│   │   ├── upload/
│   │   ├── analysis/
│   │   ├── interview/
│   │   ├── feedback/
│   │   └── report/
│   ├── shared/
│   │   ├── components/
│   │   ├── models/
│   │   └── pipes/
│   └── app.component.ts
├── assets/
├── styles/
└── main.ts
```

## Key Components

### Pages
1. **Upload Page** - Resume upload + job description
2. **Analysis Page** - Extracted data display
3. **Interview Page** (High match) - Interview questions
4. **Feedback Page** (Low match) - Improvement guidance
5. **Report Page** - Recruiter summary

### Services
- **APIService** - Backend communication
- **AIOrchestratorService** - LLM workflow coordination
- **ResumeService** - Resume data management

## Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  maxFileSize: 5 * 1024 * 1024 // 5MB
};
```

## Running

```bash
# Development
ng serve

# Production build
ng build

# Run tests
ng test

# E2E tests
ng e2e

# Linting
ng lint
```

## Build for Production

```bash
# Build optimized bundle
ng build --configuration production

# Output in dist/ folder
# Deploy to web server (Nginx, Apache, etc.)
```

## Dependencies

- Angular 18.x
- TypeScript 5.x
- Bootstrap 5
- RxJS 7.x
- Angular Material (optional)
- Cypress (E2E testing)
- Jasmine (Unit testing)

## Features

- ✅ Resume drag-and-drop upload
- ✅ Real-time validation
- ✅ AI-powered analysis
- ✅ Conditional interview questions
- ✅ Improvement suggestions
- ✅ Report generation & export
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility (WCAG AA)

## API Integration

All API calls go through `APIService`:

```typescript
// Example: Upload resume
this.apiService.uploadResume(file, jobDescription).subscribe(
  response => console.log(response),
  error => console.error(error)
);
```

See `../docs/API_SPECIFICATION.md` for full API reference.

## Testing

```bash
# Unit tests
ng test --watch=true

# Coverage report
ng test --code-coverage

# E2E tests
ng e2e
```

**Target Coverage:** 70%+

## Styling

- **CSS Framework:** Bootstrap 5
- **Custom Styles:** `src/styles/`
- **Component Styles:** Component `.css` files
- **Dark Mode:** CSS variables for theme switching

## Troubleshooting

### Port 4200 in use
```bash
ng serve --port 4300
```

### Module not found errors
```bash
rm -rf node_modules
npm install
```

### Build failures
```bash
# Clear Angular cache
ng cache clean

# Rebuild
ng build
```

### API connection issues
```typescript
// Check environment configuration
console.log(environment.apiUrl);

// Verify backend is running
curl http://localhost:8080/api/v1/health
```

## Deployment

### Static Hosting (Firebase, Vercel, Netlify)

```bash
# Build
ng build --configuration production

# Deploy dist/ folder
```

### Traditional Web Server (Nginx)

```nginx
server {
  listen 80;
  server_name resume-screener.example.com;
  root /var/www/resume-screener;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  location /api/ {
    proxy_pass http://backend:8080;
  }
}
```

### Docker

```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN ng build --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Code Standards

- **Style:** Angular Style Guide
- **Naming:** camelCase for variables, PascalCase for classes
- **Formatting:** Prettier (auto-format with `npm run format`)
- **Linting:** ESLint (run with `ng lint`)

## Contributing

1. Follow Angular Style Guide
2. Write tests for new components
3. Ensure 70%+ code coverage
4. Update documentation

## Performance

- ✅ Lazy loading modules
- ✅ Change detection optimization
- ✅ Tree-shaking in production build
- ✅ Gzip compression
- ✅ Bundle analysis (use `ng build --stats-json`)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - See LICENSE file
