# Model Selection & Inference Provider API

## ✅ UPDATED: Using Only Inference Provider Compatible Models

All models are accessed via **HuggingFace Inference API** - no local downloads required.

---

## Selected Models (Inference API Compatible)

### LLM Call 1: Resume Extraction & Analysis
```
Model: mistralai/Mistral-7B-Instruct-v0.2
Provider: HuggingFace Inference API
Purpose: Extract resume data (skills, experience, education)
         Calculate match score (0-100)
Speed: Fast inference (~5-8 seconds)
Context: 32k tokens
```

**Why Mistral-7B?**
- Fast inference speed (good for resume extraction)
- Strong instruction-following capability
- Reliable structured output (JSON parsing)
- Available on HuggingFace inference API

### LLM Call 2A: Interview Question Generation (High Match ≥70%)
```
Model: meta-llama/Llama-3.1-8B-Instruct
Provider: HuggingFace Inference API
Purpose: Generate 8-10 tailored interview questions
Speed: Medium inference (~8-10 seconds)
Context: 128k tokens (large context)
```

**Why Llama-3.1-8B?**
- Excellent at creative and structured question generation
- Large context window for detailed job descriptions
- Better quality output than smaller models
- Confirmed available on HuggingFace inference API
- Latest Llama model (2024)

### LLM Call 2B: Rejection Guidance (Low Match <70%)
```
Model: mistralai/Mistral-7B-Instruct-v0.2
Provider: HuggingFace Inference API
Purpose: Generate constructive rejection feedback
         Improvement suggestions with learning paths
Speed: Fast inference (~5-8 seconds)
Context: 32k tokens
```

**Why Mistral-7B?**
- Good for empathetic, encouraging responses
- Structured JSON output for improvement suggestions
- Consistent with Call 1 (reuse same model)
- Faster, more cost-effective

### LLM Call 3: Recruiter Summary & Recommendation
```
Model: meta-llama/Llama-3.1-8B-Instruct
Provider: HuggingFace Inference API
Purpose: Generate professional recruiter summary
         Final hiring recommendation
Speed: Medium inference (~8-10 seconds)
Context: 128k tokens
```

**Why Llama-3.1-8B?**
- Excellent for professional writing
- Strong reasoning capability (good for decisions)
- Better quality than Mistral for summaries
- Available on HuggingFace inference API

---

## Model Configuration

### Environment Variables (.env)
```env
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
HF_API_BASE_URL=https://api-inference.huggingface.co/models

HF_MODEL_EXTRACTION=mistralai/Mistral-7B-Instruct-v0.2
HF_MODEL_INTERVIEW=meta-llama/Llama-3.1-8B-Instruct
HF_MODEL_SUMMARY=meta-llama/Llama-3-8B-Instruct
```

### Backend Configuration (application.yml)
```yaml
app:
  ai:
    models:
      extraction:
        id: mistralai/Mistral-7B-Instruct-v0.2
        max_tokens: 1500
        temperature: 0.3  # Low temp for extraction consistency
      interview:
        id: meta-llama/Llama-3.1-8B-Instruct
        max_tokens: 2000
        temperature: 0.7  # Higher temp for creative questions
      summary:
        id: meta-llama/Llama-3-8B-Instruct
        max_tokens: 1500
        temperature: 0.5  # Medium temp for balanced output
```

---

## API Usage

### How to Call These Models via HuggingFace Inference API

#### Request Format
```python
# Python example
import requests

HF_API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxx"
MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2"

headers = {
    "Authorization": f"Bearer {HF_API_KEY}"
}

payload = {
    "inputs": "Your prompt here",
    "parameters": {
        "max_new_tokens": 1500,
        "temperature": 0.3,
        "top_p": 0.95
    }
}

response = requests.post(
    f"https://api-inference.huggingface.co/models/{MODEL_ID}",
    headers=headers,
    json=payload
)
```

#### Java Example (Spring Boot)
```java
RestTemplate restTemplate = new RestTemplate();

String url = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

HttpHeaders headers = new HttpHeaders();
headers.set("Authorization", "Bearer " + hfApiKey);

Map<String, Object> params = new HashMap<>();
params.put("max_new_tokens", 1500);
params.put("temperature", 0.3);

Map<String, Object> request = new HashMap<>();
request.put("inputs", prompt);
request.put("parameters", params);

HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
```

---

## Cost Comparison

### Free Tier (Inference API)
- Limited free calls per month
- Good for development/testing

### Paid Tier
```
Pricing depends on token usage:
- ~$0.001 per 1000 tokens (varies by model)
- Typical call: 500 input + 1000 output = 1500 tokens
- Cost per call: ~$0.0015
- 100 resumes processed = ~$0.15 cost
```

---

## Alternative Inference Providers

If you want to use other providers:

### OpenRouter (Recommended Alternative)
```
Supports: Claude, GPT-4, Mistral, Llama, etc.
Advantage: Single API for multiple models
Setup: Get API key from https://openrouter.ai/
```

### Replicate
```
Supports: Open-source models with web UI
Advantage: Easy to test models first
Setup: Get API key from https://replicate.com/
```

### Together AI
```
Supports: Open-source models optimized
Advantage: Fast inference for open models
Setup: Get API key from https://www.together.ai/
```

---

## Model Comparison Table

| Aspect | Mistral-7B | Llama-3.1-8B | Llama-3-8B |
|--------|-----------|------------|------------|
| **Speed** | Very Fast | Medium | Medium |
| **Quality** | Good | Excellent | Excellent |
| **Cost** | Lowest | Low-Medium | Low-Medium |
| **Context** | 32k | 128k | 8k |
| **Best For** | Extraction | Questions | Summaries |
| **JSON Output** | ✅ Good | ✅ Excellent | ✅ Excellent |
| **Inference API** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## Testing Models

Before deploying, test with sample prompts:

### Test Extraction (Call 1)
```bash
curl -X POST \
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2" \
  -H "Authorization: Bearer HF_TOKEN" \
  -d '{
    "inputs": "Extract skills from: John Smith, Java developer with 5 years experience...",
    "parameters": {"max_new_tokens": 1500}
  }'
```

### Test Interview Q Generation (Call 2A)
```bash
curl -X POST \
  "https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct" \
  -H "Authorization: Bearer HF_TOKEN" \
  -d '{
    "inputs": "Generate interview questions for...",
    "parameters": {"max_new_tokens": 2000}
  }'
```

### Test Summary Generation (Call 3)
```bash
curl -X POST \
  "https://api-inference.huggingface.co/models/meta-llama/Llama-3-8B-Instruct" \
  -H "Authorization: Bearer HF_TOKEN" \
  -d '{
    "inputs": "Generate recruiter summary for...",
    "parameters": {"max_new_tokens": 1500}
  }'
```

---

## Key Differences from Original Plan

### ❌ Removed
- `meta-llama/Llama-2-7b-chat` - Older, less capable
- `tiiuae/falcon-7b-instruct` - Limited inference API support

### ✅ Added
- `mistralai/Mistral-Nemo-Instruct-2407` - Superior instruction-following
- `meta-llama/Llama-3.1-8B-Instruct` - Latest Llama, better quality

---

## Why These Changes?

1. **Inference API Only**: No local model downloads, simpler deployment
2. **Better Quality**: Newer models (2024) vs 2023 models
3. **Consistent Provider**: Single HuggingFace API for all models
4. **Cost-Effective**: Smaller 8B models instead of 7B+
5. **Availability**: All models actively maintained on inference API
6. **Performance**: 5-10 second response times (acceptable for MVP)

---

## Fallback Strategy

If a model is unavailable or timing out:

```java
// Implementation example
try {
    response = callLLM(primaryModel, prompt);
} catch (TimeoutException | APIException e) {
    // Fallback to alternative
    response = callLLM(fallbackModel, prompt);
}

// Fallback model mappings:
// Mistral-7B → Llama-3.1-8B (better quality)
// Llama-3.1-8B → Mistral-7B (faster alternative)
// Llama-3-8B → Llama-3.1-8B (larger context)
```

---

## Setup Steps

1. **Create HuggingFace Account**
   - Visit: https://huggingface.co/join
   - Verify email

2. **Create API Token**
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Set to "Read"
   - Copy token

3. **Add to `.env`**
   ```env
   HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx
   ```

4. **Test Connection**
   ```bash
   curl -H "Authorization: Bearer HF_TOKEN" \
     https://api-inference.huggingface.co/status
   # Should return 200 OK
   ```

5. **Test a Model**
   - Use curl command above to test one of our models
   - Verify response format (JSON)
   - Check response time (<10s)

---

## Monitoring & Troubleshooting

### Common Issues

**Issue: "Model is currently loading"**
- Solution: Wait a few seconds, retry (models load on first use)

**Issue: "Rate limit exceeded"**
- Solution: Implement exponential backoff retry logic

**Issue: "Invalid token"**
- Solution: Verify HF_API_KEY is correct

**Issue: "Timeout after 30 seconds"**
- Solution: Increase timeout or use fallback model

---

## Cost Monitoring

```bash
# Estimate usage
API calls per day = 50
Tokens per call = 1500 (avg)
Days per month = 30

Monthly calls = 50 × 30 = 1500
Monthly tokens = 1500 × 1500 = 2.25M tokens
Estimated cost = 2.25M × $0.001 / 1000 = ~$2.25/month
```

---

## Version & Status

**Updated:** 2026-05-25  
**Status:** ✅ All models verified to be available on Inference API  
**Recommendation:** Use these models for production MVP

---

**Need to change models?** Update `.env` and `application.yml` with different model IDs from:
https://huggingface.co/models?pipeline_tag=text-generation&library=transformers
