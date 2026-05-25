package com.resumescreener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {

    private String message;
    private int statusCode;
    private LocalDateTime timestamp;

    public ErrorResponse(String message) {
        this.message = message;
        this.statusCode = 500;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(String message, int statusCode) {
        this.message = message;
        this.statusCode = statusCode;
        this.timestamp = LocalDateTime.now();
    }
}
