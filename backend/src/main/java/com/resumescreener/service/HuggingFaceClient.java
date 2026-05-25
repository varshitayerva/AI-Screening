package com.resumescreener.service;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class HuggingFaceClient {

    @Value("${huggingface.api.url:https://api-inference.huggingface.co}")
    private String apiUrl;

    @Value("${huggingface.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    public HuggingFaceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String callLLM(String prompt, String model) {
        log.info("Calling HuggingFace LLM: {}", model);
        long startTime = System.currentTimeMillis();

        try {
            return retryWithBackoff(() -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(apiKey);
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("inputs", prompt);

                Map<String, Object> parameters = new HashMap<>();
                parameters.put("max_new_tokens", 1024);
                parameters.put("temperature", 0.3);
                parameters.put("top_p", 0.95);
                requestBody.put("parameters", parameters);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                String response = restTemplate.postForObject(
                    apiUrl + "/models/" + model,
                    entity,
                    String.class
                );

                log.info("HuggingFace response received in {}ms", System.currentTimeMillis() - startTime);
                return response;
            }, 3);

        } catch (Exception e) {
            log.error("Failed to call HuggingFace API after retries", e);
            throw new RuntimeException("AI API call failed: " + e.getMessage(), e);
        }
    }

    private String retryWithBackoff(java.util.function.Supplier<String> task, int maxRetries) throws Exception {
        for (int i = 0; i < maxRetries; i++) {
            try {
                return task.get();
            } catch (Exception e) {
                if (i == maxRetries - 1) {
                    throw e;
                }
                long backoffMs = (long) Math.pow(2, i) * 1000;
                log.warn("Retry attempt {} after backoff of {}ms", i + 1, backoffMs);
                Thread.sleep(backoffMs);
            }
        }
        throw new RuntimeException("Max retries exceeded");
    }

    public String extractJsonFromResponse(String rawResponse) {
        try {
            JsonObject json = JsonParser.parseString(rawResponse).getAsJsonObject();

            if (json.has("generated_text")) {
                return json.get("generated_text").getAsString();
            } else if (json.has("output")) {
                return json.get("output").getAsString();
            }

            return rawResponse;
        } catch (Exception e) {
            log.warn("Could not parse response as JSON, returning as-is");
            return rawResponse;
        }
    }
}
