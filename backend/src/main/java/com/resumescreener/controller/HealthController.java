package com.resumescreener.controller;

import com.resumescreener.service.SessionManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@CrossOrigin(origins = "*")
@Slf4j
public class HealthController {

    @Autowired
    private SessionManager sessionManager;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("activeSessions", sessionManager.getActiveSessionCount());
        response.put("message", "Resume Screener API is running");

        return ResponseEntity.ok(response);
    }
}
